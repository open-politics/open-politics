// store/useFocusStore.ts

import { create } from 'zustand';

interface FocusState {
  focusType: 'entity' | 'country' | 'article' | 'coordinate' | null;
  focusData: any;
  setFocus: (focusType: FocusState['focusType'], focusData: any) => void;
  clearFocus: () => void;
}

export const useFocusStore = create<FocusState>((set) => ({
  focusType: null,
  focusData: null,
  setFocus: (focusType, focusData) => set({ focusType, focusData }),
  clearFocus: () => set({ focusType: null, focusData: null }),
}));
