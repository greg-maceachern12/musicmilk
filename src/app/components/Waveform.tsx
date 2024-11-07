'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Download } from 'lucide-react';

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

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4a5568',
      progressColor: '#3b82f6',
      cursorColor: 'transparent',
      barWidth: 2,
      height: 64,
      normalize: true,
      // Critical changes for background playback
      backend: 'WebAudio',
      mediaControls: true,
      media: document.createElement('audio')
    });

    wavesurferRef.current = wavesurfer;

    // Basic event handlers
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

    // Load audio
    if (audioFile) {
      wavesurfer.loadBlob(audioFile);
    } else if (audioUrl) {
      wavesurfer.load(audioUrl);
    }

    // Cleanup
    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, audioFile, onPlayPause]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleDownload = async () => {
    try {
      if (audioFile) {
        const url = URL.createObjectURL(audioFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = `musicmilk_${audioFile.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (audioUrl) {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const originalName = audioUrl.split('/').pop() || 'audio.mp3';
        a.download = `musicmilk_${originalName}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex justify-center items-center h-16">
          <div className="text-gray-400">Loading audio...</div>
        </div>
      )}
      
      {/* Simple wrapper for waveform */}
      <div className="w-full overflow-hidden">
        <div ref={containerRef} className={isLoading ? 'invisible' : ''} />
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </button>

        <div className="flex items-center gap-2 font-mono text-sm text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="bg-blue-600/10 hover:bg-blue-600/20 p-2.5 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          title="Download audio"
        >
          <Download className="w-5 h-5 text-blue-600" />
        </button>
      </div>
    </div>
  );
}