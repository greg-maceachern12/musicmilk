'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut, User, ChevronDown, HelpCircle } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

export function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setIsOpen(false);
  };

  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-800 rounded-lg transition-colors"
        >
          Profile
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
            {/* Email display */}
            <div className="px-4 py-2 bg-gray-700/50 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300 truncate">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/profile"
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 flex items-center gap-3 text-gray-200 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                View Profile
              </Link>

              <a
                href="mailto:gregmaceachern98@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 flex items-center gap-3 text-gray-200 hover:text-white transition-colors border-t border-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <HelpCircle className="w-4 h-4" />
                Get Support
              </a>

              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 text-red-400 hover:text-red-300 flex items-center gap-3 transition-colors border-t border-gray-700"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/signin"
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-800 rounded-lg transition-colors"
    >
      <LogIn className="w-4 h-4" />
      Sign In
    </Link>
  );
}