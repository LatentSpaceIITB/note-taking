"use client";

import { motion } from "framer-motion";
import {
  BentoCard,
  WaveformVisual,
  NotesVisual,
  FolderVisual,
  WhisperVisual,
} from "./BentoCard";
import { FadeInView } from "@/components/animations/FadeInView";
import { OrbBackground } from "./GradientOrb";

export function BentoGrid() {
  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden bg-stone-900">
      <OrbBackground variant="section" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <FadeInView className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-teal-500/20 text-teal-400 text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-stone-400">Everything you need to</span>
            <br />
            <span className="text-teal-400">capture knowledge</span>
          </h2>
          <p className="text-lg text-stone-400 max-w-2xl mx-auto">
            From recording to organized notes, we handle the heavy lifting so
            you can focus on learning.
          </p>
        </FadeInView>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* One-Click Recording - Large Featured Card */}
          <BentoCard
            title="One-Click Recording"
            description="Start capturing lectures instantly. Just hit record and focus on understanding. We'll handle the rest."
            colSpan={8}
            rowSpan={2}
            variant="featured"
            delay={0}
            icon={
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            }
            visual={<WaveformVisual />}
          />

          {/* Whisper Powered - Small Card */}
          <BentoCard
            title="Whisper Powered"
            description="Industry-leading transcription accuracy powered by OpenAI's Whisper model."
            colSpan={4}
            variant="default"
            delay={0.1}
            icon={
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            }
          />

          {/* Smart Notes - Small Card */}
          <BentoCard
            title="AI-Powered Notes"
            description="GPT-4 transforms your transcripts into beautifully structured, study-ready notes."
            colSpan={4}
            variant="accent"
            delay={0.2}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            }
          />

          {/* Organized Folders - Medium Card */}
          <BentoCard
            title="Organized Folders"
            description="Keep all your lectures neatly organized by subject, date, or custom categories."
            colSpan={6}
            variant="default"
            delay={0.3}
            icon={
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            }
            visual={<FolderVisual />}
          />

          {/* Smart Notes Preview - Medium Card */}
          <BentoCard
            title="Structured Output"
            description="Get key points, summaries, and action items automatically extracted from every lecture."
            colSpan={6}
            variant="default"
            delay={0.4}
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            visual={<NotesVisual />}
          />
        </div>
      </div>
    </section>
  );
}
