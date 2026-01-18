"use client";

import { motion } from "framer-motion";
import { GlowButton } from "@/components/ui/GlowButton";
import { OrbBackground } from "./GradientOrb";
import { heroTextVariants, fadeInUp, EASING, TIMING } from "@/lib/animations";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-900 pt-24">
      {/* Background Orbs - adjusted for dark theme */}
      <OrbBackground variant="hero" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASING.smooth }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-900/50 border border-teal-700/50 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="text-sm font-medium text-teal-300">
            AI-Powered Note Taking
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="hero-headline mb-6"
          custom={0.1}
          initial="hidden"
          animate="visible"
          variants={heroTextVariants}
        >
          <span className="text-stone-400">Stop scribbling.</span>
          <br />
          <span className="text-teal-400">Start listening.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="hero-subheadline max-w-2xl mx-auto mb-10 text-stone-300"
          custom={0.2}
          initial="hidden"
          animate="visible"
          variants={heroTextVariants}
        >
          The AI study partner that turns 90-minute lectures into perfectly
          structured notes. Just hit record and focus on understanding.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          custom={0.3}
          initial="hidden"
          animate="visible"
          variants={heroTextVariants}
        >
          <GlowButton href="/login" variant="primary" size="lg">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Start for Free
          </GlowButton>
          <GlowButton href="#how-it-works" variant="secondary" size="lg">
            See how it works
          </GlowButton>
        </motion.div>

        {/* Product Demo/Preview */}
        <motion.div
          className="mt-16 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: EASING.smooth,
            delay: 0.5,
          }}
        >
          {/* Glass Frame - Dark variant */}
          <div className="glass-card-dark rounded-3xl p-2 md:p-4 shadow-2xl max-w-4xl mx-auto">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-stone-800 text-stone-400 text-sm">
                  lecturenotes.ai/record
                </div>
              </div>
            </div>

            {/* App Preview */}
            <div className="bg-stone-800 rounded-2xl overflow-hidden">
              <div className="aspect-video flex items-center justify-center p-8 md:p-12">
                {/* Recording UI Preview */}
                <div className="text-center">
                  {/* Static Waveform */}
                  <div className="flex items-center justify-center gap-1 mb-8">
                    {[16, 24, 32, 40, 48, 56, 64, 56, 48, 40, 48, 56, 64, 56, 48, 40, 32, 24, 16, 12].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-teal-500 rounded-full"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>

                  {/* Record Button Preview */}
                  <motion.div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 mx-auto flex items-center justify-center shadow-lg"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(244, 63, 94, 0.4)",
                        "0 0 0 20px rgba(244, 63, 94, 0)",
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    <div className="w-8 h-8 bg-white rounded-sm" />
                  </motion.div>

                  <p className="mt-6 text-stone-400 font-medium">
                    Recording: 45:32
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative glow under the preview */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-teal-500/20 blur-3xl rounded-full" />
        </motion.div>

        {/* Trust Indicator */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-stone-400 font-medium">
            Built by IITB students, for IITB students
          </p>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-stone-500"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  );
}
