require('dotenv/config');
const { google } = require('googleapis');

async function testSync() {
  console.log('=== Testing Sync Function ===\n');

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  console.log('Folder ID from .env:', folderId);

  const credentialsJson = process.env.GOOGLE_CREDENTIALS;
  const credentials = JSON.parse(credentialsJson);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log('\n🔍 Listing PDFs using the exact query from the app...\n');

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'files(id, name, createdTime, modifiedTime, webViewLink, webContentLink, size)',
      orderBy: 'modifiedTime desc',
    });

    const files = response.data.files || [];

    console.log(`✅ Found ${files.length} files\n`);

    if (files.length > 0) {
      console.log('Files returned:');
      files.forEach((file, i) => {
        console.log(`${i + 1}. ${file.name}`);
        console.log(`   webViewLink: ${file.webViewLink || 'MISSING'}`);
        console.log(`   webContentLink: ${file.webContentLink || 'MISSING'}`);
      });
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error.errors);
  }

  console.log('\n=== End Test ===');
}

testSync().catch(console.error);
