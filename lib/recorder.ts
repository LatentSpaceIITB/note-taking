import { v4 as uuidv4 } from 'uuid';
import { saveChunk, createSession, updateSession, type AudioChunk, type RecordingSession } from './indexeddb';

export type RecorderState = 'inactive' | 'recording' | 'paused';

export interface RecorderCallbacks {
  onChunkSaved?: (chunk: AudioChunk) => void;
  onStateChange?: (state: RecorderState) => void;
  onError?: (error: Error) => void;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private sessionId: string | null = null;
  private chunkIndex = 0;
  private callbacks: RecorderCallbacks = {};

  // 5-second chunks
  private readonly TIMESLICE_MS = 5000;

  async start(callbacks: RecorderCallbacks = {}): Promise<string> {
    this.callbacks = callbacks;

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Generate session ID
      this.sessionId = uuidv4();
      this.chunkIndex = 0;

      // Create session record
      const session: RecordingSession = {
        id: this.sessionId,
        startedAt: Date.now(),
        status: 'recording',
        totalChunks: 0,
        uploadedChunks: 0,
      };
      await createSession(session);

      // Determine best codec
      const mimeType = this.getSupportedMimeType();

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

      // Handle data available event
      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await this.handleChunk(event.data);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        this.callbacks.onError?.(new Error('MediaRecorder error'));
        console.error('MediaRecorder error:', event);
      };

      this.mediaRecorder.onstart = () => {
        this.callbacks.onStateChange?.('recording');
      };

      this.mediaRecorder.onstop = () => {
        this.callbacks.onStateChange?.('inactive');
      };

      this.mediaRecorder.onpause = () => {
        this.callbacks.onStateChange?.('paused');
      };

      this.mediaRecorder.onresume = () => {
        this.callbacks.onStateChange?.('recording');
      };

      // Start recording with timeslice
      this.mediaRecorder.start(this.TIMESLICE_MS);

      return this.sessionId;
    } catch (error) {
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  private async handleChunk(blob: Blob): Promise<void> {
    if (!this.sessionId) return;

    const chunk: AudioChunk = {
      id: `${this.sessionId}_chunk_${String(this.chunkIndex).padStart(6, '0')}`,
      sessionId: this.sessionId,
      chunkIndex: this.chunkIndex,
      blob,
      createdAt: Date.now(),
      uploaded: false,
    };

    // Save to IndexedDB immediately
    await saveChunk(chunk);

    // Update session total chunks
    await updateSession(this.sessionId, {
      totalChunks: this.chunkIndex + 1,
    });

    this.chunkIndex++;

    // Notify callback
    this.callbacks.onChunkSaved?.(chunk);
  }

  pause(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resume(): void {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  async stop(): Promise<string | null> {
    if (!this.mediaRecorder || !this.sessionId) return null;

    return new Promise((resolve) => {
      const sessionId = this.sessionId;

      this.mediaRecorder!.onstop = async () => {
        // Clean up stream
        this.stream?.getTracks().forEach((track) => track.stop());

        // Update session status
        await updateSession(sessionId!, {
          endedAt: Date.now(),
          status: 'uploading',
        });

        this.callbacks.onStateChange?.('inactive');
        this.cleanup();
        resolve(sessionId);
      };

      this.mediaRecorder!.stop();
    });
  }

  private cleanup(): void {
    this.mediaRecorder = null;
    this.stream = null;
    this.sessionId = null;
    this.chunkIndex = 0;
  }

  getState(): RecorderState {
    return (this.mediaRecorder?.state as RecorderState) || 'inactive';
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  getChunkCount(): number {
    return this.chunkIndex;
  }
}

// Singleton instance
export const recorder = new AudioRecorder();
