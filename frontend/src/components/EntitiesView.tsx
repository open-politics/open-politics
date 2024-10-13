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

interface LeaderInfo {
  state?: string;
  headOfState?: string;
  headOfStateImage?: string | null;
  headOfGovernment?: string;
  headOfGovernmentImage?: string | null;
}

interface EntitiesViewProps {
  leaderInfo: LeaderInfo | null;
  entities: Entity[];
}

const EntitiesView: React.FC<EntitiesViewProps> = ({ leaderInfo, entities }) => {
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>(['PERSON']);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const toggleEntityType = (type: string) => {
    setSelectedEntityTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="space-y-8 max-h-[80vh] overflow-y-auto">
      
      {/* Display leader information if available */}
      {leaderInfo && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {leaderInfo.headOfState && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-600 font-bold rounded-full w-18">
                National State
              </Badge>
              <Avatar className="w-12 h-12">
                <AvatarImage src={leaderInfo.headOfStateImage || undefined} alt={leaderInfo.headOfState} style={{ objectFit: 'cover' }} />
                <AvatarFallback>{leaderInfo.headOfState.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Head of State</p>
                <p className="text-xs">{leaderInfo.headOfState}</p>
              </div>
            </div>
          )}
          {leaderInfo.headOfGovernment && (
            <div className="flex items-center space-x-2">
              <Avatar className="w-12 h-12">
                <AvatarImage src={leaderInfo.headOfGovernmentImage || undefined} alt={leaderInfo.headOfGovernment} style={{ objectFit: 'cover' }} />
                <AvatarFallback>{leaderInfo.headOfGovernment.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Head of Government</p>
                <p className="text-xs">{leaderInfo.headOfGovernment}</p>
              </div>
            </div>
          )}
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
