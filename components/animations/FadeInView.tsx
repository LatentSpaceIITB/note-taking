"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
import { ReactNode } from "react";
import { EASING, TIMING } from "@/lib/animations";

type MotionElement = "div" | "section" | "article" | "aside" | "main" | "header" | "footer" | "nav" | "span" | "p" | "ul" | "ol" | "li";

interface FadeInViewProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  margin?: string;
  threshold?: number;
  stagger?: boolean;
  staggerDelay?: number;
  as?: MotionElement;
}

export function FadeInView({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = TIMING.slow,
  distance = 30,
  once = true,
  margin = "-100px 0px",
  as = "div",
}: FadeInViewProps) {
  const prefersReducedMotion = useReducedMotion();

  const getInitialPosition = () => {
    if (prefersReducedMotion) return { opacity: 0 };

    switch (direction) {
      case "up":
        return { opacity: 0, y: distance };
      case "down":
        return { opacity: 0, y: -distance };
      case "left":
        return { opacity: 0, x: distance };
      case "right":
        return { opacity: 0, x: -distance };
      case "none":
      default:
        return { opacity: 0 };
    }
  };

  const variants: Variants = {
    hidden: getInitialPosition(),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : duration,
        ease: EASING.smooth,
        delay,
      },
    },
  };

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={variants}
    >
      {children}
    </MotionComponent>
  );
}

// Stagger container for multiple fade-in items
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  once?: boolean;
  margin?: string;
  as?: MotionElement;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  delayChildren = 0,
  once = true,
  margin = "-100px 0px",
  as = "div",
}: StaggerContainerProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={containerVariants}
    >
      {children}
    </MotionComponent>
  );
}

// Stagger item to be used inside StaggerContainer
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  as?: MotionElement;
}

export function StaggerItem({
  children,
  className = "",
  direction = "up",
  distance = 20,
  duration = TIMING.slow,
  as = "div",
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  const getInitialPosition = () => {
    if (prefersReducedMotion) return { opacity: 0 };

    switch (direction) {
      case "up":
        return { opacity: 0, y: distance };
      case "down":
        return { opacity: 0, y: -distance };
      case "left":
        return { opacity: 0, x: distance };
      case "right":
        return { opacity: 0, x: -distance };
      case "none":
      default:
        return { opacity: 0 };
    }
  };

  const itemVariants: Variants = {
    hidden: getInitialPosition(),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : duration,
        ease: EASING.smooth,
      },
    },
  };

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent className={className} variants={itemVariants}>
      {children}
    </MotionComponent>
  );
}

// Scale fade in variant
interface ScaleFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  initialScale?: number;
  once?: boolean;
  margin?: string;
}

export function ScaleFadeIn({
  children,
  className = "",
  delay = 0,
  duration = TIMING.slow,
  initialScale = 0.95,
  once = true,
  margin = "-100px 0px",
}: ScaleFadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : initialScale,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.01 : duration,
        ease: EASING.smooth,
        delay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

// Slide reveal (for text reveals)
interface SlideRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function SlideReveal({
  children,
  className = "",
  delay = 0,
  duration = TIMING.deliberate,
}: SlideRevealProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration,
          ease: EASING.smooth,
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
