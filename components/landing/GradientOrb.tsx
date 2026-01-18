"use client";

import { motion } from "framer-motion";
import { orbFloat } from "@/lib/animations";

interface GradientOrbProps {
  color?: "teal" | "rose" | "cream";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
  blur?: number;
  opacity?: number;
}

export function GradientOrb({
  color = "teal",
  size = "md",
  className = "",
  animate = true,
  blur = 80,
  opacity = 0.5,
}: GradientOrbProps) {
  const colors = {
    teal: "from-teal-300 to-teal-500",
    rose: "from-rose-300 to-rose-400",
    cream: "from-cream-200 to-cream-100",
  };

  const sizes = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96",
    xl: "w-[32rem] h-[32rem]",
  };

  const baseStyles = `
    absolute rounded-full pointer-events-none
    bg-gradient-to-br ${colors[color]} ${sizes[size]}
  `;

  const style = {
    filter: `blur(${blur}px)`,
    opacity,
  };

  if (animate) {
    return (
      <motion.div
        className={`${baseStyles} ${className}`.trim()}
        style={style}
        variants={orbFloat}
        animate="animate"
      />
    );
  }

  return (
    <div
      className={`${baseStyles} ${className}`.trim()}
      style={style}
    />
  );
}

// Background with multiple orbs
interface OrbBackgroundProps {
  variant?: "hero" | "section" | "minimal";
  className?: string;
}

export function OrbBackground({ variant = "hero", className = "" }: OrbBackgroundProps) {
  if (variant === "hero") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <GradientOrb
          color="teal"
          size="xl"
          className="-top-48 -right-48"
          blur={100}
          opacity={0.4}
        />
        <GradientOrb
          color="rose"
          size="lg"
          className="top-1/3 -left-32"
          blur={80}
          opacity={0.3}
        />
        <GradientOrb
          color="cream"
          size="xl"
          className="-bottom-48 right-1/4"
          blur={100}
          opacity={0.6}
        />
        <GradientOrb
          color="teal"
          size="md"
          className="bottom-1/4 -right-16"
          blur={60}
          opacity={0.3}
        />
      </div>
    );
  }

  if (variant === "section") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <GradientOrb
          color="teal"
          size="lg"
          className="-top-32 -right-32"
          blur={80}
          opacity={0.25}
        />
        <GradientOrb
          color="cream"
          size="md"
          className="bottom-0 -left-16"
          blur={60}
          opacity={0.4}
        />
      </div>
    );
  }

  // minimal
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <GradientOrb
        color="teal"
        size="md"
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        blur={100}
        opacity={0.2}
        animate={false}
      />
    </div>
  );
}
