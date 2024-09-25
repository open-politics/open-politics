import { create } from 'zustand'

type Bookmark = {
  url: string;
  headline: string;
  source: string;
  snippet: string;
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