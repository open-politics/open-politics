'use client';

import { useState } from 'react';
import { ClientMessage } from '../actions';
import { useActions, useUIState } from 'ai/rsc';
import { nanoid } from 'nanoid';
import { getWeather } from '../actions';

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState<ClientMessage[]>([]);
  const { continueConversation } = useActions();
  const [weather, setWeather] = useState<string | null>(null);

  return (
    <div>
      <div className="max-w-lg mx-auto my-4 p-4 border rounded-lg shadow-lg overflow-hidden">
        <div className="h-auto overflow-y-auto">
          {conversation.map((message: ClientMessage) => (
            <div key={message.id} className="p-2">
              <span className="font-semibold">{message.role}:</span> {message.display}
            </div>
          ))}
        </div>

        <div className="flex mt-4">
          <input
            type="text"
            value={input}
            onChange={event => setInput(event.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={async () => {
              setConversation((currentConversation: ClientMessage[]) => [
                ...currentConversation,
                { id: nanoid(), role: 'user', display: input },
              ]);

              const message = await continueConversation(input);

              setConversation((currentConversation: ClientMessage[]) => [
                ...currentConversation,
                message,
              ]);

              setInput(''); // Clear input after sending
            }}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send Message
          </button>
        </div>
  );
}
