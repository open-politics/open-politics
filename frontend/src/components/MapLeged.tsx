import React from 'react';

const event_types = [
    { type: "Article", emoji: "🌍", color: "#00cccc" }, // Darker Green
    { type: "Elections", emoji: "🗳️", color: "#4CAF50" }, // Darker Green
    { type: "Protests", emoji: "✊", color: "#2196F3" }, // Darker Blue
    { type: "Economic", emoji: "💰", color: "#FF9800" }, // Darker Orange
    // { type: "Legal", emoji: "⚖️", color: "#FFFF00" }, // Yellow
    { type: "Social", emoji: "👥", color: "#E91E63" }, // Darker Pink
    { type: "Crisis", emoji: "🚨", color: "#F44336" }, // Darker Red
    { type: "War", emoji: "⚔️", color: "#FF5722" }, // Darker Orange-Red
    { type: "Peace", emoji: "☮️", color: "#9C27B0" }, // Darker Purple
    // { type: "Diplomacy", emoji: "🤝", color: "#008000" }, // Dark Green
    // { type: "Technology", emoji: "💻", color: "#FFC0CB" }, // Pink
    // { type: "Science", emoji: "🔬", color: "#A52A2A" }, // Brown
    // { type: "Culture", emoji: "🎨", color: "#FFD700" }, // Gold
    // { type: "Sports", emoji: "⚽", color: "#000000" }  // Black
];

const MapLeged = () => {
  return (
    <div className="p-4">
      <h4 className="text-xl font-bold">Events on the Globe</h4>
      <div className="flex flex-col">
        {event_types.map((event) => (
          <div key={event.type} className="flex items-center mb-2">
            <span className="w-4 h-4 inline-block mr-2" style={{ backgroundColor: event.color }}></span>
            <span>{event.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLeged;
