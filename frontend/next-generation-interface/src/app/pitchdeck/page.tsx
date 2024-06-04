'use client';
// src/app/page.tsx
import React from 'react';
import Deck from './Deck';

const pitchdeck: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Deck />
    </main>
  );
};

export default pitchdeck;