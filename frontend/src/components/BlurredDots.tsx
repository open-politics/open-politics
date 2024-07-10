'use client';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

const BlurredDot = ({ color, x, y, size }) => {
  return (
    <motion.div
      className="fixed rounded-full blur-[100px] opacity-30"
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        left: x,
        top: y,
        zIndex: 10,
      }}
    />
  );
};

const dotsConfig = {
  '/': [
    { color: '#00FFFF', size: '30vw' },
    { color: '#FF00FF', size: '40vw' },
  ],
  '/blog': [
    { color: '#32CD32', size: '35vw' },
    { color: '#FFD700', size: '30vw' },
  ],
  '/blog/about': [
    { color: '#76B900', size: '35vw' },
    { color: '#DDA0DD', size: '30vw' },
  ],
  
  // Add more configurations for different routes
};

const BlurredDots = () => {
  const pathname = usePathname();
  const [dots, setDots] = useState(dotsConfig['/']);
  const { scrollYProgress } = useScroll();

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
  }, [pathname]);

  const topLeftX = useTransform(scrollYProgress, [0, 1], ['-20vw', '-20vw']);
  const topLeftY = useTransform(scrollYProgress, [0, 1], ['-10vh', '80vh']);
  const bottomRightX = useTransform(scrollYProgress, [0, 1], ['80vw', '80vw']);
  const bottomRightY = useTransform(scrollYProgress, [0, 1], ['80vh', '-40vh']);

  return (
    <>
      <BlurredDot {...dots[0]} x={topLeftX} y={topLeftY} />
      <BlurredDot {...dots[1]} x={bottomRightX} y={bottomRightY} />
    </>
  );
};

export default BlurredDots;