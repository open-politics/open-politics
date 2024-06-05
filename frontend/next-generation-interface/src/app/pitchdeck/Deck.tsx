// src/app/pitch-deck/Deck.tsx
'use client';

import React, { useState } from 'react';
import Slide from './Slide';
import slidesData from './slidesData';

const Deck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slidesData.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="flex flex-col items-center w-full justify-center h-screen bg-zinc-950 text-white">
      <Slide {...slidesData[currentSlide]} />
      <div className="mt-4">
        <button 
          onClick={prevSlide} 
          disabled={currentSlide === 0}
          className="mr-2 px-4 py-2 bg-gray-700 rounded"
        >
          Previous
        </button>
        <button 
          onClick={nextSlide} 
          disabled={currentSlide === slidesData.length - 1}
          className="ml-2 px-4 py-2 bg-gray-700 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Deck;
