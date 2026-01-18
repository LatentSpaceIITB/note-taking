"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { EASING, TIMING } from "@/lib/animations";

interface BentoCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  visual?: ReactNode;
  colSpan?: 4 | 6 | 8 | 12;
  rowSpan?: 1 | 2;
  variant?: "default" | "featured" | "accent";
  className?: string;
  delay?: number;
}

export function BentoCard({
  title,
  description,
  icon,
  visual,
  colSpan = 6,
  rowSpan = 1,
  variant = "default",
  className = "",
  delay = 0,
}: BentoCardProps) {
  const colSpanClasses = {
    4: "md:col-span-4",
    6: "md:col-span-6",
    8: "md:col-span-8",
    12: "md:col-span-12",
  };

  const rowSpanClasses = {
    1: "",
    2: "md:row-span-2",
  };

  const variants = {
    default: "glass-card-dark border border-white/10",
    featured: "bg-gradient-to-br from-teal-800 to-teal-600 text-white border border-teal-500/30",
    accent: "glass-card-dark border border-rose-500/30 border-t-rose-500/50",
  };

  const textColors = {
    default: {
      title: "text-stone-100",
      description: "text-stone-400",
    },
    featured: {
      title: "text-stone-100",
      description: "text-teal-100",
    },
    accent: {
      title: "text-stone-100",
      description: "text-stone-400",
    },
  };

  return (
    <motion.div
      className={`
        col-span-12 ${colSpanClasses[colSpan]} ${rowSpanClasses[rowSpan]}
        ${variants[variant]}
        rounded-3xl p-6 md:p-8
        overflow-hidden relative
        ${className}
      `.trim()}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: TIMING.slow,
        ease: EASING.smooth,
        delay,
      }}
      whileHover={{
        y: -4,
        transition: { duration: TIMING.normal, ease: EASING.smooth },
      }}
    >
      <div className="relative z-10 h-full flex flex-col">
        {/* Icon */}
        {icon && (
          <div
            className={`
              w-12 h-12 rounded-xl mb-4 flex items-center justify-center
              ${variant === "featured" ? "bg-white/20 text-white" : "bg-teal-500/20 text-teal-400"}
            `}
          >
            {icon}
          </div>
        )}

        {/* Content */}
        <div className={visual ? "mb-6" : ""}>
          <h3 className={`text-xl md:text-2xl font-bold mb-2 ${textColors[variant].title}`}>
            {title}
          </h3>
          <p className={`leading-relaxed ${textColors[variant].description}`}>
            {description}
          </p>
        </div>

        {/* Visual Element */}
        {visual && <div className="mt-auto flex-1 flex items-end">{visual}</div>}
      </div>

      {/* Background decoration for featured variant */}
      {variant === "featured" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-600/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
        </div>
      )}
    </motion.div>
  );
}

// Visual elements for bento cards
export function WaveformVisual() {
  return (
    <div className="w-full h-24 flex items-center justify-center gap-1">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-teal-400 rounded-full"
          animate={{
            height: [8, 24 + Math.random() * 24, 8],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.03,
          }}
        />
      ))}
    </div>
  );
}

export function NotesVisual() {
  return (
    <div className="w-full bg-stone-800/80 rounded-xl p-4 space-y-3 border border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs font-bold">
          1
        </div>
        <div className="h-3 bg-stone-700 rounded w-3/4" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs font-bold">
          2
        </div>
        <div className="h-3 bg-stone-700 rounded w-1/2" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs font-bold">
          3
        </div>
        <div className="h-3 bg-stone-700 rounded w-2/3" />
      </div>
    </div>
  );
}

export function FolderVisual() {
  return (
    <div className="space-y-2">
      {["Lecture 1", "Lecture 2", "Lecture 3"].map((name, i) => (
        <motion.div
          key={name}
          className="flex items-center gap-3 bg-stone-800/80 rounded-lg px-3 py-2 border border-white/10"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <svg
            className="w-4 h-4 text-teal-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <span className="text-sm text-stone-300">{name}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function WhisperVisual() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-20 h-20 rounded-full border-4 border-dashed border-white/30" />
        <div className="absolute inset-2 rounded-full bg-white/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
