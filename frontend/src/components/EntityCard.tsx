import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useEntityImage from '@/hooks/useEntityImage';
import { useEntityData } from '@/hooks/useEntity';
import DotLoader from 'react-spinners/DotLoader';
import ArticleCard from './ArticleCard';
import WikipediaView from './WikipediaView';
import { Image as LucideImage } from 'lucide-react';

interface Entity {
  name: string;
  type: string;
  article_count: number;
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
  const { data, isLoading, error, fetchArticles, resetArticles } = useEntityData(entity.name, isSelected);

  useEffect(() => {
    if (isSelected) {
      resetArticles();
      fetchArticles(0, 20).then(() => {
        console.log(`Fetched articles for ${entity.name}`);
      }).catch((error) => {
        console.error(`Error fetching articles for ${entity.name}: ${error}`);
      });
    }
  }, [isSelected, fetchArticles, resetArticles]);

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
      <p className="text-sm">Article Count: {entity.article_count}</p>
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
          {isLoading.articles ? (
            <DotLoader size={50} />
          ) : error.articles ? (
            <p className="text-red-500">Error loading articles</p>
          ) : (
            data.articles.map((article) => (
              <ArticleCard
                key={article.url}
                {...article}
                paragraphs={article.paragraphs}
              />
            ))
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EntityCard;
