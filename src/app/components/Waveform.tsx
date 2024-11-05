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

    wavesurfer.on('timeupdate', () => {
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

  const handleDownload = async () => {
    try {
      if (audioFile) {
        // If we have a File object, create a download link for it
        const url = URL.createObjectURL(audioFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = `musicmilk_${audioFile.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (audioUrl) {
        // If we have a URL, fetch it and create a download
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Extract filename from URL or use a default name
        const originalName = audioUrl.split('/').pop() || 'audio.mp3';
        const filename = `musicmilk_${originalName}`;
        a.download = filename;
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
          className="bg-blue-600/10 hover:bg-blue-600/20 p-2.5 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-auto group"
          title="Download audio"
        >
          <Download className="w-5 h-5 text-blue-600 transition-transform group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}