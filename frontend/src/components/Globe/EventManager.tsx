// components/Globe/EventManager.tsx

import React, { useState } from 'react';
import { useGeoJsonStore, EventType } from '@/store/useGeoJsonStore';

const EventManager: React.FC = () => {
  const addEventType = useGeoJsonStore((state) => state.addEventType);
  const removeEventType = useGeoJsonStore((state) => state.removeEventType);
  const toggleEventTypeVisibility = useGeoJsonStore((state) => state.toggleEventTypeVisibility);
  const updateEventType = useGeoJsonStore((state) => state.updateEventType);
  const eventTypes = useGeoJsonStore((state) => state.eventTypes);

  const [newEventType, setNewEventType] = useState<EventType>({
    type: '',
    color: '#FF0000',
    icon: '',
    geojsonUrl: '',
    isVisible: true,
    zIndex: 1,
  });

  const handleAddEventType = () => {
    if (
      newEventType.type &&
      newEventType.color &&
      newEventType.icon &&
      newEventType.geojsonUrl
    ) {
      addEventType(newEventType);
      // Reset the form
      setNewEventType({
        type: '',
        color: '#FF0000',
        icon: '',
        geojsonUrl: '',
        isVisible: true,
        zIndex: 1,
      });
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="event-manager">
      <h2>Add New Event Type</h2>
      <div className="form-group">
        <label>
          Event Type:
          <input
            type="text"
            value={newEventType.type}
            onChange={(e) => setNewEventType({ ...newEventType, type: e.target.value })}
            placeholder="Enter event type"
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Color:
          <input
            type="color"
            value={newEventType.color}
            onChange={(e) => setNewEventType({ ...newEventType, color: e.target.value })}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Icon Name:
          <input
            type="text"
            value={newEventType.icon}
            onChange={(e) => setNewEventType({ ...newEventType, icon: e.target.value })}
            placeholder="Enter icon name"
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          GeoJSON URL:
          <input
            type="text"
            value={newEventType.geojsonUrl}
            onChange={(e) => setNewEventType({ ...newEventType, geojsonUrl: e.target.value })}
            placeholder="Enter GeoJSON URL"
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Z-Index:
          <input
            type="number"
            value={newEventType.zIndex}
            onChange={(e) =>
              setNewEventType({ ...newEventType, zIndex: parseInt(e.target.value, 10) })
            }
            placeholder="Enter z-index"
          />
        </label>
      </div>
      <button onClick={handleAddEventType}>Add Event Type</button>

      <h2>Manage Event Types</h2>
      <ul className="event-type-list">
        {eventTypes.map((eventType) => (
          <li key={eventType.type} className="event-type-item">
            <span style={{ color: eventType.color }}>{eventType.type}</span>
            <button onClick={() => toggleEventTypeVisibility(eventType.type)}>
              {eventType.isVisible ? 'Hide' : 'Show'}
            </button>
            <button onClick={() => removeEventType(eventType.type)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventManager;
