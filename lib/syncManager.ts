import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';
import {
  getUnuploadedChunks,
  markChunkUploaded,
  updateSession,
  getSession,
  type AudioChunk,
} from './indexeddb';

export type SyncStatus = 'idle' | 'syncing' | 'paused' | 'error';

export interface SyncCallbacks {
  onStatusChange?: (status: SyncStatus) => void;
  onChunkUploaded?: (chunkId: string, uploadedCount: number, totalCount: number) => void;
  onError?: (error: Error, chunkId: string) => void;
  onComplete?: (sessionId: string) => void;
}

export class SyncManager {
  private running = false;
  private sessionId: string | null = null;
  private userId: string | null = null;
  private callbacks: SyncCallbacks = {};
  private retryDelays = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff

  async start(sessionId: string, userId: string, callbacks: SyncCallbacks = {}): Promise<void> {
    if (this.running) {
      console.warn('SyncManager already running');
      return;
    }

    this.sessionId = sessionId;
    this.userId = userId;
    this.callbacks = callbacks;
    this.running = true;

    this.callbacks.onStatusChange?.('syncing');

    await this.syncLoop();
  }

  private async syncLoop(): Promise<void> {
    console.log('[SyncManager] Starting sync loop for session:', this.sessionId);

    while (this.running && this.sessionId) {
      try {
        // Get next unuploaded chunk
        const pending = await getUnuploadedChunks(this.sessionId);
        console.log('[SyncManager] Pending chunks:', pending.length);

        if (pending.length === 0) {
          // No pending chunks, check if session is done
          const session = await getSession(this.sessionId);
          if (session?.status === 'uploading' && session.endedAt) {
            // Recording ended and all chunks uploaded
            await updateSession(this.sessionId, { status: 'completed' });
            this.callbacks.onComplete?.(this.sessionId);
            this.stop();
            return;
          }

          // Still recording, wait and check again
          await this.sleep(1000);
          continue;
        }

        // Upload the first pending chunk
        const chunk = pending[0];
        console.log('[SyncManager] Uploading chunk:', chunk.id, 'size:', chunk.blob.size);
        await this.uploadChunkWithRetry(chunk);
        console.log('[SyncManager] Chunk uploaded successfully:', chunk.id);

        // Mark as uploaded
        await markChunkUploaded(chunk.id);

        // Update session progress
        const session = await getSession(this.sessionId);
        if (session) {
          await updateSession(this.sessionId, {
            uploadedChunks: session.uploadedChunks + 1,
          });

          this.callbacks.onChunkUploaded?.(
            chunk.id,
            session.uploadedChunks + 1,
            session.totalChunks
          );
        }
      } catch (error) {
        console.error('Sync loop error:', error);
        this.callbacks.onStatusChange?.('error');
        // Wait before retrying
        await this.sleep(5000);
        this.callbacks.onStatusChange?.('syncing');
      }
    }
  }

  private async uploadChunkWithRetry(chunk: AudioChunk, attempt = 0): Promise<string> {
    try {
      return await this.uploadChunk(chunk);
    } catch (error) {
      if (attempt < this.retryDelays.length) {
        console.log(`Upload failed, retrying in ${this.retryDelays[attempt]}ms...`);
        this.callbacks.onError?.(error as Error, chunk.id);
        await this.sleep(this.retryDelays[attempt]);
        return this.uploadChunkWithRetry(chunk, attempt + 1);
      }
      throw error;
    }
  }

  private async uploadChunk(chunk: AudioChunk): Promise<string> {
    console.log('[SyncManager] uploadChunk called, isFirebaseConfigured:', isFirebaseConfigured);

    // If Firebase not configured, simulate upload
    if (!isFirebaseConfigured) {
      console.log(`[Simulated Upload] chunk_${chunk.chunkIndex} (${chunk.blob.size} bytes)`);
      await this.sleep(100); // Simulate network delay
      return `simulated://chunk_${chunk.chunkIndex}`;
    }

    // Determine file extension from blob type
    const ext = chunk.blob.type.includes('webm') ? 'webm' : 'ogg';

    // Use user-scoped storage path
    const storagePath = this.userId
      ? `users/${this.userId}/recordings/${chunk.sessionId}/chunk_${String(chunk.chunkIndex).padStart(6, '0')}.${ext}`
      : `recordings/${chunk.sessionId}/chunk_${String(chunk.chunkIndex).padStart(6, '0')}.${ext}`;

    console.log('[SyncManager] Uploading to Firebase:', storagePath);

    // Create storage reference
    const chunkRef = ref(storage, storagePath);

    // Upload
    await uploadBytes(chunkRef, chunk.blob, {
      contentType: chunk.blob.type,
    });

    // Get download URL (optional, for verification)
    const url = await getDownloadURL(chunkRef);
    return url;
  }

  stop(): void {
    this.running = false;
    this.sessionId = null;
    this.userId = null;
    this.callbacks.onStatusChange?.('idle');
  }

  pause(): void {
    this.running = false;
    this.callbacks.onStatusChange?.('paused');
  }

  isRunning(): boolean {
    return this.running;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const syncManager = new SyncManager();
