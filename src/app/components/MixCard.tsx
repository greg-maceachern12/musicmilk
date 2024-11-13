'use client';

import { Music } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeIn, fadeInUp, cardHover, defaultTransition } from '@/lib/animations';

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

export function MixCard({ mix }: MixCardProps) {
  return (
    <Link href={`/mix/${mix.id}`}>
      <motion.div 
        className="bg-gray-800 rounded-lg p-4 space-y-3 hover:bg-gray-750 transition cursor-pointer"
        variants={cardHover}
        whileHover="hover"
        whileTap="tap"
      >
        {/* Cover Image */}
        <div className="relative w-full h-48 bg-gray-700 rounded-md overflow-hidden">
          {mix.cover_url ? (
            <motion.div
              className="relative w-full h-full"
              variants={cardHover}
              initial="initial"
              whileHover="hover"
              transition={defaultTransition}
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
                variants={fadeIn}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.2 }}
              >
                <Music className="w-12 h-12 text-gray-600" />
              </motion.div>
            </div>
          )}
        </div>

        {/* Mix Info */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <h3 className="font-medium truncate">
            {mix.title}
          </h3>
          <div className="flex justify-between items-center text-sm text-gray-400">
            <div className="flex flex-col">
              <p className="truncate">
                by {mix.artist || 'Unknown Artist'}
              </p>
              {mix.genre && (
                <motion.span 
                  className="text-blue-400 text-xs"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.2 }}
                >
                  {mix.genre}
                </motion.span>
              )}
            </div>
            <motion.p
              variants={fadeIn}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.3 }}
            >
              {mix.play_count} plays
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </Link>
  );
}

// Loading skeleton component for the card
export function MixCardSkeleton() {
  return (
    <motion.div 
      className="bg-gray-800 rounded-lg p-4 space-y-3"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
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
