'use client';

import { UploadZone } from './components/UploadZone';
import RecentMixes from './components/RecentMixes';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold">🎧 Share Your Mixes</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          From mashups to mixtapes, Music Milk is the home
          for all your creative combinations
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link 
            href="/feed" 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg"
          >
            Browse Mixes
          </Link>
          <a 
            href="#upload" 
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 transition rounded-lg"
          >
            Upload Mix
          </a>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="max-w-3xl mx-auto">
        <UploadZone />
      </section>

      {/* Recent Mixes Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Recent Mixes</h2>
          <Link 
            href="/feed" 
            className="text-blue-400 hover:text-blue-300 transition"
          >
            View All
          </Link>
        </div>
        <RecentMixes />
      </section>
    </div>
  );
}