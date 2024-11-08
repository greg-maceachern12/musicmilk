'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MixCard, MixCardSkeleton } from './MixCard';
import type { Mix } from '@/app/types/mix';

export default function RecentMixes() {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const MIXES_TO_SHOW = 3;

  const fetchMixes = async () => {
    try {
      const { data, error } = await supabase
        .from('mixes')
        .select(`
          id, 
          title, 
          genre, 
          cover_url, 
          play_count, 
          created_at,
          mix_artists!left(
            artists(
              id,
              name,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(MIXES_TO_SHOW);

      if (error) throw error;
      setMixes(data || []);
    } catch (err) {
      console.error('Error fetching mixes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load mixes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMixes();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(MIXES_TO_SHOW)].map((_, i) => (
          <MixCardSkeleton key={i} />
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mixes.map((mix) => (
          <MixCard key={mix.id} mix={mix} />
        ))}
      </div>

      <div className="flex justify-center">
        <Link
          href="/feed"
          className="px-6 py-3 text-sm bg-gray-800 rounded-md hover:bg-gray-700 transition inline-flex items-center gap-2"
        >
          Show More
        </Link>
      </div>
    </div>
  );
}