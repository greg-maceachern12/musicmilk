'use client';

import { useState, useEffect } from 'react';
import { Calendar, Music, User, Link } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { Waveform } from '@/app/components/Waveform';

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
  const [copied, setCopied] = useState(false);
  const supabase = createClientComponentClient();

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
      
      // Update document title
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

  if (!mix) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading mix...</div>
      </div>
    );
  }
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formattedDate = new Date(mix.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
                <h1 className="text-2xl md:text-4xl font-bold break-words">{mix.title}</h1>
                <button
                  onClick= {handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-sm bg-white/10 hover:bg-white/20 transition-colors rounded-md mx-auto md:mx-0"
                >
                  <Link className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy link'}</span>
                </button>
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
    </div>
  );
}