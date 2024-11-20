import { X } from 'lucide-react';

interface Chapter {
  title: string;
  timestamp: string; // in format "MM:SS"
  order: number;
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
    newChapters[index] = {
      ...newChapters[index],
      [field]: e.target.value
    };
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
    const newChapters = metadata.chapters.filter((_, i) => i !== index);
    // Update order of remaining chapters
    const reorderedChapters = newChapters.map((chapter, i) => ({
      ...chapter,
      order: i
    }));
    onChange({
      ...metadata,
      chapters: reorderedChapters
    });
  };

  return (
    <div className="md:col-span-2 bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Mix Details</h2>

      <div className="space-y-4">
        {/* Existing fields */}
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

        {/* Chapters section */}
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
            <div key={index} className="flex gap-3 items-start">
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
              <div className="w-24">
                <input
                  type="text"
                  value={chapter.timestamp}
                  onChange={handleChapterChange(index, 'timestamp')}
                  disabled={disabled}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="HH:MM:SS"
                  pattern="[0-9]{2}:[0-9]{2}"
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
          ))}
        </div>
      </div>
    </div>
  );
}