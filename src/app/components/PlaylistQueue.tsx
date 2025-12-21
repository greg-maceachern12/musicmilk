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
  const [isMobile, setIsMobile] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        className="flex flex-shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        aria-label="Show queue"
        title={`Queue (${playlist.length} tracks)`}
      >
        <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Queue Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // @ts-expect-error - Framer motion types conflict with React 19
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal Content - Mobile: bottom sheet, Desktop: centered */}
            <div className="fixed inset-0 z-[101] pointer-events-none flex items-end sm:items-center sm:justify-center p-0 sm:p-4">
              <motion.div
                initial={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.95 }}
                animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
                exit={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.95 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 30,
                  opacity: { duration: 0.2 }
                }}
                // @ts-expect-error - Framer motion types conflict with React 19
                className="pointer-events-auto bg-gray-900 rounded-t-2xl sm:rounded-2xl p-4 pt-5 sm:p-6 w-full sm:max-w-md max-h-[70vh] sm:max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border-t sm:border border-white/10"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Queue</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                  aria-label="Close queue"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Track List */}
              <div ref={listRef} className="space-y-2 overflow-y-auto custom-scrollbar pr-2 -mr-2 flex-1 min-h-0">
                {playlist.map((mix, index) => (
                  <motion.button
                    key={`${mix.id}-${index}`}
                    ref={index === currentIndex ? activeItemRef : null}
                    // @ts-expect-error - Framer motion types conflict with React 19
                    onClick={() => handleTrackClick(index)}
                    className={`w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-lg transition-colors text-left ${
                      index === currentIndex
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                    whileHover={{ scale: index === currentIndex ? 1 : 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                      {mix.cover_url ? (
                        <Image
                          src={mix.cover_url}
                          alt={mix.title}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate text-sm sm:text-base ${
                        index === currentIndex ? 'text-blue-300' : 'text-white'
                      }`}>
                        {mix.title}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">
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
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 