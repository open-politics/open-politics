'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

const Pitchdeck: React.FC = () => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/other/deck_v3.pdf';
    link.download = 'deck_v3.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <Button onClick={handleDownload}>
        Download Pitch Deck
      </Button>
    </main>
  );
};

export default Pitchdeck;
