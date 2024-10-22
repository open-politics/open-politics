import { create } from 'zustand'

type Bookmark = {
  id: string;
  url: string;
  title: string | null;
  content_type: string;
  source: string | null;
  insertion_date: string;
  content_language: string | null;
  author: string | null;
  publication_date: string | null;
  version: number;
  is_active: boolean;
  text_content: string | null;
  embeddings: number[] | null;
  media_details: {
    id: string;
    content_id: string;
    duration: number | null;
    transcribed_text: string | null;
    captions: string | null;
    video_frames: Array<{
      media_details_id: string;
      frame_number: number;
      frame_url: string;
      timestamp: number;
      embeddings: number[] | null;
    }> | null;
    images: Array<{
      id: string;
      media_details_id: string;
      image_url: string;
      caption: string | null;
      embeddings: number[] | null;
    }> | null;
  } | null;
  entities: Array<{
    id: string;
    name: string;
    entity_type: string;
    locations: Array<{
      id: string;
      name: string;
      location_type: string;
      coordinates: number[] | null;
      weight: number;
    }>;
  }>;
  tags: Array<{
    id: string;
    name: string;
  }>;
  classification: {
    content_id: string;
    category: string;
    secondary_categories: string[] | null;
    keywords: string[] | null;
    geopolitical_relevance: number;
    legislative_influence_score: number;
    international_relevance_score: number;
    democratic_process_implications_score: number;
    general_interest_score: number;
    spam_score: number;
    clickbait_score: number;
    fake_news_score: number;
    satire_score: number;
    event_type: string;
  } | null;

};

type BookmarkState = {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (url: string) => void;
  getBookmarks: () => Bookmark[];
};

export const useBookMarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  addBookmark: (bookmark) => set((state) => ({ bookmarks: [...state.bookmarks, bookmark] })),
  removeBookmark: (url) => set((state) => ({ bookmarks: state.bookmarks.filter((bookmark) => bookmark.url !== url) })),
  getBookmarks: () => get().bookmarks,
}));