'use client';

import { useState, useEffect } from 'react';
import { Calendar, Music, User, AlertCircle, Heart, Play, Pause } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User as SupabaseUser } from '@supabase/supabase-js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MixMenu } from '@/app/components/MixMenu';
import { useAudio } from '@/app/contexts/AudioContext';

interface Mix {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  description: string | null;
  audio_url: string;
  audio_storage_path: string;
  cover_url: string | null;
  cover_storage_path: string | null;
  created_at: string;
  play_count: number;
  user_id: string | null;
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 }
};

async function extractColors(imageSrc: string): Promise<string[]> {
  try {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(imageUrl);
          resolve(['#1e293b', '#0f172a', '#0a0f1a', '#070b14']);
          return;
        }

        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        const imageData = ctx.getImageData(0, 0, 100, 100).data;

        const colorBuckets: { [key: string]: number } = {};

        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Skip very light colors
          const brightness = (r + g + b) / 3;
          if (brightness > 200) continue;

          // Quantize colors to reduce number of buckets
          const quantizedR = Math.round(r / 24) * 24;
          const quantizedG = Math.round(g / 24) * 24;
          const quantizedB = Math.round(b / 24) * 24;

          const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
          colorBuckets[colorKey] = (colorBuckets[colorKey] || 0) + 1;
        }

        // Sort buckets by frequency and get top colors
        const sortedColors = Object.entries(colorBuckets)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 4) // Get top 4 colors
          .map(([color]) => {
            const [r, g, b] = color.split(',').map(Number);

            // Darken the colors
            const darken = (value: number) => Math.floor(value * 0.35);

            // Add a slight saturation boost to maintain color identity
            const saturate = (value: number) => Math.min(255, value * 1.2);

            const finalR = darken(saturate(r));
            const finalG = darken(saturate(g));
            const finalB = darken(saturate(b));

            return `rgba(${finalR}, ${finalG}, ${finalB}, 0.95)`;
          });

        // Ensure we have 4 colors
        while (sortedColors.length < 4) {
          sortedColors.push('rgba(10, 15, 24, 0.95)');
        }

        URL.revokeObjectURL(imageUrl);
        resolve(sortedColors);
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(['#1e293b', '#0f172a', '#0a0f1a', '#070b14']);
      };

      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error extracting colors:', error);
    return ['#1e293b', '#0f172a', '#0a0f1a', '#070b14'];
  }
}


export function MixPlayer({ id }: { id: string }) {
  const [mix, setMix] = useState<Mix | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { state, dispatch } = useAudio();
  const [backgroundColors, setBackgroundColors] = useState<string[]>(['#1e293b', '#0f172a']);

  // Check if this mix is currently playing
  const isCurrentMix = state.currentMix?.id === id;
  const isPlaying = isCurrentMix && state.isPlaying;

  // Set up media session metadata when mix data is loaded
  useEffect(() => {
    if (mix && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: mix.title,
        artist: mix.artist || 'Unknown Artist',
        album: mix.genre || 'Mix',
        artwork: [
          { src: mix.cover_url || '/placeholder-artwork.png', sizes: '96x96', type: 'image/jpeg' },
          { src: mix.cover_url || '/placeholder-artwork.png', sizes: '128x128', type: 'image/jpeg' },
          { src: mix.cover_url || '/placeholder-artwork.png', sizes: '256x256', type: 'image/jpeg' },
          { src: mix.cover_url || '/placeholder-artwork.png', sizes: '512x512', type: 'image/jpeg' },
        ]
      });
    }
  }, [mix]);

  // Fetch mix data and like status
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    async function fetchMixAndLikes() {
      const { data: mixData, error: mixError } = await supabase
        .from('mixes')
        .select('*')
        .eq('id', id)
        .single();

      if (mixError) {
        console.error('Error fetching mix:', mixError);
        return;
      }

      setMix(mixData);
      document.title = `${mixData.title} | MusicMilk`;

      // Extract colors from cover art as soon as we have the mix data

      if (mixData.cover_url) {
        const colors = await extractColors(mixData.cover_url);
        setBackgroundColors(colors);
        // For debugging, use useEffect to log the updated state
        console.log('Setting new colors:', colors);
      }
      console.log(backgroundColors)

      // Update play count
      await supabase
        .from('mixes')
        .update({ play_count: (mixData.play_count || 0) + 1 })
        .eq('id', id);

      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('mix_id', id);

      setLikeCount(count || 0);
    }

    fetchMixAndLikes();
  }, [id, supabase]);

  // Check if current user has liked the mix
  useEffect(() => {
    async function checkLikeStatus() {
      if (!user || !mix) return;

      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('mix_id', mix.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error) {
        setIsLiked(!!data);
      }
    }

    checkLikeStatus();
  }, [user, mix, supabase]);

  const handlePlayPause = () => {
    if (!mix) return;

    if (!isCurrentMix) {
      // Start playing this mix
      dispatch({
        type: 'PLAY_MIX',
        payload: {
          id: mix.id,
          title: mix.title,
          artist: mix.artist,
          genre: mix.genre,
          audio_url: mix.audio_url,
          cover_url: mix.cover_url
        }
      });
    } else {
      // Toggle play/pause for current mix
      dispatch({ type: 'TOGGLE_PLAY' });
    }
  };

  const handleLikeToggle = async () => {
    if (!user || !mix || isLikeLoading) return;

    setIsLikeLoading(true);
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(prev => prev + (isLiked ? -1 : 1));

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('mix_id', mix.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            mix_id: mix.id,
            user_id: user.id
          });

        if (error) throw error;
      }
    } catch (error) {
      // Revert optimistic update on error
      console.error('Error toggling like:', error);
      setIsLiked(!isLiked);
      setLikeCount(prev => prev + (isLiked ? 1 : -1));
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!mix || !user || isDeleting) return;

    setIsDeleting(true);
    try {
      const deleteResponse = await fetch('/api/delete-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl: mix.audio_url,
          coverUrl: mix.cover_url,
          mixId: mix.id
        }),
      });

      if (!deleteResponse.ok) {
        const error = await deleteResponse.json();
        throw new Error(error.error || 'Failed to delete files');
      }

      // If files are deleted successfully, delete the database record
      const { error: dbError } = await supabase
        .from('mixes')
        .delete()
        .eq('id', mix.id)
        .eq('user_id', user.id);

      if (dbError) {
        throw dbError;
      }

      router.push('/');

    } catch (error) {
      console.error('Error deleting mix:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete mix. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!mix) {
    return (
      <motion.div
        className="min-h-64 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center"
        {...fadeIn}
        transition={{ duration: 0.3 }}
      >
        <div className="animate-pulse text-gray-400">Loading mix...</div>
      </motion.div>
    );
  }

  const formattedDate = new Date(mix.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Base dark background */}
      <div className="fixed inset-0 -z-20 bg-black" />

      {/* Main gradient background */}
      <motion.div
        className="fixed inset-0 -z-10"
        initial={false}
        animate={{
          background: `
            linear-gradient(
              150deg,
              ${backgroundColors[0]} 0%,
              ${backgroundColors[1]} 25%,
              ${backgroundColors[2]} 50%,
              ${backgroundColors[3]} 100%
            )
          `
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Radial overlay for depth */}
      <motion.div
        className="fixed inset-0 -z-10 opacity-50"
        initial={false}
        animate={{
          background: `
            radial-gradient(circle at 50% 0%, 
              ${backgroundColors[0]}00, 
              ${backgroundColors[1]}40 40%, 
              ${backgroundColors[2]}80 80%
            )
          `
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Subtle animated noise overlay */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.15] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 2000 2000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          transform: 'translateZ(0)'
        }}
      />

      {/* Blur overlay */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      <main className="container mx-auto px-4 py-4 lg:py-20 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="bg-black/40 backdrop-blur-xl rounded-xl p-4 lg:p-8 shadow-2xl border border-white/5"
            variants={scaleIn}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              {/* Cover Art Section */}
              <motion.div
                className="w-56 lg:w-60 mx-auto lg:mx-0 shrink-0"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-black/50 shadow-lg relative">
                  {mix.cover_url ? (
                    <Image
                      src={mix.cover_url}
                      alt={mix.title}
                      width={320}
                      height={320}
                      className="object-cover w-full h-full"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-16 sm:w-20 h-16 sm:h-20 text-gray-400" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Mix Info Section */}
              <div className="flex-1 flex flex-col min-w-0 lg:py-2">
                {/* Title and Controls */}
                <div className="flex flex-col gap-4">
                  <motion.div
                    className="flex items-start gap-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <motion.button
                      onClick={handlePlayPause}
                      className="shrink-0 w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 ml-1 text-white" />
                      )}
                    </motion.button>

                    <div className="flex-1 flex items-start justify-between gap-4 min-w-0">
                      <motion.h1
                        className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight break-words"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        {mix.title}
                      </motion.h1>

                      <motion.div
                        className="flex items-center gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <motion.button
                          onClick={handleLikeToggle}
                          disabled={!user}
                          className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${user ? 'hover:bg-white/10' : 'cursor-not-allowed opacity-50'
                            }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title={user ? 'Like' : 'Sign in to like'}
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-white'
                              }`}
                          />
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={likeCount}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="text-sm font-medium text-gray-300"
                            >
                              {likeCount}
                            </motion.span>
                          </AnimatePresence>
                        </motion.button>

                        <MixMenu
                          isOwner={Boolean(user && mix.user_id === user.id)}
                          onDelete={() => setShowDeleteConfirm(true)}
                          audioUrl={mix.audio_url}
                          mixTitle={mix.title}
                        />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Artist Info */}
                  {mix.artist && (
                    <motion.div
                      className="flex items-center gap-2 text-gray-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-base sm:text-lg">{mix.artist}</span>
                    </motion.div>
                  )}
                </div>

                {/* Genre Tags */}
                {mix.genre && (
                  <motion.div
                    className="flex flex-wrap gap-2 mt-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <motion.span
                      className="bg-white/10 backdrop-blur-sm text-white/90 px-3 py-1 rounded-full text-sm font-medium"
                      whileHover={{ scale: 1.05 }}
                    >
                      {mix.genre}
                    </motion.span>
                  </motion.div>
                )}

                {/* Metadata */}
                <motion.div
                  className="flex flex-wrap items-center gap-3 text-gray-400 mt-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                  <span>•</span>
                  <span>{mix.play_count.toLocaleString()} plays</span>
                </motion.div>

                {/* Description */}
                {mix.description && (
                  <motion.p
                    className="text-gray-300 text-sm leading-relaxed mt-5 lg:max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    {mix.description}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-black/60 backdrop-blur-xl rounded-xl p-4 sm:p-6 w-full max-w-sm mx-auto border border-white/10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-semibold text-white">Delete Mix</h3>
                  <p className="text-gray-300 text-sm">
                    Are you sure you want to delete &ldquo;{mix.title}&rdquo;? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full px-4 py-2.5 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isDeleting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDelete}
                  className="w-full px-4 py-2.5 text-sm font-medium bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors backdrop-blur-sm text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}