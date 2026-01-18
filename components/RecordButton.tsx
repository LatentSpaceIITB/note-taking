'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type RecorderState } from '@/lib/recorder';
import { breathingGlow, EASING, TIMING, TRANSITIONS } from '@/lib/animations';

interface RecordButtonProps {
  state: RecorderState;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  disabled?: boolean;
}

export function RecordButton({
  state,
  onStart,
  onStop,
  onPause,
  onResume,
  disabled,
}: RecordButtonProps) {
  const isRecording = state === 'recording';
  const isPaused = state === 'paused';
  const isInactive = state === 'inactive';

  return (
    <div className="flex items-center justify-center gap-6">
      <AnimatePresence mode="wait">
        {isInactive && (
          <motion.button
            key="start"
            onClick={onStart}
            disabled={disabled}
            className="relative flex items-center justify-center w-28 h-28 rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={TRANSITIONS.spring}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 opacity-20" />
            <div className="absolute inset-2 rounded-full bg-cream-50" />

            {/* Main button */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30 transition-shadow hover:shadow-xl hover:shadow-rose-500/40">
              <div className="w-6 h-6 rounded-full bg-white" />
            </div>
          </motion.button>
        )}

        {isRecording && (
          <motion.div
            key="recording"
            className="flex items-center gap-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={TRANSITIONS.spring}
          >
            {/* Pause Button */}
            <motion.button
              onClick={onPause}
              className="relative flex items-center justify-center w-16 h-16 rounded-full bg-stone-800 hover:bg-stone-700 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-stone-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex gap-1.5">
                <div className="w-1.5 h-5 bg-white rounded-sm" />
                <div className="w-1.5 h-5 bg-white rounded-sm" />
              </div>
            </motion.button>

            {/* Stop Button with breathing glow */}
            <motion.button
              onClick={onStop}
              className="relative flex items-center justify-center w-28 h-28 rounded-full focus:outline-none"
              variants={breathingGlow}
              initial="idle"
              animate="active"
            >
              {/* Outer breathing rings */}
              <motion.div
                className="absolute inset-0 rounded-full bg-rose-500"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-2 rounded-full bg-rose-500"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.2, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />

              {/* Main button */}
              <motion.div
                className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-6 h-6 rounded-sm bg-white" />
              </motion.div>
            </motion.button>
          </motion.div>
        )}

        {isPaused && (
          <motion.div
            key="paused"
            className="flex items-center gap-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={TRANSITIONS.spring}
          >
            {/* Resume Button */}
            <motion.button
              onClick={onResume}
              className="relative flex items-center justify-center w-16 h-16 rounded-full bg-teal-700 hover:bg-teal-600 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.button>

            {/* Stop Button */}
            <motion.button
              onClick={onStop}
              className="relative flex items-center justify-center w-28 h-28 rounded-full focus:outline-none"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full bg-rose-500/20" />
              <div className="absolute inset-2 rounded-full bg-cream-50" />

              {/* Main button */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <div className="w-6 h-6 rounded-sm bg-white" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
