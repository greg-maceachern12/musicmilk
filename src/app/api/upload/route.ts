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

const AUDIO_CONTAINER = 'audio';
const COVER_CONTAINER = 'covers';

async function uploadToAzure(
  file: FileData,
  containerName: string
): Promise<string> {
  console.log(`Starting Azure upload to ${containerName}:`, file.name);
  
  try {
    // Get container client and ensure it exists
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    // Generate unique blob name
    const blobName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Convert base64 to buffer
    const base64Data = file.data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    console.log(`Uploading ${file.name}, size: ${buffer.length} bytes`);

    // Upload to Azure
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type
      }
    });

    console.log(`Successfully uploaded ${file.name} to Azure`);
    return blockBlobClient.url;
  } catch (error) {
    console.error(`Azure upload failed for ${file.name}:`, error);
    throw error;
  }
}

export async function POST(request: Request) {
  console.log('=== Upload Request Started ===');
  
  try {
    // Log request basics
    console.log('Request headers:', Object.fromEntries(request.headers));
    
    // Parse request body with error handling
    let data: UploadRequest;
    try {
      data = await request.json();
      console.log('Request received:', {
        fileName: data.audioFile.name,
        fileType: data.audioFile.type,
        fileSize: Buffer.from(data.audioFile.data.split(',')[1], 'base64').length,
        hasCover: !!data.coverImage,
        title: data.title
      });
    } catch (e) {
      console.error('Failed to parse request body:', e);
      const errorMessage = e instanceof Error ? e.message : 'Unknown parse error';
      return NextResponse.json(
        { error: 'Invalid request body', details: errorMessage },
        { status: 400 }
      );
    }

    // Verify environment variables
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
      console.error('Azure connection string missing');
      return NextResponse.json(
        { error: 'Server configuration error - Missing Azure credentials' },
        { status: 500 }
      );
    }
    
    // Verify user authentication
    console.log('Verifying authentication...');
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      );
    }
    
    if (!user) {
      console.error('No user found');
      return NextResponse.json(
        { error: 'Unauthorized - No user found' },
        { status: 401 }
      );
    }
    
    console.log('User authenticated:', user.id);

    // Upload audio file with error handling
    let audioUrl: string;
    try {
      console.log('Starting audio upload...');
      audioUrl = await uploadToAzure(data.audioFile, AUDIO_CONTAINER);
      console.log('Audio uploaded successfully:', audioUrl);
    } catch (uploadError) {
      console.error('Audio upload failed:', uploadError);
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
      return NextResponse.json(
        { error: 'Failed to upload audio file', details: errorMessage },
        { status: 500 }
      );
    }

    // Upload cover image if provided
    let coverUrl: string | null = null;
    if (data.coverImage) {
      try {
        console.log('Starting cover image upload...');
        coverUrl = await uploadToAzure(data.coverImage, COVER_CONTAINER);
        console.log('Cover image uploaded successfully:', coverUrl);
      } catch (coverError) {
        console.error('Cover upload failed:', coverError);
        const errorMessage = coverError instanceof Error ? coverError.message : 'Unknown cover upload error';
        // Continue without cover if it fails, but log the error
        console.warn('Continuing without cover image:', errorMessage);
      }
    }

    // Create database record
    console.log('Creating database record...');
    try {
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
        return NextResponse.json(
          { error: 'Database error', details: dbError.message },
          { status: 500 }
        );
      }

      console.log('Mix created successfully:', mix.id);
      return NextResponse.json({ mix });

    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      return NextResponse.json(
        { error: 'Database operation failed', details: errorMessage },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Unhandled error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}