'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import debounce from 'lodash/debounce';
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

export default function FeedPage() {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClientComponentClient();
  const MIXES_PER_PAGE = 3;

  const fetchMixes = async (pageNumber: number, search: string, isInitial: boolean = false) => {
    try {
      if (!isInitial) {
        setIsLoadingMore(true);
      }

      let query = supabase
        .from('mixes')
        .select('id, title, artist, genre, cover_url, play_count, created_at', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Add search functionality
      if (search) {
        query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%,genre.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range(pageNumber * MIXES_PER_PAGE, (pageNumber + 1) * MIXES_PER_PAGE - 1);

      if (error) {
        throw error;
      }

      if (isInitial) {
        setMixes(data);
      } else {
        setMixes(prevMixes => [...prevMixes, ...data]);
      }

      const totalMixes = count || 0;
      setHasMore((pageNumber + 1) * MIXES_PER_PAGE < totalMixes);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mixes');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Debounced search function
  const debouncedSearch = debounce((query: string) => {
    setPage(0);
    fetchMixes(0, query, true);
  }, 300);

  useEffect(() => {
    fetchMixes(0, searchQuery, true);
  }, []);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    const nextPage = page + 1;
    await fetchMixes(nextPage, searchQuery);
    setPage(nextPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Mixes Grid */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <MixCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mixes.map((mix) => (
                <MixCard key={mix.id} mix={mix} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-3 text-sm bg-gray-800 rounded-md hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}