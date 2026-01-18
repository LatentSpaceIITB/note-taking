This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.




Lecture Notes SaaS - High Level Design

  ┌─────────────────────────────────────────────────────────────────────────────────────────┐
  │                                      BROWSER                                             │
  │  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌────────────────┐  │
  │  │  MediaRecorder │───▶│   IndexedDB    │───▶│  SyncManager   │───▶│   UI State     │  │
  │  │  (5s chunks)   │    │  (crash safe)  │    │ (upload queue) │    │   (React)      │  │
  │  └────────────────┘    └────────────────┘    └────────────────┘    └────────────────┘  │
  │         │                                            │                     ▲            │
  │         │ audio/webm;codecs=opus                     │ multipart upload    │ real-time  │
  │         ▼                                            ▼                     │ updates    │
  └─────────────────────────────────────────────────────────────────────────────────────────┘
                                                         │
                                                         │ HTTPS
                                                         ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────────┐
  │                                  FIREBASE PLATFORM                                       │
  │                                                                                          │
  │  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐                │
  │  │   Firebase Auth  │     │  Firebase Storage │     │    Firestore     │                │
  │  │   (Google SSO)   │     │                  │     │                  │                │
  │  │                  │     │  /recordings/    │     │  /lectures/      │                │
  │  │   • User mgmt    │     │    {sessionId}/  │     │    {sessionId}   │                │
  │  │   • JWT tokens   │     │      chunk_00.webm│    │      • status    │                │
  │  │                  │     │      chunk_01.webm│    │      • transcript│                │
  │  │  [Future Phase]  │     │      ...         │     │      • notes     │                │
  │  └──────────────────┘     └────────┬─────────┘     └────────▲─────────┘                │
  │                                    │                        │                           │
  │                                    │ Storage Trigger        │ Write results             │
  │                                    ▼                        │                           │
  │  ┌──────────────────────────────────────────────────────────┴──────────────────────┐   │
  │  │                         CLOUD FUNCTIONS (2nd Gen)                                │   │
  │  │                         Node.js 20 | 2GB RAM | 9min timeout                      │   │
  │  │                                                                                  │   │
  │  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │   │
  │  │   │  Download   │───▶│   FFmpeg    │───▶│   Whisper   │───▶│  GPT-4o     │     │   │
  │  │   │   Chunks    │    │   Merge     │    │ Transcribe  │    │   Clean     │     │   │
  │  │   └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘     │   │
  │  │                                                                    │            │   │
  │  │                                                                    ▼            │   │
  │  │                                                           ┌─────────────┐       │   │
  │  │                                                           │  GPT-4o     │       │   │
  │  │                                                           │  Generate   │       │   │
  │  │                                                           │   Notes     │       │   │
  │  │                                                           └─────────────┘       │   │
  │  └──────────────────────────────────────────────────────────────────────────────────┘   │
  │                                                                                          │
  └─────────────────────────────────────────────────────────────────────────────────────────┘
                                                         │
                                                         │ API Calls
                                                         ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────────┐
  │                                   OPENAI API                                             │
  │                                                                                          │
  │  ┌──────────────────────────────────┐    ┌──────────────────────────────────┐          │
  │  │         Whisper API              │    │           GPT-4o API             │          │
  │  │                                  │    │                                  │          │
  │  │  • Speech-to-text                │    │  • Topic detection               │          │
  │  │  • 25MB file limit               │    │  • Transcript cleaning           │          │
  │  │  • ~$0.36/hour audio             │    │  • Structured notes generation   │          │
  │  │                                  │    │  • Summary creation              │          │
  │  └──────────────────────────────────┘    └──────────────────────────────────┘          │
  │                                                                                          │
  └─────────────────────────────────────────────────────────────────────────────────────────┘


  ┌─────────────────────────────────────────────────────────────────────────────────────────┐
  │                                   HOSTING                                                │
  │                                                                                          │
  │  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
  │  │                              VERCEL                                               │  │
  │  │                                                                                   │  │
  │  │  Next.js 14 (App Router) + React 19 + TailwindCSS                                │  │
  │  │                                                                                   │  │
  │  │  Routes:                                                                          │  │
  │  │    /              → Landing page                                                  │  │
  │  │    /record        → Recording interface                                           │  │
  │  │    /dashboard     → Lecture list (real-time)                                      │  │
  │  │    /lecture/[id]  → Transcript + Notes view                                       │  │
  │  │                                                                                   │  │
  │  └──────────────────────────────────────────────────────────────────────────────────┘  │
  │                                                                                          │
  └─────────────────────────────────────────────────────────────────────────────────────────┘

  Data Flow

  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │  Record  │────▶│  Store   │────▶│  Upload  │────▶│ Process  │────▶│  Display │
  │  Audio   │     │ IndexedDB│     │ Firebase │     │   AI     │     │  Notes   │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
      5s              crash           parallel        sequential        real-time
     chunks           safe            chunks          pipeline          updates

  Processing Pipeline

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                        AUDIO PROCESSING PIPELINE                             │
  │                                                                              │
  │  1. DOWNLOAD         2. MERGE           3. TRANSCRIBE      4. ENHANCE       │
  │  ┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐      │
  │  │ chunk_0 │──┐     │         │        │         │        │ Topic   │      │
  │  │ chunk_1 │──┼────▶│ FFmpeg  │───────▶│ Whisper │───────▶│ Detect  │      │
  │  │ chunk_2 │──┤     │ concat  │        │  API    │        │         │      │
  │  │   ...   │──┘     │         │        │         │        └────┬────┘      │
  │  └─────────┘        └─────────┘        └─────────┘             │           │
  │                                                                 ▼           │
  │  5. OUTPUT          6. SUMMARIZE       5. STRUCTURE       4. CLEAN         │
  │  ┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐      │
  │  │ Final   │◀───────│ Summary │◀───────│ Generate│◀───────│ Fix     │      │
  │  │ Notes   │        │ Points  │        │  Notes  │        │ Errors  │      │
  │  └─────────┘        └─────────┘        └─────────┘        └─────────┘      │
  │                                                                              │
  └─────────────────────────────────────────────────────────────────────────────┘

  Cost Model (per lecture hour)

  ┌────────────────────┬──────────┐
  │ Service            │ Cost     │
  ├────────────────────┼──────────┤
  │ Whisper API        │ $0.36    │
  │ GPT-4o (clean)     │ ~$0.40   │
  │ GPT-4o (notes)     │ ~$0.40   │
  │ Firebase Storage   │ ~$0.01   │
  │ Cloud Functions    │ ~$0.05   │
  ├────────────────────┼──────────┤
  │ TOTAL              │ ~$1.22   │
  └────────────────────┴──────────┘

✻ Churned for 46s