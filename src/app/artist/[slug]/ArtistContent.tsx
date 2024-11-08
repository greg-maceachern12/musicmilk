'use client';

import { useEffect, useState } from 'react';
import { Calendar, PlayCircle, Ticket, Globe, Music, Video, Share2, MessagesSquare } from 'lucide-react';

interface TourDate {
  id: string;
  date: string;
  venue: string;
  location: string;
  ticketUrl: string;
}

interface Artist {
  id: string;
  name: string;
  bio: string;
  monthlyListeners: number;
  imageUrl: string;
  spotifyId: string;
  socials: {
    spotify: string;
    instagram: string;
    youtube: string;
    facebook: string;
  };
}

interface ArtistContentProps {
  initialArtist: Artist | null;
  slug: string;
}

export function ArtistContent({ initialArtist, slug }: ArtistContentProps) {
  const [artist, setArtist] = useState<Artist | null>(initialArtist);
  const [tourDates, setTourDates] = useState<TourDate[]>([]);
  const [isLoading, setIsLoading] = useState(!initialArtist);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArtistData() {
      try {
        const artistData: Artist = {
          id: '1',
          name: 'Lane 8',
          bio: 'Lane 8 is the electronic musical project of American musician, DJ and record producer Daniel Goldstein. Known for his melodic deep house sound and innovative This Never Happened label/events concept, Lane 8 has established himself as one of electronic music\'s most compelling and authentic artists.',
          monthlyListeners: 1200000,
          imageUrl: '/artists/lane8-hero.jpg',
          spotifyId: '27gtK7m9vYwCyJ04zz0kIb',
          socials: {
            spotify: 'https://open.spotify.com/artist/4xnihxcoXWK3UqryOSnbw5',
            instagram: 'https://instagram.com/lane8music',
            youtube: 'https://youtube.com/lane8music',
            facebook: 'https://facebook.com/lane8music'
          }
        };

        const tourData: TourDate[] = [
          {
            id: '1',
            date: '2024-12-14',
            venue: 'Red Rocks Amphitheatre',
            location: 'Morrison, CO',
            ticketUrl: 'https://www.bandsintown.com/lane8'
          },
          {
            id: '2',
            date: '2024-12-30',
            venue: 'Brooklyn Mirage',
            location: 'Brooklyn, NY',
            ticketUrl: 'https://www.bandsintown.com/lane8'
          },
          {
            id: '3',
            date: '2025-01-14',
            venue: 'The Shrine Auditorium',
            location: 'Los Angeles, CA',
            ticketUrl: 'https://www.bandsintown.com/lane8'
          }
        ];

        setArtist(artistData);
        setTourDates(tourData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load artist');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    // Only fetch if we don't have initial data
    if (!initialArtist) {
      loadArtistData();
    }
  }, [slug, initialArtist, error]);

  if (!artist && !isLoading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Artist Header */}
        <div className="relative">
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 h-48 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, gray 1px, transparent 0)',
              backgroundSize: '40px 40px',
              opacity: 0.15
            }}
          />

          {/* Artist Content */}
          <div className="relative pt-8 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12 mb-8">
                {/* Artist Image */}
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src="/api/placeholder/96/96"
                    alt={artist?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Artist Info */}
                <div className="flex-grow">
                  <h1 className="text-2xl font-bold mb-2">{artist?.name}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Electronic Music Producer
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      {artist?.monthlyListeners?.toLocaleString()} monthly listeners
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mt-12">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            {artist?.bio}
          </p>
          {/* Social Links */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-700">
            <a 
              href={artist?.socials.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <Music className="w-4 h-4" />
              Spotify
            </a>
            <a 
              href={artist?.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <Share2 className="w-4 h-4" />
              Instagram
            </a>
            <a 
              href={artist?.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <Video className="w-4 h-4" />
              YouTube
            </a>
            <a 
              href={artist?.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <MessagesSquare className="w-4 h-4" />
              Facebook
            </a>
          </div>
        </div>

        {/* Tour Dates Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Upcoming Shows</h2>
            <span className="px-2.5 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-full">
              {tourDates.length} shows
            </span>
          </div>
          
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
              {tourDates.length === 0 ? (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No upcoming shows</h3>
                  <p className="text-gray-400">
                    Check back later for new tour dates
                  </p>
                </div>
              ) : (
                tourDates.map((show) => (
                  <div 
                    key={show.id} 
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 flex-none w-80"
                  >
                    <div className="font-medium text-gray-400">
                      {new Date(show.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-lg font-semibold mt-2">{show.venue}</div>
                    <div className="text-gray-500 mb-4">{show.location}</div>
                    <a 
                      href={show.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors w-full justify-center"
                    >
                      <Ticket className="w-4 h-4" />
                      Get Tickets
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Popular Tracks */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6">Popular Tracks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((trackNumber) => (
              <div key={trackNumber} className="h-[380px] bg-gray-800/50 rounded-xl overflow-hidden">
                <iframe
                  src={`https://open.spotify.com/embed/artist/${artist?.spotifyId}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="encrypted-media"
                  className="rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}