"use client";

import Link from "next/link";
import { GlowButton } from "@/components/ui/GlowButton";
import { FadeInView } from "@/components/animations/FadeInView";

export function Footer() {
  return (
    <footer className="relative bg-stone-900 pt-16 pb-12 overflow-hidden">
      {/* Final CTA Section */}
      <FadeInView className="max-w-4xl mx-auto px-6 text-center mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          <span className="text-stone-400">Ready to capture</span>
          <br />
          <span className="text-teal-400">every insight?</span>
        </h2>
        <p className="text-base sm:text-lg text-stone-400 mb-8 max-w-xl mx-auto">
          Join your batchmates who are already transforming their lectures
          into structured knowledge.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <GlowButton href="/login" variant="primary" size="lg">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
            Start for Free
          </GlowButton>
          <p className="text-sm text-stone-500">
            No credit card required
          </p>
        </div>
      </FadeInView>

      {/* Simple Footer */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center py-8 border-t border-stone-800">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">
              Lecture Notes
            </span>
          </Link>
          <p className="text-sm text-stone-500">
            2025 Lecture Notes. Built by IITB students.
          </p>
        </div>
      </div>
    </footer>
  );
}
