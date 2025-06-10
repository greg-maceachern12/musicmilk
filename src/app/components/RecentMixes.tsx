'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MixCard, MixCardSkeleton } from './MixCard';
import { motion } from 'framer-motion';
import { 
  fadeIn, 
  fadeInUp, 
  listContainer, 
  cardHover,
  defaultTransition 
} from '@/lib/animations';

interface Mix {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  audio_url: string;
  cover_url: string | null;
  play_count: number;
  created_at: string;
}

export default function RecentMixes() {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const MIXES_TO_SHOW = 3;

  const fetchMixes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('mixes')
        .select('id, title, artist, genre, audio_url, cover_url, play_count, created_at')
        .order('created_at', { ascending: false })
        .limit(MIXES_TO_SHOW);

      if (error) {
        throw error;
      }

      setMixes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mixes');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchMixes();
  }, [fetchMixes]);

  if (isLoading) {
    return (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={listContainer}
        initial="initial"
        animate="animate"
      >
        {[...Array(MIXES_TO_SHOW)].map((_, i) => (
          <motion.div 
            key={i}
            variants={fadeInUp}
            transition={{ ...defaultTransition, delay: i * 0.1 }}
          >
            <MixCardSkeleton />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="text-center py-8"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={defaultTransition}
      >
        <p className="text-red-400">{error}</p>
        <motion.button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition"
          variants={cardHover}
          whileHover="hover"
          whileTap="tap"
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
    >
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={listContainer}
        initial="initial"
        animate="animate"
      >
        {mixes.map((mix, index) => (
          <motion.div
            key={mix.id}
            variants={fadeInUp}
            transition={{ ...defaultTransition, delay: index * 0.1 }}
          >
            <MixCard 
              mix={mix} 
              playlist={mixes}
              playlistIndex={index}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Show More Link */}
      <motion.div 
        className="flex justify-center"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...defaultTransition, delay: 0.4 }}
      >
        <motion.div
          variants={cardHover}
          whileHover="hover"
          whileTap="tap"
        >
          <Link 
            href="/feed" 
            className="px-6 py-3 text-sm bg-gray-800 rounded-md hover:bg-gray-700 transition inline-flex items-center gap-2"
          >
            Show More
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}