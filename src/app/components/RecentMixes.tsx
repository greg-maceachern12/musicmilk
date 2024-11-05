'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Music } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

interface Mix {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  cover_url: string | null;
  play_count: number;
  created_at: string;
}

export default function RecentMixes() {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchRecentMixes = async () => {
      try {
        const { data, error } = await supabase
          .from('mixes')
          .select('id, title, artist, genre, cover_url, play_count, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }

        setMixes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mixes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentMixes();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 space-y-3 animate-pulse">
            <div className="bg-gray-700 h-48 rounded-md"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mixes.map((mix) => (
        <Link href={`/mix/${mix.id}`} key={mix.id}>
          <div className="bg-gray-800 rounded-lg p-4 space-y-3 hover:bg-gray-750 transition cursor-pointer">
            {/* Cover Image */}
            <div className="relative w-full h-48 bg-gray-700 rounded-md overflow-hidden">
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
            <h3 className="font-medium truncate">{mix.title}</h3>
            <div className="flex justify-between items-center text-sm text-gray-400">
              <div className="flex flex-col">
                <p className="truncate">by {mix.artist || 'Unknown Artist'}</p>
                {mix.genre && (
                  <span className="text-blue-400 text-xs">{mix.genre}</span>
                )}
              </div>
              <p>{mix.play_count} plays</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}