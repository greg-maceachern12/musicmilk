// In Waveform.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause } from 'lucide-react';

interface WaveformProps {
  audioFile: File;
}

export function Waveform({ audioFile }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
    });

    wavesurferRef.current = wavesurfer;

    const audioUrl = URL.createObjectURL(audioFile);
    wavesurfer.load(audioUrl);

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
      URL.revokeObjectURL(audioUrl);
    };
  }, [audioFile]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="w-full" />
      <button
        onClick={togglePlayPause}
        className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}