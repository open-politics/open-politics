"use client";
import React, { useEffect, useRef, useState } from "react";
import { Easing, motion } from "framer-motion";

interface TextWriterProps {
  text: string | React.ReactElement;
  delay?: number;
  className?: string;
  cursorColor?: string;
  cursorWidth?: string;
  cursorStyle?: string;
  eraseOnComplete?: boolean;
  eraseDelay?: number;
  loop?: boolean;
  typingDelay?: number;
  startDelay?: number;
  sequential?: boolean;
}

const TextWriter: React.FC<TextWriterProps> = ({
  text,
  delay = 0.05,
  className = "",
  cursorColor = "#000",
  cursorWidth = "2px",
  cursorStyle = "solid",
  eraseOnComplete = false,
  eraseDelay = 2000,
  loop = false,
  typingDelay = 50,
  startDelay = 0,
  sequential = true,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [showElement, setShowElement] = useState(false);
  const [isWriting, setIsWriting] = useState(true);
  const [visibleElements, setVisibleElements] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const stepEasing: Easing = (t) => Math.floor(t * 2) / 2;

  useEffect(() => {
    if (hasAnimated && !loop) return; // Skip if already animated and not looping

    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const writeText = () => {
      if (typeof text === 'string') {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
          timeoutId = setTimeout(writeText, typingDelay);
        } else {
          setIsWriting(false);
          setHasAnimated(true);
          if (eraseOnComplete || loop) {
            timeoutId = setTimeout(eraseText, eraseDelay);
          }
        }
      } else {
        const totalElements = React.Children.count(text.props.children);
        if (currentIndex <= totalElements) {
          setVisibleElements(currentIndex);
          currentIndex++;
          timeoutId = setTimeout(writeText, typingDelay);
        } else {
          setIsWriting(false);
          setHasAnimated(true);
        }
      }
    };

    timeoutId = setTimeout(() => {
      writeText();
    }, startDelay);

    const eraseText = () => {
      setIsWriting(true);
      if (currentIndex > 0) {
        currentIndex--;
        if (typeof text === 'string') {
          setDisplayText(text.toString().slice(0, currentIndex));
        } else {
          setVisibleElements(currentIndex);
        }
        timeoutId = setTimeout(eraseText, delay * 1000);
      } else {
        if (loop) {
          currentIndex = 0;
          timeoutId = setTimeout(writeText, delay * 1000);
        } else {
          setIsWriting(false);
        }
      }
    };

    return () => clearTimeout(timeoutId);
  }, [text, typingDelay, eraseOnComplete, eraseDelay, loop, startDelay, delay, hasAnimated]);

  const renderSequentialElements = (element: React.ReactElement) => {
    if (!sequential) return element;

    return React.cloneElement(
      element,
      { className: `${element.props.className || ""} group` },
      React.Children.map(element.props.children, (child, index) => {
        if (index < visibleElements) {
          if (React.isValidElement(child)) {
            const typedChild = child as React.ReactElement<{ className?: string; style?: React.CSSProperties }>;
            const isLucideIcon = 
              typedChild.props.className?.includes('lucide') || 
              (typeof typedChild.type === 'function' && typedChild.type.name?.includes('Icon'));

            if (isLucideIcon) {
              return React.cloneElement(
                typedChild,
                {
                  ...typedChild.props,
                  className: `${typedChild.props.className || ""} group-[.animate-shimmer-once]:text-transparent group-[.animate-shimmer-once]:stroke-[url(#shimmer)]`,
                  style: {
                    ...typedChild.props.style,
                    strokeWidth: 2,
                  }
                }
              );
            }
            return React.cloneElement(
              typedChild,
              {
                ...typedChild.props,
                className: `${typedChild.props.className || ""} group-[.animate-shimmer-once]:text-transparent group-[.animate-shimmer-once]:bg-gradient-to-r group-[.animate-shimmer-once]:from-purple-500 group-[.animate-shimmer-once]:via-blue-500 group-[.animate-shimmer-once]:to-purple-500 group-[.animate-shimmer-once]:bg-clip-text group-[.animate-shimmer-once]:bg-[length:200%_auto]`,
              }
            );
          }
          return child;
        }
        return null;
      })
    );
  };

  return (
    <>
      <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="200%" y2="0%">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" /> {/* purple-500 */}
            <stop offset="50%" stopColor="rgb(59, 130, 246)" /> {/* blue-500 */}
            <stop offset="100%" stopColor="rgb(168, 85, 247)" /> {/* purple-500 */}
          </linearGradient>
        </defs>
      </svg>
      <span className={`inline-flex items-center ${className}`}>
        {typeof text === 'string' ? (
          <span ref={textRef}>{displayText}</span>
        ) : (
          (showElement || sequential) && renderSequentialElements(text)
        )}
        {isWriting && (
          <motion.span
            style={{
              width: cursorWidth,
              height: "1em",
              backgroundColor: cursorColor,
              display: "inline-block",
              borderStyle: cursorStyle,
              marginLeft: "1px",
            }}
            animate={{ opacity: [1, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: stepEasing,
            }}
          />
        )}
      </span>
    </>
  );
};

export default TextWriter;
