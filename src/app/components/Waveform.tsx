import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

interface WaveformProps {
  audioUrl?: string;
  audioFile?: File;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function Waveform({ audioUrl, audioFile }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInternalPlayChange, setIsInternalPlayChange] = useState(false);
  const { state, dispatch } = useAudio();
  const { isPlaying, seekTime } = state;

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
      backend: 'WebAudio',
      mediaControls: true,
      media: document.createElement('audio')
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
      setIsInternalPlayChange(true);
      dispatch({ type: 'PLAY_MIX', payload: state.currentMix! });
    });

    wavesurfer.on('pause', () => {
      setIsInternalPlayChange(true);
      dispatch({ type: 'STOP' });
    });

    if (audioFile) {
      wavesurfer.loadBlob(audioFile);
    } else if (audioUrl) {
      wavesurfer.load(audioUrl);
    }

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, audioFile, dispatch, state.currentMix]);

  // Handle seeking
  useEffect(() => {
    if (seekTime !== undefined && wavesurferRef.current && !isLoading) {
      wavesurferRef.current.seekTo(seekTime / wavesurferRef.current.getDuration());
      dispatch({ type: 'CLEAR_SEEK' });
    }
  }, [seekTime, isLoading, dispatch]);

  // Sync wavesurfer with global play state
  useEffect(() => {
    if (!wavesurferRef.current || isInternalPlayChange) {
      setIsInternalPlayChange(false);
      return;
    }

    const shouldPlay = isPlaying && !wavesurferRef.current.isPlaying();
    const shouldPause = !isPlaying && wavesurferRef.current.isPlaying();

    if (shouldPlay) {
      wavesurferRef.current.play();
    } else if (shouldPause) {
      wavesurferRef.current.pause();
    }
  }, [isPlaying, isInternalPlayChange]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex justify-center items-center h-16">
          <div className="text-gray-400">Loading waveform...</div>
        </div>
      )}
      
      <div className="w-full overflow-hidden">
        <div ref={containerRef} className={isLoading ? 'invisible' : ''} />
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
      </div>
    </div>
  );
}