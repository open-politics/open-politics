'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { FileRead } from '@/client/models';
import { useDocumentStore } from '@/zustand_stores/storeDocuments';

interface EditDocumentOverlayProps {
  open: boolean;
  onClose: () => void;
  documentId: number;
  defaultTitle: string;
  defaultContentType: string;
  defaultSource?: string | null;
  defaultTextContent?: string;
  defaultSummary?: string;
  defaultInsertionDate: string;
  defaultTopImage?: string | null;
  defaultFiles?: FileRead[];
}

export default function EditDocumentOverlay({ 
  open, 
  onClose, 
  documentId,
  defaultTitle: initialTitle,
  defaultContentType: initialContentType,
  defaultSource: initialSource,
  defaultTextContent: initialTextContent,
  defaultSummary: initialSummary,
  defaultInsertionDate,
  defaultTopImage: initialTopImage,
  defaultFiles: initialFiles,
}: EditDocumentOverlayProps) {
  const { documents, updateDocument } = useDocumentStore();
  const [title, setTitle] = useState(initialTitle);
  const [url, setUrl] = useState('');
  const [contentType, setContentType] = useState(initialContentType);
  const [source, setSource] = useState(initialSource);
  const [textContent, setTextContent] = useState(initialTextContent);
  const [summary, setSummary] = useState(initialSummary);
  const [files, setFiles] = useState<FileRead[]>(initialFiles || []);
  const [topImage, setTopImage] = useState(initialTopImage || '');

  useEffect(() => {
    if (documentId > 0) {
      const document = documents.find(doc => doc.id === documentId);
      if (document) {
        setTitle(document.title);
        setUrl(document.url || '');
        setContentType(document.content_type || 'article');
        setSource(document.source || '');
        setTextContent(document.text_content || '');
        setSummary(document.summary || '');
        setTopImage(document.top_image || '');
        // setFiles(document.files || []);
      }
    }
  }, [documentId, documents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDocument(documentId, {
        title,
        url,
        content_type: contentType,
        source,
        text_content: textContent,
        summary,
      });
      onClose();
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        // await deleteDocumentFile(documentId, fileId); // Assuming you have a deleteDocumentFile function in your store
        setFiles(files.filter((file: any) => file.id !== fileId)); // Update the local state
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div>
            <Label>Content Type</Label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="article">Article</option>
              <option value="blog">Blog</option>
              <option value="report">Report</option>
            </select>
          </div>
          <div>
            <Label>Source</Label>
            <Input value={source || ""} onChange={(e) => setSource(e.target.value)} />
          </div>
          <div>
            <Label>Text Content</Label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>
          <div>
            <Label>Image</Label>
            <Input value={topImage} onChange={(e) => setTopImage(e.target.value)} />
          </div>
          <div>
            <Label>Summary</Label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>
          <div>
            <Label>Files</Label>
            <ul>
              {files.map((file: any) => (
                <li key={file.id} className="flex items-center justify-between">
                  <a
                    href={`/api/v1/documents/files/${file.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.name}
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}