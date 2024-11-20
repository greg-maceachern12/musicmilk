import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { fadeInUp, defaultTransition, cardHover } from '@/lib/animations';
import { useAudio } from '@/app/contexts/AudioContext';

interface Chapter {
  id: string;
  mix_id: string;
  title: string;
  timestamp: string;
  order: number;
}

interface ChapterListProps {
  chapters: Chapter[];
}

function parseTimestamp(timestamp: string): number {
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export function ChapterList({ chapters }: ChapterListProps) {
  const { state, dispatch } = useAudio();
  
  if (!chapters.length) return null;

  const handleChapterClick = (timestamp: string) => {
    const seconds = parseTimestamp(timestamp);
    console.log(timestamp)
    dispatch({ type: 'SEEK', payload: seconds });
  };

  return (
    <motion.div
      className="mt-8"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ ...defaultTransition, delay: 0.9 }}
    >
      <h3 className="text-lg font-semibold text-white mb-4">Chapters</h3>
      <div className="space-y-3">
        {chapters.sort((a, b) => a.order - b.order).map((chapter) => (
          <motion.button
            key={chapter.id}
            onClick={() => handleChapterClick(chapter.timestamp)}
            className="w-full flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
            variants={cardHover}
            whileHover="hover"
            whileTap="tap"
          >
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{chapter.timestamp}</span>
            <span className="text-sm text-left">{chapter.title}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}