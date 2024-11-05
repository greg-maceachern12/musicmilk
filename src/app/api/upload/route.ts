export async function POST(request: Request) {
  try {
    const { audioFile, title, artist, genre, description, coverImage } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Upload audio file
    const audioFileName = `${Date.now()}-${audioFile.name}`;
    const { error: audioError } = await supabase.storage
      .from('audio')
      .upload(audioFileName, audioFile);

    if (audioError) {
      throw audioError;
    }

    // Get audio URL
    const { data: { publicUrl: audioUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(audioFileName);

    // Upload cover image if provided
    let coverUrl = null;
    if (coverImage) {
      const coverFileName = `${Date.now()}-${coverImage.name}`;
      const { error: coverError } = await supabase.storage
        .from('covers')
        .upload(coverFileName, coverImage);

      if (!coverError) {
        const { data: { publicUrl } } = supabase.storage
          .from('covers')
          .getPublicUrl(coverFileName);
        coverUrl = publicUrl;
      }
    }

    // Store metadata
    const { data: mix, error: dbError } = await supabase
      .from('mixes')
      .insert({
        title,
        artist,
        genre,
        description,
        audio_url: audioUrl,
        cover_url: coverUrl,
        user_id: user.id
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    return Response.json({ 
      mix,
      audioUrl,
      coverUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}