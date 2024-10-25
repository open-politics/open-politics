import { create } from 'zustand';

interface SpatialTopicTag {
  id: string;
  label: string;
  icon?: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
}

interface SpatialTopicTagsStore {
  tags: SpatialTopicTag[];
  addTag: (tag: SpatialTopicTag) => void;
  removeTag: (id: string) => void;
  clearTags: () => void;
}

export const useSpatialTopicTags = create<SpatialTopicTagsStore>((set) => ({
  tags: [],
  addTag: (tag) => set((state) => ({ 
    tags: [...state.tags, tag] 
  })),
  removeTag: (id) => set((state) => ({ 
    tags: state.tags.filter(tag => tag.id !== id) 
  })),
  clearTags: () => set({ tags: [] }),
}));