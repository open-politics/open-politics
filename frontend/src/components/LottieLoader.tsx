import React, { useState, useEffect, useRef } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

const LottieLoader: React.FC = () => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    fetch('/animations/brainloader.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(err => {
        console.error('Error loading animation:', err);
        setError('Failed to load animation');
      });
  }, []);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(2); // Set speed to 2x
    }
  }, [animationData]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!animationData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center bg-transparent mt-0" style={{ width: 150, height: 150 }}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottieLoader;