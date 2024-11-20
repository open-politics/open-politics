import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchHistoriesService } from '@/hooks/search/search-history-service';
import type { SearchHistory } from '@/lib/types';

const HistoryList: React.FC<{ userId: number | undefined }> = ({ userId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['search_histories', userId],
    queryFn: async () => {
      if (!userId) return { data: [], count: 0 };
      return await SearchHistoriesService.list();
    },
    enabled: !!userId, // Only run query if userId is available
  });

  if (isLoading) return <div>Loading search history...</div>;
  if (error) return <div>Error loading search history.</div>;

  return (
    <div>
      <h2>Your Search History</h2>
      <ul>
        {data?.data.map((history: SearchHistory) => (
          <li key={history.id}>
            <span>{history.query}</span> - <span>{new Date(history.timestamp).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryList;
