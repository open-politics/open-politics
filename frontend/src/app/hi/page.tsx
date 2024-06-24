'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const TypeAsync = ({ words = [] }) => {
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const type = async (word) => {
      for (let i = 0; i <= word.length; i++) {
        setText(word.slice(0, i));
        await sleep(100); // Set your typing interval here
      }
    };

    const del = async (word) => {
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

  return <span dangerouslySetInnerHTML={{ __html: text }} />;
};

const Hi = ({ user }) => {
  const words = ['looking', 'researching', 'rooting', 'developing', 'asking']; // add your words here

  return (
    <div className="p-8">
      <div className="flex flex-col justify-center items-center h-screen" style={{ marginTop: '-2px' }}>
        <div className="text-center mb-4">
          <h1 className="text-6xl font-bold leading-none sd:mt-8" style={{ marginTop: '-8rem' }}>
            <div className="fixed-height">What are you</div>
            <div className="fixed-height flex justify-center">
              <span id="shimmer-ast" className="shimmer">*</span>
              <TypeAsync words={words} />
            </div>
            <div className="fixed-height">for?</div>
          </h1>
        </div>

        <div className="mt-2 mr-8 text-right">
          <p className="text-pink-600 font-bold mb-1">Rethinking News Analysis with Open Source & AI.</p>
          <p className="text-lg mt-1 mb-2">Navigate news with next-gen tools.</p>
          <p className="mt-1 mb-2">Come back soon for feature releases.</p>

          <div className="space-y-2 max-w-sm mx-auto mt-4">
            <Link href="https://github.com/JimVincentW/open-politics" className="inline-block bg-black text-white py-2 px-4 rounded-full border border-transparent hover:bg-white hover:text-black hover:border-black dark:hover:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-300 ease-in-out">
              Project on GitHub
            </Link>
            <Link href="https://zu61ygkfc3v.typeform.com/to/KHZeedk3" className="inline-block bg-black text-white py-2 px-4 rounded-full border border-transparent hover:bg-white hover:text-black hover:border-black dark:hover:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-300 ease-in-out">
              Join the waitlist
            </Link>

            {user && (
              <>
                <div className="mt-4">
                  <Link href="/news_home" className="inline-block bg-pink-600 text-white py-2 px-4 rounded-full border border-transparent hover:bg-white hover:text-black hover:border-black dark:bg-pink-600 dark:text-white dark:hover:bg-black dark:hover:text-white dark:hover:border-white transition-colors duration-300 ease-in-out">
                    Search News
                  </Link>
                </div>
                <div className="mt-4">
                  <Link href="/globe" className="inline-block bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl text-white py-2 px-4 rounded-full border border-transparent hover:bg-white hover:text-black hover:border-black dark:bg-pink-600 dark:text-white dark:hover:bg-black dark:hover:text-white dark:hover:border-white transition-colors duration-300 ease-in-out">
                    Open Globe
                  </Link>
                </div>
              </>
            )}

            {user && user.groups.includes("Dashboard Users") && (
              <div className="mt-4">
                <Link href="/dashboard" className="inline-block bg-blue-500 text-white py-2 px-4 rounded-full border border-transparent hover:bg-white hover:text-black hover:border-black dark:hover:border-white dark:bg-blue-500 dark:text-white dark:hover:bg-black dark:hover:text-white transition-colors duration-300 ease-in-out">
                  Dashboard
                </Link>
              </div>
            )}
          </div>
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

        .blinking-cursor {
          font-weight: bold;
          font-size: inherit; /* Match the font size of surrounding text */
          color: white;
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          from, to { color: transparent; }
          50% { color: white; }
        }

        .ast {
          display: inline-block;
        }

        .fixed-height {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default Hi;
