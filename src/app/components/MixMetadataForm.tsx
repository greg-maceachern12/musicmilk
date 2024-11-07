interface MixMetadata {
    title: string;
    artist: string;
    genre: string;
    description: string;
  }
  
  interface MixMetadataFormProps {
    metadata: MixMetadata;
    onChange: (metadata: MixMetadata) => void;
  }
  
  export function MixMetadataForm({ metadata, onChange }: MixMetadataFormProps) {
    const handleChange = (field: keyof MixMetadata) => (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      onChange({
        ...metadata,
        [field]: e.target.value
      });
    };
  
    return (
      <div className="md:col-span-2 bg-gray-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Mix Details</h2>
  
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title*
            </label>
            <input
              type="text"
              value={metadata.title}
              onChange={handleChange('title')}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
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
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
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
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
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
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              rows={4}
              placeholder="Tell us about your mix"
            />
          </div>
        </div>
      </div>
    );
  }