import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEntityData } from '@/hooks/useEntity';
import DotLoader from 'react-spinners/DotLoader';
import ArticlesView from './ArticlesView'; 
import ArticleCard from './ArticleCard'; 
import useEntityImage from '@/hooks/useEntityImage';

interface Entity {
  name: string;
  type: string;
  article_count: number;
  total_frequency: number;
  relevance_score: number;
}

interface EntitiesViewProps {
  leaderInfo: {
    state: string;
    headOfState: string;
    headOfStateImage: string | null;
    headOfGovernment: string;
    headOfGovernmentImage: string | null;
  };
  entities: Entity[];
}

const EntitiesView: React.FC<EntitiesViewProps> = ({ leaderInfo, entities }) => {
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>(['PERSON']);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const { data, isLoading, error, fetchArticles, resetArticles } = useEntityData(selectedEntity);

  const toggleEntityType = (type: string) => {
    setSelectedEntityTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  useEffect(() => {
    if (selectedEntity) {
      resetArticles();
      fetchArticles(0, 20);
    }
  }, [selectedEntity, fetchArticles, resetArticles]);

  return (
    <div className="space-y-8">
      <div className="leader-info md:pb-4 shadow-sm overflow-hidden">
        <h2 className="text-center text-xl font-bold mb-4">Head(s) of State</h2>
        <div className="flex justify-center space-x-4">
          {leaderInfo.headOfStateImage && (
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-24 h-24">
                <AvatarImage src={leaderInfo.headOfStateImage} alt={leaderInfo.headOfState} style={{ objectFit: 'cover', objectPosition: 'center' }} />
                <AvatarFallback>{leaderInfo.headOfState.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{leaderInfo.headOfState}</p>
            </div>
          )}
          {leaderInfo.headOfGovernmentImage && (
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-24 h-24">
                <AvatarImage src={leaderInfo.headOfGovernmentImage} alt={leaderInfo.headOfGovernment} style={{ objectFit: 'cover', objectPosition: 'center' }} />
                <AvatarFallback>{leaderInfo.headOfGovernment.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{leaderInfo.headOfGovernment}</p>
            </div>
          )}
        </div>
      </div>
      <div className="entities-info">
        <h2 className="text-center text-xl font-bold mb-4">Relevant Entities</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Select Entity Types</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Entity Types</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['PERSON', 'ORG', 'GPE', 'LOC', 'EVENT', 'PRODUCT', 'WORK_OF_ART', 'LAW', 'LANGUAGE', 'DATE', 'TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL'].map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={selectedEntityTypes.includes(type)}
                onCheckedChange={() => toggleEntityType(type)}
              >
                {type}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="h-1/2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {entities
            .filter((entity, index, self) => 
              index === self.findIndex((t) => (
                t.name === entity.name && t.type === entity.type
              ))
            )
            .filter(entity => selectedEntityTypes.includes(entity.type))
            .map((entity, index) => {
              const { imageUrl, loading } = useEntityImage(entity.name);
              return (
                <div key={index} className="cursor-pointer" onClick={() => setSelectedEntity(entity.name)}>
                  <h3 className="font-bold">{entity.name}</h3>
                  {loading ? (
                    <p>Loading image...</p>
                  ) : imageUrl ? (
                    <img src={imageUrl} alt={entity.name} className="rounded-full w-24 h-24 object-cover" />
                  ) : (
                    <p>No image available</p>
                  )}
                  <p className="text-sm text-gray-600">Type: {entity.type}</p>
                  <p className="text-sm">Article Count: {entity.article_count}</p>
                  <p className="text-sm">Total Frequency: {entity.total_frequency}</p>
                  <p className="text-sm">Relevance Score: {entity.relevance_score.toFixed(2)}</p>
                </div>
              );
            })}
        </div>
      </div>
      {selectedEntity && (
        <div className="articles-info">
          <h2 className="text-center text-xl font-bold mb-4">Articles for {selectedEntity}</h2>
          {isLoading.articles ? (
            <div className="flex flex-col items-center justify-center h-full">
              <DotLoader color="#000" size={50} />
              <p className="mt-4">Loading articles...</p>
            </div>
          ) : data.articles.length > 0 ? (
            <div className="space-y-2">
              {data.articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  headline={article.headline}
                  paragraphs={article.paragraphs}
                  url={article.url}
                  source={article.source}
                  insertion_date={article.insertion_date}
                  entities={article.entities}
                  tags={article.tags}
                  classification={article.classification}
                />
              ))}
            </div>
          ) : (
            <p>No articles found for {selectedEntity}.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EntitiesView;
