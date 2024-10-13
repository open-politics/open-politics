import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import EntityCard from './EntityCard'; // Import the new EntityCard component
import { Badge } from "@/components/ui/badge"; // Import the Badge component

interface Entity {
  name: string;
  type: string;
  article_count: number;
  total_frequency: number;
  relevance_score: number;
}

interface EntitiesViewProps {
  leaderInfo: {
    state?: string;
    headOfState?: string;
    headOfStateImage?: string | null;
    headOfGovernment?: string;
    headOfGovernmentImage?: string | null;
  } | null;
  entities: Entity[];
}

const EntitiesView: React.FC<EntitiesViewProps> = ({ leaderInfo, entities }) => {
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>(['PERSON', 'ORG', 'GPE']);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const toggleEntityType = (type: string) => {
    setSelectedEntityTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="space-y-8 max-h-[80vh] overflow-y-auto">
      {/* Display leader information if available */}
      {leaderInfo && (leaderInfo.headOfState || leaderInfo.headOfGovernment) && (
        <div className="leader-info md:pb-4 shadow-sm overflow-hidden">
          <h2 className="text-center text-xl font-bold mb-4">Head(s) of State</h2>
          <div className="flex justify-center space-x-4">
            {leaderInfo.headOfStateImage && (
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={leaderInfo.headOfStateImage} alt={leaderInfo.headOfState || 'Head of State'} style={{ objectFit: 'cover', objectPosition: 'center' }} />
                  <AvatarFallback>{leaderInfo.headOfState?.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{leaderInfo.headOfState}</p>
              </div>
            )}
            {leaderInfo.headOfGovernmentImage && (
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={leaderInfo.headOfGovernmentImage} alt={leaderInfo.headOfGovernment || 'Head of Government'} style={{ objectFit: 'cover', objectPosition: 'center' }} />
                  <AvatarFallback>{leaderInfo.headOfGovernment?.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{leaderInfo.headOfGovernment}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Display entities regardless of leader information */}
      <div className="entities-info">
        <h2 className="text-center text-xl font-bold mb-2">Relevant Entities</h2>
        
        {/* Badge List for Entity Types */}
        <div className="flex overflow-x-auto space-x-2 rounded-full">
          {['PERSON', 'ORG', 'GPE', 'LOC', 'EVENT', 'PRODUCT', 'WORK_OF_ART', 'LAW', 'LANGUAGE', 'DATE', 'TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL'].map((type) => (
            <Badge
              key={type}
              variant={selectedEntityTypes.includes(type) ? 'secondary' : 'outline'}
              className="cursor-pointer px-3 py-1"
              onClick={() => toggleEntityType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {entities
            .filter((entity, index, self) => 
              index === self.findIndex((t) => (
                t.name === entity.name && t.type === entity.type
              ))
            )
            .filter(entity => selectedEntityTypes.includes(entity.type))
            .map((entity) => (
              <EntityCard
                key={entity.name}
                entity={entity}
                isSelected={selectedEntity === entity.name}
                onSelect={(name) => setSelectedEntity(name)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default EntitiesView;
