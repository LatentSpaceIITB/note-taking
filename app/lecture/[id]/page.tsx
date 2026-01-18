'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  subscribeLecture,
  formatDuration,
  getStatusInfo,
  type Lecture,
} from '@/lib/firestore';
import { useAuth } from '@/lib/AuthContext';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { FadeInView } from '@/components/animations/FadeInView';
import { EASING } from '@/lib/animations';

type Tab = 'notes' | 'transcript';

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all
        ${active
          ? 'text-stone-800'
          : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
        }
      `}
    >
      {children}
      {active && (
        <motion.div
          className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
          layoutId="activeTab"
          transition={{ duration: 0.2, ease: EASING.smooth }}
        />
      )}
    </button>
  );
}

function NotesView({ notes }: { notes: string }) {
  const formattedNotes = notes
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-stone-800 mt-6 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-stone-800 mt-8 mb-4 pb-2 border-b border-stone-200">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-stone-800 mb-6">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-stone-800">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-2">$1</li>')
    .replace(/\$\$(.+?)\$\$/g, '<div class="my-4 p-4 bg-teal-50 border border-teal-100 rounded-xl font-mono text-sm text-teal-800 overflow-x-auto">$1</div>')
    .replace(/\$(.+?)\$/g, '<code class="px-1.5 py-0.5 bg-teal-50 border border-teal-100 rounded text-teal-700 font-mono text-sm">$1</code>')
    .replace(/\n\n/g, '</p><p class="mb-4 text-stone-600 leading-relaxed">')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="list-disc mb-4 text-stone-600">$&</ul>');

  return (
    <FadeInView>
      <div className="prose max-w-none">
        <div
          className="text-stone-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${formattedNotes}</p>` }}
        />
      </div>
    </FadeInView>
  );
}

function TranscriptView({ transcript }: { transcript: string }) {
  const paragraphs = transcript.split(/\n\n+/).filter(p => p.trim());

  return (
    <FadeInView>
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-stone-600 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </FadeInView>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <motion.div
        className="w-10 h-10 border-3 border-teal-200 border-t-teal-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function NotFoundState() {
  return (
    <FadeInView className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 mb-6 rounded-2xl bg-stone-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">Lecture not found</h3>
      <p className="text-stone-500 mb-6">
        This lecture may have been deleted or doesn&apos;t exist.
      </p>
      <GlowButton href="/dashboard" variant="secondary">
        Back to Dashboard
      </GlowButton>
    </FadeInView>
  );
}

function ProcessingState({ lecture }: { lecture: Lecture }) {
  const progress = lecture.totalChunks > 0
    ? Math.round((lecture.transcribedChunks / lecture.totalChunks) * 100)
    : 0;

  return (
    <FadeInView className="flex flex-col items-center justify-center py-20 text-center">
      <div className={`w-20 h-20 mb-6 rounded-2xl flex items-center justify-center ${
        lecture.status === 'cleaning' ? 'bg-purple-100' : 'bg-amber-100'
      }`}>
        <motion.div
          className={`w-10 h-10 border-3 rounded-full ${
            lecture.status === 'cleaning'
              ? 'border-purple-200 border-t-purple-600'
              : 'border-amber-200 border-t-amber-600'
          }`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">
        {lecture.status === 'transcribing' ? 'Transcribing audio...' : 'Generating notes...'}
      </h3>
      <p className="text-stone-500 mb-8 max-w-sm">
        {lecture.status === 'transcribing'
          ? `Processing chunk ${lecture.transcribedChunks} of ${lecture.totalChunks}`
          : 'Cleaning transcript and creating structured notes'
        }
      </p>
      <div className="w-72">
        <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-2 rounded-full ${
              lecture.status === 'cleaning' ? 'bg-purple-500' : 'bg-amber-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: lecture.status === 'cleaning' ? '100%' : `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="mt-3 text-sm text-stone-400">{progress}% complete</p>
      </div>
    </FadeInView>
  );
}

export default function LecturePage() {
  const params = useParams();
  const sessionId = params.id as string;
  const { user } = useAuth();

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('notes');

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeLecture(user.uid, sessionId, (updatedLecture) => {
      setLecture(updatedLecture);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId, user]);

  let title = 'Lecture';
  if (lecture?.notes) {
    const titleMatch = lecture.notes.match(/^#\s*(.+)/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }

  const date = lecture?.startedAt?.toDate?.() || new Date();

  if (!user) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <GlassCard className="text-center" padding="xl">
          <p className="text-stone-600 mb-4">Please sign in to view lectures</p>
          <GlowButton href="/login" variant="primary">
            Sign In
          </GlowButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="sticky top-0 bg-cream-50/90 backdrop-blur-md border-b border-stone-200 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 text-stone-400 hover:text-stone-800 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-stone-800 truncate">{title}</h1>
              {lecture && (
                <div className="flex items-center gap-3 text-sm text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
              )}
            </div>
          </div>

          {/* Tabs */}
          {lecture?.status === 'completed' && (
            <div className="flex gap-1 p-1 bg-stone-100 rounded-xl w-fit">
              <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>
                Notes
              </TabButton>
              <TabButton active={activeTab === 'transcript'} onClick={() => setActiveTab('transcript')}>
                Transcript
              </TabButton>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <LoadingState />
        ) : !lecture ? (
          <NotFoundState />
        ) : lecture.status === 'failed' ? (
          <FadeInView className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 mb-6 rounded-2xl bg-rose-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">Processing failed</h3>
            <p className="text-stone-500 mb-6 max-w-sm">
              {lecture.error || 'An error occurred while processing this lecture.'}
            </p>
            <GlowButton href="/dashboard" variant="secondary">
              Back to Dashboard
            </GlowButton>
          </FadeInView>
        ) : lecture.status !== 'completed' ? (
          <ProcessingState lecture={lecture} />
        ) : (
          <GlassCard padding="xl" hover={false} className="bg-white/80">
            <AnimatePresence mode="wait">
              {activeTab === 'notes' && lecture.notes && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <NotesView notes={lecture.notes} />
                </motion.div>
              )}
              {activeTab === 'transcript' && lecture.transcriptClean && (
                <motion.div
                  key="transcript"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TranscriptView transcript={lecture.transcriptClean} />
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        )}
      </main>
    </div>
  );
}
