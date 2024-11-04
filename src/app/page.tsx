'use client';

import { UploadZone } from './components/UploadZone';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold">Share Your Long-Form Mixes</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Upload your 30-60 minute mixtapes and share them with the world. 
          High-quality audio streaming with beautiful waveform visualization.
        </p>
      </section>

      {/* Upload Section */}
      <section className="max-w-3xl mx-auto">
        <UploadZone />
      </section>

      {/* Featured Mixes Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Featured Mixes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="bg-gray-700 h-40 rounded-md"></div>
            <h3 className="font-medium">Summer Vibes Mix</h3>
            <p className="text-sm text-gray-400">by DJ Example</p>
          </div>
        </div>
      </section>
    </div>
  );
}