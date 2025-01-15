import HistoryContainer from '@/components/ui/SearchHistory'

export async function Sidebar() {
  return (
    <div className="h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 fixed top-0 right-0 flex-col justify-center pb-24 hidden sm:flex">
      <HistoryContainer location="sidebar" />
    </div>
  )
}
