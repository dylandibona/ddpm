"use server";

import { listPDFsInFolder, downloadAndExtractPDFText } from "@/lib/google-drive";
import { prisma } from "@/lib/prisma";
import { extractTransactionsFromText } from "@/lib/openai";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function syncGoogleDrive() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      throw new Error("GOOGLE_DRIVE_FOLDER_ID environment variable is not set");
    }

    // Get all PDFs from Google Drive folder
    const pdfs = await listPDFsInFolder(folderId);

    if (pdfs.length === 0) {
      console.log("No PDFs found in the specified folder");
      return;
    }

    // Get all existing statements from database
    const existingStatements = await prisma.statement.findMany({
      select: { url: true },
    });
    const existingUrls = new Set(
      existingStatements.map((s) => s.url).filter(Boolean) as string[]
    );

    // Filter out PDFs that already exist in database
    // We check by URL (which contains the Google Drive file link)
    const newPDFs = pdfs.filter((pdf) => {
      if (!pdf.id) return false;
      const viewLink = pdf.webViewLink || pdf.webContentLink;
      if (!viewLink) return false;
      
      // Check if this URL already exists
      return !existingUrls.has(viewLink);
    });

    if (newPDFs.length === 0) {
      console.log("All PDFs are already synced");
      revalidatePath("/");
      return;
    }

    // Get the first property (or you can modify this to select a specific property)
    // For now, we'll use the first property or create a default one
    let property = await prisma.property.findFirst();

    if (!property) {
      // If no property exists, we can't create statements
      throw new Error("No properties found in database. Please seed the database first.");
    }

    // Create statements for new PDFs and process them
    let totalTransactions = 0;
    let totalFlagged = 0;
    const errors: string[] = [];

    for (const pdf of newPDFs) {
      try {
        // Use modifiedTime as the statement date, fallback to createdTime, then current date
        const date = pdf.modifiedTime
          ? new Date(pdf.modifiedTime)
          : pdf.createdTime
          ? new Date(pdf.createdTime)
          : new Date();

        // Store the webViewLink (preferred) or webContentLink as the URL
        const url = pdf.webViewLink || pdf.webContentLink || "";

        // Create the statement
        const statement = await prisma.statement.create({
          data: {
            date,
            url,
            propertyId: property.id,
          },
        });

        // Download PDF and extract text
        if (pdf.id) {
          try {
            const rawText = await downloadAndExtractPDFText(pdf.id);

            // Update statement with extracted text
            await prisma.statement.update({
              where: { id: statement.id },
              data: { rawText },
            });

            // Extract transactions using OpenAI
            const extractedTransactions = await extractTransactionsFromText(rawText);

            if (extractedTransactions.length > 0) {
              // Create transactions in database
              const transactions = await Promise.all(
                extractedTransactions.map((tx) => {
                  const transactionDate = new Date(tx.date);

                  return prisma.transaction.create({
                    data: {
                      date: transactionDate,
                      amount: new Prisma.Decimal(tx.amount),
                      category: tx.category,
                      vendor: tx.vendor,
                      isFlagged: tx.isFlagged,
                      flagReason: tx.flagReason,
                      statementId: statement.id,
                    },
                  });
                })
              );

              totalTransactions += transactions.length;
              totalFlagged += transactions.filter((t) => t.isFlagged).length;
            }
          } catch (error) {
            console.error(`Error processing PDF ${pdf.name}:`, error);
            errors.push(`${pdf.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      } catch (error) {
        console.error(`Error creating statement for ${pdf.name}:`, error);
        errors.push(`${pdf.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`Successfully synced ${newPDFs.length} new PDF(s)`);
    if (totalTransactions > 0) {
      console.log(`Extracted ${totalTransactions} transaction(s)`);
    }
    if (totalFlagged > 0) {
      console.log(`${totalFlagged} flagged for review`);
    }
    if (errors.length > 0) {
      console.warn(`Warnings: ${errors.length} file(s) had errors:`, errors);
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error syncing Google Drive:", error);
    throw error; // Rethrow so client can handle it
  }
}

