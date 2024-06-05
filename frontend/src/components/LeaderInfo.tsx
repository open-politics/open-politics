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
    <div className="leader-info fixed bottom-0 inset-x-0 mx-auto w-full max-w-xs bg-black bg-opacity-30 backdrop backdrop-blur-xl rounded-t-xl p-4 text-gray-50 shadow-sm overflow-hidden">
      <h2 className="text-xl text-center font-semibold mb-2">Head(s) of State</h2>
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
