'use client'

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Lottie with no SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import animationData from "public/animations/lottie-globe-loader.json"

const LottiePlaceholder: React.FC = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Lottie
        animationData={animationData}
        loop={true}
      />
    </div>
  );
};

export default LottiePlaceholder;
