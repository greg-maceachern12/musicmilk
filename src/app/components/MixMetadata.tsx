'use client';

interface MixMetadataProps {
    metadata: MixMetadata;
    onMetadataChange: (metadata: MixMetadata) => void;
    onComplete: () => void;
  }

  export function MixMetadata({ metadata, onMetadataChange, onComplete }: MixMetadataProps) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={metadata.title}
              onChange={(e) => onMetadataChange({ ...metadata, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name your mix"
            />
          </div>
  
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-2">
              Genre
            </label>
            <input
              type="text"
              id="genre"
              value={metadata.genre}
              onChange={(e) => onMetadataChange({ ...metadata, genre: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., House, Techno, Ambient"
            />
          </div>
  
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={metadata.description}
              onChange={(e) => onMetadataChange({ ...metadata, description: e.target.value })}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about your mix"
            />
          </div>
        </div>
  
        <button
          onClick={onComplete}
          disabled={!metadata.title.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium"
        >
          Continue
        </button>
      </div>
    );
  }