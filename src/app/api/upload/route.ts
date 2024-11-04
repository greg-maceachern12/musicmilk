// app/api/upload/route.ts
import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob';

if (!process.env.AZURE_STORAGE_ACCOUNT || !process.env.AZURE_STORAGE_ACCESS_KEY) {
  throw new Error('Azure Storage credentials not found');
}

const credential = new StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT,
  process.env.AZURE_STORAGE_ACCESS_KEY
);

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    // Create unique blob name
    const blobName = `${Date.now()}-${filename}`;
    
    // Create permissions
    const permissions = new BlobSASPermissions();
    permissions.read = true;
    permissions.write = true;
    permissions.create = true;

    // Generate SAS token
    const startsOn = new Date();
    const expiresOn = new Date(new Date().valueOf() + 3600 * 1000);
    
    const sasToken = generateBlobSASQueryParameters({
      containerName: 'mixes',
      blobName: blobName,
      permissions: permissions,
      startsOn: startsOn,
      expiresOn: expiresOn,
    }, credential).toString();

    // Construct URLs
    const baseUrl = `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`;
    const uploadUrl = `${baseUrl}/mixes/${blobName}?${sasToken}`;
    const streamUrl = `${baseUrl}/mixes/${blobName}`;

    return Response.json({
      uploadUrl,
      streamUrl,
      blobName,
      sasToken
    });

  } catch (error) {
    console.error('Error generating upload URL:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}