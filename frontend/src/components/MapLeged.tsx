import React from 'react';

const event_types = [
    { type: "Elections", emoji: "🗳️", color: "#39FF14" }, // Neon Green
    { type: "Protests", emoji: "✊", color: "#00FF00" }, // Green
    { type: "Economic", emoji: "💰", color: "#0000FF" }, // Blue
    // { type: "Legal", emoji: "⚖️", color: "#FFFF00" }, // Yellow
    { type: "Social", emoji: "👥", color: "#FF00FF" }, // Magenta
    { type: "Crisis", emoji: "🚨", color: "#000000" }, // Black
    { type: "War", emoji: "⚔️", color: "#FFA500" }, // Orange
    { type: "Peace", emoji: "☮️", color: "#800080" }, // Purple
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
