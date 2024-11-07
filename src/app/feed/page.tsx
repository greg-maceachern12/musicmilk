'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { debounce } from 'lodash';
import { MixCard, MixCardSkeleton } from '../components/MixCard';

interface Mix {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  cover_url: string | null;
  play_count: number;
  created_at: string;
}

const ITEMS_PER_PAGE = 12;

export default function FeedPage() {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const loaderRef = useRef(null);
  const supabase = createClientComponentClient();

  const fetchMixes = async (pageNumber: number, search: string, isInitial: boolean = false) => {
    try {
      if (!isInitial) {
        setIsLoadingMore(true);
      }

      // Calculate the start index
      const startIndex = pageNumber * ITEMS_PER_PAGE;
      
      // Don't fetch if we're beyond the total count
      if (totalCount > 0 && startIndex >= totalCount) {
        setHasMore(false);
        setIsLoadingMore(false);
        return;
      }

      let query = supabase
        .from('mixes')
        .select('id, title, artist, genre, cover_url, play_count, created_at', { count: 'exact' })
        .order('created_at', { ascending: false });

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
        setTotalCount(count);
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
  };

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
      fetchMixes(page, searchQuery);
    }
  }, [page]);

  // Initial fetch and search handling
  useEffect(() => {
    setIsLoading(true);
    setPage(0);
    setHasMore(true);
    setTotalCount(0);
    fetchMixes(0, searchQuery, true);
  }, [searchQuery]);

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
            fetchMixes(0, searchQuery, true);
          }}
          className="mt-4 px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold">Explore Mixes</h1>
        <p className="text-gray-400">Discover amazing music combinations from our community</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, artist, or genre..."
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Mixes Grid */}
      <div className="space-y-6 px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <MixCardSkeleton key={i} />
            ))}
          </div>
        ) : mixes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mixes.map((mix) => (
              <MixCard key={mix.id} mix={mix} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No mixes found{searchQuery ? ' for your search' : ''}.</p>
          </div>
        )}

        {/* Infinite scroll trigger element */}
        {(hasMore || isLoadingMore) && (
          <div 
            ref={loaderRef}
            className="h-10 w-full flex items-center justify-center"
          >
            {isLoadingMore && (
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}