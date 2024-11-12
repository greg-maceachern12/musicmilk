//app/api/upload/route.ts
import { BlobServiceClient, BlobSASPermissions } from '@azure/storage-blob';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);

const AUDIO_CONTAINER = 'audio';
const COVER_CONTAINER = 'covers';

interface FileData {
  filename: string;
  fileType: string;
  isAudio: boolean;
  metadata?: {
    title: string;
    artist?: string;
    genre?: string;
    description?: string;
  };
}

export async function POST(request: Request) {
  try {
    // Verify user authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: FileData = await request.json();
    const { filename, fileType, isAudio, metadata } = body;

    if (!filename || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique blob name
    const blobName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const containerName = isAudio ? AUDIO_CONTAINER : COVER_CONTAINER;

    try {
      // Get container client and ensure it exists
      const containerClient = blobServiceClient.getContainerClient(containerName);
      await containerClient.createIfNotExists({
        access: 'blob'
      });

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Generate SAS URL with correct permissions
      const permissions = new BlobSASPermissions();
      permissions.write = true;
      permissions.create = true;

      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions,
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000)
      });

      // If this is an audio file and we have metadata, create the database record
      if (isAudio && metadata) {
        const { data: mix, error: dbError } = await supabase
          .from('mixes')
          .insert({
            title: metadata.title,
            artist: metadata.artist || null,
            genre: metadata.genre || null,
            description: metadata.description || null,
            audio_url: blockBlobClient.url,
            play_count: 0,
            user_id: user.id,
            storage_provider: 'azure'
          })
          .select()
          .single();

        if (dbError) {
          throw dbError;
        }

        return NextResponse.json({
          uploadUrl: sasUrl,
          blobUrl: blockBlobClient.url,
          mix
        });
      }

      // For cover image or non-metadata uploads, just return the URLs
      return NextResponse.json({
        uploadUrl: sasUrl,
        blobUrl: blockBlobClient.url
      });

    } catch (storageError) {
      console.error('Azure storage error:', storageError);
      return NextResponse.json(
        { 
          error: 'Failed to generate upload URL',
          details: storageError instanceof Error ? storageError.message : 'Unknown storage error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Unexpected error in upload route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}