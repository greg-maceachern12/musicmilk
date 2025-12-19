'use client';

import { UploadZone } from './components/UploadZone';
import RecentMixes from './components/PopularMixes';
import { AnimatedGradient } from './components/AnimatedGradient';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* Animated morphing gradient background */}
      <AnimatedGradient />

      {/* Original home-only background gradient - commented out */}
      {/* <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1728] via-[#12324e] to-[#070e19]" />
        <div className="absolute top-[-15%] left-[-10%] h-[55vh] w-[60vw] rounded-full blur-[110px] opacity-25 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.16),_transparent_60%)]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[60vh] w-[55vw] rounded-full blur-[120px] opacity-25 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.16),_transparent_60%)]" />
      </div> */}

      <main className="container mx-auto px-4 py-8 lg:py-16 relative z-10">
        <div className="space-y-16 lg:space-y-24">
          {/* Hero Section */}
          <section className="text-center space-y-6 lg:space-y-8 py-8 lg:py-12 relative">
            {/* Decorative background element behind hero */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-radial from-blue-500/10 via-transparent to-transparent -z-10 blur-3xl" />
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-sm">
              <span className="block mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50">Share Your</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">Sonic Journey</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
              From mashups to mixtapes, Music Milk is the home
              for all your creative combinations
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
              <Link 
                href="/feed" 
                className="px-8 py-4 bg-white text-black hover:bg-gray-100 transition-all rounded-full font-medium shadow-xl shadow-white/5 hover:scale-105 active:scale-95"
              >
                Browse Mixes
              </Link>
              <a 
                href="#upload" 
                className="px-8 py-4 bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all rounded-full font-medium backdrop-blur-md hover:scale-105 active:scale-95"
              >
                Upload Mix
              </a>
            </div>
          </section>

          {/* Upload Section */}
          <section id="upload" className="max-w-4xl mx-auto">
            <div className="bg-black/20 backdrop-blur-2xl rounded-3xl p-1 border border-white/10 shadow-2xl">
              <div className="bg-black/20 rounded-[1.4rem] p-6 sm:p-10 border border-white/5">
                <UploadZone />
              </div>
            </div>
          </section>

          {/* Recent Mixes Section */}
          <section className="space-y-8">
            <div className="flex justify-between items-end px-2">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-white tracking-tight">Popular Drops</h2>
                <p className="text-white/40 text-sm">Listen to what's trending this week</p>
              </div>
              <Link 
                href="/feed" 
                className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 group"
              >
                View All
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <RecentMixes />
          </section>
        </div>
      </main>
    </>
  );
}