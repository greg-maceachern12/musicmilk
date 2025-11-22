'use client'

import { useEffect, useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Waveform } from './Waveform';
import { PlaylistQueue } from './PlaylistQueue';
import { Music, Play, Pause, SkipBack, SkipForward, Shuffle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function UniversalPlayer() {
  const { state, dispatch } = useAudio();
  const { currentMix, isPlaying, shuffleEnabled, playlist, currentIndex, currentTime } = state;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(Boolean(currentMix));
  }, [currentMix]);

  // Keep Apple/Safari Now Playing (Media Session) metadata in sync
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!currentMix) return;

    const artwork = currentMix.cover_url
      ? [
        { src: currentMix.cover_url, sizes: '96x96', type: 'image/jpeg' },
        { src: currentMix.cover_url, sizes: '128x128', type: 'image/jpeg' },
        { src: currentMix.cover_url, sizes: '256x256', type: 'image/jpeg' },
        { src: currentMix.cover_url, sizes: '512x512', type: 'image/jpeg' },
      ]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentMix.title,
      artist: currentMix.artist || 'Unknown Artist',
      album: currentMix.genre || 'Mix',
      artwork,
    });

    // Remote control handlers
    navigator.mediaSession.setActionHandler('play', () => {
      dispatch({ type: 'TOGGLE_PLAY' });
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      dispatch({ type: 'TOGGLE_PLAY' });
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      dispatch({ type: 'PREVIOUS_TRACK' });
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      dispatch({ type: 'NEXT_TRACK' });
    });

    navigator.mediaSession.setActionHandler('seekto', (event: MediaSessionActionDetails) => {
      // Some browsers may not provide this type; keep it safe
      const seekTime = typeof event.seekTime === 'number' ? event.seekTime : undefined;
      if (typeof seekTime === 'number' && !Number.isNaN(seekTime)) {
        dispatch({ type: 'SEEK', payload: seekTime });
      }
    });
    navigator.mediaSession.setActionHandler('seekforward', (event: MediaSessionActionDetails) => {
      const offset = typeof event.seekOffset === 'number' ? event.seekOffset : 10;
      const newTime = Math.max(0, (currentTime || 0) + offset);
      dispatch({ type: 'SEEK', payload: newTime });
    });
    navigator.mediaSession.setActionHandler('seekbackward', (event: MediaSessionActionDetails) => {
      const offset = typeof event.seekOffset === 'number' ? event.seekOffset : 10;
      const newTime = Math.max(0, (currentTime || 0) - offset);
      dispatch({ type: 'SEEK', payload: newTime });
    });
  }, [currentMix, currentTime, dispatch]);

  // Reflect play/pause state in Media Session
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  const handlePlayPause = () => {
    dispatch({ type: 'TOGGLE_PLAY' });
  };

  const handlePrevious = () => {
    dispatch({ type: 'PREVIOUS_TRACK' });
  };

  const handleNext = () => {
    dispatch({ type: 'NEXT_TRACK' });
  };

  const handleToggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < playlist.length - 1;

  if (!isVisible) return null;

  return (
    <>
      {/* Fixed height spacer */}
      <div className="h-24" />

      {/* Fixed Player with glass morphism effect and gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-24">
        {/* Gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/30 to-gray-900/50 backdrop-blur-xl border-t border-gray-800/50 shadow-2xl" />

        <div className="container mx-auto my-auto h-full relative z-10">
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
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 shadow-lg ring-1 ring-white/10">
                {currentMix?.cover_url ? (
                  <Image
                    src={currentMix.cover_url}
                    alt={currentMix.title}
                    width={52}
                    height={52}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                    <Music className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            </Link>

            {/* Controls and Waveform Container */}
            <div className="flex-1 flex items-center gap-1 sm:gap-2 lg:gap-3 min-w-0">
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                className="flex-shrink-0 p-1 sm:p-2 rounded-full hover:bg-gray-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous track"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>

              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className="flex-shrink-0 p-2 sm:p-2.5 lg:p-3 rounded-full bg-blue-600/90 hover:bg-blue-600 transition-colors shadow-lg hover:shadow-blue-500/20"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                ) : (
                  <Play className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                )}
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className="flex-shrink-0 p-1 sm:p-2 rounded-full hover:bg-gray-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next track"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>

              {/* Waveform - Expanded on mobile */}
              <div className="flex-1 h-14 sm:h-16 min-w-0 px-1 sm:px-0 flex items-center">
                {currentMix && (
                  <Waveform
                    audioUrl={currentMix.audio_url}
                    key={currentMix.id}
                  />
                )}
              </div>

              {/* Shuffle and Queue buttons - Stacked on mobile */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-2 flex-shrink-0">
                {/* Shuffle Toggle */}
                <button
                  onClick={handleToggleShuffle}
                  className={`flex flex-shrink-0 p-1 sm:p-2 rounded-full transition-colors ${shuffleEnabled
                    ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                    : 'hover:bg-gray-700/50 text-gray-400'
                    }`}
                  aria-label={`Shuffle ${shuffleEnabled ? 'on' : 'off'}`}
                  title={`Shuffle ${shuffleEnabled ? 'on' : 'off'}`}
                >
                  <Shuffle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </button>

                {/* Playlist Queue */}
                <div className="flex items-center scale-90 sm:scale-100">
                  <PlaylistQueue />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}