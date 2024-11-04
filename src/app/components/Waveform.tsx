'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause } from 'lucide-react';

interface WaveformProps {
  audioUrl?: string;
  audioFile?: File;
  onPlayPause?: (isPlaying: boolean) => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function Waveform({ audioUrl, audioFile, onPlayPause }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4a5568',
      progressColor: '#3b82f6',
      cursorColor: '#3b82f6',
      barWidth: 2,
      barGap: 1,
      height: 100,
      normalize: true,
      backend: 'MediaElement'
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.on('ready', () => {
      setDuration(wavesurfer.getDuration());
      setIsLoading(false);
    });

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('play', () => {
      setIsPlaying(true);
      onPlayPause?.(true);
    });

    wavesurfer.on('pause', () => {
      setIsPlaying(false);
      onPlayPause?.(false);
    });

    wavesurfer.on('seek', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    if (audioFile) {
      // If we have a File object, load it directly
      wavesurfer.loadBlob(audioFile);
    } else if (audioUrl) {
      // If we have a URL, load it
      wavesurfer.load(audioUrl);
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioUrl, audioFile, onPlayPause]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-[100px]">
          <div className="animate-pulse text-gray-400">
            Loading waveform...
          </div>
        </div>
      ) : null}
      <div ref={containerRef} className={`w-full ${isLoading ? 'invisible' : ''}`} />
      
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        <div className="flex items-center gap-2 font-mono text-sm text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}