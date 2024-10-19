import React from 'react';

const event_types = [
    { type: "Elections", emoji: "🗳️", color: "#4CAF50", text: "X" },
    { type: "Protests", emoji: "✊", color: "#2196F3", text: "\/" },
    { type: "Economic", emoji: "💰", color: "#FF9800", text: "$" },
    { type: "Social", emoji: "👥", color: "#E91E63", text: "O" },
    { type: "Crisis", emoji: "🚨", color: "#F44336", text: "!!" },
    { type: "War", emoji: "⚔️", color: "#FF5722", text: "<>" },
];

const MapLegend = () => {
  return (
    <div className="fixed top-1/4 left-8 p-2 bg-white dark:bg-black bg-opacity-70 dark:bg-opacity-70 backdrop-blur-sm rounded-md shadow-md z-20">
      <h4 className="text-lg font-semibold text-black dark:text-gray-300 mb-1">Events</h4>
      <div className="grid grid-cols-2 gap-2">
        {event_types.map((event) => (
          <div key={event.type} className="flex items-center mb-1">
            <span className="w-3 h-3 inline-block mr-1 rounded-full" style={{ backgroundColor: event.color }}></span>
            <span className="font-medium text-black dark:text-gray-300">{event.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;