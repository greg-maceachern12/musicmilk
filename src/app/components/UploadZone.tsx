'use client';

import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { MixMetadata } from './MixMetadata';
import { Waveform } from './Waveform'

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

  // In UploadZone.tsx


  const handleUpload = async () => {
    if (!audioFile || !metadata.title) return;

    setIsUploading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: audioFile.name,
          contentType: audioFile.type,
        }),
      });

      const { uploadUrl, streamUrl, blobName } = await response.json();

      // Upload the file
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': audioFile.type,
        },
        body: audioFile
      });

      if (uploadResponse.ok) {
        // Generate the shareable URL using the blob name
        const shareUrl = `${window.location.origin}/mix/${blobName}`;

        // Show success message with shareable link
        setStreamUrl(shareUrl);
      }

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
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
    <div className="max-w-4xl mx-auto">
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAudioFile(file);
                }}
              />
              <span className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium inline-block">
                Choose File
              </span>
            </label>
          </div>
        </div>
      ) : (
        // Main Upload Interface
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
                onClick={() => setAudioFile(null)}
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
                    Title
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
                      src={URL.createObjectURL(coverImage)}
                      alt="Cover art preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => setCoverImage(null)}
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
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCoverImage(file);
                    }}
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
                <span className="text-sm text-gray-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stream URL Display */}
          {streamUrl && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">🎉 Upload Complete!</h3>
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
