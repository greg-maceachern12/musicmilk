'use client';

import { Music } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Mix {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  cover_url: string | null;
  play_count: number;
  created_at: string;
}

interface MixCardProps {
  mix: Mix;
}

export function MixCard({ mix }: MixCardProps) {
  return (
    <Link href={`/mix/${mix.id}`}>
      <div className="bg-gray-800 rounded-lg p-4 space-y-3 hover:bg-gray-750 transition cursor-pointer">
        {/* Cover Image */}
        <div className="relative w-full h-48 bg-gray-700 rounded-md overflow-hidden">
          {mix.cover_url ? (
            <Image
              src={mix.cover_url}
              alt={mix.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-12 h-12 text-gray-600" />
            </div>
          )}
        </div>

        {/* Mix Info */}
        <h3 className="font-medium truncate">{mix.title}</h3>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div className="flex flex-col">
            <p className="truncate">by {mix.artist || 'Unknown Artist'}</p>
            {mix.genre && (
              <span className="text-blue-400 text-xs">{mix.genre}</span>
            )}
          </div>
          <p>{mix.play_count} plays</p>
        </div>
      </div>
    </Link>
  );
}

// Loading skeleton component for the card
export function MixCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3 animate-pulse">
      <div className="bg-gray-700 h-48 rounded-md"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
    </div>
  );
}