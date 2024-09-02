import React from 'react';
import Image from 'next/image';
import ArticleCard, { ArticleCardProps } from './ArticleCard';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResultsProps {
  results: {
    tavilyResults: {
      images?: string[];
      results: any[];
    };
    ssareResults: ArticleCardProps[];
  };
  summary?: string;
}

const Results: React.FC<ResultsProps> = ({ results, summary }) => {
  const [showArticles, setShowArticles] = React.useState(true);

  if (!results) {
    return null;
  }

  const { tavilyResults, ssareResults } = results;

  const MarkdownComponents: object = {
    p: (paragraph: { children?: boolean; node?: any }) => {
      const { node } = paragraph;
      if (node.children[0].tagName === "img") {
        const image = node.children[0];
        return (
          <div className="image-wrapper">
            <img src={image.properties.src} alt={image.properties.alt} />
          </div>
        );
      }
      return <p className="mb-2">{paragraph.children}</p>;
    },
    h3: (props: any) => <h3 className="text-xl font-semibold mt-4 mb-2">{props.children}</h3>,
    ul: (props: any) => <ul className="list-disc pl-4 mb-2">{props.children}</ul>,
    ol: (props: any) => <ol className="list-decimal pl-4 mb-2">{props.children}</ol>,
    li: (props: any) => <li className="mb-1">{props.children}</li>,
  };

  return (
    <div className="bg-opacity-20 backdrop backdrop-blur-lg w-full rounded-lg p-4 mb-16 overflow-x-hidden">
      <h2 className="text-xl mb-2">Articles & Summary</h2>
      <Button className='my-2 mb-3' variant="outline" onClick={() => setShowArticles(!showArticles)}>
        {showArticles ? 'Hide' : 'Show'}
      </Button>
      <div className="flex flex-col h-full">
        {showArticles && summary && (
          <div className="flex-none mb-4 overflow-auto max-h-96 prose prose-invert max-w-none">
            <ReactMarkdown 
              components={MarkdownComponents}
              remarkPlugins={[remarkGfm]}
            >
              {summary}
            </ReactMarkdown>
          </div>
        )}
        {showArticles && (
          <div className="flex-grow overflow-auto max-w-full">
            {tavilyResults.images && tavilyResults.images.length > 0 && (
              <div className="flex overflow-x-auto space-x-4 mb-4 pb-2">
                {tavilyResults.images.map((image: string, index: number) => (
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
              <h3 className="text-lg font-semibold mb-2">Tavily Results</h3>
              {tavilyResults.results && tavilyResults.results.map((result: any, index: number) => (
                <ArticleCard
                  className={index === 0 ? 'first-article' : ''}
                  key={`tavily-${index}`}
                  id={`tavily-${index}`}
                  headline={result.title}
                  paragraphs={result.content.length > 300 ? `${result.content.substring(0, 300)}...` : result.content}
                  url={result.url}
                  source={result.url || 'Unknown'}
                  insertion_date={null}
                  entities={[]}
                  tags={[]}
                  classification={null}
                />
              ))}
              <h3 className="text-lg font-semibold mt-4 mb-2">SSARE Results</h3>
              {ssareResults && ssareResults.map((result: ArticleCardProps, index: number) => (
                <ArticleCard
                  key={`ssare-${result.id}`}
                  {...result}
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