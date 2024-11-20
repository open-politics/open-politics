import React from 'react'
import { History } from './history'
import { HistoryList } from './history-list'

type HistoryContainerProps = {
  location: 'sidebar' | 'header'
  userId: string | null
}

const HistoryContainer: React.FC<HistoryContainerProps> = async ({
  location,
  userId
}) => {
  return (
    <div
      className={location === 'header' ? 'block sm:hidden' : 'hidden sm:block'}
    >
      <History location="sidebar">
        <HistoryList userId={userId} />
      </History>
    </div>
  )
}

export default HistoryContainer
