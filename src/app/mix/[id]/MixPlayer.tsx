// app/mix/[id]/MixPlayer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

export function MixPlayer({ id }: { id: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4a5568',
      progressColor: '#3b82f6',
      cursorColor: '#3b82f6',
      barWidth: 2,
      barGap: 1,
      height: 100,
      normalize: true,
      backend: 'MediaElement' // Add this line
    });

    wavesurferRef.current = wavesurfer;

    // Add loading handler
    wavesurfer.on('ready', () => {
      setIsLoading(false);
      console.log('Waveform ready!');
    });

    const audioUrl = `https://${process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/mixes/${id}`;
    wavesurfer.load(audioUrl);

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));

    return () => {
      wavesurfer.destroy();
    };
  }, [id]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6">
            {/* Mix Info */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">Mix</h1>
              <p className="text-gray-400">ID: {id}</p>
            </div>

            {/* Waveform */}
            <div className="mb-4 bg-gray-700/50 rounded-lg p-4">
              {isLoading && (
                <div className="flex justify-center items-center h-[100px]">
                  <div className="animate-pulse text-gray-400">
                    Generating waveform...
                  </div>
                </div>
              )}
              <div ref={waveformRef} className={isLoading ? 'invisible' : ''} />
            </div>

            {/* Player Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlayPause}
                disabled={isLoading}
                className="p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}