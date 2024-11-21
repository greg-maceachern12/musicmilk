'use client'

import { useEffect, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Waveform } from './Waveform';
import { Music, Play, Pause } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function UniversalPlayer() {
  const { state, dispatch } = useAudio();
  const { currentMix, isPlaying } = state;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(Boolean(currentMix));
  }, [currentMix]);

  const handlePlayPause = () => {
    dispatch({ type: 'TOGGLE_PLAY' });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Fixed height spacer */}
      <div className="h-24" />
      
      {/* Fixed Player with glass morphism effect and gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-24">
        {/* Gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/30 to-gray-900/50 backdrop-blur-xl border-t border-gray-800/50 shadow-2xl" />
        
        <div className="container mx-auto h-full relative z-10">
          <div className="flex items-center h-full px-4 lg:px-6 gap-4 lg:gap-6">
            {/* Mix Info with hover animation - Hidden on mobile */}
            <Link 
              href={`/mix/${currentMix?.id}`} 
              className="hidden sm:flex items-center gap-4 sm:w-[35%] lg:w-[30%] group hover:opacity-90 transition-all duration-200 transform hover:scale-[1.02]"
            >
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-800 shadow-lg ring-1 ring-white/10">
                {currentMix?.cover_url ? (
                  <Image
                    src={currentMix.cover_url}
                    alt={currentMix.title}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <Music className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </div>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm sm:text-base text-white truncate group-hover:text-blue-400 transition-colors">
                  {currentMix?.title}
                </h3>
                {currentMix?.artist && (
                  <p className="text-xs sm:text-sm text-gray-400 truncate mt-0.5 group-hover:text-gray-300 transition-colors">
                    {currentMix.artist}
                  </p>
                )}
              </div>
            </Link>

            {/* Mobile Mix Info - Compact version */}
            <Link 
              href={`/mix/${currentMix?.id}`} 
              className="sm:hidden flex-shrink-0"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 shadow-lg ring-1 ring-white/10">
                {currentMix?.cover_url ? (
                  <Image
                    src={currentMix.cover_url}
                    alt={currentMix.title}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <Music className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            </Link>

            {/* Play/Pause Button and Waveform Container */}
            <div className="flex-1 flex items-center gap-3 lg:gap-4">
              <button
                onClick={handlePlayPause}
                className="flex-shrink-0 p-2.5 lg:p-3 rounded-full bg-blue-600/90 hover:bg-blue-600 transition-colors shadow-lg hover:shadow-blue-500/20"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                ) : (
                  <Play className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                )}
              </button>

              {/* Waveform - Adjusted for mobile */}
              <div className="flex-1 h-16">
                {currentMix && (
                  <Waveform
                    audioUrl={currentMix.audio_url}
                    key={currentMix.id}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}