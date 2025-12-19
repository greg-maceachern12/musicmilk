'use client';

import { Music, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAudio } from '../contexts/AudioContext';

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

interface MixCardProps {
  mix: Mix;
  playlist?: Mix[];
  playlistIndex?: number;
}

const genreVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      delay: 0.2,
      duration: 0.3
    }
  }
};

export function MixCard({ mix, playlist, playlistIndex }: MixCardProps) {
  const { dispatch } = useAudio();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (playlist && playlistIndex !== undefined) {
      dispatch({
        type: 'SET_PLAYLIST',
        payload: { mixes: playlist, startIndex: playlistIndex }
      });
    } else {
      dispatch({ type: 'PLAY_MIX', payload: mix });
    }
  };

  return (
    <div className="relative group h-full">
      <Link href={`/mix/${mix.id}`} className="block h-full">
        <motion.div 
          className="bg-black/20 backdrop-blur-md rounded-2xl p-4 space-y-4 border border-white/5 hover:bg-black/30 hover:border-white/10 hover:ring-1 hover:ring-white/10 transition-all duration-300 h-full flex flex-col"
        >
        {/* Cover Image */}
        <div className="relative w-full aspect-square bg-gray-900/50 rounded-xl overflow-hidden shadow-lg border border-white/5 group-hover:shadow-2xl transition-all duration-500">
          {mix.cover_url ? (
            <motion.div
              className="relative w-full h-full"
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] }
              }}
            >
              <Image
                src={mix.cover_url}
                alt={mix.title}
                fill
                className="object-cover"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 0.5,
                  delay: 0.2,
                  ease: "easeOut" 
                }}
              >
                <Music className="w-16 h-16 text-white/20" />
              </motion.div>
            </div>
          )}
          
          {/* Play Button Overlay */}
          <motion.div
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black rounded-full p-4 shadow-xl shadow-black/20 hover:scale-110 transition-transform"
            >
              <Play className="w-6 h-6 ml-0.5 fill-current" />
            </motion.button>
          </motion.div>
        </div>

        {/* Mix Info */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="w-full mb-1">
            <h3 className="font-bold text-lg text-white/90 truncate max-w-full group-hover:text-white transition-colors">
              {mix.title}
            </h3>
          </div>
          <div className="flex flex-col gap-3 mt-auto">
            <div className="flex justify-between items-center">
              <p className="text-sm text-white/50 truncate max-w-[60%] hover:text-white/70 transition-colors">
                {mix.artist || 'Unknown Artist'}
              </p>
              <span className="text-xs font-medium text-white/30 flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                {mix.play_count}
              </span>
            </div>
            {mix.genre && (
              <div className="flex">
                <motion.span 
                  className="text-[10px] uppercase tracking-wider font-semibold text-white/60 px-2 py-1 rounded-md bg-white/5 border border-white/5"
                  variants={genreVariants}
                  initial="initial"
                  animate="animate"
                >
                  {mix.genre}
                </motion.span>
              </div>
            )}
          </div>
        </div>
        </motion.div>
      </Link>
    </div>
  );
}

// Loading skeleton component for the card
export function MixCardSkeleton() {
  return (
    <motion.div 
      className="bg-white/5 rounded-2xl p-4 space-y-4 h-full border border-white/5"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        transition: {
          duration: 0.4,
          ease: "easeOut"
        }
      }}
    >
      <motion.div
        className="bg-white/5 h-64 rounded-xl aspect-square w-full"
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
          transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          }
        }}
      />
      <div className="space-y-3">
        <motion.div 
          className="h-6 bg-white/5 rounded-md w-3/4"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            transition: {
              repeat: Infinity,
              duration: 1.5,
              delay: 0.2,
              ease: "easeInOut"
            }
          }}
        />
        <motion.div 
          className="h-4 bg-white/5 rounded-md w-1/2"
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
            transition: {
              repeat: Infinity,
              duration: 1.5,
              delay: 0.4,
              ease: "easeInOut"
            }
          }}
        />
      </div>
    </motion.div>
  );
}