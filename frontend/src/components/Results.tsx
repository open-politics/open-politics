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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="flex flex-col h-full bg-opacity-20 backdrop-blur-lg w-full rounded-lg p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl">Articles & Summary</h2>
        <Button 
          className="px-2 py-1 text-xs" 
          variant="outline" 
          onClick={() => setShowArticles(!showArticles)}
        >
          {showArticles ? 'Hide' : 'Show'}
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        {showArticles && summary && (
          <div className="flex-none mb-4 overflow-auto max-h-96 prose prose-invert max-w-none rounded-md p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <ReactMarkdown 
              components={MarkdownComponents}
              remarkPlugins={[remarkGfm]}
            >
              {summary}
            </ReactMarkdown>
          </div>
        )}
        {showArticles && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Results</TabsTrigger>
              <TabsTrigger value="tavily">Tavily Results</TabsTrigger>
              <TabsTrigger value="ssare">SSARE Results</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="flex-grow overflow-auto max-h-[600px] overflow-y-auto max-w-full rounded-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Render all results here */}
                {renderAllResults(tavilyResults, ssareResults)}
              </div>
            </TabsContent>
            <TabsContent value="tavily">
              <div className="flex-grow overflow-auto max-h-[600px] overflow-y-auto max-w-full rounded-md p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Render Tavily results here */}
                {renderTavilyResults(tavilyResults)}
              </div>
            </TabsContent>
            <TabsContent value="ssare">
              <div className="flex-grow overflow-auto max-h-[600px] overflow-y-auto max-w-full rounded-md p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* Render SSARE results here */}
                {renderSsareResults(ssareResults)}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

// Helper functions to render results
const renderAllResults = (tavilyResults: any, ssareResults: ArticleCardProps[]) => (
  <>
    {renderTavilyResults(tavilyResults)}
    {renderSsareResults(ssareResults)}
  </>
);

const renderTavilyResults = (tavilyResults: any) => (
  <>
    {tavilyResults.images && tavilyResults.images.length > 0 && (
      <div className="flex overflow-x-auto space-x-4 mb-4 pb-2">
        {/* ... existing image rendering code ... */}
      </div>
    )}
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
  </>
);

const renderSsareResults = (ssareResults: ArticleCardProps[]) => (
  <>
    <h3 className="text-lg font-semibold mt-4 mb-2">SSARE Results</h3>
    {ssareResults && ssareResults.map((result: ArticleCardProps) => (
      <ArticleCard
        key={`ssare-${result.id}`}
        {...result}
      />
    ))}
  </>
);

export default Results;