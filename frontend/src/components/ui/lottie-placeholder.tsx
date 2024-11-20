import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';


const LottiePlaceholder: React.FC = () => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/animations/lottie-globe.lottie')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(err => {
        console.error('Error loading animation:', err);
        setError('Failed to load animation');
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!animationData) {
    return <div>Loading...</div>;
  }

  return (
    <Lottie
      animationData={animationData}
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default LottiePlaceholder;