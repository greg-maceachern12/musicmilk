'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MixCard, MixCardSkeleton } from './MixCard';
import { motion } from 'framer-motion';

interface Mix {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  cover_url: string | null;
  play_count: number;
  created_at: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  show: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  }
};

const buttonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      delay: 0.4,
      duration: 0.5
    }
  },
  hover: { 
    scale: 1.05,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 400
    }
  },
  tap: { 
    scale: 0.95 
  }
};

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
        .select('id, title, artist, genre, cover_url, play_count, created_at')
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
  };

  useEffect(() => {
    fetchMixes();
  }, []);

  if (isLoading) {
    return (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {[...Array(MIXES_TO_SHOW)].map((_, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-red-400">{error}</p>
        <motion.button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {mixes.map((mix, index) => (
          <motion.div
            key={mix.id}
            variants={itemVariants}
            custom={index}
          >
            <MixCard mix={mix} />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Show More Link */}
      <motion.div 
        className="flex justify-center"
        variants={buttonVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div
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