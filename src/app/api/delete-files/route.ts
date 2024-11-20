import { BlobServiceClient } from '@azure/storage-blob';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);

// Helper function to extract container and blob name from Azure URL
function parseAzureUrl(url: string): { containerName: string; blobName: string } | null {
  try {
    const urlObj = new URL(url);
    // Azure blob URLs are in format: https://<account>.blob.core.windows.net/<container>/<blob>
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return {
        containerName: pathParts[0],
        blobName: pathParts.slice(1).join('/')
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  console.log('Delete files API route hit');
  
  try {
    const { audioUrl, coverUrl, mixId } = await request.json();
    console.log('Received request to delete:', { audioUrl, coverUrl, mixId });
    
    // Verify user authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Authenticated user:', user.id);

    // Verify user owns this mix
    const { data: mix, error: mixError } = await supabase
      .from('mixes')
      .select('user_id')
      .eq('id', mixId)
      .single();

    if (mixError) {
      console.error('Error fetching mix:', mixError);
      return NextResponse.json({ error: 'Mix not found' }, { status: 404 });
    }

    if (mix.user_id !== user.id) {
      console.log('User does not own mix');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete audio file
    if (audioUrl) {
      console.log('Processing audio URL:', audioUrl);
      const audioFile = parseAzureUrl(audioUrl);
      console.log('Parsed audio file info:', audioFile);
      
      if (audioFile) {
        const containerClient = blobServiceClient.getContainerClient(audioFile.containerName);
        await containerClient.deleteBlob(audioFile.blobName);
        console.log('Audio file deleted successfully');
      }
    }

    // Delete cover file
    if (coverUrl) {
      console.log('Processing cover URL:', coverUrl);
      const coverFile = parseAzureUrl(coverUrl);
      console.log('Parsed cover file info:', coverFile);
      
      if (coverFile) {
        const containerClient = blobServiceClient.getContainerClient(coverFile.containerName);
        await containerClient.deleteBlob(coverFile.blobName);
        console.log('Cover file deleted successfully');
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Server error in delete-files:', error);
    
    // Type guard for Error objects
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Failed to delete files',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}