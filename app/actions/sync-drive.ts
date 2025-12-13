"use server";

import { listPDFsInFolder } from "@/lib/google-drive";
import { prisma } from "@/lib/prisma";

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

    // Create statements for new PDFs
    const statements = await Promise.all(
      newPDFs.map((pdf) => {
        // Use modifiedTime as the statement date, fallback to createdTime, then current date
        const date = pdf.modifiedTime
          ? new Date(pdf.modifiedTime)
          : pdf.createdTime
          ? new Date(pdf.createdTime)
          : new Date();
        
        // Store the webViewLink (preferred) or webContentLink as the URL
        const url = pdf.webViewLink || pdf.webContentLink || "";

        return prisma.statement.create({
          data: {
            date,
            url,
            propertyId: property.id,
          },
        });
      })
    );

    return {
      success: true,
      message: `Successfully synced ${statements.length} new PDF(s)`,
      added: statements.length,
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

