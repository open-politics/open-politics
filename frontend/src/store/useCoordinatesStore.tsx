import { create } from 'zustand';

interface CoordinatesState {
  longitude: number | null;
  latitude: number | null;
  setCoordinates: (longitude: number, latitude: number) => void;
}

export const useCoordinatesStore = create<CoordinatesState>((set) => ({
  longitude: null,
  latitude: null,
  setCoordinates: (longitude, latitude) => set({ longitude, latitude }),
}));