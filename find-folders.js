require('dotenv/config');
const { google } = require('googleapis');

async function findSharedFolders() {
  console.log('=== Finding Folders Shared with Service Account ===\n');

  const credentialsJson = process.env.GOOGLE_CREDENTIALS;
  if (!credentialsJson) {
    console.error('❌ ERROR: GOOGLE_CREDENTIALS not set');
    process.exit(1);
  }

  const credentials = JSON.parse(credentialsJson);
  console.log('📧 Service Account:', credentials.client_email);
  console.log('\n🔍 Searching for folders shared with this account...\n');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // List all folders the service account can access
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name, parents, webViewLink)',
      pageSize: 50,
    });

    const folders = response.data.files || [];

    if (folders.length === 0) {
      console.log('❌ No folders found!');
      console.log('\nThis means no folders have been shared with the service account.');
      console.log('Please share your property_docs folder with:', credentials.client_email);
    } else {
      console.log(`✅ Found ${folders.length} folder(s):\n`);

      for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        console.log(`${i + 1}. ${folder.name}`);
        console.log(`   Folder ID: ${folder.id}`);
        console.log(`   Link: ${folder.webViewLink || 'N/A'}`);

        // Check if this folder has PDFs
        try {
          const filesInFolder = await drive.files.list({
            q: `'${folder.id}' in parents and mimeType='application/pdf' and trashed=false`,
            fields: 'files(id, name)',
            pageSize: 5,
          });

          const pdfCount = filesInFolder.data.files?.length || 0;
          if (pdfCount > 0) {
            console.log(`   📄 Contains ${pdfCount} PDF(s)`);
            filesInFolder.data.files.forEach(pdf => {
              console.log(`      - ${pdf.name}`);
            });
          } else {
            console.log(`   📭 No PDFs found`);
          }
        } catch (err) {
          console.log(`   ⚠️  Cannot list contents (permission issue)`);
        }

        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }

  console.log('=== End of Search ===');
}

findSharedFolders().catch(console.error);
