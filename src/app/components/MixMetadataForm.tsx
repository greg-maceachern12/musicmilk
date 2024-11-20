import { X, AlertCircle } from 'lucide-react';

interface Chapter {
  title: string;
  timestamp: string;
  order: number;
  error?: string;
}

interface MixMetadata {
  title: string;
  artist: string;
  genre: string;
  description: string;
  chapters: Chapter[];
}

interface MixMetadataFormProps {
  metadata: MixMetadata;
  onChange: (metadata: MixMetadata) => void;
  disabled?: boolean;
}

function formatTimestamp(input: string): string {
  // Remove any non-digit characters
  const digits = input.replace(/\D/g, '');
  
  // Handle different cases based on length
  if (digits.length <= 2) {
    return digits.padStart(2, '0');
  } else if (digits.length <= 4) {
    const minutes = digits.slice(0, -2).padStart(2, '0');
    const seconds = digits.slice(-2).padStart(2, '0');
    return `${minutes}:${seconds}`;
  } else {
    const hours = digits.slice(0, -4).padStart(2, '0');
    const minutes = digits.slice(-4, -2).padStart(2, '0');
    const seconds = digits.slice(-2).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}

function validateTimestamp(timestamp: string): string | null {
  // Empty timestamp
  if (!timestamp) return "Timestamp is required";

  // Check format
  const timestampRegex = /^(?:(?:[0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9])|(?:[0-5][0-9]:[0-5][0-9])$/;
  if (!timestampRegex.test(timestamp)) {
    return "Invalid format. Use HH:MM:SS or MM:SS";
  }

  // Validate the timestamp values
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    if (minutes >= 60) return "Minutes cannot exceed 59";
    if (seconds >= 60) return "Seconds cannot exceed 59";
  } else if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    if (hours >= 24) return "Hours cannot exceed 23";
    if (minutes >= 60) return "Minutes cannot exceed 59";
    if (seconds >= 60) return "Seconds cannot exceed 59";
  }

  return null;
}

export function MixMetadataForm({ metadata, onChange, disabled = false }: MixMetadataFormProps) {
  const handleChange = (field: keyof Omit<MixMetadata, 'chapters'>) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange({
      ...metadata,
      [field]: e.target.value
    });
  };

  const handleChapterChange = (index: number, field: keyof Chapter) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newChapters = [...metadata.chapters];
    
    if (field === 'timestamp') {
      // Format the timestamp as the user types
      const formattedTimestamp = formatTimestamp(e.target.value);
      
      // Validate the timestamp
      const error = validateTimestamp(formattedTimestamp);
      
      newChapters[index] = {
        ...newChapters[index],
        timestamp: formattedTimestamp,
        error: error || undefined
      };
    } else {
      newChapters[index] = {
        ...newChapters[index],
        [field]: e.target.value
      };
    }
    
    onChange({
      ...metadata,
      chapters: newChapters
    });
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      title: '',
      timestamp: '',
      order: metadata.chapters.length
    };
    onChange({
      ...metadata,
      chapters: [...metadata.chapters, newChapter]
    });
  };

  const removeChapter = (index: number) => {
    const newChapters = metadata.chapters
      .filter((_, i) => i !== index)
      .map((chapter, i) => ({
        ...chapter,
        order: i
      }));
    onChange({
      ...metadata,
      chapters: newChapters
    });
  };

  return (
    <div className="md:col-span-2 bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Mix Details</h2>

      <div className="space-y-4">
        {/* Basic fields remain the same */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title*
          </label>
          <input
            type="text"
            value={metadata.title}
            onChange={handleChange('title')}
            disabled={disabled}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Mix title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Artist
          </label>
          <input
            type="text"
            value={metadata.artist}
            onChange={handleChange('artist')}
            disabled={disabled}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Artist name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Genre
          </label>
          <input
            type="text"
            value={metadata.genre}
            onChange={handleChange('genre')}
            disabled={disabled}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., House, Techno, Ambient"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={metadata.description}
            onChange={handleChange('description')}
            disabled={disabled}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
            rows={4}
            placeholder="Tell us about your mix"
          />
        </div>

        {/* Enhanced Chapters section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-300">
              Chapters
            </label>
            <button
              type="button"
              onClick={addChapter}
              disabled={disabled}
              className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Chapter
            </button>
          </div>

          {metadata.chapters.map((chapter, index) => (
            <div key={index} className="space-y-2">
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={chapter.title}
                    onChange={handleChapterChange(index, 'title')}
                    disabled={disabled}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Song title"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="text"
                    value={chapter.timestamp}
                    onChange={handleChapterChange(index, 'timestamp')}
                    disabled={disabled}
                    className={`w-full bg-gray-700 border rounded-lg px-4 py-2
                             disabled:opacity-50 disabled:cursor-not-allowed
                             ${chapter.error ? 'border-red-500' : 'border-gray-600'}`}
                    placeholder="HH:MM:SS"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeChapter(index)}
                  disabled={disabled}
                  className="p-2 hover:bg-gray-700 rounded-full disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Error message */}
              {chapter.error && (
                <div className="flex items-center gap-2 text-red-400 text-sm ml-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{chapter.error}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}