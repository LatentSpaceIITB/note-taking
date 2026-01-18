"use client";

import { motion } from "framer-motion";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations/FadeInView";

const logos = [
  "Stanford",
  "MIT",
  "Harvard",
  "Berkeley",
  "Yale",
  "Princeton",
  "Columbia",
  "Cornell",
];

const testimonials = [
  {
    quote: "This app literally saved my semester. I can finally focus on understanding the lecture instead of frantically writing notes.",
    author: "Sarah M.",
    role: "Medical Student, Stanford",
  },
  {
    quote: "The AI summaries are surprisingly good. They pick up on key concepts I might have missed during class.",
    author: "James K.",
    role: "Engineering Student, MIT",
  },
  {
    quote: "I use it for every lecture now. It's like having a personal note-taker that never misses anything.",
    author: "Emily R.",
    role: "Law Student, Harvard",
  },
];

export function TrustParade() {
  return (
    <section className="relative py-24 md:py-32 bg-stone-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <FadeInView className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-teal-400 text-sm font-medium mb-4">
            Trusted by Thousands
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-stone-400">Loved by</span> <span className="text-teal-400">students everywhere</span>
          </h2>
          <p className="text-lg text-stone-400 max-w-2xl mx-auto">
            Join thousands of students who are transforming how they capture and learn from lectures.
          </p>
        </FadeInView>

        {/* Logo Marquee */}
        <div className="relative mb-20">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-stone-900 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-stone-900 to-transparent z-10" />

          <div className="overflow-hidden py-4">
            <motion.div
              className="flex gap-12 items-center"
              animate={{
                x: [0, -1200],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {[...logos, ...logos].map((logo, index) => (
                <div
                  key={`${logo}-${index}`}
                  className="flex-shrink-0 px-8 py-4 bg-stone-800/50 backdrop-blur-sm rounded-xl border border-white/10 border-t-teal-500/30"
                >
                  <span className="text-xl font-semibold text-stone-300 whitespace-nowrap">
                    {logo}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.author}>
              <div className="glass-card-dark rounded-2xl p-8 h-full">
                <div className="flex flex-col h-full">
                  <p className="text-stone-300 text-lg leading-relaxed mb-6 flex-grow">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm text-stone-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Stats */}
        <FadeInView className="mt-20">
          <div className="glass-card-dark rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-teal-400 mb-1">50K+</p>
                <p className="text-stone-400">Active Students</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-teal-400 mb-1">1M+</p>
                <p className="text-stone-400">Lectures Recorded</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-teal-400 mb-1">98%</p>
                <p className="text-stone-400">Accuracy Rate</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-teal-400 mb-1">4.9</p>
                <p className="text-stone-400">User Rating</p>
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
