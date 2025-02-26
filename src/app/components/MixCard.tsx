'use client';

import { Music } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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

interface MixCardProps {
  mix: Mix;
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

export function MixCard({ mix }: MixCardProps) {
  return (
    <Link href={`/mix/${mix.id}`}>
      <motion.div 
        className="bg-gray-800/60 rounded-lg p-4 space-y-3 hover:bg-gray-750 transition cursor-pointer"
      >
        {/* Cover Image */}
        <div className="relative w-full h-48 bg-gray-700 rounded-md overflow-hidden">
          {mix.cover_url ? (
            <motion.div
              className="relative w-full h-full"
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.4, ease: "easeOut" }
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
                <Music className="w-12 h-12 text-gray-600" />
              </motion.div>
            </div>
          )}
        </div>

        {/* Mix Info */}
        <div className="w-full">
          <div className="w-full">
            <h3 className="font-medium truncate max-w-full">
              {mix.title}
            </h3>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-400">
            <div className="flex flex-col min-w-0 flex-1 mr-4">
              <p className="truncate max-w-full">
                by {mix.artist || 'Unknown Artist'}
              </p>
              {mix.genre && (
                <motion.span 
                  className="text-blue-400 text-xs truncate"
                  variants={genreVariants}
                  initial="initial"
                  animate="animate"
                >
                  {mix.genre}
                </motion.span>
              )}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-shrink-0"
            >
              {mix.play_count} plays
            </motion.p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Loading skeleton component for the card
export function MixCardSkeleton() {
  return (
    <motion.div 
      className="bg-gray-800 rounded-lg p-4 space-y-3"
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
        className="bg-gray-700 h-48 rounded-md"
        animate={{ 
          opacity: [0.5, 0.8, 0.5],
          transition: {
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          }
        }}
      />
      <motion.div 
        className="h-4 bg-gray-700 rounded w-3/4"
        animate={{ 
          opacity: [0.5, 0.8, 0.5],
          transition: {
            repeat: Infinity,
            duration: 1.5,
            delay: 0.2,
            ease: "easeInOut"
          }
        }}
      />
      <motion.div 
        className="h-3 bg-gray-700 rounded w-1/2"
        animate={{ 
          opacity: [0.5, 0.8, 0.5],
          transition: {
            repeat: Infinity,
            duration: 1.5,
            delay: 0.4,
            ease: "easeInOut"
          }
        }}
      />
    </motion.div>
  );
}