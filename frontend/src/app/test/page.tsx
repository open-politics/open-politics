'use client';

import { useState } from 'react';
import { ClientMessage } from './actions';
import { useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4 mb-6">
        {conversation.map((message: ClientMessage) => (
          <div key={message.id} className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <span className="font-bold">{message.role}: </span>
            <span>{message.display}</span>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={async () => {
            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              { id: generateId(), role: 'user', display: input },
            ]);

            const message = await continueConversation(input);

            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              message,
            ]);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Send Message
        </button>
      </div>
    </div>
  );
}