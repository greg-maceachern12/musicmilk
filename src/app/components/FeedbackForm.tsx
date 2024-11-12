'use client';

import React, { useState } from 'react';
import { MessageCircle, CheckCircle2, AlertCircle, X, HelpCircle } from 'lucide-react';

// Define types for the form data
interface FeedbackFormData {
  'form-name': string;
  message: string;
  [key: string]: string; // Allow for additional string key-value pairs
}

const FloatingFeedback: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const encode = (data: FeedbackFormData): string => {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const formData: FeedbackFormData = {
      'form-name': 'feedback',
      message: message
    };

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setMessage('');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      setError(`Failed to submit feedback. Please try again: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-500 text-white rounded-full p-3 shadow-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label={isOpen ? 'Close feedback form' : 'Open feedback form'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <HelpCircle className="w-6 h-6" />
        )}
      </button>

      {/* Feedback form panel */}
      <div className={`absolute bottom-16 right-0 transition-all duration-200 ease-in-out transform ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}>
        <div className="w-80 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              name="feedback"
              method="post"
              data-netlify="true"
            >
              <input type="hidden" name="feedback" value="feedback" />
              
              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                <MessageCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <input
                  type="text"
                  name="message"
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                  placeholder="Have feedback? Let us know!"
                  className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400 w-full"
                  disabled={isSubmitting}
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-500 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </button>

              {error && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {showSuccess && (
                <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-600">Thank you for your feedback!</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingFeedback;