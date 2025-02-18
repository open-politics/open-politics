'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/text-area';
import { Button } from '@/components/ui/button';
import useAuth from '@/hooks/useAuth';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateDocumentsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateDocumentsDialog({ open, onClose }: CreateDocumentsDialogProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { isLoggedIn } = useAuth();

  // Form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [contentType, setContentType] = useState('article');
  const [source, setSource] = useState('');
  const [textContent, setTextContent] = useState('');
  const [summary, setSummary] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [insertionDate, setInsertionDate] = useState<Date | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  const handleYearSelect = (year: string) => {
    const newDate = insertionDate ? new Date(insertionDate) : new Date();
    newDate.setFullYear(parseInt(year));
    setInsertionDate(newDate);
  };

  // Handle file input changes (multiple files can be selected)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Function to make the API call for creating a document with files
  const uploadDocument = async (formData: FormData, workspaceId: number) => {
    if (!isLoggedIn) {
      throw new Error('User is not logged in.');
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found.');
    }

    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/documents/`, {
        method: 'POST',
        body: formData,
        // Do not set the Content-Type header here: the browser will automatically
        // add the proper boundaries when using FormData.
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const document = await response.json();
      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!activeWorkspace) {
      setErrorMessage('No active workspace selected.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Title is required.');
      return;
    }

    // Build FormData payload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('url', url || '');
    formData.append('content_type', contentType);
    formData.append('source', source || '');
    formData.append('text_content', textContent || '');
    formData.append('summary', summary || '');
    if (insertionDate) {
      formData.append('insertion_date', format(insertionDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
    }
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await uploadDocument(formData, activeWorkspace.uid);
      alert('Document created successfully');
      // Clear form fields after submission
      setTitle('');
      setUrl('');
      setContentType('article');
      setSource('');
      setTextContent('');
      setSummary('');
      setFiles([]);
      onClose();
    } catch (error: any) {
      console.error('Error creating document:', error);
      setErrorMessage(error.message || 'Failed to create document.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Select onValueChange={handleYearSelect} value={insertionDate?.getFullYear().toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Calendar
                mode="single"
                selected={insertionDate ? new Date(insertionDate) : undefined}
                onSelect={(day) => setInsertionDate(day || null)}
                className="w-full"
              />
            </div>
            <Input
              placeholder="Content Type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            />
          </div>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Input
            placeholder="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <Textarea
            placeholder="Text Content"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />
          <Textarea
            placeholder="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <Input type="file" multiple onChange={handleFileChange} />
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <DialogFooter>
            <Button type="submit">Create Document</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}