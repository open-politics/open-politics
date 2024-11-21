// store/useGeoJsonStore.ts

import { create } from 'zustand';

export interface EventType {
  type: string;
  color: string;
  icon: string;
  geojsonUrl: string;
  isVisible: boolean;
  zIndex: number;
}

interface GeoJsonStoreState {
  eventTypes: EventType[];
  addEventType: (eventType: EventType) => void;
  removeEventType: (type: string) => void;
  toggleEventTypeVisibility: (type: string) => void;
  updateEventType: (type: string, newData: Partial<EventType>) => void;
}

export const useGeoJsonStore = create<GeoJsonStoreState>((set) => ({
  eventTypes: [
    {
      type: 'Protests',
      color: '#2196F3',
      icon: 'protest',
      geojsonUrl: '/api/v1/locations/geojson_events?event_type=Protests',
      isVisible: true,
      zIndex: 4,
    },
  ],
  addEventType: (eventType) =>
    set((state) => ({
      eventTypes: [...state.eventTypes, eventType],
    })),
  removeEventType: (type) =>
    set((state) => ({
      eventTypes: state.eventTypes.filter((eventType) => eventType.type !== type),
    })),
  toggleEventTypeVisibility: (type) =>
    set((state) => ({
      eventTypes: state.eventTypes.map((eventType) =>
        eventType.type === type
          ? { ...eventType, isVisible: !eventType.isVisible }
          : eventType
      ),
    })),
  updateEventType: (type, newData) =>
    set((state) => ({
      eventTypes: state.eventTypes.map((eventType) =>
        eventType.type === type ? { ...eventType, ...newData } : eventType
      ),
    })),
}));
