import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { spawn } from 'child_process';

admin.initializeApp();

const storage = admin.storage();
const firestore = admin.firestore();

// Initialize OpenAI client
function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set');
  }
  return new OpenAI({ apiKey });
}

interface ProcessingResult {
  sessionId: string;
  transcriptRaw: string;
  transcriptClean: string;
  notes: string;
  totalChunks: number;
  duration: number;
}

/**
 * Merge webm chunks by binary concatenation and convert for Whisper
 * MediaRecorder timeslice chunks form a continuous WebM stream:
 * - First chunk has EBML header + initialization segment
 * - Subsequent chunks are cluster data only
 */
async function mergeChunks(chunkPaths: string[], outputPath: string): Promise<void> {
  const tempDir = path.dirname(outputPath);
  const concatenatedPath = path.join(tempDir, 'concat_temp.webm');
  const fixedPath = path.join(tempDir, 'fixed_temp.webm');

  console.log(`Binary concatenating ${chunkPaths.length} chunks...`);

  // Concatenate all chunks - this creates a valid WebM stream
  const writeStream = fs.createWriteStream(concatenatedPath);
  for (let i = 0; i < chunkPaths.length; i++) {
    const data = fs.readFileSync(chunkPaths[i]);
    writeStream.write(data);
    if (i === 0 || i === chunkPaths.length - 1) {
      console.log(`  Chunk ${i}: ${data.length} bytes`);
    }
  }
  writeStream.end();

  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  const concatSize = fs.statSync(concatenatedPath).size;
  console.log(`Concatenated WebM: ${concatSize} bytes`);

  // Step 1: Re-mux to fix any container issues (stream copy, no re-encode)
  await new Promise<void>((resolve, reject) => {
    console.log('Re-muxing WebM to fix container...');

    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-fflags', '+genpts+igndts',  // Generate PTS, ignore DTS issues
      '-err_detect', 'ignore_err',   // Ignore errors
      '-i', concatenatedPath,
      '-c', 'copy',                  // Stream copy (no re-encode)
      '-f', 'matroska',              // Force matroska format
      fixedPath
    ]);

    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      // Log duration info from FFmpeg
      const durationMatch = stderr.match(/Duration: (\d+:\d+:\d+\.\d+)/);
      if (durationMatch) {
        console.log(`  Detected duration: ${durationMatch[1]}`);
      }
      const timeMatch = stderr.match(/time=(\d+:\d+:\d+\.\d+)/g);
      if (timeMatch && timeMatch.length > 0) {
        console.log(`  Processed time: ${timeMatch[timeMatch.length - 1]}`);
      }

      if (code === 0) {
        const stats = fs.statSync(fixedPath);
        console.log(`  Re-muxed file: ${stats.size} bytes`);
        resolve();
      } else {
        // Try to continue even if re-mux fails
        console.warn('Re-mux warning (continuing):', stderr.slice(-300));
        try {
          fs.copyFileSync(concatenatedPath, fixedPath);
          resolve();
        } catch (e) {
          reject(new Error(`FFmpeg re-mux failed: ${stderr.slice(-300)}`));
        }
      }
    });

    ffmpeg.on('error', reject);
  });

  // Clean up concatenated file
  try { fs.unlinkSync(concatenatedPath); } catch (e) { /* ignore */ }

  // Step 2: Convert to MP3 for Whisper
  return new Promise((resolve, reject) => {
    console.log('Converting to MP3 for Whisper...');

    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-i', fixedPath,
      '-vn',                    // No video
      '-acodec', 'libmp3lame',  // MP3 codec
      '-ar', '16000',           // 16kHz sample rate (optimal for Whisper)
      '-ac', '1',               // Mono
      '-b:a', '128k',           // Higher bitrate for better quality
      outputPath
    ]);

    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      // Clean up fixed file
      try { fs.unlinkSync(fixedPath); } catch (e) { /* ignore */ }

      // Log conversion info
      const timeMatch = stderr.match(/time=(\d+:\d+:\d+\.\d+)/g);
      if (timeMatch && timeMatch.length > 0) {
        console.log(`  Converted time: ${timeMatch[timeMatch.length - 1]}`);
      }

      if (code === 0) {
        const stats = fs.statSync(outputPath);
        console.log(`MP3 conversion complete: ${stats.size} bytes`);
        resolve();
      } else {
        console.error('FFmpeg MP3 conversion stderr:', stderr.slice(-500));
        reject(new Error(`FFmpeg failed with code ${code}: ${stderr.slice(-500)}`));
      }
    });

    ffmpeg.on('error', reject);
  });
}

/**
 * Convert a single audio file to MP3 for Whisper
 */
async function convertAudioFile(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Converting audio file to MP3...');

    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-i', inputPath,
      '-vn',
      '-acodec', 'libmp3lame',
      '-ar', '16000',
      '-ac', '1',
      '-b:a', '64k',
      outputPath
    ]);

    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        const stats = fs.statSync(outputPath);
        console.log(`Audio conversion complete: ${stats.size} bytes`);
        resolve();
      } else {
        console.error('FFmpeg error:', stderr);
        reject(new Error(`FFmpeg conversion failed: ${stderr.slice(-300)}`));
      }
    });

    ffmpeg.on('error', reject);
  });
}

/**
 * Split large audio file and transcribe in segments
 */
async function transcribeLargeFile(
  openai: OpenAI,
  audioPath: string,
  tempDir: string
): Promise<string> {
  const SEGMENT_DURATION = 600; // 10 minutes per segment

  // Split using FFmpeg - output as MP3 segments
  const segmentPattern = path.join(tempDir, 'segment_%03d.mp3');

  await new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-i', audioPath,
      '-f', 'segment',
      '-segment_time', String(SEGMENT_DURATION),
      '-acodec', 'libmp3lame',
      '-ar', '16000',
      '-ac', '1',
      segmentPattern
    ]);

    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg split failed: ${stderr.slice(-300)}`));
      }
    });

    ffmpeg.on('error', reject);
  });

  // Find all segment files
  const segmentFiles = fs.readdirSync(tempDir)
    .filter(f => f.startsWith('segment_') && f.endsWith('.mp3'))
    .sort()
    .map(f => path.join(tempDir, f));

  console.log(`Split into ${segmentFiles.length} segments`);

  // Transcribe each segment
  const transcriptions: string[] = [];
  for (let i = 0; i < segmentFiles.length; i++) {
    const segmentPath = segmentFiles[i];
    console.log(`Transcribing segment ${i + 1}/${segmentFiles.length}...`);

    try {
      const audioFile = fs.createReadStream(segmentPath);
      const transcript = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: audioFile,
        response_format: 'text',
      });
      transcriptions.push(transcript);
    } catch (error) {
      console.error(`Error transcribing segment ${i}:`, error);
      // Continue with other segments
    }

    // Clean up segment file
    try {
      fs.unlinkSync(segmentPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }

  return transcriptions.join(' ');
}

/**
 * Process a recording session:
 * 1. Download all chunks from Storage
 * 2. Merge chunks with FFmpeg
 * 3. Transcribe merged audio with Whisper
 * 4. Clean transcript with GPT
 * 5. Generate notes with GPT
 * 6. Save results to Firestore
 */
export const processRecording = functions.https.onRequest(
  {
    timeoutSeconds: 1800, // 30 minutes for long recordings
    memory: '4GiB',
    cpu: 2,
    secrets: ['OPENAI_API_KEY'],
  },
  async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    const { sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      res.status(400).json({ error: 'sessionId and userId required' });
      return;
    }

    console.log(`Processing session: ${sessionId} for user: ${userId}`);
    const tempDir = path.join(os.tmpdir(), sessionId);

    try {
      // Create temp directory
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Update status to processing - use user-scoped path
      const lectureRef = firestore
        .collection('users').doc(userId)
        .collection('lectures').doc(sessionId);

      await lectureRef.set({
        sessionId,
        status: 'processing',
        startedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      // Step 1: List all chunks for this session - use user-scoped path
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({
        prefix: `users/${userId}/recordings/${sessionId}/`,
      });

      const chunkFiles = files
        .filter(f => f.name.includes('chunk_'))
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(`Found ${chunkFiles.length} chunks`);

      if (chunkFiles.length === 0) {
        throw new Error('No chunks found for session');
      }

      // Update total chunks count
      await lectureRef.update({
        totalChunks: chunkFiles.length,
      });

      // Step 2: Download all chunks
      const chunkPaths: string[] = [];
      for (let i = 0; i < chunkFiles.length; i++) {
        const file = chunkFiles[i];
        const localPath = path.join(tempDir, `chunk_${String(i).padStart(6, '0')}.webm`);

        console.log(`Downloading chunk ${i + 1}/${chunkFiles.length}: ${file.name}`);
        const [buffer] = await file.download();
        fs.writeFileSync(localPath, buffer);
        chunkPaths.push(localPath);
        console.log(`  Size: ${buffer.length} bytes`);
      }

      // Step 3: Merge chunks with FFmpeg (or use directly if single file upload)
      let mergedPath: string;

      if (chunkFiles.length === 1 && !chunkFiles[0].name.includes('chunk_')) {
        // Single uploaded file - convert to MP3 for consistency
        mergedPath = path.join(tempDir, 'merged.mp3');
        await convertAudioFile(chunkPaths[0], mergedPath);
        console.log('Single file upload detected, converted to MP3');
      } else if (chunkFiles.length === 1) {
        // Single chunk - convert to MP3
        mergedPath = path.join(tempDir, 'merged.mp3');
        await convertAudioFile(chunkPaths[0], mergedPath);
      } else {
        // Multiple chunks - merge and convert to MP3
        mergedPath = path.join(tempDir, 'merged.mp3');
        await mergeChunks(chunkPaths, mergedPath);
      }

      const mergedStats = fs.statSync(mergedPath);
      console.log(`Processed file size: ${mergedStats.size} bytes`);

      // Step 4: Transcribe merged audio with Whisper
      console.log('Transcribing merged audio...');
      const openai = getOpenAI();

      // Update status
      await lectureRef.update({
        status: 'transcribing',
      });

      // Check file size - Whisper has 25MB limit
      const WHISPER_LIMIT = 24 * 1024 * 1024; // 24MB to be safe
      let rawTranscript: string;

      if (mergedStats.size > WHISPER_LIMIT) {
        // Split into 10-minute segments for transcription
        console.log(`File too large (${mergedStats.size} bytes), splitting for transcription...`);
        rawTranscript = await transcribeLargeFile(openai, mergedPath, tempDir);
      } else {
        const audioFile = fs.createReadStream(mergedPath);
        rawTranscript = await openai.audio.transcriptions.create({
          model: 'whisper-1',
          file: audioFile,
          response_format: 'text',
        });
      }

      console.log(`Raw transcript length: ${rawTranscript.length} chars`);

      // Step 5: Detect topic and clean transcript
      await lectureRef.update({
        status: 'cleaning',
        transcriptRaw: rawTranscript,
      });

      console.log('Detecting topic...');
      const topicAnalysis = await detectTopic(openai, rawTranscript);
      console.log('Topic:', topicAnalysis);

      console.log('Cleaning transcript...');
      const cleanedTranscript = await cleanTranscriptText(openai, rawTranscript, topicAnalysis);
      console.log(`Clean transcript length: ${cleanedTranscript.length} chars`);

      // Step 6: Generate notes
      console.log('Generating notes...');
      const notes = await generateNotes(openai, cleanedTranscript, topicAnalysis);
      console.log(`Notes length: ${notes.length} chars`);

      // Step 7: Save results to Firestore
      const result: ProcessingResult = {
        sessionId,
        transcriptRaw: rawTranscript,
        transcriptClean: cleanedTranscript,
        notes,
        totalChunks: chunkFiles.length,
        duration: chunkFiles.length * 5, // 5 seconds per chunk
      };

      await lectureRef.set({
        ...result,
        topicAnalysis,
        status: 'completed',
        completedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log(`Processing complete for session: ${sessionId}`);

      // Cleanup temp files
      fs.rmSync(tempDir, { recursive: true, force: true });

      res.json({ success: true, sessionId, status: 'completed' });
    } catch (error) {
      console.error('Processing error:', error);

      // Cleanup temp files on error
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }

      await firestore
        .collection('users').doc(userId)
        .collection('lectures').doc(sessionId)
        .set({
          status: 'failed',
          error: (error as Error).message,
          failedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * Detect topic from transcript sample
 */
async function detectTopic(openai: OpenAI, transcript: string): Promise<string> {
  const sample = transcript.slice(0, 3000);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Analyze this transcript and identify:
1. Subject area (e.g., physics, chemistry, history)
2. Specific topics covered (3-5 main topics)
3. Key technical terms that might be mistranscribed
4. Context type (university lecture, interview, etc.)

Respond in this format:
SUBJECT: [subject]
TOPICS: [comma-separated]
KEY_TERMS: [comma-separated]
CONTEXT: [context type]`,
      },
      { role: 'user', content: `Analyze:\n\n${sample}` },
    ],
    temperature: 0.2,
  });

  return response.choices[0].message.content || '';
}

/**
 * Clean transcript using topic context
 */
async function cleanTranscriptText(
  openai: OpenAI,
  transcript: string,
  topicAnalysis: string
): Promise<string> {
  const systemPrompt = `You are cleaning up an audio transcript. Context:

${topicAnalysis}

Tasks:
1. Fix transcription errors, especially technical terms
2. Remove gibberish/garbled text
3. Improve punctuation and sentence structure
4. Keep conversational style
5. Preserve original meaning

Output ONLY the cleaned transcript.`;

  // Process in chunks if needed
  const maxChunkSize = 6000;
  const chunks: string[] = [];

  for (let i = 0; i < transcript.length; i += maxChunkSize) {
    chunks.push(transcript.slice(i, i + maxChunkSize));
  }

  const cleanedChunks: string[] = [];

  for (const chunk of chunks) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Clean:\n\n${chunk}` },
      ],
      temperature: 0.3,
    });

    cleanedChunks.push(response.choices[0].message.content || '');
  }

  return cleanedChunks.join('\n\n');
}

/**
 * Generate structured notes from cleaned transcript
 */
async function generateNotes(
  openai: OpenAI,
  transcript: string,
  _topicAnalysis: string
): Promise<string> {
  // First, analyze structure
  const structureResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Analyze this lecture transcript and identify:
1. Overall subject and suggested lecture title
2. Main topics/sections in order
3. Key terminology introduced

Respond in this format:
TITLE: [suggested title]
SUBJECT: [subject]
TOPICS:
1. [topic 1]
2. [topic 2]
...
KEY_TERMS: [comma-separated]`,
      },
      { role: 'user', content: `Analyze:\n\n${transcript.slice(0, 5000)}` },
    ],
    temperature: 0.2,
  });

  const structure = structureResponse.choices[0].message.content || '';

  // Extract title
  let title = 'Lecture Notes';
  const titleMatch = structure.match(/TITLE:\s*(.+)/);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Generate notes
  const notesPrompt = `Create structured class notes from this lecture transcript.

Structure detected:
${structure}

Use this EXACT format for each section:

## [Topic Name]

### Key Concepts
- **Concept**: Clear explanation

### Definitions
- **Term**: Definition

### Formulas/Equations (if any)
- Equation with explanation

### Examples
- Examples from the lecture

### Student Q&A (if present)
- **Q**: Question
- **A**: Answer

Extract ALL important information. Use LaTeX for math. Output ONLY formatted notes.`;

  // Process in chunks
  const maxChunkSize = 6000;
  const chunks: string[] = [];

  for (let i = 0; i < transcript.length; i += maxChunkSize) {
    chunks.push(transcript.slice(i, i + maxChunkSize));
  }

  const notesChunks: string[] = [];

  for (const chunk of chunks) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: notesPrompt },
        { role: 'user', content: `Convert to notes:\n\n${chunk}` },
      ],
      temperature: 0.3,
    });

    notesChunks.push(response.choices[0].message.content || '');
  }

  // Generate summary
  const combinedNotes = notesChunks.join('\n\n');

  const summaryResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Based on these lecture notes, create a summary:

${combinedNotes.slice(0, 8000)}

Create a "## Summary" section with:
- 5-7 bullet points of main takeaways
- Key formulas to remember
- Important concepts

Output ONLY the summary section.`,
      },
      { role: 'user', content: 'Create summary.' },
    ],
    temperature: 0.3,
  });

  const summary = summaryResponse.choices[0].message.content || '';

  return `# ${title}\n\n${combinedNotes}\n\n${summary}`;
}
