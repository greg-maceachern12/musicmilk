'use client';

import { useState, useEffect } from 'react';
import { Calendar, Music, User, AlertCircle, Heart, Play, Pause, Disc3 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User as SupabaseUser } from '@supabase/supabase-js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MixMenu } from '@/app/components/MixMenu';
import { ChapterList } from '@/app/components/ChapterList';
import { useAudio } from '@/app/contexts/AudioContext';
import {
  fadeIn,
  fadeInUp,
  scaleIn,
  cardHover,
  defaultTransition,
  quickTransition
} from '@/lib/animations';

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
  chapters: {
    id: string;
    mix_id: string;
    title: string;
    timestamp: string;
    order: number;
  }[];
}

interface MixPlayerProps {
  mix: Mix;
  initialLikeCount: number;
}

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

          if (a < 128) continue;

          const brightness = (r + g + b) / 3;
          if (brightness > 200) continue;

          const quantizedR = Math.round(r / 24) * 24;
          const quantizedG = Math.round(g / 24) * 24;
          const quantizedB = Math.round(b / 24) * 24;

          const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
          colorBuckets[colorKey] = (colorBuckets[colorKey] || 0) + 1;
        }

        const sortedColors = Object.entries(colorBuckets)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 4)
          .map(([color]) => {
            const [r, g, b] = color.split(',').map(Number);
            const darken = (value: number) => Math.floor(value * 0.35);
            const saturate = (value: number) => Math.min(255, value * 1.2);
            const finalR = darken(saturate(r));
            const finalG = darken(saturate(g));
            const finalB = darken(saturate(b));
            return `rgba(${finalR}, ${finalG}, ${finalB}, 0.95)`;
          });

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


export function MixPlayer({ mix, initialLikeCount }: MixPlayerProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { state, dispatch } = useAudio();
  const [backgroundColors, setBackgroundColors] = useState<string[]>(['#1e293b', '#0f172a']);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(-1);

  const isCurrentMix = state.currentMix?.id === mix.id;
  const isPlaying = isCurrentMix && state.isPlaying;

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

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!isCurrentMix) return;
    if (!mix.chapters || mix.chapters.length === 0) return;

    const parseTimestamp = (timestamp: string): number => {
      const parts = timestamp.split(':').map(Number);
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      return 0;
    };

    const sortedChapters = [...mix.chapters].sort(
      (a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp)
    );

    const currentTime = state.currentTime || 0;
    let newIndex = -1;
    for (let i = sortedChapters.length - 1; i >= 0; i--) {
      if (parseTimestamp(sortedChapters[i].timestamp) <= currentTime) {
        newIndex = i;
        break;
      }
    }

    if (newIndex !== activeChapterIndex) {
      setActiveChapterIndex(newIndex);
      const artwork = mix.cover_url
        ? [
            { src: mix.cover_url, sizes: '96x96', type: 'image/jpeg' },
            { src: mix.cover_url, sizes: '128x128', type: 'image/jpeg' },
            { src: mix.cover_url, sizes: '256x256', type: 'image/jpeg' },
            { src: mix.cover_url, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [];

      const titleToShow = newIndex >= 0 ? sortedChapters[newIndex].title : mix.title;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: titleToShow,
        artist: mix.artist || 'Unknown Artist',
        album: mix.title,
        artwork,
      });
    }
  }, [state.currentTime, isCurrentMix, mix.chapters, mix.cover_url, mix.artist, mix.title, activeChapterIndex]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    if (mix.cover_url) {
      extractColors(mix.cover_url).then(setBackgroundColors);
    }
  }, [mix.cover_url, supabase.auth]);

  useEffect(() => {
    async function checkLikeStatus() {
      if (!user) return;

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
  }, [user, mix.id, supabase]);

  const handlePlayPause = async () => {
    if (!isCurrentMix) {
      try {
        const { data: relatedMixes } = await supabase
          .from('mixes')
          .select('id, title, artist, genre, audio_url, cover_url')
          .neq('id', mix.id)
          .or(`genre.eq.${mix.genre},artist.eq.${mix.artist}`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!relatedMixes || relatedMixes.length === 0) {
          const { data: recentMixes } = await supabase
            .from('mixes')
            .select('id, title, artist, genre, audio_url, cover_url')
            .neq('id', mix.id)
            .order('created_at', { ascending: false })
            .limit(10);

          const playlist = [
            {
              id: mix.id,
              title: mix.title,
              artist: mix.artist,
              genre: mix.genre,
              audio_url: mix.audio_url,
              cover_url: mix.cover_url
            },
            ...(recentMixes || [])
          ];

          dispatch({
            type: 'SET_PLAYLIST',
            payload: { mixes: playlist, startIndex: 0 }
          });
        } else {
          const playlist = [
            {
              id: mix.id,
              title: mix.title,
              artist: mix.artist,
              genre: mix.genre,
              audio_url: mix.audio_url,
              cover_url: mix.cover_url
            },
            ...relatedMixes
          ];

          dispatch({
            type: 'SET_PLAYLIST',
            payload: { mixes: playlist, startIndex: 0 }
          });
        }
      } catch (error) {
        console.error('Error fetching related mixes:', error);
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
      }
    } else {
      dispatch({ type: 'TOGGLE_PLAY' });
    }
  };

  const handleLikeToggle = async () => {
    if (!user || !mix || isLikeLoading) return;

    setIsLikeLoading(true);
    setIsLiked(!isLiked);
    setLikeCount(prev => prev + (isLiked ? -1 : 1));

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('mix_id', mix.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({
            mix_id: mix.id,
            user_id: user.id
          });

        if (error) throw error;
      }
    } catch (error) {
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
        // @ts-expect-error - Framer motion types conflict with React 19
        className="min-h-64 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center"
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={quickTransition}
      >
        <div className="animate-pulse text-gray-400">Loading mix...</div>
      </motion.div>
    );
  }

  const formattedDate = new Date(mix.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      // @ts-expect-error - Framer motion types conflict with React 19
      className="relative min-h-screen"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
    >
      {/* Base dark background */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a0c]" />

      {/* Main gradient background */}
      <motion.div
        // @ts-expect-error - Framer motion types conflict with React 19
        className="fixed inset-0 -z-10"
        initial={false}
        animate={{
          background: `
          linear-gradient(
            180deg,
            ${backgroundColors[0]} 0%,
            ${backgroundColors[1]} 30%,
            rgba(10, 10, 12, 0.98) 70%,
            #0a0a0c 100%
          )
        `
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Radial glow from cover */}
      <motion.div
        // @ts-expect-error - Framer motion types conflict with React 19
        className="fixed inset-0 -z-10 opacity-40"
        initial={false}
        animate={{
          background: `
          radial-gradient(ellipse 80% 50% at 50% 20%, 
            ${backgroundColors[0]}80, 
            transparent 70%
          )
        `
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Noise texture */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 2000 2000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <main className="relative pb-32">
        {/* Hero Section - Cover Art & Primary Info */}
        <div className="px-4 pt-6 pb-8 sm:pt-10 sm:pb-12 lg:pt-16 lg:pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-12">
              
              {/* Cover Art - Full width on mobile, fixed on desktop */}
              <motion.div
                // @ts-expect-error - Framer motion types conflict with React 19
                className="relative w-full sm:w-80 lg:w-96 mx-auto lg:mx-0 shrink-0"
                variants={scaleIn}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.1 }}
              >
                <div className="relative aspect-square w-full rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                  {mix.cover_url ? (
                    <Image
                      src={mix.cover_url}
                      alt={mix.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                      <Disc3 className="w-24 h-24 text-zinc-600" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Mix Info */}
              <div className="flex-1 min-w-0 lg:pt-4">
                {/* Genre tag with menu */}
                {mix.genre && (
                  <motion.div
                    // @ts-expect-error - Framer motion types conflict with React 19
                    className="mb-3 flex items-center gap-2"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ ...defaultTransition, delay: 0.2 }}
                  >
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-white/70 border border-white/10">
                      {mix.genre}
                    </span>
                    <div className="ml-auto">
                      <MixMenu
                        isOwner={Boolean(user && mix.user_id === user.id)}
                        onDelete={() => setShowDeleteConfirm(true)}
                      />
                    </div>
                  </motion.div>
                )}
                {!mix.genre && (
                  <motion.div
                    // @ts-expect-error - Framer motion types conflict with React 19
                    className="mb-3 flex items-center justify-end"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ ...defaultTransition, delay: 0.2 }}
                  >
                    <MixMenu
                      isOwner={Boolean(user && mix.user_id === user.id)}
                      onDelete={() => setShowDeleteConfirm(true)}
                    />
                  </motion.div>
                )}

                {/* Title */}
                <motion.h1
                  // @ts-expect-error - Framer motion types conflict with React 19
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-4"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.25 }}
                >
                  {mix.title}
                </motion.h1>

                {/* Artist */}
                {mix.artist && (
                  <motion.div
                    // @ts-expect-error - Framer motion types conflict with React 19
                    className="flex items-center gap-2 mb-6"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ ...defaultTransition, delay: 0.3 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-zinc-300" />
                    </div>
                    <span className="text-lg sm:text-xl text-white/80 font-medium">{mix.artist}</span>
                  </motion.div>
                )}

                {/* Play button row */}
                <motion.div
                  // @ts-expect-error - Framer motion types conflict with React 19
                  className="mb-6 flex items-center gap-2 sm:gap-4"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.35 }}
                >
                  {/* Play button */}
                  <motion.button
                    // @ts-expect-error - Framer motion types conflict with React 19
                    onClick={handlePlayPause}
                    className="inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-white hover:bg-white/90 text-black rounded-full font-semibold text-sm sm:text-base transition-all shadow-lg shadow-white/10"
                    variants={cardHover}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 fill-black" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                        <span>Play</span>
                      </>
                    )}
                  </motion.button>

                  {/* Now Playing indicator */}
                  <AnimatePresence>
                    {isPlaying && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        // @ts-expect-error - Framer motion types conflict with React 19
                        className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                      >
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <span className="w-0.5 h-2 sm:w-1 sm:h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 h-3 sm:w-1 sm:h-4 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 h-1.5 sm:w-1 sm:h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-emerald-400 font-medium text-xs sm:text-sm">Now Playing</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Meta info with like button */}
                <motion.div
                  // @ts-expect-error - Framer motion types conflict with React 19
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/50"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.4 }}
                >
                  <div className="flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{mix.play_count.toLocaleString()} plays</span>
                  </div>
                  <span className="text-white/20">•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                  <span className="text-white/20">•</span>
                  <motion.button
                    // @ts-expect-error - Framer motion types conflict with React 19
                    onClick={handleLikeToggle}
                    disabled={!user}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all
                      ${isLiked 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' 
                        : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70 hover:border-white/20'
                      }
                      ${!user && 'opacity-50 cursor-not-allowed'}
                    `}
                    variants={cardHover}
                    whileHover={user ? "hover" : undefined}
                    whileTap={user ? "tap" : undefined}
                    title={user ? 'Like' : 'Sign in to like'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-all ${isLiked ? 'fill-rose-400' : ''}`}
                    />
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={likeCount}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        // @ts-expect-error - Framer motion types conflict with React 19
                        className="font-medium tabular-nums"
                      >
                        {likeCount}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </motion.div>

                {/* Description */}
                {mix.description && (
                  <motion.p
                    // @ts-expect-error - Framer motion types conflict with React 19
                    className="mt-6 text-white/60 text-base leading-relaxed max-w-2xl"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ ...defaultTransition, delay: 0.45 }}
                  >
                    {mix.description}
                  </motion.p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        {mix.chapters && mix.chapters.length > 0 && (
          <motion.div
            // @ts-expect-error - Framer motion types conflict with React 19
            className="px-4 py-8 border-t border-white/5"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.5 }}
          >
            <div className="max-w-6xl mx-auto">
              <ChapterList chapters={mix.chapters} />
            </div>
          </motion.div>
        )}
      </main>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            // @ts-expect-error - Framer motion types conflict with React 19
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              // @ts-expect-error - Framer motion types conflict with React 19
              className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md mx-auto border border-white/10 shadow-2xl"
              variants={scaleIn}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={defaultTransition}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Delete Mix</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Are you sure you want to delete &ldquo;{mix.title}&rdquo;? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <motion.button
                  // @ts-expect-error - Framer motion types conflict with React 19
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-5 py-3 text-sm font-medium bg-white/10 hover:bg-white/15 rounded-xl transition-colors text-white"
                  variants={cardHover}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={isDeleting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  // @ts-expect-error - Framer motion types conflict with React 19
                  onClick={handleDelete}
                  className="flex-1 px-5 py-3 text-sm font-medium bg-red-500 hover:bg-red-600 rounded-xl transition-colors text-white"
                  variants={cardHover}
                  whileHover="hover"
                  whileTap="tap"
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
