// open-politics/frontend/src/components/ChatWithContext.tsx

import React, { useContext, useState } from 'react';
import { ArticleSelectionContext } from '@/contexts/ArticleSelectionContext';
import { generateSummaryFromArticles } from '@/app/actions';
import { readStreamableValue } from 'ai/rsc';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

export const ChatWithContext: React.FC = () => {
  const { selectedArticles } = useContext(ArticleSelectionContext);
  const [conversation, setConversation] = useState<string>('');

  const handleStartChat = async () => {
    if (selectedArticles.length === 0) return;

    const { output } = await generateSummaryFromArticles(selectedArticles, [], 'Your Analysis Type');
    let fullSummary = '';
    for await (const delta of readStreamableValue(output)) {
      fullSummary += delta;
      setConversation(fullSummary);
    }
  };

  return (
    <div className="chat-with-context">
      <Button onClick={handleStartChat} disabled={selectedArticles.length === 0}>
        Start Chat with Selected Articles
      </Button>

      {conversation && (
        <div className="conversation">
          <ReactMarkdown>{conversation}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};