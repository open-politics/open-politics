'use client';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

const BlurredDot = ({ color, x, y, size }) => {
  return (
    <motion.div
      className="fixed rounded-full blur-[100px] opacity-40 dark:opacity-20"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        left: x,
        top: y,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
};

const dotsConfig = {
  '/': [
    { color: '#7AEFFF', size: '30vw' }, // Light blue at 0%
    { color: '#7CFF7A', size: '40vw' }, // Light green at 18%
  ],
  '/blog': [
    { color: '#FEEC90', size: '35vw' }, // Light yellow at 40%
    { color: '#FFC978', size: '30vw' }, // Light orange at 60%
  ],
  '/webpages/about': [
    { color: '#E478FF', size: '35vw' }, // Light purple at 92%
    { color: '#7AEFFF', size: '30vw' }, // Light blue at 0%
  ],
  '/login': [
    { color: '#7CFF7A', size: '40vw' }, // Light green at 18%
    { color: '#FEEC90', size: '20vw' }, // Light yellow at 40%
  ],
  '/documentation': [
    { color: '#FFC978', size: '40vw' }, // Light orange at 60%
    { color: '#E478FF', size: '20vw' }, // Light purple at 92%
  ],
  '/desk_synthese': [
    { color: '#7AEFFF', size: '40vw' }, // Light blue at 0%
    { color: '#7CFF7A', size: '20vw' }, // Light green at 18%
  ],
  '/webpages/*': [
    { color: '#FEEC90', size: '40vw' }, // Light yellow at 40%
    { color: '#FFC978', size: '20vw' }, // Light orange at 60%
  ],
};

const BlurredDots = () => {
  const pathname = usePathname();
  const [dots, setDots] = useState(dotsConfig['/']);
  const { scrollYProgress } = useScroll();
  const controls = useAnimation();
  const containerRef = useRef(null);

  useEffect(() => {
    if (dotsConfig[pathname]) {
      setDots(dotsConfig[pathname]);
    } else {
      const routeGroup = Object.keys(dotsConfig)
        .sort((a, b) => b.length - a.length) // Sort routes by length, longest first
        .find(route => 
          pathname.startsWith(route) && route !== '/'
        );
      if (routeGroup) {
        setDots(dotsConfig[routeGroup]);
      } else {
        setDots(dotsConfig['/']);
      }
    }
  }, [pathname, controls]);

  const topLeftX = useTransform(scrollYProgress, [0, 1], ['-20vw', '-20vw']);
  const topLeftY = useTransform(scrollYProgress, [0, 1], ['-10vh', '80vh']);
  const bottomRightX = useTransform(scrollYProgress, [0, 1], ['90vw', '90vw']);
  const bottomRightY = useTransform(scrollYProgress, [0, 1], ['80vh', '-40vh']);

  return (
    <>
      <BlurredDot {...dots[0]} x={topLeftX} y={topLeftY} />
      <BlurredDot {...dots[1]} x={bottomRightX} y={bottomRightY} />
    </>
  );
};

export default BlurredDots;