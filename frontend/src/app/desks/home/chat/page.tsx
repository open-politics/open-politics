import { Chat } from '@/components/chat'
import { generateId } from 'ai'
import { AI } from '@/app/actions'

export const maxDuration = 60

export default function Page() {
  const id = generateId()
  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <div className="h-full overflow-y-auto">
        <Chat id={id} />
      </div>
    </AI>
  )
}