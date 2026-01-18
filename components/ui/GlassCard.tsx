"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { TRANSITIONS, EASING } from "@/lib/animations";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  animate?: boolean;
  delay?: number;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  border?: boolean;
  shadow?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
  dark?: boolean;
}

export function GlassCard({
  children,
  className = "",
  hover = true,
  animate = false,
  delay = 0,
  padding = "lg",
  rounded = "2xl",
  border = true,
  shadow = "md",
  onClick,
  dark = false,
}: GlassCardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  };

  const roundedStyles = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
  };

  const shadowStyles = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const baseStyles = `
    ${dark ? "glass-card-dark" : "glass-card"}
    ${paddingStyles[padding]}
    ${roundedStyles[rounded]}
    ${shadowStyles[shadow]}
    ${border ? (dark ? "border border-white/10" : "border border-white/50") : ""}
    ${onClick ? "cursor-pointer" : ""}
  `;

  const hoverProps = hover
    ? {
        whileHover: {
          y: -4,
          scale: 1.01,
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.5)",
        },
        transition: TRANSITIONS.smooth,
      }
    : {};

  const animateProps = animate
    ? {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, margin: "-100px" },
        variants: {
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: EASING.smooth,
              delay,
            },
          },
        },
      }
    : {};

  return (
    <motion.div
      className={`${baseStyles} ${className}`.trim()}
      onClick={onClick}
      {...hoverProps}
      {...animateProps}
    >
      {children}
    </motion.div>
  );
}

// Feature Card variant for bento grids
interface FeatureCardProps extends Omit<GlassCardProps, "children"> {
  icon?: ReactNode;
  title: string;
  description: string;
  colSpan?: number;
  rowSpan?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  colSpan = 1,
  rowSpan = 1,
  className = "",
  ...props
}: FeatureCardProps) {
  const spanClasses = `
    ${colSpan === 2 ? "md:col-span-2" : ""}
    ${colSpan === 3 ? "md:col-span-3" : ""}
    ${colSpan === 4 ? "md:col-span-4" : ""}
    ${colSpan === 6 ? "md:col-span-6" : ""}
    ${colSpan === 8 ? "md:col-span-8" : ""}
    ${rowSpan === 2 ? "md:row-span-2" : ""}
  `;

  return (
    <GlassCard
      className={`${spanClasses} ${className}`.trim()}
      padding="xl"
      {...props}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-stone-800 mb-2">{title}</h3>
      <p className="text-stone-600 leading-relaxed">{description}</p>
    </GlassCard>
  );
}

// Testimonial Card variant
interface TestimonialCardProps extends Omit<GlassCardProps, "children"> {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  className = "",
  ...props
}: TestimonialCardProps) {
  return (
    <GlassCard className={className} padding="xl" {...props}>
      <div className="flex flex-col h-full">
        <p className="text-stone-700 text-lg leading-relaxed mb-6 flex-grow">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt={author}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
              {author.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-stone-800">{author}</p>
            <p className="text-sm text-stone-500">{role}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// Stat Card variant
interface StatCardProps extends Omit<GlassCardProps, "children"> {
  value: string;
  label: string;
  icon?: ReactNode;
}

export function StatCard({
  value,
  label,
  icon,
  className = "",
  ...props
}: StatCardProps) {
  return (
    <GlassCard className={`text-center ${className}`} padding="lg" {...props}>
      {icon && (
        <div className="flex justify-center mb-3 text-teal-600">{icon}</div>
      )}
      <p className="text-3xl md:text-4xl font-bold text-stone-800 mb-1">
        {value}
      </p>
      <p className="text-stone-500">{label}</p>
    </GlassCard>
  );
}
