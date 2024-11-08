'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  avatar_url?: string;
}

interface MixMetadata {
  title: string;
  artists: Artist[];
  genre: string | null;
  description: string | null;
}

interface MixMetadataFormProps {
  metadata: MixMetadata;
  onChange: (metadata: MixMetadata) => void;
  onArtistSearch: (query: string) => Promise<Artist[]>;
  onArtistCreate: (name: string) => Promise<Artist>;
  disabled?: boolean;
}

export function MixMetadataForm({ 
  metadata, 
  onChange, 
  onArtistSearch,
  onArtistCreate,
  disabled = false 
}: MixMetadataFormProps) {
  const [artistInput, setArtistInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const handleChange = (field: keyof MixMetadata) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange({
      ...metadata,
      [field]: e.target.value
    });
  };

  const handleArtistSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setArtistInput(query);
    
    if (query.length >= 2) {
      setIsSearching(true);
      setShowResults(true);
      try {
        const results = await onArtistSearch(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching artists:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const addArtist = (artist: Artist) => {
    if (!metadata.artists.some(a => a.id === artist.id)) {
      onChange({
        ...metadata,
        artists: [...metadata.artists, artist]
      });
    }
    setArtistInput('');
    setSearchResults([]);
    setShowResults(false);
  };

  const createAndAddArtist = async () => {
    if (!artistInput.trim()) return;
    
    setIsCreating(true);
    try {
      const newArtist = await onArtistCreate(artistInput.trim());
      addArtist(newArtist);
    } catch (error) {
      console.error('Error creating artist:', error);
      // You might want to show an error toast/notification here
    } finally {
      setIsCreating(false);
    }
  };

  const removeArtist = (artistId: string) => {
    onChange({
      ...metadata,
      artists: metadata.artists.filter(artist => artist.id !== artistId)
    });
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.artist-search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="md:col-span-2 bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Mix Details</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title*
          </label>
          <input
            type="text"
            value={metadata.title}
            onChange={handleChange('title')}
            disabled={disabled}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Mix title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Artists
          </label>
          <div className="space-y-2">
            {metadata.artists.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {metadata.artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="flex items-center gap-1 bg-gray-700 rounded-full px-3 py-1"
                  >
                    <span className="text-sm">{artist.name}</span>
                    <button
                      type="button"
                      onClick={() => removeArtist(artist.id)}
                      className="text-gray-400 hover:text-gray-200"
                      disabled={disabled}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="relative artist-search-container">
              <input
                type="text"
                value={artistInput}
                onChange={handleArtistSearch}
                disabled={disabled || isCreating}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Search for artists..."
              />
              
              {showResults && (artistInput.length >= 2) && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-400">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {searchResults.map((artist) => (
                        <button
                          key={artist.id}
                          onClick={() => addArtist(artist)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
                        >
                          <span>{artist.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={createAndAddArtist}
                      disabled={isCreating || !artistInput.trim()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 
                               hover:bg-blue-700 disabled:bg-gray-700 rounded-lg text-sm font-medium
                               disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {isCreating ? 'Creating...' : `Create "${artistInput.trim()}" as new artist`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Genre
          </label>
          <input
            type="text"
            value={metadata.genre || ''}
            onChange={handleChange('genre')}
            disabled={disabled}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., House, Techno, Ambient"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={metadata.description || ''}
            onChange={handleChange('description')}
            disabled={disabled}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
            rows={4}
            placeholder="Tell us about your mix"
          />
        </div>
      </div>
    </div>
  );
}