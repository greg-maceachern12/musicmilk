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

  const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250MB in bytes

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
      if (selectedFile.size > MAX_FILE_SIZE) {
        alert('File size exceeds 250MB limit. Please choose a smaller file.');
        e.target.value = ''; // Reset input
        return;
      }
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
    <div className="space-y-6">
      {/* Main Upload Interface */}
      {!audioFile ? (
        // Initial Upload UI
        <div className="border-2 border-dashed border-white/20 bg-white/5 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="bg-white/10 p-6 rounded-full shadow-inner ring-1 ring-white/10">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Upload Your Mix</h3>
              <p className="text-sm text-white/50">
                Drag and drop or click to select (max 250MB)
              </p>
            </div>
            <label className="cursor-pointer group">
              <input
                type="file"
                className="hidden"
                accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/*"
                onChange={handleAudioSelect}
              />
              <span className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-full font-bold shadow-lg shadow-white/10 transition-all transform group-hover:scale-105 inline-block">
                Choose File
              </span>
            </label>
          </div>
        </div>
      ) : (
        // Form Interface
        <div className="space-y-8">
          {/* Waveform Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{audioFile.name}</h3>
                <p className="text-sm text-white/50">
                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={clearAudio}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
              <h3 className="text-lg font-bold mb-4 text-white">Cover Art</h3>
              {coverPreview ? (
                <div className="space-y-4">
                  <div className="relative aspect-square shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/10">
                    <Image
                      src={coverPreview}
                      alt="Cover art preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={clearImage}
                    disabled={isUploading}
                    className="w-full px-4 py-2 border border-white/20 rounded-xl hover:bg-white/10 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/20 rounded-xl bg-black/20 ${!isUploading ? 'cursor-pointer hover:bg-white/5 hover:border-white/30' : 'opacity-50 cursor-not-allowed'} transition-all`}>
                  <ImageIcon className="w-8 h-8 text-white/30 mb-2" />
                  <span className="text-sm text-white/50 font-medium">Add cover art</span>
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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                <span className="text-sm text-white/70 font-medium">Uploading your mix...</span>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!metadata.title.trim() || !audioFile || isUploading}
              className="bg-white text-black hover:bg-gray-100 disabled:bg-white/10 disabled:text-white/30
              disabled:cursor-not-allowed px-10 py-4 rounded-full font-bold shadow-xl shadow-white/5 hover:scale-105 active:scale-95 transition-all"
            >
              {isUploading ? 'Uploading...' : 'Upload Mix'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}