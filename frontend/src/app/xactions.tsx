'use server';

import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { ReactNode } from 'react';
import { nanoid } from 'nanoid';
import { createStreamableValue } from 'ai/rsc';
import { streamText } from 'ai';

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
  results: any,
  analysisType: string = 'general politics',
) {
  const stream = createStreamableValue('');

  // Safely extract articles from both sources
  const opolArticles = results?.opolResults?.contents || [];

  const combinedDescriptions = [
    // Handle opol results
    ...opolArticles.map((article: any) => {
      const content = article.paragraphs || article.content || '';
      return typeof content === 'string' ? content.slice(0, 650) : '';
    }),
  ]
    .filter(Boolean)
    .join('\n\n');

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-4o'),
      prompt: `
        You are a seasoned geopolitical analyst specializing in ${analysisType}. Based on the provided articles, generate a concise, insightful report suitable for a modern streaming markdown application.

        **Data:**
        ${combinedDescriptions}

        **Report Structure:**

        ### 🎯 Key Findings
        *   **Headline:** (Max 10 words, impactful)
        *   **Takeaway:** (1-2 sentence summary)
        *   **Urgent Concern:** ⚠️ (Related to ${analysisType})
        *   **Global Impact:** 🌍 (From a ${analysisType} perspective)
        *   **Future Outlook:** 🔮 (Implications considering ${analysisType})

        ### 🏛️ Analysis
        *   **Topic 1:** (Relevant to ${analysisType})
            *   Key points
            *   Balanced perspective
            *   Data/Statistics
        *   **Topic 2:** (Relevant to ${analysisType})
            *   Key points
            *   Balanced perspective
            *   Data/Statistics
        *   **Topic 3:** (Relevant to ${analysisType})
            *   Key points
            *   Balanced perspective
            *   Data/Statistics

        **Instructions:**

        *   Use professional language and Markdown for formatting.
        *   Focus on aspects directly relevant to ${analysisType}.
        *   Start immediately with the "Key Findings" section.
        *   If the provided data poorly matches the user's query, acknowledge the limitations and provide a brief overview of the available information.
        *   If the data allows for a reasonable report, proceed with the structured format.
        *   Recognize that one API returns general news data, while the other provides politically focused articles. Highlight political insights where possible.
        *   Maintain a neutral and objective perspective.
        `,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}

export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
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
      // fetchReport: {
      //   description: 'Fetch a more detailed report using AI agents',
      //   parameters: z.object({
      //     query: z.string().describe('The query to search for. From the role of a journalist/ political analyst.'),
      //   }),
      //   generate: async ({query}) => {
      //     const url = new URL(`http://dev.open-politics.org/api/v1/search/report/${query}`);
      //     url.searchParams.append('query', query);
      //     const response = await fetch(url.toString(), {
      //       method: 'GET'
      //     });
      //     const data = await response.json();
      //     return (
      //       <div>
      //         <div className="h-96 overflow-hidden">
      //           <ReactMarkdown>{data.report}</ReactMarkdown>
      //         </div>
      //       </div>
      //     );
      //   }
      // }
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
