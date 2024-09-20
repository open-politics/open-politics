import React from 'react';

const event_types = [
    { type: "Article", emoji: "🌍", color: "#00cccc", text: "" }, // Changed text to empty for Article
    { type: "Elections", emoji: "🗳️", color: "#4CAF50", text: "X" },
    { type: "Protests", emoji: "✊", color: "#2196F3", text: "\/" },
    { type: "Economic", emoji: "💰", color: "#FF9800", text: "$" },
    { type: "Social", emoji: "👥", color: "#E91E63", text: "O" },
    { type: "Crisis", emoji: "🚨", color: "#F44336", text: "!!" },
    { type: "War", emoji: "⚔️", color: "#FF5722", text: "<>" },
];
  
const MapLeged = () => {
  return (
    <div className="p-4 bg-transparent backdrop-blur-lg rounded-lg shadow-lg">
      <h4 className="text-xl font-bold text-black dark:text-gray-200">Events on the Globe</h4>
      <div className="grid grid-cols-2 gap-4 mt-2">
        {event_types.map((event) => (
          <div key={event.type} className="flex items-center mb-2">
            <span className="text-2xl mr-2" style={{ color: event.color }}>{event.emoji}</span>
            <span className="font-semibold text-black dark:text-gray-200">{event.type}</span>
            <span className="w-4 h-4 inline-block mr-2"></span>
            {event.type === "Article" ? (
              <span className="w-6 h-6 inline-block mr-2 rounded-full opacity-75" style={{ backgroundColor: "#ff0000" }}></span>
            ) : (
              <span className="italic text-black dark:text-gray-200">{event.text}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLeged;
