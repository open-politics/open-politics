'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

interface TypeAsyncProps {
  words: string[];
}

const TypeAsync: React.FC<TypeAsyncProps> = ({ words = [] }) => {
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const type = async (word: string) => {
      for (let i = 0; i <= word.length; i++) {
        setText(word.slice(0, i));
        await sleep(100); // Set your typing interval here
      }
    };

    const del = async (word: string) => {
      for (let i = word.length; i >= 0; i--) {
        setText(word.slice(0, i));
        await sleep(50); // Set your deleting interval here
      }
    };

    const runTypeAsync = async () => {
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        setTyping(true);
        await type(word);
        await sleep(2000); // Pause after typing the word
        setTyping(false);
        if (i < words.length - 1) {
          await del(word);
          await sleep(500); // Pause after deleting the word
        }
      }
    };

    if (words.length > 0) {
      runTypeAsync();
    }
  }, [words]);

  return <span style={{ letterSpacing: '0.1em' }} dangerouslySetInnerHTML={{ __html: text }} />;
};

interface HiProps {
  user?: {
    name: string;
    groups: string[];
  };
}

const HomePage: React.FC<HiProps> = () => {
  const words = ['looking', 'researching', 'rooting', 'developing', 'asking', '']; 

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center mb-8">
      {/* <div className="text-sm text-gray-500 sticky top-16 left-0 p-2 z-50 w-full">
        <p>Public Maintenance Notice: Scheduled downtime on July 13, 2024</p>
      </div> */}
        <h1 className="text-4xl md:text-6xl font-bold leading-none dark:text-white">
          <div className="flex flex-col items-center">
            <span style={{ letterSpacing: '0.1em' }}>What are you</span>
            <div className="flex items-center">
              <span id="shimmer-ast" className="shimmer mt-2" style={{ letterSpacing: '0.1em' }}>*</span>
              <TypeAsync words={words} />
            </div>
            <span className="" style={{ letterSpacing: '0.1em' }}>for?</span>
          </div>
        </h1>
      </div>

      <div className="mt-2 text-center">
        <p className="text-blue-500 font-bold mb-3">Next-gen political analysis for everyone.</p>
        {/* <p className="mb-3 font-bold">Navigate news with next-gen tools.</p> */}

        <div className="space-x-2">
          <Button asChild variant="outline" className="border border-blue-500">
            <Link href="https://github.com/JimVincentW/open-politics">
              Project on GitHub
            </Link>
          </Button>
          <Button asChild>
            <Link href="https://zu61ygkfc3v.typeform.com/to/KHZeedk3">
              Join the waitlist
            </Link>
          </Button>
        </div>
      </div>

      <style jsx>{`
        .shimmer {
          display: inline-block;
          animation: shimmer 2s infinite linear;
        }

        @keyframes shimmer {
          0% { color: red; }
          20% { color: orange; }
          40% { color: yellow; }
          60% { color: green; }
          80% { color: blue; }
          100% { color: violet; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;