'use client'

import React, { useState, useEffect } from 'react';
import Lottie, { useLottie } from "lottie-react";
import animationData from "public/animations/lottie-globe-loader.json"

const LottiePlaceholder: React.FC = () => {
  const options = {
    animationData: animationData,
    loop: true,
    speed: 4.5
  };

  const { View } = useLottie(options);

  return (
    <div className="w-full h-full flex justify-center items-center">
      {View}
    </div>
  );
};


export default LottiePlaceholder;
