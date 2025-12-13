import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const credentialsJson = process.env.GOOGLE_CREDENTIALS;

    if (!credentialsJson) {
      return NextResponse.json({
        error: 'GOOGLE_CREDENTIALS not set',
        hasCredentials: false,
      });
    }

    const credentials = JSON.parse(credentialsJson);

    return NextResponse.json({
      hasCredentials: true,
      serviceAccountEmail: credentials.client_email,
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || 'NOT SET',
      hasDatabase: !!process.env.DATABASE_URL,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      hasCredentials: false,
    });
  }
}
