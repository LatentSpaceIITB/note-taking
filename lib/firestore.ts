import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';

export type LectureStatus = 'uploading' | 'transcribing' | 'cleaning' | 'completed' | 'failed';

export interface Lecture {
  sessionId: string;
  status: LectureStatus;
  totalChunks: number;
  transcribedChunks: number;
  transcriptRaw?: string;
  transcriptClean?: string;
  notes?: string;
  topicAnalysis?: string;
  duration?: number; // in seconds
  error?: string;
  folderId?: string | null;
  title?: string;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  failedAt?: Timestamp;
}

export interface ChunkTranscription {
  chunkIndex: number;
  rawText: string;
  timestamp: number; // Start time in seconds
  createdAt: Timestamp;
}

/**
 * Get all lectures for a user, ordered by most recent first
 */
export async function getLectures(userId: string): Promise<Lecture[]> {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured, returning empty lectures');
    return [];
  }

  const lecturesRef = collection(db, 'users', userId, 'lectures');
  const q = query(lecturesRef, orderBy('startedAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    sessionId: doc.id,
    ...doc.data(),
  } as Lecture));
}

/**
 * Get a single lecture by sessionId for a user
 */
export async function getLecture(userId: string, sessionId: string): Promise<Lecture | null> {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured');
    return null;
  }

  const lectureRef = doc(db, 'users', userId, 'lectures', sessionId);
  const snapshot = await getDoc(lectureRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    sessionId: snapshot.id,
    ...snapshot.data(),
  } as Lecture;
}

/**
 * Create a new lecture for a user
 */
export async function createLecture(
  userId: string,
  sessionId: string,
  data: Partial<Lecture>
): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase not configured');
  }

  const lectureRef = doc(db, 'users', userId, 'lectures', sessionId);
  await setDoc(lectureRef, {
    sessionId,
    status: 'uploading',
    totalChunks: 0,
    transcribedChunks: 0,
    startedAt: serverTimestamp(),
    ...data,
  });
}

/**
 * Update a lecture
 */
export async function updateLecture(
  userId: string,
  sessionId: string,
  data: Partial<Lecture>
): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase not configured');
  }

  const lectureRef = doc(db, 'users', userId, 'lectures', sessionId);
  await updateDoc(lectureRef, data);
}

/**
 * Move a lecture to a folder
 */
export async function moveLectureToFolder(
  userId: string,
  sessionId: string,
  folderId: string | null
): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase not configured');
  }

  const lectureRef = doc(db, 'users', userId, 'lectures', sessionId);
  await updateDoc(lectureRef, { folderId });
}

/**
 * Get chunk transcriptions for a lecture
 */
export async function getChunkTranscriptions(userId: string, sessionId: string): Promise<ChunkTranscription[]> {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured');
    return [];
  }

  const chunksRef = collection(db, 'users', userId, 'lectures', sessionId, 'chunkTranscriptions');
  const q = query(chunksRef, orderBy('chunkIndex', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => doc.data() as ChunkTranscription);
}

/**
 * Subscribe to real-time updates for all lectures of a user
 */
export function subscribeLectures(
  userId: string,
  onLecturesChange: (lectures: Lecture[]) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured');
    return () => {};
  }

  const lecturesRef = collection(db, 'users', userId, 'lectures');
  const q = query(lecturesRef, orderBy('startedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const lectures = snapshot.docs.map(doc => ({
        sessionId: doc.id,
        ...doc.data(),
      } as Lecture));
      onLecturesChange(lectures);
    },
    (error) => {
      // Handle permission errors gracefully (can happen during auth token refresh)
      console.warn('Firestore subscription error:', error.code);
      if (error.code !== 'permission-denied') {
        console.error('Firestore error:', error);
      }
    }
  );
}

/**
 * Subscribe to real-time updates for a single lecture
 */
export function subscribeLecture(
  userId: string,
  sessionId: string,
  onLectureChange: (lecture: Lecture | null) => void
): Unsubscribe {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured');
    return () => {};
  }

  const lectureRef = doc(db, 'users', userId, 'lectures', sessionId);

  return onSnapshot(
    lectureRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onLectureChange(null);
        return;
      }
      onLectureChange({
        sessionId: snapshot.id,
        ...snapshot.data(),
      } as Lecture);
    },
    (error) => {
      console.warn('Firestore subscription error:', error.code);
      if (error.code !== 'permission-denied') {
        console.error('Firestore error:', error);
      }
    }
  );
}

/**
 * Format duration in seconds to human readable string
 */
export function formatDuration(seconds: number): string {
  if (!seconds) return '0:00';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Get status display info
 */
export function getStatusInfo(status: LectureStatus): { label: string; color: string; bgColor: string } {
  switch (status) {
    case 'uploading':
      return { label: 'Uploading', color: 'text-blue-400', bgColor: 'bg-blue-900/30' };
    case 'transcribing':
      return { label: 'Transcribing', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30' };
    case 'cleaning':
      return { label: 'Processing', color: 'text-purple-400', bgColor: 'bg-purple-900/30' };
    case 'completed':
      return { label: 'Ready', color: 'text-green-400', bgColor: 'bg-green-900/30' };
    case 'failed':
      return { label: 'Failed', color: 'text-red-400', bgColor: 'bg-red-900/30' };
    default:
      return { label: 'Unknown', color: 'text-gray-400', bgColor: 'bg-gray-900/30' };
  }
}

/**
 * Delete a lecture and all associated data
 */
export async function deleteLecture(userId: string, sessionId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    console.warn('Firebase not configured');
    return;
  }

  // 1. Delete all chunk transcriptions subcollection
  const chunksRef = collection(db, 'users', userId, 'lectures', sessionId, 'chunkTranscriptions');
  const chunksSnapshot = await getDocs(chunksRef);
  const chunkDeletePromises = chunksSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(chunkDeletePromises);

  // 2. Delete the lecture document
  const lectureRef = doc(db, 'users', userId, 'lectures', sessionId);
  await deleteDoc(lectureRef);

  // 3. Delete all audio chunks from Storage
  try {
    const storageRef = ref(storage, `users/${userId}/recordings/${sessionId}`);
    const listResult = await listAll(storageRef);
    const storageDeletePromises = listResult.items.map(item => deleteObject(item));
    await Promise.all(storageDeletePromises);
  } catch (error) {
    // Storage might not have files or folder might not exist
    console.warn('Storage cleanup warning:', error);
  }
}
