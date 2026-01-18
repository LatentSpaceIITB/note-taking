"use client";

import { motion } from "framer-motion";
import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations/FadeInView";

const useCases = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Lectures",
    description: "Perfect for students capturing hour-long lectures. Never miss a key concept again. Our AI identifies main topics, key definitions, and important examples automatically.",
    color: "teal",
    featured: true,
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Meetings",
    description: "Turn brainstorming sessions and team meetings into actionable notes and tasks.",
    color: "rose",
    featured: false,
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: "Video Calls",
    description: "Record Google Meet, Zoom, or any video call. Get transcripts and summaries automatically.",
    color: "amber",
    featured: false,
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Any Audio",
    description: "Upload podcasts, interviews, or voice memos. We handle any audio source.",
    color: "purple",
    featured: false,
  },
];

const colorStyles = {
  teal: {
    iconBg: "bg-teal-500/20",
    iconText: "text-teal-400",
    borderTop: "border-t-teal-500/50",
  },
  rose: {
    iconBg: "bg-rose-500/20",
    iconText: "text-rose-400",
    borderTop: "border-t-rose-500/50",
  },
  amber: {
    iconBg: "bg-amber-500/20",
    iconText: "text-amber-400",
    borderTop: "border-t-amber-500/50",
  },
  purple: {
    iconBg: "bg-purple-500/20",
    iconText: "text-purple-400",
    borderTop: "border-t-purple-500/50",
  },
};

export function UseCases() {
  return (
    <section id="use-cases" className="relative py-24 md:py-32 bg-stone-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <FadeInView className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-rose-500/20 text-rose-400 text-sm font-medium mb-4">
            Use Cases
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-stone-400">Works with</span> <span className="text-teal-400">any audio</span>
          </h2>
          <p className="text-lg text-stone-400 max-w-2xl mx-auto">
            Whether it's a lecture hall or a coffee shop meeting, we've got you covered.
          </p>
        </FadeInView>

        {/* Asymmetric Bento Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-fr">
          {useCases.map((useCase, index) => {
            const colors = colorStyles[useCase.color as keyof typeof colorStyles];

            return (
              <StaggerItem
                key={useCase.title}
                className={useCase.featured ? "md:col-span-3 md:row-span-2" : "md:col-span-3"}
              >
                <motion.div
                  className={`
                    h-full rounded-2xl p-8
                    bg-stone-800/50 backdrop-blur-sm
                    border border-white/10 ${colors.borderTop}
                    transition-all duration-300
                    hover:bg-stone-800/70 hover:border-white/20
                    hover:-translate-y-1
                  `}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className={`
                    w-14 h-14 rounded-2xl mb-5 flex items-center justify-center
                    ${colors.iconBg} ${colors.iconText}
                  `}>
                    {useCase.icon}
                  </div>
                  <h3 className="text-xl font-bold text-stone-100 mb-3">
                    {useCase.title}
                  </h3>
                  <p className={`text-stone-400 leading-relaxed ${useCase.featured ? 'text-base' : 'text-sm'}`}>
                    {useCase.description}
                  </p>
                  {useCase.featured && (
                    <div className="mt-6 inline-flex items-center gap-2 text-teal-400 text-sm font-medium">
                      <span className="px-3 py-1 rounded-full bg-teal-500/20">Most popular</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
