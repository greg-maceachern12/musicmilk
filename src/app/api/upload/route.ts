import { BlobServiceClient } from '@azure/storage-blob';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface FileData {
  name: string;
  type: string;
  data: string;  // base64 encoded file data
}

interface UploadRequest {
  audioFile: FileData;
  coverImage?: FileData | null;
  title: string;
  artist?: string;
  genre?: string;
  description?: string;
}

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);

const AUDIO_CONTAINER = 'audio-mixes';
const COVER_CONTAINER = 'cover-images';

async function uploadToAzure(
  file: FileData,
  containerName: string
): Promise<string> {
  // Get container client and ensure it exists
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  // Generate unique blob name
  const blobName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Convert base64 to buffer
  const base64Data = file.data.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');

  // Upload to Azure
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: file.type
    }
  });

  return blockBlobClient.url;
}

export async function POST(request: Request) {
  try {
    const data: UploadRequest = await request.json();
    
    // Verify user authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Upload audio file
    const audioUrl = await uploadToAzure(data.audioFile, AUDIO_CONTAINER);

    // Upload cover image if provided
    let coverUrl: string | null = null;
    if (data.coverImage) {
      coverUrl = await uploadToAzure(data.coverImage, COVER_CONTAINER);
    }

    // Create database record
    const { data: mix, error: dbError } = await supabase
      .from('mixes')
      .insert({
        title: data.title,
        artist: data.artist || null,
        genre: data.genre || null,
        description: data.description || null,
        audio_url: audioUrl,
        cover_url: coverUrl,
        play_count: 0,
        user_id: user.id,
        storage_provider: 'azure'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return NextResponse.json({ mix });

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}