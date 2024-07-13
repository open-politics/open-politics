import React from 'react';
import Image from 'next/image';
import ArticleCard from './ArticleCard';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

const Results: React.FC<{ results: any, summary?: string }> = ({ results, summary }) => {
  const [showArticles, setShowArticles] = React.useState(true);

  if (!results) {
    return null;
  }

  const preprocessMarkdown = (markdown: string) => {
    return markdown.replace(/\n/g, '  \n'); // Add two spaces at the end of each line
  };

  return (
    <div className="bg-opacity-20 backdrop backdrop-blur-lg w-full rounded-lg p-4 mb-16 overflow-x-hidden">
      <h2 className="text-xl mb-2">Articles & Summary</h2>
      <Button className='my-2 mb-3' variant="outline" onClick={() => setShowArticles(!showArticles)}>
        {showArticles ? 'Hide' : 'Show'}
      </Button>
      <div className="flex flex-col h-full">
        {showArticles && summary && (
          <div className="flex-none mb-4 overflow-auto max-h-96">
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>{preprocessMarkdown(summary)}</ReactMarkdown>
          </div>
        )}
        {showArticles && (
          <div className="flex-grow overflow-auto max-w-screen overflow-x-hidden">
            {results.images && results.images.length > 0 && (
              <div className="flex overflow-x-auto space-x-4 mb-4 pb-2">
                {results.images.map((image: string, index: number) => (
                  <Popover key={index}>
                    <PopoverTrigger>
                      <Image src={image} alt={`Image ${index + 1}`} width={96} height={96} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <a href={image} target="_blank" rel="noopener noreferrer">
                        <Image src={image} alt={`Image ${index + 1}`} width={256} height={256} className="w-64 h-64 object-cover rounded-md" />
                      </a>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            )}
            <div className="max-h-[28rem] overflow-y-auto overflow-x-hidden pb-4">
              {results.results && results.results.map((result: any, index: number) => (
                <ArticleCard
                  className={index === 0 ? 'first-article' : ''}
                  key={index}
                  title={result.title}
                  description={result.content.length > 300 ? `${result.content.substring(0, 300)}...` : result.content}
                  image={result.image}
                  url={result.url}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;