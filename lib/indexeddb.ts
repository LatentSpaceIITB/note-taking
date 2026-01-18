import Dexie, { type EntityTable } from 'dexie';

export interface AudioChunk {
  id: string;           // "session_001_chunk_042"
  sessionId: string;
  chunkIndex: number;
  blob: Blob;
  createdAt: number;
  uploaded: boolean;
}

export interface RecordingSession {
  id: string;
  startedAt: number;
  endedAt?: number;
  status: 'recording' | 'uploading' | 'completed' | 'failed';
  totalChunks: number;
  uploadedChunks: number;
}

const db = new Dexie('LectureNotesDB') as Dexie & {
  chunks: EntityTable<AudioChunk, 'id'>;
  sessions: EntityTable<RecordingSession, 'id'>;
};

db.version(3).stores({
  chunks: 'id, sessionId, chunkIndex, uploaded',
  sessions: 'id, status',
});

export { db };

// Helper functions
export async function saveChunk(chunk: AudioChunk): Promise<void> {
  await db.chunks.put(chunk);
}

export async function getUnuploadedChunks(sessionId: string): Promise<AudioChunk[]> {
  // Get all chunks for session and filter unuploaded
  const chunks = await db.chunks
    .where('sessionId')
    .equals(sessionId)
    .toArray();

  return chunks
    .filter(c => !c.uploaded)
    .sort((a, b) => a.chunkIndex - b.chunkIndex);
}

export async function markChunkUploaded(chunkId: string): Promise<void> {
  await db.chunks.update(chunkId, { uploaded: true });
}

export async function getSession(sessionId: string): Promise<RecordingSession | undefined> {
  return db.sessions.get(sessionId);
}

export async function createSession(session: RecordingSession): Promise<void> {
  await db.sessions.put(session);
}

export async function updateSession(sessionId: string, updates: Partial<RecordingSession>): Promise<void> {
  if (!sessionId || !updates) {
    console.warn('updateSession called with invalid params:', { sessionId, updates });
    return;
  }

  // Ensure session exists before updating
  const existing = await db.sessions.get(sessionId);
  if (!existing) {
    console.warn('Session not found, creating with updates:', sessionId);
    await db.sessions.put({
      id: sessionId,
      startedAt: Date.now(),
      status: 'recording',
      totalChunks: 0,
      uploadedChunks: 0,
      ...updates
    } as RecordingSession);
    return;
  }

  await db.sessions.update(sessionId, updates);
}

export async function getIncompleteSessions(): Promise<RecordingSession[]> {
  return db.sessions
    .where('status')
    .anyOf(['recording', 'uploading'])
    .toArray();
}

export async function getChunksForSession(sessionId: string): Promise<AudioChunk[]> {
  return db.chunks
    .where({ sessionId })
    .sortBy('chunkIndex');
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.chunks.where({ sessionId }).delete();
  await db.sessions.delete(sessionId);
}
