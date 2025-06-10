'use client';

import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Music2, CalendarDays, PlayCircle, Heart } from 'lucide-react';
import { MixCard, MixCardSkeleton } from '@/app/components/MixCard';
import {
  fadeIn,
  fadeInUp,
  listContainer,
  defaultTransition,
  scaleIn,
  cardHover
} from '@/lib/animations';

interface Mix {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  audio_url: string;
  cover_url: string | null;
  play_count: number;
  created_at: string;
}

interface LikedMixJoin {
  mix_id: string;
  mixes: Mix;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [likedMixes, setLikedMixes] = useState<Mix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/signin');
          return;
        }

        setUser(user);

        // Fetch user's mixes
        const { data: mixesData, error: mixesError } = await supabase
          .from('mixes')
          .select('id, title, artist, genre, audio_url, cover_url, play_count, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (mixesError) throw mixesError;
        setMixes(mixesData);

        // Fetch liked mixes with proper typing
        const { data: likedData, error: likedError } = await supabase
          .from('likes')
          .select(`
            mix_id,
            mixes (
              id,
              title,
              artist,
              genre,
              audio_url,
              cover_url,
              play_count,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }) as {
            data: LikedMixJoin[] | null;
            error: PostgrestError | null;
          };

        if (likedError) throw likedError;

        // Extract the mix data from the joined query
        const likedMixesData = likedData
          ?.filter(item => item.mixes) // Filter out any null mixes
          .map(item => item.mixes) || [];

        setLikedMixes(likedMixesData);

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [supabase, router]);

  if (!user) return null;

  const totalPlays = mixes.reduce((sum, mix) => sum + mix.play_count, 0);
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <motion.div
      className="min-h-screen"
      variants={fadeIn}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          className="relative"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...defaultTransition, delay: 0.2 }}
        >
          {/* Background Pattern */}
          <div
            className="absolute inset-0 h-48 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, gray 1px, transparent 0)',
              backgroundSize: '40px 40px',
              opacity: 0.15
            }}
          />

          {/* Profile Content */}
          <div className="relative pt-8 px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12 mb-8"
                variants={fadeInUp}
                transition={{ ...defaultTransition, delay: 0.3 }}
              >
                {/* Avatar */}
                <motion.div
                  className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                  transition={defaultTransition}
                >
                  <span className="text-3xl font-bold">
                    {user.email?.[0].toUpperCase()}
                  </span>
                </motion.div>

                {/* User Info */}
                <div className="flex-grow">
                  <motion.h1
                    className="text-2xl font-bold mb-2"
                    variants={fadeInUp}
                    transition={{ ...defaultTransition, delay: 0.4 }}
                  >
                    {user.email?.split('@')[0]}
                  </motion.h1>
                  <motion.div
                    className="flex flex-wrap gap-4 text-sm text-gray-400"
                    variants={fadeInUp}
                    transition={{ ...defaultTransition, delay: 0.5 }}
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Joined {joinDate}
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      {totalPlays.toLocaleString()} total plays
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Your Mixes Section */}
        <motion.div
          className="max-w-7xl mx-auto mt-12"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...defaultTransition, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">Your Mixes</h2>
              {!isLoading && (
                <motion.span
                  className="px-2.5 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-full"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.1 }}
                >
                  {mixes.length} {mixes.length === 1 ? 'mix' : 'mixes'}
                </motion.span>
              )}
            </div>
          </div>

          {isLoading ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={listContainer}
              initial="initial"
              animate="animate"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  transition={{ ...defaultTransition, delay: i * 0.1 }}
                >
                  <MixCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              className="bg-gray-800/50 rounded-xl p-8 text-center"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <p className="text-red-400 mb-4">{error}</p>
              <motion.button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                variants={cardHover}
                whileHover="hover"
                whileTap="tap"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : mixes.length === 0 ? (
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <motion.div
                className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6"
                variants={scaleIn}
              >
                <Music2 className="w-8 h-8 text-gray-500" />
              </motion.div>
              <motion.h3
                className="text-xl font-semibold mb-2"
                variants={fadeInUp}
                transition={{ ...defaultTransition, delay: 0.1 }}
              >
                No mixes yet
              </motion.h3>
              <motion.p
                className="text-gray-400 mb-6"
                variants={fadeInUp}
                transition={{ ...defaultTransition, delay: 0.2 }}
              >
                Share your first mix with the world
              </motion.p>
              <motion.button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-flex items-center gap-2"
                variants={cardHover}
                whileHover="hover"
                whileTap="tap"
              >
                Upload your first mix
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={listContainer}
              initial="initial"
              animate="animate"
            >
              {mixes.map((mix, index) => (
                <motion.div
                  key={mix.id}
                  variants={fadeInUp}
                  transition={{ ...defaultTransition, delay: index * 0.1 }}
                >
                  <MixCard 
                    mix={mix} 
                    playlist={mixes}
                    playlistIndex={index}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Liked Mixes Section */}
        <motion.div
          className="max-w-7xl mx-auto mt-16"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...defaultTransition, delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">Liked Mixes</h2>
              {!isLoading && (
                <motion.span
                  className="px-2.5 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-full"
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.1 }}
                >
                  {likedMixes.length} {likedMixes.length === 1 ? 'mix' : 'mixes'}
                </motion.span>
              )}
            </div>
          </div>

          {isLoading ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={listContainer}
              initial="initial"
              animate="animate"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  transition={{ ...defaultTransition, delay: i * 0.1 }}
                >
                  <MixCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : likedMixes.length === 0 ? (
            <motion.div
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <motion.div
                className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6"
                variants={scaleIn}
              >
                <Heart className="w-8 h-8 text-gray-500" />
              </motion.div>
              <motion.h3
                className="text-xl font-semibold mb-2"
                variants={fadeInUp}
                transition={{ ...defaultTransition, delay: 0.1 }}
              >
                No liked mixes
              </motion.h3>
              <motion.p
                className="text-gray-400 mb-6"
                variants={fadeInUp}
                transition={{ ...defaultTransition, delay: 0.2 }}
              >
                Find and like some mixes to add them to your collection
              </motion.p>
              <motion.button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-flex items-center gap-2"
                variants={cardHover}
                whileHover="hover"
                whileTap="tap"
              >
                Discover mixes
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={listContainer}
              initial="initial"
              animate="animate"
            >
              {likedMixes.map((mix, index) => (
                <motion.div
                  key={mix.id}
                  variants={fadeInUp}
                  transition={{ ...defaultTransition, delay: index * 0.1 }}
                >
                  <MixCard 
                    mix={mix} 
                    playlist={likedMixes}
                    playlistIndex={index}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}