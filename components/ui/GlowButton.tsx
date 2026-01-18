"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { buttonHover, TRANSITIONS } from "@/lib/animations";

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

export function GlowButton({
  children,
  onClick,
  href,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  fullWidth = false,
}: GlowButtonProps) {
  const baseStyles = `
    relative inline-flex items-center justify-center font-semibold
    rounded-full overflow-hidden cursor-pointer
    transition-all duration-300 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-teal-600 text-white
      hover:bg-teal-500
      shadow-md hover:shadow-lg hover:shadow-teal-600/30
    `,
    secondary: `
      bg-transparent text-white
      border-2 border-stone-500
      hover:border-white hover:bg-white/10
    `,
    ghost: `
      bg-transparent text-stone-300
      hover:text-white hover:bg-white/10
    `,
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const combinedClassName = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `.trim();

  const content = (
    <>
      {/* Shimmer effect overlay */}
      <span
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s ease-in-out infinite",
        }}
      />
      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={combinedClassName}
        {...buttonHover}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
      whileHover={disabled ? undefined : { scale: 1.02, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={TRANSITIONS.fast}
    >
      {content}
    </motion.button>
  );
}

// Preset button variants for common use cases
export function CTAButton({
  children,
  ...props
}: Omit<GlowButtonProps, "variant" | "size">) {
  return (
    <GlowButton variant="primary" size="lg" {...props}>
      {children}
    </GlowButton>
  );
}

export function SecondaryButton({
  children,
  ...props
}: Omit<GlowButtonProps, "variant">) {
  return (
    <GlowButton variant="secondary" {...props}>
      {children}
    </GlowButton>
  );
}
