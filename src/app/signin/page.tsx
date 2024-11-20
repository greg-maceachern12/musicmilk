'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Mail } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (signInError) {
        setMessage({ type: 'error', text: signInError.message });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Check your email for the magic link! You can close this page.' 
        });
        setEmail('');
      }
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred:' + err 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Sign in to Music Milk</h1>
        <p className="text-gray-400">
          Sign in to save your mixes and access additional features
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-900/50' : 'bg-red-900/50'
            }`}>
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-300' : 'text-red-300'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 
                     disabled:cursor-not-allowed px-4 py-2 rounded-lg 
                     font-medium flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}