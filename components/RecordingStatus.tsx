'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type RecorderState } from '@/lib/recorder';
import { type SyncStatus } from '@/lib/syncManager';
import { EASING } from '@/lib/animations';

interface RecordingStatusProps {
  state: RecorderState;
  syncStatus: SyncStatus;
  duration: number; // in seconds
  chunksSaved: number;
  chunksUploaded: number;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RecordingStatus({
  state,
  syncStatus,
  duration,
  chunksSaved,
  chunksUploaded,
}: RecordingStatusProps) {
  const isRecording = state === 'recording';
  const isPaused = state === 'paused';
  const isInactive = state === 'inactive';
  const uploadProgress = chunksSaved > 0 ? Math.round((chunksUploaded / chunksSaved) * 100) : 0;
  const isAllUploaded = chunksSaved > 0 && chunksUploaded === chunksSaved;

  return (
    <motion.div
      className="w-full max-w-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASING.smooth }}
    >
      {/* Timer Display - Minimal */}
      <div className="text-center mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`
                text-6xl md:text-7xl font-mono font-bold tracking-tight
                ${isRecording ? 'text-stone-800' : ''}
                ${isPaused ? 'text-stone-400' : ''}
                ${isInactive ? 'text-stone-300' : ''}
              `}
              animate={isRecording ? {
                opacity: [1, 0.7, 1],
              } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {formatDuration(duration)}
            </motion.div>

            {/* Status Label */}
            <div className="mt-3 flex items-center justify-center gap-2">
              {isRecording && (
                <motion.span
                  className="inline-flex items-center gap-2 text-sm font-medium text-rose-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.span
                    className="w-2 h-2 rounded-full bg-rose-500"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.6, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  />
                  Recording
                </motion.span>
              )}
              {isPaused && (
                <span className="text-sm font-medium text-amber-600">
                  Paused
                </span>
              )}
              {isInactive && chunksSaved === 0 && (
                <span className="text-sm font-medium text-stone-400">
                  Ready to record
                </span>
              )}
              {isInactive && chunksSaved > 0 && (
                <span className="text-sm font-medium text-teal-600">
                  Recording complete
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Upload Progress - Only show when relevant */}
      <AnimatePresence>
        {chunksSaved > 0 && (
          <motion.div
            className="glass-card rounded-2xl p-5"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.3, ease: EASING.smooth }}
          >
            {/* Sync Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {syncStatus === 'syncing' && (
                  <motion.svg
                    className="w-4 h-4 text-teal-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <path
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
                {isAllUploaded && (
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {syncStatus === 'error' && (
                  <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`text-sm font-medium ${
                  syncStatus === 'syncing' ? 'text-teal-700' :
                  syncStatus === 'error' ? 'text-rose-600' :
                  isAllUploaded ? 'text-teal-700' :
                  'text-stone-500'
                }`}>
                  {syncStatus === 'syncing' && 'Uploading to cloud...'}
                  {syncStatus === 'error' && 'Upload error (retrying)'}
                  {isAllUploaded && 'All uploaded'}
                  {syncStatus === 'idle' && !isAllUploaded && chunksSaved > 0 && 'Waiting...'}
                </span>
              </div>
              <span className="text-sm text-stone-500">
                {chunksUploaded}/{chunksSaved}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-stone-200 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  syncStatus === 'error' ? 'bg-rose-400' : 'bg-teal-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3, ease: EASING.smooth }}
              />
              {syncStatus === 'syncing' && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            {/* Storage info - subtle */}
            <p className="mt-3 text-xs text-stone-400 text-center">
              ~{((chunksSaved * 5 * 16) / 1024).toFixed(1)} MB saved locally
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
