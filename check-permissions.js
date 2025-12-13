require('dotenv/config');
const { google } = require('googleapis');

async function checkPermissions() {
  const folderId = '1q7opDVzQUaZWV8Y0j7fm1xro4eg4WcHf';
  const credentialsJson = process.env.GOOGLE_CREDENTIALS;
  const credentials = JSON.parse(credentialsJson);

  console.log('=== Checking Folder Permissions ===\n');
  console.log('Service Account:', credentials.client_email);
  console.log('Folder ID:', folderId);

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Try to get the folder itself
    console.log('\n🔍 Checking folder access...\n');
    const folder = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, owners, permissions',
    });

    console.log('✅ Folder found:', folder.data.name);
    console.log('\n📋 Permissions on this folder:');

    if (folder.data.permissions) {
      folder.data.permissions.forEach((perm, i) => {
        console.log(`\n${i + 1}. Type: ${perm.type}`);
        console.log(`   Role: ${perm.role}`);
        if (perm.emailAddress) {
          console.log(`   Email: ${perm.emailAddress}`);
        }
      });

      const hasServiceAccount = folder.data.permissions.some(
        p => p.emailAddress === credentials.client_email
      );

      if (hasServiceAccount) {
        console.log('\n✅ Service account HAS access to this folder!');
      } else {
        console.log('\n❌ Service account DOES NOT have access to this folder!');
        console.log('\nYou need to share the folder with:', credentials.client_email);
      }
    } else {
      console.log('\n⚠️  Cannot read permissions (this is normal)');
      console.log('But the service account CAN access the folder since we got here!');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Error code:', error.code);

    if (error.code === 404) {
      console.error('\n📌 The service account CANNOT see this folder.');
      console.error('   The folder is NOT shared with:', credentials.client_email);
      console.error('\n🔧 To fix:');
      console.error('   1. Go to https://drive.google.com/drive/folders/1q7opDVzQUaZWV8Y0j7fm1xro4eg4WcHf');
      console.error('   2. Right-click the folder → "Share"');
      console.error('   3. Add this email:', credentials.client_email);
      console.error('   4. Set permission to "Viewer"');
      console.error('   5. Click "Send" (you can uncheck "Notify people")');
    }
  }
}

checkPermissions().catch(console.error);
