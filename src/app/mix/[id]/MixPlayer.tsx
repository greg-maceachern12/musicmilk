'use client';

import { useState, useEffect } from 'react';
import { Calendar, Music, User, AlertCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User as SupabaseUser } from '@supabase/supabase-js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Waveform } from '@/app/components/Waveform';
import { MixMenu } from '@/app/components/MixMenu';

interface Mix {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  description: string | null;
  audio_url: string;
  audio_storage_path: string;
  cover_url: string | null;
  cover_storage_path: string | null;
  created_at: string;
  play_count: number;
  user_id: string | null;
}

export function MixPlayer({ id }: { id: string }) {
  const [mix, setMix] = useState<Mix | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    async function fetchMix() {
      const { data, error } = await supabase
        .from('mixes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching mix:', error);
        return;
      }

      setMix(data);
      document.title = `${data.title} | MusicMilk`;

      const { error: updateError } = await supabase
        .from('mixes')
        .update({ play_count: (data.play_count || 0) + 1 })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating play count:', updateError);
      }
    }

    fetchMix();
  }, [id, supabase]);

  const handleDelete = async () => {
    if (!mix || !user || isDeleting) return;
      
    setIsDeleting(true);
    try {
      console.log('Deleting audio:', mix.audio_storage_path);
      
      // Delete the audio file from storage
      const { error: audioError } = await supabase.storage
        .from('audio')
        .remove([mix.audio_storage_path]);
      
      if (audioError) {
        console.error('Error deleting audio:', audioError);
        throw audioError;
      }
  
      // Delete cover image if it exists
      if (mix.cover_storage_path) {
        console.log('Deleting cover:', mix.cover_storage_path);
        
        const { error: coverError } = await supabase.storage
          .from('covers')
          .remove([mix.cover_storage_path]);
        
        if (coverError) {
          console.error('Error deleting cover:', coverError);
          // Don't throw here, as cover deletion is not critical
        }
      }
  
      // Delete the database record
      const { error: dbError } = await supabase
        .from('mixes')
        .delete()
        .eq('id', mix.id)
        .eq('user_id', user.id);
  
      if (dbError) {
        throw dbError;
      }
  
      // Redirect to home page
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
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading mix...</div>
      </div>
    );
  }

  const formattedDate = new Date(mix.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isOwner = Boolean(user && mix.user_id === user.id);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-4 md:p-8">
            {/* Mix Header */}
            <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
              {/* Cover Image */}
              <div className="mx-auto md:mx-0 w-48 h-48 relative flex-shrink-0 bg-gray-700 rounded-lg overflow-hidden mb-4 md:mb-0">
                {mix.cover_url ? (
                  <Image
                    src={mix.cover_url}
                    alt={mix.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-12 h-12 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Mix Info */}
              <div className="flex-grow text-center md:text-left space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-2xl md:text-4xl font-bold break-words">{mix.title}</h1>
                  <MixMenu
                    isOwner={isOwner}
                    onDelete={() => setShowDeleteConfirm(true)}
                  />
                </div>

                {mix.artist && (
                  <div className="flex items-center gap-2 text-gray-300 justify-center md:justify-start">
                    <User className="w-4 h-4" />
                    <span className="break-words text-lg">{mix.artist}</span>
                  </div>
                )}

                {mix.genre && (
                  <div className="inline-block bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    {mix.genre}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                  <span className="hidden md:inline">•</span>
                  <span>{mix.play_count} plays</span>
                </div>

                {mix.description && (
                  <p className="text-gray-300 text-sm md:text-base break-words">
                    {mix.description}
                  </p>
                )}
              </div>
            </div>

            {/* Waveform */}
            <div className="bg-gray-700/50 rounded-lg p-4 md:p-6 mt-8">
              <Waveform
                audioUrl={mix.audio_url}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Delete Mix</h3>
                <p className="text-gray-300 text-sm">
                Are you sure you want to delete &ldquo;{mix.title}&rdquo;? This action cannot be undone..
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
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