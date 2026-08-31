'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAudio } from '../contexts/AudioContext';
import { getSharedMediaElement } from '@/lib/sharedAudio';

interface WaveformProps {
  audioUrl?: string;
  audioFile?: File;
}

export function Waveform({ audioUrl, audioFile }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const isPlayingRef = useRef(false);
  const ignorePauseRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const { state, dispatch } = useAudio();
  const { isPlaying, seekTime } = state;

  isPlayingRef.current = isPlaying;

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const destroyCurrent = () => {
      if (!wavesurferRef.current) return;
      ignorePauseRef.current = true;
      wavesurferRef.current.unAll();
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    };

    const initWaveSurfer = () => {
      if (cancelled || !containerRef.current) return;

      // If container has no width (e.g. hidden or not laid out yet), wait and retry
      if (containerRef.current.clientWidth === 0) {
        retryTimer = setTimeout(initWaveSurfer, 100);
        return;
      }

      destroyCurrent();

      const waveformHeight = containerRef.current.clientHeight;

      // Reuse one element for streamed playback so the next track can
      // autoplay. File previews (uploads) keep a fresh element.
      const media = audioUrl ? getSharedMediaElement() : undefined;
      if (media) {
        media.autoplay = isPlayingRef.current;
      }

      const wavesurfer = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#4a5568',
        progressColor: '#00A1FF',
        cursorColor: 'transparent',
        barWidth: 2,
        height: waveformHeight,
        normalize: true,
        backend: 'MediaElement',
        mediaControls: false,
        autoplay: isPlayingRef.current,
        ...(media ? { media } : {}),
      });

      wavesurferRef.current = wavesurfer;

      wavesurfer.on('ready', () => {
        ignorePauseRef.current = false;
        setIsLoading(false);
        if (isPlayingRef.current && !wavesurfer.isPlaying()) {
          void wavesurfer.play().catch((error: unknown) => {
            console.error('Wavesurfer play failed:', error);
          });
        }
      });

      wavesurfer.on('loading', (percent: number) => {
        setLoadingProgress(percent);
      });

      wavesurfer.on('audioprocess', () => {
        const time = wavesurfer.getCurrentTime();
        dispatch({ type: 'UPDATE_TIME', payload: time });
      });

      wavesurfer.on('seeking', () => {
        const time = wavesurfer.getCurrentTime();
        dispatch({ type: 'UPDATE_TIME', payload: time });
      });

      // HTML media fires `pause` as well as `ended` when a track finishes.
      // If we treat that pause as a user stop, autoplay of the next track
      // is cancelled (isPlaying flipped back to false).
      wavesurfer.on('finish', () => {
        ignorePauseRef.current = true;
        dispatch({ type: 'TRACK_ENDED' });
      });

      wavesurfer.on('pause', () => {
        if (ignorePauseRef.current) return;
        dispatch({ type: 'STOP' });
      });

      const loadAudio = async () => {
        ignorePauseRef.current = true;
        try {
          if (audioFile) {
            await wavesurfer.loadBlob(audioFile);
          } else if (audioUrl) {
            await wavesurfer.load(audioUrl);
          }
        } catch (error) {
          // This is expected when the component unmounts and destroy() is called.
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Wavesurfer error on load: ', error);
          }
        }
      };
      void loadAudio();
    };

    setIsLoading(true);
    setLoadingProgress(0);
    initWaveSurfer();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      destroyCurrent();
    };
  }, [audioUrl, audioFile, dispatch]);

  // Handle seeking
  useEffect(() => {
    if (seekTime !== undefined && wavesurferRef.current && !isLoading) {
      const duration = wavesurferRef.current.getDuration();
      if (duration > 0) {
        wavesurferRef.current.seekTo(seekTime / duration);
      }
      dispatch({ type: 'CLEAR_SEEK' });
    }
  }, [seekTime, isLoading, dispatch]);

  // Sync wavesurfer with global play state
  useEffect(() => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer || isLoading) return;

    const shouldPlay = isPlaying && !wavesurfer.isPlaying();
    const shouldPause = !isPlaying && wavesurfer.isPlaying();

    if (shouldPlay) {
      ignorePauseRef.current = false;
      void wavesurfer.play().catch((error: unknown) => {
        console.error('Wavesurfer play failed:', error);
      });
    } else if (shouldPause) {
      ignorePauseRef.current = true;
      wavesurfer.pause();
      ignorePauseRef.current = false;
    }
  }, [isPlaying, isLoading]);

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
