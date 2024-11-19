import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import EntityCard from './EntityCard';
import { Badge } from "@/components/ui/badge"; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
interface Entity {
  id: string;
  name: string;
  entity_type: string;
  locations: any[];
  article_count?: number;
  total_frequency?: number;
  relevance_score?: number;
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
  entities: Entity[] | null;
  variant?: 'default' | 'compact';
}

const EntitiesView: React.FC<EntitiesViewProps> = ({ leaderInfo, entities, variant = 'default' }) => {
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>(['PER', 'ORG', 'GPE']);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const toggleEntityType = (type: string) => {
    setSelectedEntityTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  if (variant === 'compact') {
    return (
      <div className="space-y-2 border-none">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Key Entities</h3>
          <div className="flex space-x-1">
            {['PER', 'ORG', 'GPE'].map((type) => (
              <Badge
                key={type}
                variant={selectedEntityTypes.includes(type) ? 'ghost' : 'secondary'}
                className="cursor-pointer text-xs px-2 py-0.5 hover:bg-secondary/80"
                onClick={() => toggleEntityType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {entities && Array.isArray(entities) && entities
            .filter(entity => selectedEntityTypes.includes(entity.entity_type))
            .slice(0, 10)
            .map((entity) => (
              <Badge
                key={entity.name}
                variant="ghost"
                className="text-xs"
              >
                {entity.name}
              </Badge>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full overflow-y-auto">
      {leaderInfo && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {leaderInfo.headOfState && (
            <div className="flex items-center space-x-2">
              <Badge variant="ghost" className="text-green-600 font-bold border-none rounded-full w-18">
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
      <div className="entities-info space-y-4">
        <div>
          <h2 className="text-sm font-medium mb-2">Filter Entities</h2>
          <div className="flex flex-wrap gap-1">
            <div className="flex flex-wrap gap-1">
              {['PER', 'ORG', 'GPE', 'LOC'].map((type) => (
                <Badge
                key={type}
                variant={selectedEntityTypes.includes(type) ? 'ghost' : 'secondary'} 
                className="cursor-pointer text-xs px-2 py-0.5 hover:bg-secondary/80"
                onClick={() => toggleEntityType(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
            <Popover>
              {/* <PopoverTrigger asChild>
                <Badge variant="ghost" className="cursor-pointer text-xs px-2 py-0.5">
                  More...
                </Badge>
              </PopoverTrigger> */}
              <PopoverContent className="w-48 z-50">
                <div className="flex flex-wrap gap-1">
                  {['EVENT', 'PRODUCT', 'WORK_OF_ART', 'LAW', 'LANGUAGE', 'DATE', 'TIME', 'PERCENT', 'MONEY', 'QUANTITY', 'ORDINAL', 'CARDINAL'].map((type) => (
                    <Badge
                      key={type}
                      variant={selectedEntityTypes.includes(type) ? 'secondary' : 'outline'}
                      className="cursor-pointer text-xs px-2 py-0.5"
                      onClick={() => toggleEntityType(type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 h-full overflow-y-auto">
          {entities && entities
            .filter((entity, index, self) => 
              index === self.findIndex((t) => (
                t.name === entity.name && t.entity_type === entity.entity_type
              ))
            )
            .filter(entity => selectedEntityTypes.includes(entity.entity_type))
            .map((entity) => (
              <EntityCard
                key={entity.name}
                entity={entity}
                isSelected={selectedEntity === entity.name}
                onSelect={(name) => setSelectedEntity(name)}
                className="mx-auto"
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default EntitiesView;
