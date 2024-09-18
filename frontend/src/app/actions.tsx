'use server';

import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { ReactNode } from 'react';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent, CardFooter, CardDescription, CardHeader } from '@/components/ui/card';
import { generateText } from 'ai';
import ReactMarkdown from 'react-markdown';
import { Progress } from '@/components/ui/progress';
import { createStreamableUI } from 'ai/rsc';
import { createStreamableValue } from 'ai/rsc';
import { streamText } from 'ai';
import { ArticleCardProps } from '@/components/ArticleCard';

export interface ServerMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant';
  display: ReactNode;
}

export async function generateSummaryFromArticles(
  articles: ArticleCardProps[], 
  ssareArticles: ArticleCardProps[], 
  analysisType: string
) {
  const stream = createStreamableValue('');

  const combinedDescriptions = [
    ...articles.map(article => article.paragraphs.join(' ').slice(0, 650)),
    ...ssareArticles.map(article => article.paragraphs.join(' ').slice(0, 650)),
  ].join('\n\n');

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-4o'),
      prompt: `As a geopolitical analyst specializing in ${analysisType}, create a concise yet comprehensive report on recent global developments based on the following information:

${combinedDescriptions}

Your report should follow this structure:

# [Headline: Max 10 words]

**Key Takeaway:** [1-2 sentences]

⚠️ [Immediate concern related to ${analysisType}]
🌍 [Global impact from a ${analysisType} perspective]
🔮 [Future implication considering ${analysisType}]

## [Topic 1 relevant to ${analysisType}]
- Key points
- Balanced perspective
- Relevant data/statistics

## [Topic 2 relevant to ${analysisType}]
- Key points
- Balanced perspective
- Relevant data/statistics

## [Topic 3 relevant to ${analysisType}]
- Key points
- Balanced perspective
- Relevant data/statistics

Use professional language and Markdown for clean formatting. Focus on aspects most relevant to ${analysisType}. Begin immediately with the headline, omitting any introductory phrases.
`
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}


export async function continueConversation(input: string): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai('gpt-4o'),
    messages: [...history.get(), { role: 'user', content: input }],
    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: 'assistant', content },
        ]);
      }

      return <div>{content}</div>;
    },
    tools: {
      searchTavily: {
        description: 'Search data using Tavily API',
        parameters: z.object({
          query: z.string().describe('The search query'),
          searchDepth: z.string().default('basic').describe('Search depth: basic or advanced'),
          maxResults: z.number().default(5).describe('Maximum number of search results'),
        }),
        generate: async ({ query, searchDepth, maxResults }) => {
          history.done((messages: ServerMessage[]) => [
            ...messages,
            {
              role: 'assistant',
              content: `Searching Tavily for query: ${query}`,
            },
          ]);

          const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
            },
            body: JSON.stringify({
              api_key: process.env.TAVILY_API_KEY,
              query,
              search_depth: searchDepth,
              max_results: maxResults,
            }),
          });

          const data = await response.json();

          return (
            <div>
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Results for "{query}"</h2>
              <div className="flex flex-nowrap overflow-x-auto gap-4">
                {data.results.map((result: any, index: number) => (
                  <div key={index} className="min-w-full md:min-w-1/2 lg:min-w-1/3">
                    <Card>
                      <CardHeader>
                        <CardTitle>{result.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{result.content.substring(0, 200)}{result.content.length > 200 ? '...' : ''}</CardDescription>
                      </CardContent>
                      <CardFooter>
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                          Read more
                        </a>
                      </CardFooter>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            </div>
          );
        },
      },
      fetchReport: {
        description: 'Fetch a more detailed report using AI agents',
        parameters: z.object({
          query: z.string().describe('The query to search for. From the role of a journalist/ political analyst.'),
        }),
        generate: async ({query}) => {
          const url = new URL(`http://dev.open-politics.org/api/v1/search/report/${query}`);
          url.searchParams.append('query', query);
          const response = await fetch(url.toString(), {
            method: 'GET'
          });
          const data = await response.json();
          return (
            <div>
              <div className="h-96 overflow-hidden">
                <ReactMarkdown>{data.report}</ReactMarkdown>
              </div>
            </div>
          );
        }
      }
    },
  });

  return {
    id: nanoid(),
    role: 'assistant',
    display: result.value,
  };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});

