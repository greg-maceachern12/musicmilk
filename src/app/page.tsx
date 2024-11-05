'use client';

import { UploadZone } from './components/UploadZone';
import RecentMixes from './components/RecentMixes';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold">Share Your Mixes</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          From mashups to mixtaps, Music Milk is the home
          for all your creative combinations
        </p>
      </section>

      {/* Upload Section */}
      <section className="max-w-3xl mx-auto">
        <UploadZone />
      </section>

      {/* Recent Mixes Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Mixes</h2>
        <RecentMixes />
      </section>
    </div>
  );
}