"use server";

export async function testEnvironment() {
  return {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasGoogleCredentials: !!process.env.GOOGLE_CREDENTIALS,
    hasGoogleFolderId: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || 'NOT SET',
    credentialsEmail: process.env.GOOGLE_CREDENTIALS
      ? JSON.parse(process.env.GOOGLE_CREDENTIALS).client_email
      : 'NOT SET',
  };
}
