'use client';
import { Music } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Mix, MixCardProps } from '@/app/types/mix'

export function MixCard({ mix }: MixCardProps) {
  const artistDisplay = mix.mix_artists?.length 
    ? mix.mix_artists.map(ma => ma.artists.name).join(', ')
    : 'Unknown Artist';

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
            <p className="truncate">{artistDisplay}</p>
            {mix.genre && (
              <span className="text-blue-400 text-xs">{mix.genre}</span>
            )}
          </div>
          <p>{mix.play_count.toLocaleString()} plays</p>
        </div>
      </div>
    </Link>
  );
}

// Loading skeleton component for the card - also make sure to export it
export function MixCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3 animate-pulse">
      <div className="bg-gray-700 h-48 rounded-md"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
    </div>
  );
}

// Also export the Mix type for reuse in other components
export type { Mix, MixCardProps };