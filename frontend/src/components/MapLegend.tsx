import React from 'react';

const event_types = [
    { type: "Article", emoji: "🌍", color: "#00cccc", text: "" },
    { type: "Elections", emoji: "🗳️", color: "#4CAF50", text: "X" },
    { type: "Protests", emoji: "✊", color: "#2196F3", text: "\/" },
    { type: "Economic", emoji: "💰", color: "#FF9800", text: "$" },
    { type: "Social", emoji: "👥", color: "#E91E63", text: "O" },
    { type: "Crisis", emoji: "🚨", color: "#F44336", text: "!!" },
    { type: "War", emoji: "⚔️", color: "#FF5722", text: "<>" },
];

const MapLegend = () => {
  return (
    <div className="fixed top-1/4 left-4 p-4 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg z-20">
      <h4 className="text-xl font-bold text-black dark:text-gray-200 mb-2">Events on the Globe</h4>
      <div className="grid grid-cols-2 gap-4">
        {event_types.map((event) => (
          <div key={event.type} className="flex items-center mb-2">
            <span className="w-4 h-4 inline-block mr-2 rounded-full" style={{ backgroundColor: event.color }}></span>
            <span className="font-semibold text-black dark:text-gray-200">{event.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;