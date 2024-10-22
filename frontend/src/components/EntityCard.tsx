import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useEntityImage from '@/hooks/useEntityImage';
import { useEntityData } from '@/hooks/useEntity';
import DotLoader from 'react-spinners/DotLoader';
import ContentCard from './ContentCard';
import WikipediaView from './WikipediaView';
import { Image as LucideImage } from 'lucide-react';

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
  const { data, isLoading, error, fetchContents, resetContents } = useEntityData(entity.name, isSelected);

  useEffect(() => {
    if (isSelected) {
      resetContents();
      fetchContents(0, 20).then(() => {
        console.log(`Fetched contents for ${entity.name}`);
      }).catch((error) => {
        console.error(`Error fetching contents for ${entity.name}: ${error}`);
      });
    }
  }, [isSelected, fetchContents, resetContents]);

  const handleCardClick = () => {
    onSelect(isSelected ? null : entity.name);
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
        <div className="mt-4">
          <WikipediaView locationName={entity.name} />
        </div>
      )}

      {isSelected && (
        <div className="articles-section max-h-[500px] overflow-y-auto">
          <h4 className="text-center text-lg font-bold mb-2">Articles</h4>
          {isLoading.contents ? (
            <DotLoader size={50} />
          ) : error.contents ? (
            <p className="text-red-500">Error loading articles</p>
          ) : (
            data.contents.map((content) => (
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
