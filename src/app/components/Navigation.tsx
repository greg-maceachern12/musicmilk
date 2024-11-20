"use client";

import { useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { AuthButton } from "./AuthButton";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/50 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4">
          {/* Main navigation bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo and brand */}
            <Link 
              className="flex items-center gap-2 shrink-0" 
              href='/'
              onClick={() => setIsMenuOpen(false)}
            >
              <Image 
                src="/images/logo_trans.png" 
                alt="Music Milk Logo" 
                width={32} 
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-white">Music Milk</span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:gap-4">
              <Link 
                href='/feed' 
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Explore
              </Link>
              <Link 
                href='/' 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Upload Mix
              </Link>
              <AuthButton />
            </div>

            {/* Mobile buttons */}
            <div className="flex items-center gap-2 md:hidden">
              <AuthButton />
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} className="text-gray-300" /> : <Menu size={24} className="text-gray-300" />}
              </button>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-700">
              <div className="py-2 space-y-1">
                <Link 
                  href='/feed' 
                  className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explore
                </Link>
                <Link 
                  href='/' 
                  className="block px-4 py-2.5 text-white hover:bg-gray-800 transition-colors rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Upload Mix
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Wrapper to push content below fixed nav */}
      <div className="pt-16" />
    </>
  );
}