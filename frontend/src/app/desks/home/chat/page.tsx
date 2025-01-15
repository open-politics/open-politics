import { Chat } from '@/components/ui/chat'
import { generateId } from 'ai'
import { AI } from '@/app/actions'

export const maxDuration = 60

export default function Page() {
  const id = generateId()
  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <div className="h-full flex flex-col">
        <div className="flex-1 max-h-screen overflow-y-auto">
          <Chat id={id} />
        </div>
      </div>
    </AI>
  )
}