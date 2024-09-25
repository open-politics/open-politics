import { create } from 'zustand'

type Bookmark = {
  id: string;
  headline: string;
  paragraphs: string;
  url: string;
  source: string;
  insertion_date: string | null;
  entities: Array<{
    id: string;
    name: string;
    entity_type: string;
    locations: Array<{
      name: string;
      type: string;
      coordinates: number[] | null;
    }>;
  }>;
  tags: Array<{
    id: string;
    name: string;
  }>;
  classification: {
    article_id: string;
    title: string;
    news_category: string;
    secondary_categories: string[];
    keywords: string[];
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