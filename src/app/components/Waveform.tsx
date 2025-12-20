import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAudio } from '../contexts/AudioContext';

interface WaveformProps {
  audioUrl?: string;
  audioFile?: File;
}

export function Waveform({ audioUrl, audioFile }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [isInternalPlayChange, setIsInternalPlayChange] = useState(false);
  const { state, dispatch } = useAudio();
  const { isPlaying, seekTime } = state;

  useEffect(() => {
    if (!containerRef.current) return;

    const initWaveSurfer = () => {
      if (!containerRef.current) return;

      // If container has no width (e.g. hidden or not laid out yet), wait and retry
      if (containerRef.current.clientWidth === 0) {
        setTimeout(initWaveSurfer, 100);
        return;
      }

      // Get the computed height of the container to ensure the waveform fits perfectly
      const waveformHeight = containerRef.current.clientHeight;

      // Destroy existing instance if any (shouldn't happen due to cleanup, but safe)
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }

      const wavesurfer = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#4a5568',
        progressColor: '#00A1FF',
        cursorColor: 'transparent',
        barWidth: 2,
        height: waveformHeight,
        normalize: true,
        backend: 'WebAudio',
        mediaControls: true,
        media: document.createElement('audio')
      });

      wavesurferRef.current = wavesurfer;

      wavesurfer.on('ready', () => {
        setIsLoading(false);
      });

      wavesurfer.on('loading', (percent: number) => {
        setLoadingProgress(percent);
      });

      wavesurfer.on('audioprocess', () => {
        const time = wavesurfer.getCurrentTime();
        dispatch({ type: 'UPDATE_TIME', payload: time });
      });

      wavesurfer.on('play', () => {
        setIsInternalPlayChange(true);
        dispatch({ type: 'PLAY_MIX', payload: state.currentMix! });
      });

      wavesurfer.on('pause', () => {
        setIsInternalPlayChange(true);
        dispatch({ type: 'STOP' });
      });

      wavesurfer.on('seeking', () => {
        const time = wavesurfer.getCurrentTime();
        dispatch({ type: 'UPDATE_TIME', payload: time });
      });

      wavesurfer.on('finish', () => {
        dispatch({ type: 'TRACK_ENDED' });
      });

      const loadAudio = async () => {
        try {
          if (audioFile) {
            await wavesurfer.loadBlob(audioFile);
          } else if (audioUrl) {
            await wavesurfer.load(audioUrl);
          }
        } catch (error) {
          // This is expected when the component unmounts and destroy() is called.
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error("Wavesurfer error on load: ", error);
          }
        }
      };
      loadAudio();
    };



    initWaveSurfer();

    const handleResize = () => {
      // Debounce could be added here if needed, but for now simple re-init is fine
      initWaveSurfer();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (wavesurferRef.current) {
        wavesurferRef.current.unAll();
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl, audioFile, dispatch, state.currentMix]);

  // Handle seekings
  useEffect(() => {
    if (seekTime !== undefined && wavesurferRef.current && !isLoading) {
      wavesurferRef.current.seekTo(seekTime / wavesurferRef.current.getDuration());
      dispatch({ type: 'CLEAR_SEEK' });
    }
  }, [seekTime, isLoading, dispatch]);

  // Sync wavesurfer with global play state
  useEffect(() => {
    if (!wavesurferRef.current || isInternalPlayChange || isLoading) {
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
  }, [isPlaying, isInternalPlayChange, isLoading]);

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-xs text-white/80 font-medium bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            Loading Audio... {loadingProgress}%
          </span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}