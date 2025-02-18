import { create } from 'zustand';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { useDocumentStore } from '@/zustand_stores/storeDocuments';
import { CoreContentModel } from '@/lib/content';


type BookmarkState = {
  bookmarks: CoreContentModel[];
  pendingBookmarks: string[];
  addBookmark: (bookmark: CoreContentModel, workspaceId?: number) => Promise<void>;
  removeBookmark: (url: string) => void;
  getBookmarks: () => CoreContentModel[];
  isBookmarkPending: (url: string) => boolean;
};

export const useBookMarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: [],
  pendingBookmarks: [],
  
  addBookmark: async (bookmark, workspaceId) => {
    set((state) => ({
      pendingBookmarks: [...state.pendingBookmarks, bookmark.url].filter(Boolean) as string[]
    }));

    if (workspaceId) {
      const { createDocument } = useDocumentStore.getState();
      try {
        const documentData = {
          title: bookmark.title || '',
          url: bookmark.url,
          content_type: bookmark.content_type || 'article',
          source: bookmark.source || '',
          text_content: bookmark.text_content || '',
          summary: bookmark.text_content?.substring(0, 200) || '',
          insertion_date: bookmark.insertion_date || bookmark.publication_date || '',
          workspace_id: workspaceId,
          top_image: bookmark.top_image || null,
        };
        
        await createDocument(documentData);
      } catch (error) {
        console.error('Error saving bookmark as document:', error);
        set((state) => ({
          pendingBookmarks: state.pendingBookmarks.filter(url => url !== bookmark.url)
        }));
        return;
      }
    }
    
    set((state) => ({
      bookmarks: [...state.bookmarks, bookmark],
      pendingBookmarks: state.pendingBookmarks.filter(url => url !== bookmark.url)
    }));
  },
  
  removeBookmark: (url) => set((state) => ({
    bookmarks: state.bookmarks.filter((bookmark) => bookmark.url !== url)
  })),
  
  getBookmarks: () => get().bookmarks,
  
  isBookmarkPending: (url) => get().pendingBookmarks.includes(url)
}));