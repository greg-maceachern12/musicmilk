'use client';

import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Link, Trash2, Flag, Pencil, Download } from 'lucide-react';

interface MixMenuProps {
  isOwner: boolean;
  onDelete: () => void;
  onEdit?: () => void;
  audioUrl: string;
  mixTitle: string;
}

export function MixMenu({ isOwner, onDelete, onEdit, audioUrl, mixTitle }: MixMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const originalName = audioUrl.split('/').pop() || 'audio.mp3';
      a.download = `musicmilk_${mixTitle}_${originalName}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsOpen(false);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download the mix. Please try again.');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      alert('Edit functionality coming soon');
    }
    setIsOpen(false);
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    alert('Report functionality coming soon');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-700/50 rounded-full transition-colors"
        aria-label="More options"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden z-10">
          <button
            onClick={handleCopy}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 flex items-center gap-3 text-gray-200 hover:text-white transition-colors"
          >
            <Link className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          <button
            onClick={handleDownload}
            className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 flex items-center gap-3 text-gray-200 hover:text-white transition-colors border-t border-gray-700"
          >
            <Download className="w-4 h-4" />
            Download mix
          </button>

          {isOwner ? (
            <>
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 flex items-center gap-3 text-gray-200 hover:text-white transition-colors border-t border-gray-700"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 text-red-400 hover:text-red-300 flex items-center gap-3 transition-colors border-t border-gray-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={handleReport}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-700 text-orange-400 hover:text-orange-300 flex items-center gap-3 transition-colors border-t border-gray-700"
            >
              <Flag className="w-4 h-4" />
              Report
            </button>
          )}
        </div>
      )}
    </div>
  );
}