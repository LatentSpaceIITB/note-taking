"use client";

import { motion } from "framer-motion";
import { FadeInView } from "@/components/animations/FadeInView";

export function ScrollTransform() {
  return (
    <section
      id="how-it-works"
      className="relative py-16 md:py-24 bg-stone-900"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-800" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Section Header */}
        <FadeInView className="mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-teal-400 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 px-2">
            <span className="text-stone-400">From speech to</span>{" "}
            <span className="text-teal-400">structured notes</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-stone-400 max-w-2xl mx-auto px-4">
            Watch the magic happen as we transform your recorded audio into
            beautifully organized notes.
          </p>
        </FadeInView>

        {/* Three Step Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Step 1: Record */}
          <FadeInView delay={0.1}>
            <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl p-6 border border-stone-700/50 h-full">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Record</h3>
              <p className="text-sm text-stone-400">
                Hit the record button and capture your lecture audio
              </p>
              {/* Static Waveform Visual */}
              <div className="flex items-center justify-center gap-0.5 mt-4 h-12">
                {[3, 5, 8, 12, 16, 20, 24, 20, 16, 12, 8, 5, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-teal-500 rounded-full"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </FadeInView>

          {/* Step 2: Transcribe */}
          <FadeInView delay={0.2}>
            <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl p-6 border border-stone-700/50 h-full">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Transcribe</h3>
              <p className="text-sm text-stone-400">
                AI converts speech to text with high accuracy
              </p>
              {/* Transcript Visual */}
              <div className="mt-4 text-left bg-stone-900/50 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span className="text-teal-400 text-xs">Transcribing...</span>
                </div>
                <p className="text-xs text-stone-400 font-mono line-clamp-2">
                  "Today we'll be discussing machine learning fundamentals..."
                </p>
              </div>
            </div>
          </FadeInView>

          {/* Step 3: Generate */}
          <FadeInView delay={0.3}>
            <div className="bg-stone-800/50 backdrop-blur-sm rounded-2xl p-6 border border-stone-700/50 h-full">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Generate</h3>
              <p className="text-sm text-stone-400">
                Get structured notes with key points extracted
              </p>
              {/* Notes Visual */}
              <div className="mt-4 text-left bg-stone-900/50 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-teal-400 text-xs">Notes ready</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-teal-500/20 flex items-center justify-center text-teal-400 text-[10px]">1</div>
                    <span className="text-xs text-stone-300">Key concept</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-teal-500/20 flex items-center justify-center text-teal-400 text-[10px]">2</div>
                    <span className="text-xs text-stone-300">Summary</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
