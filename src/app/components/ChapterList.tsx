import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Play } from 'lucide-react';
import { cardHover } from '@/lib/animations';
import { useAudio } from '@/app/contexts/AudioContext';

interface Chapter {
  id: string;
  mix_id: string;
  title: string;
  timestamp: string;
  order: number;
}

interface ChapterListProps {
  chapters: Chapter[];
}

function parseTimestamp(timestamp: string): number {
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export function ChapterList({ chapters }: ChapterListProps) {
  const { state, dispatch } = useAudio();
  
  if (!chapters.length) return null;

  const handleChapterClick = (timestamp: string) => {
    const seconds = parseTimestamp(timestamp);
    dispatch({ type: 'SEEK', payload: seconds });
  };

  // Sort chapters by timestamp
  const sortedChapters = [...chapters].sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp));

  const findActiveChapterIndex = () => {
    const currentTime = state.currentTime || 0;
    
    // Find the last chapter that starts before or at the current time
    for (let i = sortedChapters.length - 1; i >= 0; i--) {
      if (parseTimestamp(sortedChapters[i].timestamp) <= currentTime) {
        return i;
      }
    }
    return -1;
  };

  const activeChapterIndex = findActiveChapterIndex();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white">Chapters</h3>
        <span className="text-sm text-gray-400">{chapters.length} tracks</span>
      </div>

      <div className="grid gap-2">
        {sortedChapters.map((chapter, index) => {
          const isActive = index === activeChapterIndex;
          
          return (
            <motion.button
              key={chapter.id}
              onClick={() => handleChapterClick(chapter.timestamp)}
              className={`w-full group relative overflow-hidden rounded-lg transition-all duration-300
                ${isActive ? 'bg-white/15 ring-2 ring-purple-500 ring-opacity-50' : 'hover:bg-white/10'}
                backdrop-blur-sm`}
              variants={cardHover}
              whileHover="hover"
              whileTap="tap"
            >
              {isActive && (
                <motion.div 
                  className="absolute bottom-0 left-0 h-0.5 bg-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              )}
              
              <div className="flex items-center gap-4 p-3">
                {/* Chapter number/indicator */}
                <div className={`w-8 h-8 flex items-center justify-center rounded-md 
                  ${isActive 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'bg-white/5 text-gray-400'}`}
                >
                  {isActive ? (
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  ) : (
                    <span className="text-sm font-medium">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Chapter info */}
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="flex-1 truncate pr-4">
                    <h4 className={`text-sm font-medium truncate 
                      ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}
                    >
                      {chapter.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1.5 
                      ${isActive ? 'text-purple-400' : 'text-gray-400'}`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{chapter.timestamp}</span>
                    </div>
                    
                    <div className={`w-8 h-8 flex items-center justify-center rounded-md
                      ${isActive 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'}
                      transition-all duration-300`}
                    >
                      <Play className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default ChapterList;