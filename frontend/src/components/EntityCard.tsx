import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import useEntityImage from '@/hooks/useEntityImage';
import { useEntityData } from '@/hooks/useEntity';
import DotLoader from 'react-spinners/DotLoader';
import ContentCard from './ContentCard';
import WikipediaView from './WikipediaView';
import { Image as LucideImage } from 'lucide-react';
import { EntityScoresView } from './EntityScoresView';
import { format, parseISO } from 'date-fns';

interface Entity {
  name: string;
  type: string;
  content_count: number;
  total_frequency: number;
  relevance_score: number;
}

interface EntityCardProps {
  entity: Entity;
  isSelected: boolean;
  onSelect: (name: string | null) => void;
}

const EntityCard: React.FC<EntityCardProps> = ({ entity, isSelected, onSelect }) => {
  const { imageUrl, loading: imageLoading } = useEntityImage(entity.name);
  const { data, isLoading, error, fetchContents, resetContents, scoreData, isLoadingScores, fetchEntityScores } = useEntityData(entity.name, isSelected);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getContentDate = (content: any): Date | null => {
    const dateString = content.publication_date || content.insertion_date || content.created_at;
    if (!dateString) return null;
    
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const filteredContents = useMemo(() => {
    if (!selectedDate || !data.contents) return data.contents;

    const selectedDateTime = parseISO(selectedDate);
    return data.contents.filter(content => {
      const contentDate = getContentDate(content);
      if (!contentDate) return false;
      
      return format(contentDate, 'yyyy-MM-dd') === format(selectedDateTime, 'yyyy-MM-dd');
    });
  }, [data.contents, selectedDate]);

  useEffect(() => {
    if (isSelected) {
      resetContents();
      fetchContents(0, 20, selectedDate).then(() => {
        console.log(`Fetched contents for ${entity.name}${selectedDate ? ` on ${selectedDate}` : ''}`);
      }).catch((error) => {
        console.error(`Error fetching contents for ${entity.name}: ${error}`);
      });
    }
  }, [isSelected, selectedDate, fetchContents, resetContents]);

  const handleCardClick = () => {
    onSelect(isSelected ? null : entity.name);
  };

  const handleInteractiveElementClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDateSelect = (date: string) => {
    console.log('Selected date:', date);
    setSelectedDate(date);
    resetContents();
    fetchContents(0, 20, date);
  };

  return (
    <motion.div
      className={`relative cursor-pointer ${isSelected ? 'col-span-1 md:col-span-2 lg:col-span-3 p-6 border-2 border-blue-500 mx-auto' : 'mx-auto'}`}
      onClick={handleCardClick}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.2 }}
    >
      <h3 className="font-bold">{entity.name}</h3>
      {imageLoading ? (
        <p>Loading image...</p>
      ) : imageUrl ? (
        <img src={imageUrl} alt={entity.name} className="rounded-full w-24 h-24 object-cover mx-auto" />
      ) : (
        <div className="rounded-full w-24 h-24 flex items-center justify-center mx-auto">
          <LucideImage size={24} />
        </div>
      )}
      <p className="text-sm text-gray-600">Type: {entity.type}</p>
      <p className="text-sm">Content Count: {entity.content_count}</p>
      <p className="text-sm">Total Frequency: {entity.total_frequency}</p>
      <p className="text-sm">Relevance Score: {entity.relevance_score.toFixed(2)}</p>

      {isSelected && (
        <div className="mt-4" onClick={handleInteractiveElementClick}>
          <WikipediaView locationName={entity.name} />
        </div>
      )}
      
      {isSelected && (
        <div 
          onClick={handleInteractiveElementClick}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <EntityScoresView
            entity={entity.name}
            fetchEntityScores={fetchEntityScores}
            scoreData={scoreData}
            isLoading={isLoadingScores}
            onDateSelect={handleDateSelect}
          />
        </div>
      )}

      {isSelected && (
        <div className="articles-section max-h-[500px] overflow-y-auto" onClick={handleInteractiveElementClick}>
          <h4 className="text-center text-lg font-bold mb-2">
            Articles {selectedDate ? `for ${format(parseISO(selectedDate), 'MMM dd, yyyy')}` : ''}
          </h4>
          {isLoading.contents ? (
            <DotLoader size={50} />
          ) : error.contents ? (
            <p className="text-red-500">{error.contents}</p>
          ) : filteredContents.length === 0 ? (
            <p className="text-center text-gray-500">
              No articles found {selectedDate ? `for ${format(parseISO(selectedDate), 'MMM dd, yyyy')}` : ''}
            </p>
          ) : (
            filteredContents.map((content) => (
              <ContentCard
                key={content.url}
                {...content}
                text_content={content.text_content}
              />
            ))
          )}
        </div>
      )}

    </motion.div>
  );
};

export default EntityCard;
