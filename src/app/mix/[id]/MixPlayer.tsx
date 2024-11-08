'use client';

import { useState, useEffect } from 'react';
import { Calendar, Music, User, AlertCircle, Heart, X } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User as SupabaseUser } from '@supabase/supabase-js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Waveform } from '@/app/components/Waveform';
import { MixMenu } from '@/app/components/MixMenu';
import { MixMetadataForm } from '@/app/components/MixMetadataForm';
import { Mix, Artist } from '@/app/components/MixCard';

export function MixPlayer({ id }: { id: string }) {
  const [mix, setMix] = useState<Mix | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    artists: [] as Artist[],
    genre: null as string | null,
    description: null as string | null,
  });
  const [isSaving, setIsSaving] = useState(false);


  const supabase = createClientComponentClient();
  const router = useRouter();

  // Set up media session metadata when mix data is loaded
  useEffect(() => {
    if (mix && 'mediaSession' in navigator) {
      const artistDisplay = mix.mix_artists?.length
        ? mix.mix_artists.map(ma => ma.artists.name).join(', ')
        : 'Unknown Artist';

      navigator.mediaSession.metadata = new MediaMetadata({
        title: mix.title,
        artist: artistDisplay,
        album: mix.genre || 'Mix',
        artwork: [
          { src: mix.cover_url || '/placeholder-artwork.png', sizes: '96x96', type: 'image/jpeg' },
          { src: mix.cover_url || '/placeholder-artwork.png', sizes: '128x128', type: 'image/jpeg' },
          { src: mix.cover_url || '/placeholder-artwork.png', sizes: '256x256', type: 'image/jpeg' },
          { src: mix.cover_url || '/placeholder-artwork.png', sizes: '512x512', type: 'image/jpeg' },
        ]
      });
    }
  }, [mix]);

  // Fetch mix data and like counts
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    async function fetchMixAndLikes() {
      const { data: mixData, error: mixError } = await supabase
        .from('mixes')
        .select(`
          *,
          mix_artists!left(
            artists(
              id,
              name,
              avatar_url
            )
          )
        `)
        .eq('id', id)
        .single();

      if (mixError) {
        console.error('Error fetching mix:', mixError);
        return;
      }

      setMix(mixData);
      document.title = `${mixData.title} | MusicMilk`;


      // Update play count
      await supabase
        .from('mixes')
        .update({ play_count: (mixData.play_count || 0) + 1 })
        .eq('id', id);

      // Fetch like count
      const { count, error: countError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('mix_id', id);

      if (!countError) {
        setLikeCount(count || 0);
      }
    }

    fetchMixAndLikes();
  }, [id, supabase]);

  // Check if current user has liked the mix
  useEffect(() => {
    async function checkLikeStatus() {
      if (!user || !mix) return;

      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('mix_id', mix.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error) {
        setIsLiked(!!data);
      }
    }

    checkLikeStatus();
  }, [user, mix, supabase]);

  // Update editForm when mix data is loaded
  useEffect(() => {
    if (mix) {
      setEditForm({
        title: mix.title,
        artists: mix.mix_artists?.map(ma => ma.artists) || [],
        genre: mix.genre,
        description: mix.description,
      });
    }
  }, [mix]);

  const handleFormChange = (newData: {
    title: string;
    artists: Artist[];
    genre: string | null;
    description: string | null;
  }) => {
    setEditForm(newData);
  };

  const handleSave = async () => {
    if (!mix || !user) return;

    setIsSaving(true);
    try {
      // Log the data being saved
      console.log('Saving mix data:', {
        title: editForm.title,
        genre: editForm.genre,
        description: editForm.description,
      });

      // Update mix details
      const { error: mixError } = await supabase
        .from('mixes')
        .update({
          title: editForm.title,
          genre: editForm.genre,
          description: editForm.description,
        })
        .eq('id', mix.id)
        .eq('user_id', user.id);

      if (mixError) {
        console.error('Error updating mix details:', mixError);
        throw mixError;
      }

      // Delete existing artist associations
      const { error: deleteError } = await supabase
        .from('mix_artists')
        .delete()
        .eq('mix_id', mix.id);

      if (deleteError) {
        console.error('Error deleting existing artists:', deleteError);
        throw deleteError;
      }

      // Insert new artist associations
      if (editForm.artists.length > 0) {
        const { error: insertError } = await supabase
          .from('mix_artists')
          .insert(
            editForm.artists.map(artist => ({
              mix_id: mix.id,
              artist_id: artist.id,
            }))
          );

        if (insertError) {
          console.error('Error inserting new artists:', insertError);
          throw insertError;
        }
      }

      // Refresh mix data
      const { data: updatedMix, error: fetchError } = await supabase
        .from('mixes')
        .select(`
        *,
        mix_artists(
          artists(
            id,
            name,
            avatar_url
          )
        )
      `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      setMix(updatedMix);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating mix:', error);
      alert('Failed to update mix. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  const handleArtistSearch = async (query: string) => {
    const { data, error } = await supabase
      .from('artists')
      .select('id, name, avatar_url')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (error) throw error;
    return data || [];
  };

  const handleArtistCreate = async (name: string) => {
    const { data, error } = await supabase
      .from('artists')
      .insert({ name })
      .select('id, name, avatar_url')
      .single();

    if (error) throw error;
    return data;
  };

  const handleLikeToggle = async () => {
    if (!user || !mix || isLikeLoading) return;

    setIsLikeLoading(true);
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(prev => prev + (isLiked ? -1 : 1));

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('mix_id', mix.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            mix_id: mix.id,
            user_id: user.id
          });

        if (error) throw error;
      }
    } catch (error) {
      // Revert optimistic update on error
      console.error('Error toggling like:', error);
      setIsLiked(!isLiked);
      setLikeCount(prev => prev + (isLiked ? 1 : -1));
    } finally {
      setIsLikeLoading(false);
    }
  };


  const handleDelete = async () => {
    if (!mix || !user || isDeleting) return;

    setIsDeleting(true);
    try {
      console.log('Deleting audio:', mix.audio_storage_path);

      const { error: audioError } = await supabase.storage
        .from('audio')
        .remove([mix.audio_storage_path]);

      if (audioError) {
        console.error('Error deleting audio:', audioError);
        throw audioError;
      }

      if (mix.cover_storage_path) {
        console.log('Deleting cover:', mix.cover_storage_path);

        const { error: coverError } = await supabase.storage
          .from('covers')
          .remove([mix.cover_storage_path]);

        if (coverError) {
          console.error('Error deleting cover:', coverError);
        }
      }

      const { error: dbError } = await supabase
        .from('mixes')
        .delete()
        .eq('id', mix.id)
        .eq('user_id', user.id);

      if (dbError) {
        throw dbError;
      }

      router.push('/');

    } catch (error) {
      console.error('Error deleting mix:', error);
      alert('Failed to delete mix. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!mix) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading mix...</div>
      </div>
    );
  }

  const formattedDate = new Date(mix.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div>
      <main className="container mx-auto px-4 py-6 lg:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg">
            {/* Mix Content */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              {/* Cover Art Section */}
              <div className="w-60 lg:w-60 shrink-0 mx-auto lg:mx-0">
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-700 shadow-lg relative">
                  {mix.cover_url ? (
                    <Image
                      src={mix.cover_url}
                      alt={mix.title}
                      width={320}
                      height={320}
                      className="object-cover w-full h-full"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-20 h-20 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Mix Info Section */}
              <div className="flex-1 flex flex-col min-w-0 lg:py-2">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight break-words">
                    {mix.title}
                  </h1>
                  <div className="flex items-center gap-2">
                    {/* Like Button */}
                    <button
                      onClick={handleLikeToggle}
                      disabled={!user}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${user ? 'hover:bg-gray-700/50' : 'cursor-not-allowed opacity-50'
                        }`}
                      title={user ? 'Like' : 'Sign in to like'}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${isLiked
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400 group-hover:text-gray-300'
                          }`}
                      />
                      <span className="text-sm font-medium text-gray-300">
                        {likeCount}
                      </span>
                    </button>

                    <MixMenu
                      isOwner={Boolean(user && mix.user_id === user.id)}
                      onDelete={() => setShowDeleteConfirm(true)}
                      onEdit={() => setIsEditing(true)}
                      showEditOnMobile={false}
                    />
                  </div>
                </div>

                {mix.mix_artists && mix.mix_artists.length > 0 && mix.mix_artists.some(ma => ma.artists) && (
                  <div className="flex items-center gap-2 text-gray-300 mt-5">
                    <User className="w-4 h-4" />
                    <span className="text-lg">
                      {mix.mix_artists
                        .filter(ma => ma.artists)
                        .map(ma => ma.artists.name)
                        .join(', ')}
                    </span>
                  </div>
                )}

                {mix.genre && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                      {mix.genre}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-gray-400 mt-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                  <span>•</span>
                  <span>{mix.play_count.toLocaleString()} plays</span>
                </div>

                {mix.description && (
                  <p className="text-gray-300 text-sm leading-relaxed mt-5 lg:max-w-2xl">
                    {mix.description}
                  </p>
                )}
              </div>
            </div>

            {/* Waveform Player */}
            <div className="mt-8 lg:mt-10 bg-gray-700/30 rounded-xl p-4 lg:p-5 shadow-md">
              <Waveform audioUrl={mix.audio_url} />
            </div>
          </div>
        </div>
      </main>

      {/* Edit Sidebar */}
      {isEditing && (
        <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-700 overflow-hidden hidden lg:flex flex-col">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Mix</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <MixMetadataForm
              metadata={{
                title: editForm.title,
                artists: editForm.artists,
                genre: editForm.genre,
                description: editForm.description
              }}
              onChange={handleFormChange}
              onArtistSearch={handleArtistSearch}
              onArtistCreate={handleArtistCreate}
              disabled={isSaving}
            />
          </div>

          <div className="p-6 border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm">
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-auto">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-semibold text-white">Delete Mix</h3>
                <p className="text-gray-300 text-sm">
                  Are you sure you want to delete &ldquo;{mix.title}&rdquo;? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full px-4 py-3 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 text-sm font-medium bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}