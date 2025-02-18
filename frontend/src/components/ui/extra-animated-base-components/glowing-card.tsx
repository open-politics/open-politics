"use client";
import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingCardProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  children?: React.ReactNode;
  background?: string;
  darkBackground?: string;
  glowIntensity?: number;
  glowSize?: number;
  glowColor?: string;
  darkGlowColor?: string;
}

const GlowingCard: React.FC<GlowingCardProps> = ({
  className = "",
  width = "100%",
  height = "100%",
  children,
  background = "linear-gradient(to right, #e2e8f0, #cbd5e0)",
  darkBackground = "linear-gradient(to right, #4a5568, #2d3748)",
  glowIntensity = 0.15,
  glowSize = 70,
  glowColor = "255, 255, 255",
  darkGlowColor = "255, 255, 255",
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scale = useMotionValue(1);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    
    // Calculate relative position (0 to 1)
    const x = (clientX - left) / width;
    const y = (clientY - top) / height;
    
    // Add slight tilt effect
    const rotateX = (y - 0.5) * 4; // 4 degree max rotation
    const rotateY = (x - 0.5) * 4;

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    currentTarget.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseEnter = () => {
    scale.set(1.02);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    mouseX.set(event.currentTarget.clientWidth / 2);
    mouseY.set(event.currentTarget.clientHeight / 2);
    scale.set(1);
    event.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
  };

  const glowBackground = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `
      radial-gradient(
        circle at ${x}px ${y}px,
        rgba(${glowColor}, ${glowIntensity}) 0%,
        rgba(${glowColor}, 0) ${glowSize}%
      ),
      ${background}
    `
  );

  const glowDarkBackground = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `
      radial-gradient(
        circle at ${x}px ${y}px,
        rgba(${darkGlowColor}, ${glowIntensity}) 0%,
        rgba(${darkGlowColor}, 0) ${glowSize}%
      ),
      ${darkBackground}
    `
  );

  const sharedMotionProps = {
    className: "w-full h-full rounded-xl cursor-pointer relative overflow-hidden transition-all duration-300",
    style: { scale },
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    transition: { duration: 0.3 },
  };

  return (
    <div className={cn("w-full h-full perspective-1000", className)}>
      <motion.div
        {...sharedMotionProps}
        className={`${sharedMotionProps.className} dark:hidden`}
        style={{ 
          ...sharedMotionProps.style,
          backgroundImage: glowBackground,
          backgroundColor: 'transparent'
        }}
        initial={{ 
          backgroundImage: `radial-gradient(
            circle at 50% 50%,
            rgba(${glowColor}, ${glowIntensity}) 0%,
            rgba(${glowColor}, 0) ${glowSize}%
          ),
          ${background}`
        }}
      >
        {children}
      </motion.div>

      <motion.div
        {...sharedMotionProps}
        className={`${sharedMotionProps.className} hidden dark:block`}
        style={{ 
          ...sharedMotionProps.style,
          backgroundImage: glowDarkBackground,
          backgroundColor: 'transparent'
        }}
        initial={{ 
          backgroundImage: `radial-gradient(
            circle at 50% 50%,
            rgba(${darkGlowColor}, ${glowIntensity}) 0%,
            rgba(${darkGlowColor}, 0) ${glowSize}%
          ),
          ${darkBackground}`
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default GlowingCard;
