import React, { useState } from 'react';
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

interface Entity {
  name: string;
  type: string;
  article_count: number;
  total_frequency: number;
  relevance_score: number;
}

interface LeaderInfoProps {
  leaderInfo: {
    state: string;
    headOfState: string;
    headOfStateImage: string | null;
    headOfGovernment: string;
    headOfGovernmentImage: string | null;
  };
  entities: Entity[];
}

const LeaderInfo: React.FC<LeaderInfoProps> = ({ leaderInfo, entities }) => {
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([
    'PERSON',
  ]);

  const toggleEntityType = (type: string) => {
    setSelectedEntityTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {entities
            .filter(entity => selectedEntityTypes.includes(entity.type))
            .map((entity, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold">{entity.name}</h3>
                <p className="text-sm text-gray-600">Type: {entity.type}</p>
                <p className="text-sm">Article Count: {entity.article_count}</p>
                <p className="text-sm">Total Frequency: {entity.total_frequency}</p>
                <p className="text-sm">Relevance Score: {entity.relevance_score.toFixed(2)}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderInfo;