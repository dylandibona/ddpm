"use server";

import { listPDFsInFolder, downloadAndExtractPDFText } from "@/lib/google-drive";
import { prisma } from "@/lib/prisma";
import { extractTransactionsFromText } from "@/lib/openai";
import { Prisma } from "@prisma/client";

export async function syncGoogleDrive() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      return {
        success: false,
        error: "GOOGLE_DRIVE_FOLDER_ID environment variable is not set",
      };
    }

    // Get all PDFs from Google Drive folder
    const pdfs = await listPDFsInFolder(folderId);

    if (pdfs.length === 0) {
      return {
        success: true,
        message: "No PDFs found in the specified folder",
        added: 0,
      };
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
      return {
        success: true,
        message: "All PDFs are already synced",
        added: 0,
      };
    }

    // Get the first property (or you can modify this to select a specific property)
    // For now, we'll use the first property or create a default one
    let property = await prisma.property.findFirst();

    if (!property) {
      // If no property exists, we can't create statements
      return {
        success: false,
        error: "No properties found. Please create a property first.",
      };
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

    const successMessage = [
      `Successfully synced ${newPDFs.length} new PDF(s)`,
      totalTransactions > 0 ? `Extracted ${totalTransactions} transaction(s)` : null,
      totalFlagged > 0 ? `(${totalFlagged} flagged for review)` : null,
      errors.length > 0 ? `\nWarnings: ${errors.length} file(s) had errors` : null,
    ]
      .filter(Boolean)
      .join('. ');

    return {
      success: true,
      message: successMessage,
      added: newPDFs.length,
      transactionsExtracted: totalTransactions,
      flaggedCount: totalFlagged,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error syncing Google Drive:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

