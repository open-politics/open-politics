export default function ChatPage() {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-auto">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm">Welcome to the chat!</p>
              </div>
              {/* Placeholder messages */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <p className="text-sm">Message {i + 1}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 rounded-md border px-3 py-2"
              />
              <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }