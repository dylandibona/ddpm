require('dotenv/config');
const { google } = require('googleapis');

async function debugGoogleDrive() {
  console.log('=== Google Drive Debug Script ===\n');

  // Step 1: Read credentials
  const credentialsJson = process.env.GOOGLE_CREDENTIALS;

  if (!credentialsJson) {
    console.error('❌ ERROR: GOOGLE_CREDENTIALS environment variable is not set');
    process.exit(1);
  }

  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
    console.log('✅ Successfully parsed GOOGLE_CREDENTIALS');
  } catch (error) {
    console.error('❌ ERROR: Failed to parse GOOGLE_CREDENTIALS as JSON');
    console.error('Error:', error.message);
    process.exit(1);
  }

  // Step 2: Print the service account email
  console.log('\n📧 Service Account Email:');
  console.log('   ', credentials.client_email);
  console.log('\n⚠️  IMPORTANT: You must share your Google Drive folder with this email address!');
  console.log('   Go to Google Drive → Right-click folder → Share → Add this email\n');

  // Step 3: Read folder ID
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    console.error('❌ ERROR: GOOGLE_DRIVE_FOLDER_ID environment variable is not set');
    process.exit(1);
  }

  console.log('📁 Google Drive Folder ID:', folderId);

  // Step 4: Attempt to list files
  console.log('\n🔍 Attempting to list files in folder...\n');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'files(id, name, createdTime, modifiedTime, webViewLink, size)',
      orderBy: 'modifiedTime desc',
    });

    const files = response.data.files || [];

    if (files.length === 0) {
      console.log('⚠️  No PDF files found in the folder');
      console.log('\nPossible reasons:');
      console.log('  1. The folder is empty (no PDFs)');
      console.log('  2. The service account does not have access to this folder');
      console.log('  3. The folder ID is incorrect');
      console.log('\nTo fix:');
      console.log('  - Share the folder with:', credentials.client_email);
      console.log('  - Make sure there are PDF files in the folder');
      console.log('  - Verify the folder ID is correct');
    } else {
      console.log(`✅ Found ${files.length} PDF file(s):\n`);
      files.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   ID: ${file.id}`);
        console.log(`   Size: ${(file.size / 1024).toFixed(2)} KB`);
        console.log(`   Modified: ${file.modifiedTime}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ ERROR: Failed to access Google Drive');
    console.error('\nError details:');
    console.error('  Code:', error.code);
    console.error('  Message:', error.message);

    if (error.code === 404) {
      console.error('\n📌 Diagnosis: Folder not found');
      console.error('   The folder ID may be incorrect, or the service account cannot access it.');
    } else if (error.code === 403) {
      console.error('\n📌 Diagnosis: Permission denied');
      console.error('   The service account does not have permission to access this folder.');
      console.error('   Solution: Share the folder with:', credentials.client_email);
    } else {
      console.error('\n📌 Diagnosis: Unknown error');
      console.error('   Full error:', error);
    }
  }

  console.log('\n=== End of Debug ===');
}

debugGoogleDrive().catch(console.error);
