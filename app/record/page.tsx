'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { RecordButton } from '@/components/RecordButton';
import { RecordingStatus } from '@/components/RecordingStatus';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { recorder, type RecorderState } from '@/lib/recorder';
import { syncManager, type SyncStatus } from '@/lib/syncManager';
import { getIncompleteSessions, type RecordingSession } from '@/lib/indexeddb';
import { createLecture } from '@/lib/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { EASING } from '@/lib/animations';

export default function RecordPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recorderState, setRecorderState] = useState<RecorderState>('inactive');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [chunksSaved, setChunksSaved] = useState(0);
  const [chunksUploaded, setChunksUploaded] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [incompleteSessions, setIncompleteSessions] = useState<RecordingSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedSessionId, setProcessedSessionId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const isRecording = recorderState === 'recording';

  // Check for incomplete sessions on mount
  useEffect(() => {
    const checkIncompleteSessions = async () => {
      const sessions = await getIncompleteSessions();
      setIncompleteSessions(sessions);
    };
    checkIncompleteSessions();
  }, []);

  // Timer effect
  useEffect(() => {
    if (recorderState === 'recording') {
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else if (recorderState === 'paused') {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recorderState]);

  const handleStart = useCallback(async () => {
    if (!user) {
      setError('Please sign in to record');
      return;
    }

    try {
      setError(null);
      startTimeRef.current = Date.now();
      setDuration(0);
      setChunksSaved(0);
      setChunksUploaded(0);

      const newSessionId = await recorder.start({
        onChunkSaved: () => {
          setChunksSaved((prev) => prev + 1);
        },
        onStateChange: setRecorderState,
        onError: (err) => setError(err.message),
      });

      setSessionId(newSessionId);

      await createLecture(user.uid, newSessionId, {
        status: 'uploading',
      });

      syncManager.start(newSessionId, user.uid, {
        onStatusChange: setSyncStatus,
        onChunkUploaded: (_, uploaded) => {
          setChunksUploaded(uploaded);
        },
        onError: (err, chunkId) => {
          console.error('Upload error:', err);
          setError(`Upload failed for ${chunkId}: ${err.message}. Check Firebase Storage rules.`);
        },
        onComplete: () => {
          console.log('All chunks uploaded!');
        },
      });
    } catch (err) {
      setError((err as Error).message);
    }
  }, [user]);

  const handleStop = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await recorder.stop();
  }, []);

  const handlePause = useCallback(() => {
    recorder.pause();
  }, []);

  const handleResume = useCallback(() => {
    recorder.resume();
  }, []);

  const handleProcess = useCallback(async () => {
    if (!sessionId || !user) return;

    setProcessing(true);
    setError(null);

    try {
      const functionUrl = process.env.NEXT_PUBLIC_FUNCTION_URL || 'http://127.0.0.1:5001/lecture-notes-f2f82/us-central1/processRecording';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId: user.uid }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Processing failed');
      }

      setProcessedSessionId(sessionId);
      console.log('Processing complete:', result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  }, [sessionId, user]);

  const handleResumeSession = useCallback(async (session: RecordingSession) => {
    if (!user) {
      setError('Please sign in to resume');
      return;
    }

    setSessionId(session.id);
    setChunksSaved(session.totalChunks);
    setChunksUploaded(session.uploadedChunks);
    setIncompleteSessions([]);

    syncManager.start(session.id, user.uid, {
      onStatusChange: setSyncStatus,
      onChunkUploaded: (_, uploaded) => {
        setChunksUploaded(uploaded);
      },
      onComplete: () => {
        console.log('Resume upload complete!');
      },
    });
  }, [user]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      setError('Please sign in to upload');
      return;
    }

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/mp4', 'audio/ogg', 'video/webm'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|m4a|mp4|ogg)$/i)) {
      setError('Please upload an audio file (MP3, WAV, M4A, WebM, or OGG)');
      return;
    }

    if (!isFirebaseConfigured) {
      setError('Firebase not configured');
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);

      await createLecture(user.uid, newSessionId, {
        status: 'uploading',
      });

      const storageRef = ref(storage, `users/${user.uid}/recordings/${newSessionId}/chunk_000000.webm`);

      setUploadProgress(50);
      await uploadBytes(storageRef, file);
      setUploadProgress(100);

      setChunksSaved(1);
      setChunksUploaded(1);
      setSyncStatus('idle');

      console.log('File uploaded successfully:', newSessionId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
        <GlassCard className="max-w-md text-center" padding="xl">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">Sign in required</h2>
          <p className="text-stone-600 mb-6">Please sign in to start recording lectures</p>
          <GlowButton href="/login" variant="primary">
            Sign In
          </GlowButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isRecording ? 'bg-rose-50/30' : 'bg-cream-50'}`}>
      {/* Minimal Header - Fades during recording */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        animate={{ opacity: isRecording ? 0.3 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.h1
            className="text-lg font-semibold text-stone-800"
            animate={{ opacity: isRecording ? 0.5 : 1 }}
          >
            {isRecording ? '' : 'New Recording'}
          </motion.h1>
          {processedSessionId && (
            <GlowButton
              onClick={() => router.push(`/lecture/${processedSessionId}`)}
              variant="primary"
              size="sm"
            >
              View Notes
            </GlowButton>
          )}
        </div>
      </motion.header>

      {/* Main Content - Centered */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        {/* Incomplete Sessions Warning */}
        <AnimatePresence>
          {incompleteSessions.length > 0 && recorderState === 'inactive' && !sessionId && (
            <motion.div
              className="mb-8 w-full max-w-md"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: EASING.smooth }}
            >
              <GlassCard className="border-amber-200 bg-amber-50/50" padding="md">
                <h2 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Incomplete Sessions
                </h2>
                {incompleteSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between py-2 border-t border-amber-200/50">
                    <span className="text-sm text-amber-700">
                      {session.totalChunks} chunks ({session.uploadedChunks} uploaded)
                    </span>
                    <button
                      onClick={() => handleResumeSession(session)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Resume
                    </button>
                  </div>
                ))}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 w-full max-w-md"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="border-rose-200 bg-rose-50/50" padding="md">
                <p className="text-rose-600 text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recording Status */}
        <RecordingStatus
          state={recorderState}
          syncStatus={syncStatus}
          duration={duration}
          chunksSaved={chunksSaved}
          chunksUploaded={chunksUploaded}
        />

        {/* Record Button */}
        <div className="mt-12">
          <RecordButton
            state={recorderState}
            onStart={handleStart}
            onStop={handleStop}
            onPause={handlePause}
            onResume={handleResume}
          />
        </div>

        {/* Process Button */}
        <AnimatePresence>
          {sessionId && recorderState === 'inactive' && chunksSaved > 0 && chunksUploaded === chunksSaved && (
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: EASING.smooth }}
            >
              {!processedSessionId ? (
                <GlowButton
                  onClick={handleProcess}
                  disabled={processing}
                  variant="primary"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <motion.svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </motion.svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Generate Notes
                    </>
                  )}
                </GlowButton>
              ) : (
                <motion.div
                  className="flex items-center gap-2 text-teal-600 font-semibold"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Notes generated successfully!
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions - Subtle */}
        <AnimatePresence>
          {recorderState === 'inactive' && !sessionId && (
            <motion.p
              className="mt-8 max-w-sm text-center text-sm text-stone-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              Audio is saved locally every 5 seconds and uploaded to cloud in real-time.
              Your recording is safe even if this tab closes.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Upload Option */}
        <AnimatePresence>
          {recorderState === 'inactive' && !sessionId && (
            <motion.div
              className="mt-12 w-full max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.4, ease: EASING.smooth }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-cream-50 text-xs text-stone-400">
                    or upload an existing recording
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <motion.label
                  htmlFor="audio-upload"
                  className={`
                    inline-flex items-center gap-2 px-5 py-3
                    text-sm text-stone-500 hover:text-stone-700
                    border-2 border-dashed border-stone-200 hover:border-stone-400
                    rounded-xl cursor-pointer transition-all
                    ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  whileHover={uploading ? {} : { scale: 1.02 }}
                  whileTap={uploading ? {} : { scale: 0.98 }}
                >
                  {uploading ? (
                    <>
                      <motion.svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </motion.svg>
                      Uploading {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Audio File
                    </>
                  )}
                </motion.label>
                <p className="mt-2 text-xs text-stone-400">MP3, WAV, M4A, WebM supported</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session ID - Very subtle */}
        {sessionId && (
          <motion.p
            className="mt-8 text-xs text-stone-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Session: {sessionId.slice(0, 8)}...
          </motion.p>
        )}
      </main>
    </div>
  );
}
