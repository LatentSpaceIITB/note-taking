"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GlowButton } from "@/components/ui/GlowButton";
import { navbarVariants, EASING } from "@/lib/animations";
import { useAuth } from "@/lib/AuthContext";

export function LandingNav() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(28, 25, 23, 0)", "rgba(28, 25, 23, 0.85)"]
  );

  const navBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(20px)"]
  );

  const navBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#use-cases", label: "Use Cases" },
    { href: "#how-it-works", label: "How It Works" },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex justify-center"
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
    >
      <motion.div
        className={`
          mt-4 mx-4 rounded-full px-6 py-3
          max-w-[800px] w-full
          transition-shadow duration-300
          ${isScrolled ? "shadow-lg" : ""}
        `}
        style={{
          background: navBackground,
          backdropFilter: navBlur,
          WebkitBackdropFilter: navBlur,
          border: `1px solid`,
          borderColor: navBorder,
        }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-stone-300 hover:text-white font-medium transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <GlowButton href="/dashboard" variant="primary" size="sm">
                Dashboard
              </GlowButton>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-stone-300 hover:text-white font-medium transition-colors text-sm"
                >
                  Sign In
                </Link>
                <GlowButton href="/login" variant="primary" size="sm">
                  Get Started
                </GlowButton>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-stone-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden mt-4 pt-4 border-t border-white/10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: EASING.smooth }}
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-stone-300 hover:text-white font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-white/10" />
              {user ? (
                <GlowButton href="/dashboard" variant="primary" size="md" fullWidth>
                  Go to Dashboard
                </GlowButton>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-stone-300 hover:text-white font-medium py-2"
                  >
                    Sign In
                  </Link>
                  <GlowButton href="/login" variant="primary" size="md" fullWidth>
                    Get Started Free
                  </GlowButton>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.nav>
  );
}
