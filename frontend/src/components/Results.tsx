import React, { useEffect, useState } from 'react';
import Image from 'next/image'; // Import Image from next/image
import { ContentCard, ContentCardProps } from './ContentCard'; // Update import
import EntitiesView from './EntitiesView'; // Import EntitiesView
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookMarkStore } from '@/hooks/useBookMarkStore'; // Import the bookmark store
import axios from 'axios'; // Import axios for API calls

interface ResultsProps {
  results: {
    tavilyResults?: {
      images?: string[];
      results: any[];
    };
    ssareResults: ContentCardProps[]; // Update type
  };
  summary?: string;
  includeSummary: boolean; // New prop for including summary
}

interface Entity {
  name: string;
  type: string;
  article_count: number;
  total_frequency: number;
  relevance_score: number;
}

const Results: React.FC<ResultsProps> = ({ results, summary, includeSummary }) => {
  const [showArticles, setShowArticles] = useState(true);
  const { addBookmark } = useBookMarkStore(); // Use the bookmark store
  const [entities, setEntities] = useState<Entity[]>([]); // State for entities

  useEffect(() => {
    // Fetch entities related to the articles
    const fetchEntities = async () => {
      try {
        const articleIds = results.ssareResults.map(article => article.id);
        const response = await axios.post('/api/v1/search/most_relevant_entities', { article_ids: articleIds });
        setEntities(response.data);
      } catch (error) {
        console.error('Error fetching entities:', error);
      }
    };

    if (results.ssareResults.length > 0) {
      fetchEntities();
    }
  }, [results.ssareResults]);

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

  const handleBookmarkAll = (articles: ContentCardProps[]) => {
    articles.forEach(article => {
      addBookmark({
        id: article.id,
        headline: article.title,
        paragraphs: article.text_content,
        url: article.url,
        source: article.source,
        insertion_date: article.insertion_date,
        entities: article.entities,
        tags: article.tags,
        classification: article.classification
      });
    });
  };

  return (
    <div className={`flex flex-col h-full bg-opacity-20 backdrop-blur-lg w-full rounded-lg p-4 overflow-y-auto ${!includeSummary ? 'grid-cols-1' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        {includeSummary ? <h2 className="p-4 pl-0">Articles & Summary</h2> : <h2 className="p-4 pl-0">Articles</h2>}
        <Button 
          className="px-2 py-1 text-xs" 
          variant="outline" 
          onClick={() => setShowArticles(!showArticles)}
        >
          {showArticles ? 'Hide' : 'Show'}
        </Button>
      </div>

      {/* Display Tavily Images */}
      {tavilyResults && tavilyResults.images && tavilyResults.images.length > 0 && (
        <div className="flex overflow-x-auto max-h-32 space-x-4 mb-4 pb-2">
          {tavilyResults.images.map((imageSrc: string, index: number) => (
            <a href={imageSrc} target="_blank" rel="noopener noreferrer" key={`tavily-image-link-${index}`}>
              <Image
                key={`tavily-image-${index}`}
                src={imageSrc}
                alt={`Tavily Image ${index}`}
                width={200}
                height={150}
                className="rounded-md"
              />
            </a>
          ))}
        </div>
      )}

      <div className="mb-2">
        <EntitiesView 
          entities={entities} 
          leaderInfo={null} 
          variant="compact" 
        />
      </div>
      <div className="flex-none mb-4 overflow-auto max-h-96 prose prose-invert max-w-none rounded-md p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {showArticles && includeSummary && summary && (
            <ReactMarkdown 
              components={MarkdownComponents}
              remarkPlugins={[remarkGfm]}
            >
              {summary}
          </ReactMarkdown>
        )}
      </div>

      <div className="flex-1 max-h-[50vh] overflow-y-auto">
        {showArticles && (
          <Tabs defaultValue="ssare" className="w-full h-full">
            <TabsList className="grid w-full grid-cols-2 gap-1">
              <TabsTrigger value="tavily" className="py-1">Tavily Results</TabsTrigger>
              <TabsTrigger value="ssare" className="py-1">SSARE Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tavily" className="h-full overflow-y-auto">
              <div className="flex-grow overflow-auto max-h-full overflow-y-auto max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {renderTavilyResults(tavilyResults)}
              </div>
            </TabsContent>

            <TabsContent value="ssare" className="h-full overflow-y-auto">
              <div className="flex-grow overflow-auto max-h-full overflow-y-auto max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
const renderAllResults = (tavilyResults: any, ssareResults: ContentCardProps[]) => (
  <>
    <div key="tavily-section">
      {renderTavilyResults(tavilyResults)}
    </div>
    <div key="ssare-section">
      {renderSsareResults(ssareResults)}
    </div>
  </>
);

const renderTavilyResults = (tavilyResults: any) => (
  <>
    <h3 className="text-lg font-semibold mb-2">Tavily Results</h3>
    {tavilyResults?.results?.map((result: any, index: number) => {
      // Create a unique ID using URL and index
      const uniqueId = `tavily-${index}-${encodeURIComponent(result.url)}`;
      
      const contentCardProps: ContentCardProps = {
        id: uniqueId,
        title: result.title || 'Untitled',  // Fallback for empty titles
        text_content: result.content || '',
        url: result.url,
        source: result.url,
        insertion_date: new Date().toISOString(),
        entities: [],
        tags: [],
        classification: null
      };

      return (
        <ContentCard
          key={uniqueId}
          {...contentCardProps}
          className={index === 0 ? 'first-article' : ''}
        />
      );
    })}
  </>
);

const renderSsareResults = (ssareResults: ContentCardProps[]) => (
  <>
    {ssareResults?.map((result: ContentCardProps, index: number) => {
      // Create a unique key using ID and index as fallback
      const uniqueKey = result.id ? 
        `ssare-${result.id}-${index}` : 
        `ssare-fallback-${index}-${encodeURIComponent(result.url || '')}`;
      
      return (
        <ContentCard
          key={uniqueKey}
          {...result}
        />
      );
    })}
  </>
);

export default Results;
