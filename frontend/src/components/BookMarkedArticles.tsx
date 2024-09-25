import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, X } from 'lucide-react'; // Import X icon
import { useBookMarkStore } from '@/hooks/useBookMarkStore';

export function BookmarkedArticles() {
  const { getBookmarks, removeBookmark } = useBookMarkStore();
  const bookmarks = getBookmarks();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center space-x-2">
            <BookOpen className="text-blue-500" />
            <span>{bookmarks.length}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-[40vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bookmarked Articles</DialogTitle>
          </DialogHeader>
          {bookmarks.length === 0 ? (
            <p>No bookmarks yet.</p>
          ) : (
            bookmarks.map((bookmark) => (
              <div key={bookmark.url} className="relative mb-4 p-4 border rounded-lg">
                <div className="absolute top-2 right-2" onClick={() => removeBookmark(bookmark.url)}>
                  <X className="text-red-500 cursor-pointer" />
                </div>
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {bookmark.headline}
                </a>
                <p>{bookmark.source}</p>
                <p>{bookmark.snippet}...</p>
              </div>
            ))
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BookmarkedArticles;