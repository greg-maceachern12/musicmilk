'use client';

import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { Waveform } from './Waveform';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function UploadZone() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    artist: '',
    genre: '',
    description: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [lastUploadedMix, setLastUploadedMix] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const resetForm = () => {
    setAudioFile(null);
    setCoverImage(null);
    setCoverPreview(null);
    setMetadata({
      title: '',
      artist: '',
      genre: '',
      description: ''
    });
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleUpload = async () => {
    if (!audioFile || !metadata.title) return;

    setIsUploading(true);
    try {
      // Upload audio file to Supabase Storage
      const audioFileName = `${Date.now()}-${audioFile.name}`;
      const { error: audioError } = await supabase.storage
        .from('audio')
        .upload(audioFileName, audioFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (audioError) {
        console.error('Audio upload error:', audioError);
        throw audioError;
      }

      // Get the public URL for the audio file
      const { data: audioUrlData } = supabase.storage
        .from('audio')
        .getPublicUrl(audioFileName);

      // Upload cover image if provided
      let coverUrl = null;
      if (coverImage) {
        const coverFileName = `${Date.now()}-${coverImage.name}`;
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverFileName, coverImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (coverError) {
          console.error('Cover upload error:', coverError);
        } else {
          const { data: coverUrlData } = supabase.storage
            .from('covers')
            .getPublicUrl(coverFileName);
          coverUrl = coverUrlData.publicUrl;
        }
      }

      // Store the mix metadata in the database
      const { data: mix, error: dbError } = await supabase
        .from('mixes')
        .insert({
          title: metadata.title,
          artist: metadata.artist || null,
          genre: metadata.genre || null,
          description: metadata.description || null,
          audio_url: audioUrlData.publicUrl,
          cover_url: coverUrl,
          play_count: 0
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      console.log('Mix uploaded successfully:', mix);

      // Generate the share URL using the mix ID
      const shareUrl = `${window.location.origin}/mix/${mix.id}`;
      setStreamUrl(shareUrl);

      setLastUploadedMix(metadata.title);
      setUploadProgress(100);

      // Reset the form
      resetForm();

    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Upload failed: ' + errorMessage);
    } finally {
      setIsUploading(false);
    }
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
    setUploadProgress(0);
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
              <h3 className="text-xl font-semibold">Upload your mix</h3>
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
            {/* Metadata Form - Takes up 2 columns */}
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
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Mix title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Artist
                  </label>
                  <input
                    type="text"
                    value={metadata.artist}
                    onChange={(e) => setMetadata(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Artist name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={metadata.genre}
                    onChange={(e) => setMetadata(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="e.g., House, Techno, Ambient"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    rows={4}
                    placeholder="Tell us about your mix"
                  />
                </div>
              </div>
            </div>

            {/* Cover Art Upload - Takes up 1 column */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Cover Art</h3>
              {coverImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-square">
                    <Image
                      src={coverPreview!}
                      alt="Cover art preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <button
                    onClick={clearImage}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700">
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">Add cover art</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Uploading...</span>
                <span className="text-sm text-gray-400">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
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
      {/* Success Message - Always show if there's a streamUrl */}
      {streamUrl && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">
            🎉 {lastUploadedMix} uploaded successfully!
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={streamUrl}
              readOnly
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(streamUrl)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}