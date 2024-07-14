// LeaderInfo.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface LeaderInfoProps {
  state: string;
  headOfState: string;
  headOfStateImage: string | null;
  headOfGovernment: string;
  headOfGovernmentImage: string | null;
}

const LeaderInfo: React.FC<LeaderInfoProps> = ({ state, headOfState, headOfStateImage, headOfGovernment, headOfGovernmentImage }) => {
  return (
    <div className="leader-info md:pb-4 shadow-sm overflow-hidden">
      <h2 className="text-center">Head(s) of State</h2>
      <div className="flex justify-center space-x-4">
        {headOfStateImage && (
          <div className="flex flex-col items-center space-y-2">
            <Avatar>
              <AvatarImage src={headOfStateImage} alt={headOfState} style={{ objectFit: 'cover', objectPosition: 'center' }} />
              <AvatarFallback>{headOfState.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm">{headOfState}</p>
          </div>
        )}
        {headOfGovernmentImage && (
          <div className="flex flex-col items-center space-y-2">
            <Avatar>
              <AvatarImage src={headOfGovernmentImage} alt={headOfGovernment} style={{ objectFit: 'cover', objectPosition: 'center' }} />
              <AvatarFallback>{headOfGovernment.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm">{headOfGovernment}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderInfo;
