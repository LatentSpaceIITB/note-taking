'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  subscribeLectures,
  deleteLecture,
  formatDuration,
  getStatusInfo,
  type Lecture,
} from '@/lib/firestore';
import { useAuth } from '@/lib/AuthContext';
import { useDragDrop } from '@/lib/DragDropContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { FadeInView, StaggerContainer, StaggerItem } from '@/components/animations/FadeInView';
import { EASING } from '@/lib/animations';

function LectureCard({
  lecture,
  onDelete,
  userId,
}: {
  lecture: Lecture;
  onDelete: (id: string) => void;
  userId: string;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { setDraggedLecture, isDragging } = useDragDrop();
  const statusInfo = getStatusInfo(lecture.status);
  const date = lecture.startedAt?.toDate?.() || new Date();
  const canDrag = lecture.status === 'completed';

  let title = 'Untitled Recording';
  if (lecture.notes) {
    const titleMatch = lecture.notes.match(/^#\s*(.+)/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }

  const progress = lecture.totalChunks > 0
    ? Math.round((lecture.transcribedChunks / lecture.totalChunks) * 100)
    : 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      await deleteLecture(userId, lecture.sessionId);
      onDelete(lecture.sessionId);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusColors = () => {
    switch (lecture.status) {
      case 'completed':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'transcribing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cleaning':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not dragging and lecture is completed
    if (lecture.status === 'completed' && !isDragging) {
      router.push(`/lecture/${lecture.sessionId}`);
    }
  };

  return (
    <div className="relative">
      <motion.div
        className={`
          group relative p-6 rounded-2xl border transition-all duration-300
          ${lecture.status === 'completed'
            ? 'glass-card hover:shadow-lg cursor-pointer'
            : 'bg-cream-100/50 border-stone-200/50'
          }
          ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}
        `}
        drag={canDrag}
        dragSnapToOrigin
        dragElastic={0.1}
        onDragStart={() => canDrag && setDraggedLecture(lecture)}
        onDragEnd={() => setDraggedLecture(null)}
        onClick={handleCardClick}
        whileHover={lecture.status === 'completed' ? { y: -2 } : {}}
        whileDrag={{
          scale: 1.02,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 50,
          cursor: 'grabbing',
        }}
      >
          {/* Drag Handle - visible on hover for completed lectures */}
          {canDrag && (
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}

          {/* Status Badge and Delete Button */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColors()}`}>
              {statusInfo.label}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              title="Delete lecture"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <h3 className={`
            text-lg font-semibold mb-2 pr-28 line-clamp-1
            ${lecture.status === 'completed' ? 'text-stone-800 group-hover:text-teal-700' : 'text-stone-500'}
            transition-colors
          `}>
            {title}
          </h3>

          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-sm text-stone-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            {lecture.duration && (
              <>
                <span className="w-1 h-1 bg-stone-300 rounded-full" />
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDuration(lecture.duration)}
                </span>
              </>
            )}
          </div>

          {/* Progress Bar for processing lectures */}
          {(lecture.status === 'transcribing' || lecture.status === 'cleaning') && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-stone-500 mb-2">
                <span>
                  {lecture.status === 'transcribing'
                    ? `Transcribing chunk ${lecture.transcribedChunks}/${lecture.totalChunks}`
                    : 'Generating notes...'
                  }
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className={`h-1.5 rounded-full ${
                    lecture.status === 'cleaning' ? 'bg-purple-500' : 'bg-amber-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: lecture.status === 'cleaning' ? '100%' : `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Error message for failed */}
          {lecture.status === 'failed' && lecture.error && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">
              {lecture.error}
            </div>
          )}

          {/* Preview for completed */}
          {lecture.status === 'completed' && lecture.transcriptClean && (
            <p className="mt-3 text-sm text-stone-500 line-clamp-2 leading-relaxed">
              {lecture.transcriptClean.slice(0, 200)}...
            </p>
          )}
        </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              className="bg-cream-50 border border-stone-200 rounded-2xl p-6 max-w-sm mx-4 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-2 text-center">Delete Lecture?</h3>
              <p className="text-stone-600 text-sm mb-6 text-center">
                This will permanently delete the recording, transcript, and notes. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-sm text-stone-600 hover:text-stone-800 border border-stone-200 rounded-xl transition-colors"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  return (
    <FadeInView className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 mb-6 rounded-2xl bg-teal-50 flex items-center justify-center">
        <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-stone-800 mb-2">No recordings yet</h3>
      <p className="text-stone-600 mb-8 max-w-sm">
        Start your first lecture recording and we&apos;ll automatically generate notes.
      </p>
      <GlowButton href="/record" variant="primary" size="lg">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        Start Recording
      </GlowButton>
    </FadeInView>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeLectures(user.uid, (updatedLectures) => {
      setLectures(updatedLectures);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <FadeInView>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-stone-800 mb-1">Your Lectures</h1>
              <p className="text-stone-500">
                {lectures.length} {lectures.length === 1 ? 'lecture' : 'lectures'} recorded
              </p>
            </div>
            <GlowButton href="/record" variant="primary" size="md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Recording
            </GlowButton>
          </div>
        </FadeInView>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="w-10 h-10 border-3 border-teal-200 border-t-teal-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : lectures.length === 0 ? (
          <EmptyState />
        ) : (
          <StaggerContainer className="grid gap-4">
            {lectures.map((lecture, index) => (
              <StaggerItem key={lecture.sessionId}>
                <LectureCard
                  lecture={lecture}
                  userId={user.uid}
                  onDelete={(id) => setLectures(prev => prev.filter(l => l.sessionId !== id))}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </main>
    </div>
  );
}
