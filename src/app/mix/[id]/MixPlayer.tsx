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

  const isOwner = Boolean(user && mix.user_id === user.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <main className="px-4 py-6 max-w-3xl mx-auto">
        {/* Cover Art Section */}
        <div className="mb-6 relative aspect-square max-w-xs mx-auto">
          <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-800 shadow-lg">
            {mix.cover_url ? (
              <Image
                src={mix.cover_url}
                alt={mix.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-16 h-16 text-gray-600" />
              </div>
            )}
          </div>
        </div>

        {/* Mix Info Section */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-white leading-tight break-words flex-1">
              {mix.title}
            </h1>
            <MixMenu
              isOwner={isOwner}
              onDelete={() => setShowDeleteConfirm(true)}
            />
          </div>

          {mix.artist && (
            <div className="flex items-center gap-2 text-gray-300">
              <User className="w-4 h-4" />
              <span className="text-lg">{mix.artist}</span>
            </div>
          )}

          {mix.genre && (
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                {mix.genre}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
            <span>•</span>
            <span>{mix.play_count} plays</span>
          </div>

          {mix.description && (
            <p className="text-gray-300 text-sm leading-relaxed">
              {mix.description}
            </p>
          )}
        </div>

        {/* Waveform Player */}
        <div className="mt-6 bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
          <Waveform audioUrl={mix.audio_url} />
        </div>
      </main>

      {/* Delete Modal - Improved mobile layout */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-t-xl sm:rounded-xl p-6 w-full max-w-sm mx-auto">
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