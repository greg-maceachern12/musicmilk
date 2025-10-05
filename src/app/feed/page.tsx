'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Clock, TrendingUp } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { debounce } from 'lodash';
import { MixCard, MixCardSkeleton } from '../components/MixCard';
import {
  fadeIn,
  fadeInDown,
  fadeInUp,
  listContainer,
  pageTransition,
  defaultTransition,
  cardTransition
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

const ITEMS_PER_PAGE = 8;


export default function FeedPage() {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const totalCount = useRef(0);
  const loaderRef = useRef(null);
  const supabase = createClientComponentClient();

  const fetchMixes = useCallback(async (pageNumber: number, search: string, sort: 'recent' | 'popular', isInitial: boolean = false) => {
    try {
      if (!isInitial) {
        setIsLoadingMore(true);
      }

      // Calculate the start index
      const startIndex = pageNumber * ITEMS_PER_PAGE;
      
      // Don't fetch if we're beyond the total count
      if (totalCount.current > 0 && startIndex >= totalCount.current) {
        setHasMore(false);
        setIsLoadingMore(false);
        return;
      }

      let query = supabase
        .from('mixes')
        .select('id, title, artist, genre, audio_url, cover_url, play_count, created_at', { count: 'exact' });

      // Apply sorting based on sortBy state
      if (sort === 'popular') {
        query = query.order('play_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Add search functionality
      if (search) {
        query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%,genre.ilike.%${search}%`);
      }

      const { data, error: fetchError, count } = await query
        .range(startIndex, startIndex + ITEMS_PER_PAGE - 1);

      if (fetchError) {
        // Check specifically for range error
        if (fetchError.code === '416') {
          setHasMore(false);
          setIsLoadingMore(false);
          return;
        }
        throw fetchError;
      }

      // Update total count only on initial load or search
      if (isInitial && count !== null) {
        totalCount.current = count;
      }

      // Handle no results
      if (!data || data.length === 0) {
        if (isInitial) {
          setMixes([]);
        }
        setHasMore(false);
        return;
      }

      // Update mixes based on whether this is initial load or pagination
      if (isInitial) {
        setMixes(data);
      } else {
        setMixes(prevMixes => [...prevMixes, ...data]);
      }

      // Update hasMore based on current data length and total count
      setHasMore(data.length === ITEMS_PER_PAGE && (!count || (startIndex + data.length) < count));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mixes');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [supabase, sortBy]);

  // Intersection Observer callback
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
      setPage(prevPage => prevPage + 1);
    }
  }, [hasMore, isLoadingMore, isLoading]);

  // Set up intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  // Fetch more mixes when page changes
  useEffect(() => {
    if (page > 0) {
      fetchMixes(page, searchQuery, sortBy);
    }
  }, [page, fetchMixes, searchQuery, sortBy]);

  // Initial fetch and search/sort handling
  useEffect(() => {
    setIsLoading(true);
    setPage(0);
    setHasMore(true);
    totalCount.current = 0;
    fetchMixes(0, searchQuery, sortBy, true);
  }, [searchQuery, sortBy, fetchMixes]);

  // Debounced search function
  const handleSearchChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, 300);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            setPage(0);
            fetchMixes(0, searchQuery, sortBy, true);
          }}
          className="mt-4 px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 min-h-screen"
      {...pageTransition}
    >
      {/* Header */}
      <motion.div 
        className="text-center space-y-4 py-8"
        variants={fadeInDown}
        initial="initial"
        animate="animate"
        transition={defaultTransition}
      >
        <h1 className="text-4xl font-bold">Explore Mixes</h1>
        <p className="text-gray-400">Discover amazing music combinations from our community</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        className="max-w-2xl mx-auto px-4"
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={{ ...defaultTransition, delay: 0.2 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, artist, or genre..."
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </motion.div>

      {/* Sort Tabs */}
      <motion.div 
        className="max-w-2xl mx-auto px-4"
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={{ ...defaultTransition, delay: 0.3 }}
      >
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => setSortBy('recent')}
            className="relative pb-3 flex items-center gap-2 group"
          >
            <Clock className={`w-4 h-4 transition-colors ${
              sortBy === 'recent' ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
            }`} />
            <span className={`text-sm font-medium transition-colors ${
              sortBy === 'recent' ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
            }`}>
              Most Recent
            </span>
            {sortBy === 'recent' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          
          <button
            onClick={() => setSortBy('popular')}
            className="relative pb-3 flex items-center gap-2 group"
          >
            <TrendingUp className={`w-4 h-4 transition-colors ${
              sortBy === 'popular' ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
            }`} />
            <span className={`text-sm font-medium transition-colors ${
              sortBy === 'popular' ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
            }`}>
              Popular
            </span>
            {sortBy === 'popular' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </div>
      </motion.div>

      {/* Mixes Grid */}
      <div className="space-y-6 px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <MixCardSkeleton key={i} />
            ))}
          </div>
        ) : mixes.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={listContainer}
            initial="initial"
            animate="animate"
          >
            {mixes.map((mix, index) => (
              <motion.div
                key={mix.id}
                {...cardTransition}
              >
                <MixCard 
                  mix={mix} 
                  playlist={mixes}
                  playlistIndex={index}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-8"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <p className="text-gray-400">No mixes found{searchQuery ? ' for your search' : ''}.</p>
          </motion.div>
        )}

        {/* Infinite scroll loader */}
        {(hasMore || isLoadingMore) && (
          <div ref={loaderRef} className="h-10 w-full flex items-center justify-center">
            {isLoadingMore && (
              <motion.div 
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
                variants={fadeIn}
                initial="initial"
                animate="animate"
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

