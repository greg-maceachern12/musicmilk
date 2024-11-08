'use client';

import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Waveform } from './Waveform';
import { MixMetadataForm } from './MixMetadataForm';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

export function UploadZone() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MixMetadata>({
    title: '',
    artists: [],
    genre: null,
    description: null
  });

  const [isUploading, setIsUploading] = useState(false);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Extract title from audio file
  useEffect(() => {
    if (!audioFile) return;

    const extractMetadata = async () => {
      console.log('Extracting metadata from:', audioFile.name);
      
      // Extract basic metadata from filename
      const filename = audioFile.name;
      const title = filename.replace(/\.[^/.]+$/, ''); // Remove extension
      
      setMetadata(prev => ({
        ...prev,
        title: title
      }));
    };

    extractMetadata();
  }, [audioFile]);

  const resetForm = () => {
    setAudioFile(null);
    setCoverImage(null);
    setCoverPreview(null);
    setMetadata({
      title: '',
      artists: [],
      genre: null,
      description: null
    });
    setIsUploading(false);
  };

  const handleUpload = async () => {
    if (!audioFile || !metadata.title) return;
  
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
  
      const audioStoragePath = `${Date.now()}-${audioFile.name}`;
      let coverStoragePath = null;
  
      // Upload audio file
      const { error: audioError } = await supabase.storage
        .from('audio')
        .upload(audioStoragePath, audioFile, {
          cacheControl: '3600',
          upsert: false
        });
  
      if (audioError) {
        console.error('Audio upload error:', audioError);
        throw audioError;
      }
  
      const { data: audioUrlData } = supabase.storage
        .from('audio')
        .getPublicUrl(audioStoragePath);
  
      // Handle cover image upload if provided
      let coverUrl = null;
      if (coverImage) {
        coverStoragePath = `${Date.now()}-${coverImage.name}`;
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverStoragePath, coverImage, {
            cacheControl: '3600',
            upsert: false
          });
  
        if (coverError) {
          console.error('Cover upload error:', coverError);
        } else {
          const { data: coverUrlData } = supabase.storage
            .from('covers')
            .getPublicUrl(coverStoragePath);
          coverUrl = coverUrlData.publicUrl;
        }
      }
  
      // Insert the mix record
      const { data: mix, error: mixError } = await supabase
        .from('mixes')
        .insert({
          title: metadata.title,
          genre: metadata.genre || null,
          description: metadata.description || null,
          audio_url: audioUrlData.publicUrl,
          audio_storage_path: audioStoragePath,
          cover_url: coverUrl,
          cover_storage_path: coverStoragePath,
          play_count: 0,
          user_id: user?.id || null
        })
        .select()
        .single();
  
      if (mixError) {
        console.error('Mix creation error:', mixError);
        throw mixError;
      }

      // Insert mix_artists records
      if (metadata.artists.length > 0) {
        const mixArtistsData = metadata.artists.map(artist => ({
          mix_id: mix.id,
          artist_id: artist.id,
          role: 'primary' // You could make this configurable in the UI
        }));

        const { error: mixArtistsError } = await supabase
          .from('mix_artists')
          .insert(mixArtistsData);

        if (mixArtistsError) {
          console.error('Mix artists association error:', mixArtistsError);
          throw mixArtistsError;
        }
      }
      
      // Navigate to the mix page
      router.push(`/mix/${mix.id}`);
      resetForm();
  
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Upload failed: ' + errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleArtistSearch = async (query: string): Promise<Artist[]> => {
    const { data, error } = await supabase
      .from('artists')
      .select('id, name, avatar_url')
      .ilike('name', `%${query}%`)
      .limit(10);

    if (error) {
      console.error('Artist search error:', error);
      return [];
    }

    return data || [];
  };

  const handleArtistCreate = async (name: string): Promise<Artist> => {
    const { data, error } = await supabase
      .from('artists')
      .insert({
        name: name.trim(),
        // You could add default values for other fields here if needed
      })
      .select('id, name, avatar_url')
      .single();

    if (error) {
      console.error('Artist creation error:', error);
      throw new Error('Failed to create artist');
    }

    if (!data) {
      throw new Error('No artist data returned');
    }

    return data;
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setAudioFile(selectedFile);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setCoverImage(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setCoverPreview(previewUrl);
    }
  };

  const clearAudio = () => {
    setAudioFile(null);
  };

  const clearImage = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverImage(null);
    setCoverPreview(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Upload Interface */}
      {!audioFile ? (
        // Initial Upload UI
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-blue-600/20 p-4 rounded-full">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Upload Your Mix</h3>
              <p className="text-sm text-gray-400">
                Drag and drop or click to select
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleAudioSelect}
              />
              <span className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium inline-block">
                Choose File
              </span>
            </label>
          </div>
        </div>
      ) : (
        // Form Interface
        <div className="space-y-8">
          {/* Waveform Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{audioFile.name}</h3>
                <p className="text-sm text-gray-400">
                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={clearAudio}
                className="p-2 hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Waveform audioFile={audioFile} />
          </div>

          {/* Two Column Layout for Metadata and Cover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metadata Form Component */}
            <MixMetadataForm 
              metadata={metadata}
              onChange={setMetadata}
              onArtistSearch={handleArtistSearch}
              onArtistCreate={handleArtistCreate}
              disabled={isUploading}
            />
            {/* Cover Art Upload - Takes up 1 column */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Cover Art</h3>
              {coverPreview ? (
                <div className="space-y-4">
                  <div className="relative aspect-square">
                    <Image
                      src={coverPreview}
                      alt="Cover art preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <button
                    onClick={clearImage}
                    disabled={isUploading}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-600 rounded-lg ${!isUploading ? 'cursor-pointer hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'}`}>
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">Add cover art</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Upload Progress Spinner */}
          {isUploading && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="text-sm text-gray-400">Uploading your mix...</span>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!metadata.title.trim() || !audioFile || isUploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 
              disabled:cursor-not-allowed px-8 py-3 rounded-lg font-medium"
            >
              {isUploading ? 'Uploading...' : 'Upload Mix'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}