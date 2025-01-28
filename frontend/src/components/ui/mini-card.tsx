import React from 'react';

interface CardItemProps {
  title: string;
  content: string;
}

const CardItem: React.FC<CardItemProps> = ({ title, content }) => {
  return (
    <div className="w-48 flex flex-col items-start gap-0.5 rounded-lg border p-1 text-left text-sm transition-all hover:bg-accent overflow-hidden">
      <div className="text-xs font-medium truncate w-full">{title}</div>
      <div className="text-xs text-muted-foreground line-clamp-1">
        {content}
      </div>
    </div>
  );
};

export default CardItem;