'use client';

import { useState, useEffect } from 'react';
import { Calendar, Music, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import { Waveform } from '@/app/components/Waveform';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Mix {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  description: string | null;
  audio_url: string;
  cover_url: string | null;
  created_at: string;
  play_count: number;
}

export function MixPlayer({ id }: { id: string }) {
  const [mix, setMix] = useState<Mix | null>(null);
  // const [isPlaying, setIsPlaying] = useState(false);

  // Fetch mix data
  useEffect(() => {
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

      // Increment play count
      const { error: updateError } = await supabase
        .from('mixes')
        .update({ play_count: (data.play_count || 0) + 1 })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating play count:', updateError);
      }
    }

    fetchMix();
  }, [id]);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6">
            {/* Mix Header */}
            <div className="flex items-start gap-6 mb-8">
              {/* Cover Image */}
              <div className="w-48 h-48 relative flex-shrink-0 bg-gray-700 rounded-lg overflow-hidden">
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
              <div className="flex-grow">
                <h1 className="text-3xl font-bold mb-2">{mix.title}</h1>
                {mix.artist && (
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <User className="w-4 h-4" />
                    <span>{mix.artist}</span>
                  </div>
                )}
                {mix.genre && (
                  <div className="inline-block bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm mb-2">
                    {mix.genre}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                  <span className="mx-2">•</span>
                  <span>{mix.play_count} plays</span>
                </div>
                {mix.description && (
                  <p className="text-gray-300 mt-4">{mix.description}</p>
                )}
              </div>
            </div>

            {/* Waveform */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <Waveform 
                audioUrl={mix.audio_url}
                onPlayPause={setIsPlaying}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}