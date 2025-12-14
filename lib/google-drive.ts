import { google } from "googleapis";

export async function getGoogleDriveClient() {
  const credentialsJson = process.env.GOOGLE_CREDENTIALS;

  if (!credentialsJson) {
    throw new Error("GOOGLE_CREDENTIALS environment variable is not set");
  }

  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch (error) {
    throw new Error("GOOGLE_CREDENTIALS must be valid JSON");
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  const drive = google.drive({ version: "v3", auth });
  return drive;
}

export async function listPDFsInFolder(folderId: string) {
  try {
    const drive = await getGoogleDriveClient();

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: "files(id, name, createdTime, modifiedTime, webViewLink, webContentLink, size)",
      orderBy: "modifiedTime desc",
    });

    return response.data.files || [];
  } catch (error: any) {
    console.error('Error listing PDFs from Google Drive:', error);
    console.error('Folder ID:', folderId);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errors: error.errors,
    });

    // Re-throw with more context
    if (error.code === 404) {
      throw new Error(`Google Drive folder not found (ID: ${folderId}). Make sure the folder is shared with the service account.`);
    } else if (error.code === 403) {
      throw new Error(`Permission denied to access Google Drive folder (ID: ${folderId}). Make sure the folder is shared with the service account.`);
    } else {
      throw new Error(`Google Drive API error: ${error.message}`);
    }
  }
}

export async function downloadAndExtractPDFText(fileId: string): Promise<string> {
  try {
    const drive = await getGoogleDriveClient();

    // Download the PDF file as a buffer
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: 'media',
      },
      {
        responseType: 'arraybuffer',
      }
    );

    // Extract text from the PDF buffer
    const buffer = Buffer.from(response.data as ArrayBuffer);

    // Dynamic import to avoid bundling pdf-parse at module evaluation time
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);

    return data.text;
  } catch (error: any) {
    console.error('Error downloading/extracting PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

