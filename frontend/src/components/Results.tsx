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

// Add a new prop for the summary
const Results: React.FC<{ results: any, summary?: string }> = ({ results, summary }) => {
  const [showArticles, setShowArticles] = React.useState(true);
  const [showSummary, setShowSummary] = React.useState(true);

  if (!results) {
    return null;
  }
  const preprocessMarkdown = (markdown: string) => {
    return markdown.replace(/\n/g, '  \n'); // Add two spaces at the end of each line
  };

  const toggleArticles = () => {
    setShowArticles(!showArticles);
  };

  return (
    <div className="bg-opacity-20 backdrop backdrop-blur-lg w-full rounded-lg p-4 overflow-hidden">
      <h2 className="text-xl mb-2">Articles & Summary</h2>
      <Button className='my-2 mb-3' variant="outline" onClick={() => setShowArticles(!showArticles)}>
        {showArticles ? 'Hide' : 'Show'}
      </Button>
      {showArticles && (
        <div>
          {summary && <div className="p-4 m-2 ml-0 pl-2 h-48 h-auto max-h-96 overflow-auto"><ReactMarkdown remarkPlugins={[remarkBreaks]}>{preprocessMarkdown(summary)}</ReactMarkdown></div>}
        </div>
      )}
      {showArticles && (
        <div className="inner-content h-full overflow-auto">
          {results.images && results.images.length > 0 && (
            <div className="flex overflow-x-auto space-x-4 mb-4">
              {results.images.map((image: string, index: number) => (
                <Popover key={index}>
                  <PopoverTrigger>
                    <Image src={image} alt={`Image ${index + 1}`} width={128} height={128} className="w-32 h-32 object-cover rounded-md" />
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
          <div>
            {results.results && results.results.map((result: any, index: number) => (
              <ArticleCard
                className={index === 0 ? 'first-article' : ''}
                key={index}
                title={result.title}
                description={result.content.length > 400 ? `${result.content.substring(0, 400)}...` : result.content}
                image={result.image}
                url={result.url}
              />
            ))}
          </div>
        </div>
      )}
      <style jsx>{`
        .inner-content::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .inner-content {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .first-article {
          width: 100%;
          height: auto;
        }
        .summary-content {
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default Results;