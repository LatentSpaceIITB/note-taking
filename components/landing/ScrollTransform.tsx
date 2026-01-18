"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FadeInView } from "@/components/animations/FadeInView";

export function ScrollTransform() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Staggered transform values to prevent overlap
  // Step 1: Waveform - visible 0.15-0.35, fade out 0.30-0.35
  const waveformOpacity = useTransform(
    scrollYProgress,
    [0.15, 0.20, 0.30, 0.35],
    [0, 1, 1, 0]
  );
  const waveformScale = useTransform(
    scrollYProgress,
    [0.15, 0.20, 0.30, 0.35],
    [0.9, 1, 1, 0.9]
  );

  // Step 2: Transcript - visible 0.35-0.55, fade out 0.50-0.55
  const textOpacity = useTransform(
    scrollYProgress,
    [0.33, 0.38, 0.50, 0.55],
    [0, 1, 1, 0]
  );
  const textY = useTransform(
    scrollYProgress,
    [0.33, 0.38, 0.50, 0.55],
    [30, 0, 0, -30]
  );

  // Step 3: Notes - visible 0.55-0.75
  const notesOpacity = useTransform(
    scrollYProgress,
    [0.53, 0.58, 0.72, 0.77],
    [0, 1, 1, 0.8]
  );
  const notesY = useTransform(
    scrollYProgress,
    [0.53, 0.58],
    [30, 0]
  );
  const notesScale = useTransform(
    scrollYProgress,
    [0.53, 0.58],
    [0.95, 1]
  );

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative min-h-[200vh] bg-stone-900"
    >
      {/* Top fade mask for transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-stone-900 to-transparent z-20 pointer-events-none" />

      {/* Sticky Container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
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
          <FadeInView className="mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-teal-400 text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-stone-400">From speech to</span> <span className="text-teal-400">structured notes</span>
            </h2>
            <p className="text-lg text-stone-400 max-w-2xl mx-auto">
              Watch the magic happen as we transform your recorded audio into
              beautifully organized notes.
            </p>
          </FadeInView>

          {/* Transformation Visual */}
          <div className="relative h-96 flex items-center justify-center">
            {/* Step 1: Waveform */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: waveformOpacity,
                scale: waveformScale,
                zIndex: 30
              }}
            >
              <div className="text-center bg-stone-900/80 rounded-2xl p-8 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[...Array(40)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-teal-500 rounded-full"
                      animate={{
                        height: [12, 48 + Math.random() * 48, 12],
                      }}
                      transition={{
                        duration: 0.6 + Math.random() * 0.4,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.02,
                      }}
                    />
                  ))}
                </div>
                <p className="text-stone-300 font-medium">Recording Audio...</p>
              </div>
            </motion.div>

            {/* Step 2: Transcript */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: textOpacity,
                y: textY,
                zIndex: 20
              }}
            >
              <div className="max-w-2xl mx-auto bg-stone-800/90 backdrop-blur rounded-2xl p-8 text-left border border-stone-700/50 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-teal-400 text-sm font-medium">
                    Transcribing...
                  </span>
                </div>
                <p className="text-stone-300 leading-relaxed font-mono text-sm">
                  <span className="text-white">
                    &quot;Today we&apos;ll be discussing the fundamental principles of
                    machine learning.
                  </span>{" "}
                  The first concept to understand is supervised learning, where
                  we train models using labeled data...&quot;
                </p>
              </div>
            </motion.div>

            {/* Step 3: Structured Notes */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: notesOpacity,
                y: notesY,
                scale: notesScale,
                zIndex: 10
              }}
            >
              <div className="max-w-2xl mx-auto bg-stone-800 rounded-2xl p-8 text-left shadow-2xl border border-stone-700/50">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-teal-400 font-semibold">
                    Notes Generated
                  </span>
                </div>

                <h3 className="text-xl font-bold text-stone-100 mb-4">
                  Machine Learning Fundamentals
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm font-bold mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        Supervised Learning
                      </p>
                      <p className="text-sm text-stone-400">
                        Training models using labeled data for prediction tasks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm font-bold mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        Key Concepts
                      </p>
                      <p className="text-sm text-stone-400">
                        Features, labels, training data, model evaluation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Progress Indicators */}
          <div className="mt-12 flex items-center justify-center gap-4">
            {["Record", "Transcribe", "Generate"].map((step, index) => {
              const progressRanges = [
                [0.15, 0.35],
                [0.35, 0.55],
                [0.55, 0.75],
              ];
              const [start, end] = progressRanges[index];

              return (
                <motion.div
                  key={step}
                  className="flex items-center gap-2"
                  style={{
                    opacity: useTransform(
                      scrollYProgress,
                      [start - 0.05, start, end - 0.05, end],
                      [0.4, 1, 1, 0.4]
                    ),
                  }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                    style={{
                      backgroundColor: useTransform(
                        scrollYProgress,
                        [start, start + 0.05],
                        ["rgb(68, 64, 60)", "rgb(20, 184, 166)"]
                      ),
                      color: useTransform(
                        scrollYProgress,
                        [start, start + 0.05],
                        ["rgb(168, 162, 158)", "rgb(255, 255, 255)"]
                      ),
                    }}
                  >
                    {index + 1}
                  </motion.div>
                  <span className="text-stone-400 font-medium">{step}</span>
                  {index < 2 && (
                    <div className="w-12 h-0.5 bg-stone-700 mx-2" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom fade mask for transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-900 to-transparent z-20 pointer-events-none" />
    </section>
  );
}
