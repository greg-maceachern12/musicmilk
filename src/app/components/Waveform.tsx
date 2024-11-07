'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Memoize event handlers
  const handleReady = useCallback(() => {
    if (!wavesurferRef.current) return;
    setDuration(wavesurferRef.current.getDuration());
    setIsLoading(false);
    setLoadingProgress(100);
  }, []);

  const handleLoading = useCallback((progress: number) => {
    setLoadingProgress(progress);
  }, []);

  const handleAudioProcess = useCallback(() => {
    if (!wavesurferRef.current) return;
    setCurrentTime(wavesurferRef.current.getCurrentTime());
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlayPause?.(true);
  }, [onPlayPause]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPlayPause?.(false);
  }, [onPlayPause]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    // Create WaveSurfer configuration inside useEffect
    const wavesurferConfig = {
      container: containerRef.current,
      waveColor: '#4a5568',
      progressColor: '#3b82f6',
      cursorColor: '#3b82f6',
      barWidth: 2,
      barGap: 1,
      height: 80,
      normalize: true,
      backend: 'WebAudio',
      // Important: These settings prevent horizontal scrolling
      fillParent: true,
      responsive: true,
      minPxPerSec: 1, // Minimum pixels per second
      autoCenter: true,
      // Other optimizations
      partialRender: true,
      xhr: {
        mode: 'fetch',
        range: true,
        credentials: 'same-origin',
        cache: 'force-cache'
      }
    };

    const wavesurfer = WaveSurfer.create(wavesurferConfig);
    wavesurferRef.current = wavesurfer;

    // Attach event listeners
    wavesurfer.on('ready', handleReady);
    wavesurfer.on('loading', handleLoading);
    wavesurfer.on('audioprocess', handleAudioProcess);
    wavesurfer.on('play', handlePlay);
    wavesurfer.on('pause', handlePause);

    // Implement lazy loading
    const loadAudio = async () => {
      try {
        if (audioFile) {
          await wavesurfer.loadBlob(audioFile);
        } else if (audioUrl) {
          await wavesurfer.load(audioUrl);
        }
      } catch (error) {
        console.error('Error loading audio:', error);
        setIsLoading(false);
      }
    };

    loadAudio();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioUrl, audioFile, handleReady, handleLoading, handleAudioProcess, handlePlay, handlePause]);

  const togglePlayPause = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  }, []);

  const handleDownload = useCallback(async () => {
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
  }, [audioFile, audioUrl]);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-20">
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="text-gray-400">
            Loading waveform... {Math.round(loadingProgress)}%
          </div>
        </div>
      ) : null}
      
      {/* Wrapper div to prevent overflow */}
      <div className="w-full overflow-hidden">
        <div ref={containerRef} className={`w-full ${isLoading ? 'invisible' : ''}`} />
      </div>
      
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