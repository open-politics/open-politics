// src/app/pitch-deck/Slide.tsx
import React from 'react';

interface SlideProps {
  title: string;
  content: string;
  additionalContent?: string[];
}

const Slide: React.FC<SlideProps> = ({ title, content, additionalContent = [] }) => {
  return (
    <div className="p-8 bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl h-auto">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-4 text-lg">{content}</p>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {additionalContent.map((boxContent, index) => (
          <div key={index} className="p-4 bg-gray-700 rounded">
            {boxContent}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slide;
