'use client';

import { useState, useEffect, useRef } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Music, List, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function PlaylistQueue() {
  const { state, dispatch } = useAudio();
  const { playlist, currentIndex } = state;
  const [isOpen, setIsOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      setTimeout(() => {
        if (activeItemRef.current) {
          activeItemRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 300); // Delay to allow modal animation to finish
    }
  }, [isOpen, currentIndex]);

  if (playlist.length <= 1) return null;

  const handleTrackClick = (index: number) => {
    dispatch({
      type: 'SET_PLAYLIST',
      payload: { mixes: playlist, startIndex: index }
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* Queue Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-shrink-0 p-2 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
        aria-label="Show queue"
        title={`Queue (${playlist.length} tracks)`}
      >
        <List className="w-4 h-4" />
      </button>

      {/* Queue Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // @ts-expect-error - Framer motion types conflict with React 19
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center p-0"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              // @ts-expect-error - Framer motion types conflict with React 19
              className="bg-gray-900 rounded-t-2xl sm:rounded-xl p-4 pt-5 sm:p-6 max-w-full sm:max-w-md w-full max-h-[60vh] sm:max-h-[70vh] overflow-hidden flex flex-col"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold">Queue</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Close queue"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div ref={listRef} className="space-y-2 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                {playlist.map((mix, index) => (
                  <motion.button
                    key={mix.id}
                    ref={index === currentIndex ? activeItemRef : null}
                    // @ts-expect-error - Framer motion types conflict with React 19
                    onClick={() => handleTrackClick(index)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left ${
                      index === currentIndex
                        ? 'bg-blue-600/20'
                        : 'hover:bg-gray-800'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                      {mix.cover_url ? (
                        <Image
                          src={mix.cover_url}
                          alt={mix.title}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate text-sm ${
                        index === currentIndex ? 'text-blue-300' : 'text-white'
                      }`}>
                        {mix.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {mix.artist || 'Unknown Artist'}
                      </p>
                    </div>

                    {index === currentIndex && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 