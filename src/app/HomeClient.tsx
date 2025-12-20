'use client';

import { UploadZone } from './components/UploadZone';
import RecentMixes, { Mix } from './components/PopularMixes';
import { AnimatedGradient } from './components/AnimatedGradient';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

export default function HomeClient({ popularMixes }: { popularMixes: Mix[] }) {
  return (
    <>
      <AnimatedGradient />

      <motion.div
        // @ts-expect-error - Framer motion types conflict with React 19
        className="space-y-24 pb-12"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        {/* Hero Section */}
        <motion.section
          // @ts-expect-error - Framer motion types conflict with React 19
          className="relative pt-12 text-center"
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
            <motion.h1
              // @ts-expect-error - Framer motion types conflict with React 19
              className="text-4xl md:text-5xl font-light tracking-tight text-white"
              variants={fadeInUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              🎧<span className="font-semibold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent"> Share Your Mixes</span>
            </motion.h1>
            
            <motion.p
              // @ts-expect-error - Framer motion types conflict with React 19
              className="text-base text-white/40 font-light leading-relaxed"
              variants={fadeInUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              The home for mashups, mixtapes, and creative combinations
            </motion.p>

            <motion.div
              // @ts-expect-error - Framer motion types conflict with React 19
              className="flex items-center gap-3"
              variants={fadeInUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            >
              <Link
                href="/feed"
                className="px-6 py-2.5 bg-white text-black font-medium rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                Browse Mixes
              </Link>
              <a
                href="#upload"
                className="px-6 py-2.5 border border-white/20 text-white/80 font-medium rounded-full transition-all duration-300 hover:bg-white/5 hover:border-white/30 hover:text-white hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                Upload Mix
              </a>
            </motion.div>
          </div>
        </motion.section>

        {/* Upload Section */}
        <motion.section
          // @ts-expect-error - Framer motion types conflict with React 19
          id="upload"
          className="max-w-3xl mx-auto scroll-mt-8"
          variants={fadeInUp}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <UploadZone />
        </motion.section>

        {/* Popular Mixes Section */}
        <motion.section
          // @ts-expect-error - Framer motion types conflict with React 19
          className="space-y-8"
          variants={fadeInUp}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">
                Popular <span className="font-semibold">Drops</span>
              </h2>
              <p className="text-white/30 mt-2 font-light">Trending mixes from the community</p>
            </div>
            <Link
              href="/feed"
              className="text-sm text-white/40 hover:text-white/70 transition-colors font-medium tracking-wide uppercase"
            >
              View All
            </Link>
          </div>
          <RecentMixes initialMixes={popularMixes} />
        </motion.section>
      </motion.div>
    </>
  );
}


