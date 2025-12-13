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
  const drive = await getGoogleDriveClient();

  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
    fields: "files(id, name, createdTime, modifiedTime, webViewLink, webContentLink, size)",
    orderBy: "modifiedTime desc",
  });

  return response.data.files || [];
}

