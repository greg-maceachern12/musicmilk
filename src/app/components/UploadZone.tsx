'use client';

import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Waveform } from './Waveform';
import { MixMetadataForm } from './MixMetadataForm';

interface Chapter {
  title: string;
  timestamp: string;
  order: number;
}

interface MixMetadata {
  title: string;
  artist: string;
  genre: string;
  description: string;
  chapters: Chapter[];
}

export function UploadZone() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MixMetadata>({
    title: '',
    artist: '',
    genre: '',
    description: '',
    chapters: []
  });
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const supabase = createClientComponentClient();

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
      artist: '',
      genre: '',
      description: '',
      chapters: []
    });
    setIsUploading(false);
  };

  const handleUpload = async () => {
    if (!audioFile || !metadata.title) return;

    setIsUploading(true);
    try {
      // Upload audio file first with metadata
      const audioResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: audioFile.name,
          fileType: audioFile.type,
          isAudio: true,
          metadata: {
            title: metadata.title,
            artist: metadata.artist || null,
            genre: metadata.genre || null,
            description: metadata.description || null,
            ...(metadata.chapters.length > 0 && {
              chapters: metadata.chapters.map(chapter => ({
                title: chapter.title,
                timestamp: chapter.timestamp,
                order: chapter.order
              }))
            })
          }
        }),
      });

      if (!audioResponse.ok) {
        throw new Error('Failed to get audio upload URL');
      }

      const { uploadUrl, mix } = await audioResponse.json();

      // Upload audio file to Azure
      const audioUploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': audioFile.type,
        },
        body: audioFile
      });

      if (!audioUploadResponse.ok) {
        throw new Error('Failed to upload audio file');
      }

      // Handle cover image if present
      if (coverImage) {
        const coverResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: coverImage.name,
            fileType: coverImage.type,
            isAudio: false
          }),
        });

        if (!coverResponse.ok) {
          throw new Error('Failed to get cover upload URL');
        }

        const { uploadUrl: coverUploadUrl, blobUrl: coverUrl } = await coverResponse.json();

        const coverUploadResponse = await fetch(coverUploadUrl, {
          method: 'PUT',
          headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': coverImage.type,
          },
          body: coverImage
        });

        if (!coverUploadResponse.ok) {
          throw new Error('Failed to upload cover image');
        }

        // Update the mix record with cover URL
        const { error: updateError } = await supabase
          .from('mixes')
          .update({ cover_url: coverUrl })
          .eq('id', mix.id);

        if (updateError) throw updateError;
      }

      console.log('Upload successful:', mix);
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
              disabled={isUploading}
            />

            {/* Cover Art Upload */}
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

          {/* Upload Progress */}
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