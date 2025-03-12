'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import useAuth from '@/hooks/useAuth';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
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
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"

import { DocumentsService, UtilsService } from '@/client/services';
import { Body_documents_extract_document_metadata_from_pdf, Body_documents_bulk_upload_documents } from '@/client/models';
import { ScrapeArticleResponse } from '@/lib/scraping/scraping_response';
import { FileText, Upload, Link as LinkIcon, Calendar as CalendarIcon, FileUp, Trash2, AlertCircle, CheckCircle2, Globe, AlignLeft, BookOpen, CheckCircle, FileImage, Building, Tag, Loader2, Folder, FolderCheckIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

interface CreateDocumentsDialogProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'single' | 'bulk' | 'scrape';
}

export default function CreateDocumentsDialog({ open, onClose, initialMode = 'single' }: CreateDocumentsDialogProps) {
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
  const [isAutofill, setIsAutofill] = useState(false);
  const [useFilenamesAsTitles, setUseFilenamesAsTitles] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(initialMode === 'bulk');
  const [isScrapeFocused, setIsScrapeFocused] = useState(initialMode === 'scrape');
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [bulkUploadSuccess, setBulkUploadSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'single' | 'scrape' | 'bulk-pdf' | 'bulk-url'>('single');
  const [topImage, setTopImage] = useState('');
  const [scrapedImages, setScrapedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scrapedArticles, setScrapedArticles] = useState<ScrapeArticleResponse[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlList, setUrlList] = useState<{ url: string; status: 'pending' | 'scraping' | 'success' | 'error'; data?: ScrapeArticleResponse }[]>([]);
  const [bulkTab, setBulkTab] = useState<'pdf' | 'url'>('pdf');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  // Reset form when dialog opens with a specific mode
  useEffect(() => {
    if (open) {
      setActiveTab(initialMode === 'bulk' ? 'bulk-pdf' : initialMode === 'scrape' ? 'scrape' : 'single');
      setIsBulkUpload(initialMode === 'bulk');
      
      if (initialMode === 'scrape') {
        setIsScrapeFocused(true);
        setTitle('');
        setTextContent('');
        setSummary('');
        setFiles([]);
      }
    }
  }, [open, initialMode]);

  // Set focus on URL input when in scrape mode
  useEffect(() => {
    if (isScrapeFocused && open) {
      const timer = setTimeout(() => {
        const urlInput = document.getElementById('url-input');
        if (urlInput) {
          urlInput.focus();
        }
        setIsScrapeFocused(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isScrapeFocused, open]);

  const handleYearSelect = (year: string) => {
    const newDate = insertionDate ? new Date(insertionDate) : new Date();
    newDate.setFullYear(parseInt(year));
    setInsertionDate(newDate);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      
      if (isAutofill && selectedFiles.length === 1 && selectedFiles[0].name.toLowerCase().endsWith('.pdf')) {
        extractPdfMetadata(selectedFiles[0]);
      }
    }
  };

  // Function to remove a specific file from the files array
  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const extractPdfMetadata = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const formData: Body_documents_extract_document_metadata_from_pdf = {
        file: file
      };

      const data = await DocumentsService.extractDocumentMetadataFromPdf({ formData });
      
      if (data.title) setTitle(data.title as string);
      if (data.text_content) setTextContent(data.text_content as string);
      if (data.summary) setSummary(data.summary as string);
      
    } catch (error: any) {
      console.error('Error extracting PDF metadata:', error);
      setErrorMessage('Failed to extract metadata from PDF');
      toast.error('Failed to extract metadata from PDF');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleScrapeArticle = useCallback(async () => {
    if (!url.trim()) {
      setErrorMessage('Please enter a URL to scrape');
      toast.error('Please enter a URL to scrape');
      return;
    }

    setIsScraping(true);
    setErrorMessage('');

    try {
      const response = await UtilsService.scrapeArticle({ url });
      console.log('Scraped article response:', response);
      
      const articleData = response as unknown as ScrapeArticleResponse;
      
      if (articleData.text_content || articleData.text) {
        setTextContent(articleData.text_content || articleData.text || '');
      }
      
      if (articleData.summary) {
        setSummary(articleData.summary);
      } else if (articleData.meta_summary) {
        setSummary(articleData.meta_summary);
      }
      
      if (articleData.publication_date) {
        try {
          setInsertionDate(new Date(articleData.publication_date));
        } catch (e: any) {
          console.error('Error parsing publication date:', e);
          toast.error('Error parsing publication date');
        }
      }
      
      if (!title.trim()) {
        if (articleData.title) {
          setTitle(articleData.title);
        } else {
          try {
            const urlObj = new URL(url);
            
            const pathSegments = urlObj.pathname.split('/').filter(segment => 
              segment && 
              !segment.startsWith('index.') && 
              !segment.match(/^\d{4}\/\d{2}\/\d{2}$/) &&
              !['www', 'com', 'org', 'net'].includes(segment)
            );
            
            if (pathSegments.length > 0) {
              const readableTitle = pathSegments[pathSegments.length - 1]
                .replace(/[-_]/g, ' ')
                .replace(/\.html$|\.htm$|\.php$|\.aspx$/i, '')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
                
              if (readableTitle && readableTitle.length > 3) {
                setTitle(readableTitle);
              } else {
                const domain = urlObj.hostname.replace('www.', '');
                setTitle(`Article from ${domain}`);
              }
            } else {
              const domain = urlObj.hostname.replace('www.', '');
              setTitle(`Article from ${domain}`);
            }
          } catch (e: any) {
            setTitle(`Article from ${url}`);
          }
        }
      }
      
      if (!source.trim()) {
        if (articleData.source) {
          setSource(articleData.source);
        } else {
          try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.replace('www.', '');
            const parts = hostname.split('.');
            if (parts.length > 1) {
              setSource(parts[parts.length - 2]);
            } else {
              setSource(hostname);
            }
          } catch (e: any) {
          }
        }
      }

      // Handle images from the scraping response
      if (articleData.top_image) {
        setTopImage(articleData.top_image);
        setSelectedImage(articleData.top_image);
      }
      
      if (articleData.images && articleData.images.length > 0) {
        setScrapedImages(articleData.images);
        if (!articleData.top_image && articleData.images.length > 0) {
          setSelectedImage(articleData.images[0]);
          setTopImage(articleData.images[0]);
        }
      }
    } catch (error: any) {
      console.error('Error scraping article:', error);
      setErrorMessage('Failed to scrape article from the provided URL. Please check the URL and try again.');
      toast.error('Failed to scrape article from the provided URL. Please check the URL and try again.');
    } finally {
      setIsScraping(false);
    }
  }, [url, title, source, setErrorMessage, setIsScraping, setTextContent, setSummary, setInsertionDate, setTitle, setSource, setTopImage, setScrapedImages, setSelectedImage]);

  const handleClear = () => {
    setTitle('');
    setUrl('');
    setContentType('article');
    setSource('');
    setTextContent('');
    setSummary('');
    setFiles([]);
    setErrorMessage('');
    setInsertionDate(null);
    setIsAutofill(false);
    setUseFilenamesAsTitles(false);
    setBulkUploadSuccess(false);
    setUploadedCount(0);
    setTopImage('');
    setScrapedImages([]);
    setSelectedImage(null);
    setScrapedArticles([]);
    setSelectedArticles([]);
  };

  const uploadDocument = useCallback(async (formData: FormData, workspaceId: number) => {
    if (!isLoggedIn) {
      throw new Error('User is not logged in.');
    }

    try {
      const result = await DocumentsService.createDocument({
        workspaceId,
        formData: {
          title: formData.get('title') as string,
          url: formData.get('url') as string || null,
          content_type: formData.get('content_type') as string,
          source: formData.get('source') as string || null,
          text_content: formData.get('text_content') as string || null,
          summary: formData.get('summary') as string || null,
          top_image: formData.get('top_image') as string || null,
          insertion_date: formData.get('insertion_date') as string || null,
          files: Array.from(formData.getAll('files')) as File[]
        }
      });
      
      return result;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('Error uploading document');
      throw error;
    }
  }, [isLoggedIn]);

  const bulkUploadDocuments = useCallback(async (workspaceId: number) => {
    if (!isLoggedIn) {
      throw new Error('User is not logged in.');
    }

    try {
      const formData: Body_documents_bulk_upload_documents = {
        files: files,
        autofill: isAutofill,
        content_type: contentType,
        source: source || null,
        use_filenames_as_titles: useFilenamesAsTitles
      };
      
      const result = await DocumentsService.bulkUploadDocuments({
        workspaceId,
        formData
      });
      
      return result;
    } catch (error: any) {
      console.error('Error bulk uploading documents:', error);
      toast.error('Error bulk uploading documents');
      throw error;
    }
  }, [isLoggedIn, files, isAutofill, contentType, source, useFilenamesAsTitles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (!activeWorkspace) {
      setErrorMessage('No active workspace selected');
      toast.error('Please select a workspace first');
      setIsLoading(false);
      return;
    }

    try {
      if (bulkTab === 'url' && selectedArticles.length > 0) {
        // Handle bulk URL scraping
        await Promise.all(selectedArticles.map(async (index) => {
          const article = urlList[index].data;
          if (article) {
            const formData = new FormData();
            formData.append('title', article.title || '');
            formData.append('url', urlList[index].url);
            formData.append('content_type', contentType);
            formData.append('source', article.source || '');
            formData.append('text_content', article.text_content || '');
            formData.append('summary', article.summary || article.meta_summary || '');
            if (article.top_image) formData.append('top_image', article.top_image);
            if (article.publication_date) formData.append('insertion_date', format(new Date(article.publication_date), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));

            await uploadDocument(formData, activeWorkspace.uid);
          }
        }));

        toast.success('Articles saved successfully');
        handleClear();
        onClose();
      } else if (bulkTab === 'pdf' && files.length > 0) {
        // Handle bulk PDF upload
        await bulkUploadDocuments(activeWorkspace.uid);
        toast.success('PDF documents uploaded successfully');
        handleClear();
        onClose();
      } else if (!isBulkUpload) {
        // Handle single document upload
        const formData = new FormData();
        formData.append('title', title);
        formData.append('url', url);
        formData.append('content_type', contentType);
        formData.append('source', source || '');
        formData.append('text_content', textContent);
        formData.append('summary', summary);
        if (selectedImage) formData.append('top_image', selectedImage);
        if (insertionDate) formData.append('insertion_date', format(insertionDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
        if (files.length > 0) {
          files.forEach(file => formData.append('files', file));
        }

        await uploadDocument(formData, activeWorkspace.uid);
        toast.success('Document saved successfully');
        handleClear();
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving document:', error);
      setErrorMessage('Failed to save document. Please try again.');
      toast.error('Failed to save document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      setUrlList([...urlList, { url: urlInput.trim(), status: 'pending' }]);
      setUrlInput('');
    }
  };

  const handleScrapeUrls = async () => {
    const updatedUrls = [...urlList];
    await Promise.all(updatedUrls.map(async (item, index) => {
      if (item.status === 'pending' || item.status === 'error') {
        updatedUrls[index].status = 'scraping';
        setUrlList([...updatedUrls]);
        try {
          const data = await UtilsService.scrapeArticle({ url: item.url }) as ScrapeArticleResponse;
          updatedUrls[index] = { url: item.url, status: 'success', data };
        } catch (error) {
          updatedUrls[index].status = 'error';
        }
        setUrlList([...updatedUrls]);
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Upload
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <Button
            variant={activeTab === 'single' ? 'default' : 'outline'}
            className="w-full flex items-center gap-2 h-auto py-4 flex-col"
            onClick={() => {
              setActiveTab('single');
              setIsBulkUpload(false);
              setBulkTab('pdf');
            }}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">Single Upload</span>
          </Button>
          <Button
            variant={activeTab === 'scrape' ? 'default' : 'outline'}
            className="w-full flex items-center gap-2 h-auto py-4 flex-col"
            onClick={() => {
              setActiveTab('scrape');
              setIsBulkUpload(false);
              setIsScrapeFocused(true);
            }}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm">URL Scrape</span>
          </Button>
          <Button
            variant={activeTab === 'bulk-pdf' ? 'default' : 'outline'}
            className="w-full flex items-center gap-2 h-auto py-4 flex-col"
            onClick={() => {
              setActiveTab('bulk-pdf');
              setIsBulkUpload(true);
              setBulkTab('pdf');
            }}
          >
            <FileUp className="w-4 h-4" />
            <span className="text-sm">Bulk PDF</span>
          </Button>
          <Button
            variant={activeTab === 'bulk-url' ? 'default' : 'outline'}
            className="w-full flex items-center gap-2 h-auto py-4 flex-col"
            onClick={() => {
              setActiveTab('bulk-url');
              setIsBulkUpload(true);
              setBulkTab('url');
            }}
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm">Bulk URLs</span>
          </Button>
        </div>

        {errorMessage && (
          <div className="border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errorMessage}
          </div>
        )}
        
        {bulkUploadSuccess && (
          <div className="border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Successfully uploaded {uploadedCount} documents!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'single' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Single Document Form Fields */}
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm font-medium">Title</span>
                    </div>
                    <Input
                      placeholder="Document title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Publication Date</span>
                    </div>
                    <Select onValueChange={handleYearSelect} value={insertionDate?.getFullYear()?.toString() || ''}>
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
                      className="w-full border rounded-md p-2 max-h-[250px] overflow-auto"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Content Type</span>
                    </div>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                        <SelectItem value="paper">Paper</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4" />
                    <span className="text-sm font-medium">Source</span>
                  </div>
                  <Input
                    placeholder="Source (e.g., New York Times)"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
              </div>

              {(scrapedImages.length > 0 || topImage) && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileImage className="w-4 h-4" />
                    <span className="text-sm font-medium">Available Images</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {topImage && !scrapedImages.includes(topImage) && (
                      <div
                        className={`relative border rounded-md overflow-hidden cursor-pointer ${selectedImage === topImage ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setSelectedImage(topImage)}
                      >
                        <img src={topImage} alt="Top image" className="w-full h-24 object-cover" />
                        {selectedImage === topImage && (
                          <div className="absolute top-1 right-1 rounded-full p-1 bg-highlighted">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                    {scrapedImages.map((img, index) => (
                      <div
                        key={index}
                        className={`relative border rounded-md overflow-hidden cursor-pointer ${selectedImage === img ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img src={img} alt={`Image ${index + 1}`} className="w-full h-24 object-cover" />
                        {selectedImage === img && (
                          <div className="absolute top-1 right-1 rounded-full p-1 bg-highlighted">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full width text content */}
              <div className="col-span-full">
                <div className="flex items-center gap-2 mb-1">
                  <AlignLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Text Content</span>
                </div>
                <Textarea
                  placeholder="Full text content of the document"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="min-h-[200px] w-full"
                />
              </div>

              {/* Full width summary */}
              <div className="col-span-full">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Summary</span>
                </div>
                <Textarea
                  placeholder="Brief summary of the document"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="min-h-[100px] w-full"
                />
              </div>
            </>
          )}

          {activeTab === 'scrape' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1">
                  <Input
                    id="url-input"
                    placeholder="Enter URL to scrape..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={handleScrapeArticle}
                  disabled={isScraping}
                  className="flex items-center gap-2"
                >
                  {isScraping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Scrape URL
                    </>
                  )}
                </Button>
              </div>
              {url && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-4 h-4" />
                        <span className="text-sm font-medium">Title</span>
                      </div>
                      <Input
                        placeholder="Document title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Publication Date</span>
                      </div>
                      <Select onValueChange={handleYearSelect} value={insertionDate?.getFullYear()?.toString() || ''}>
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
                        className="w-full border rounded-md p-2 max-h-[250px] overflow-auto"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">Content Type</span>
                      </div>
                      <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                          <SelectItem value="paper">Paper</SelectItem>
                          <SelectItem value="news">News</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4" />
                      <span className="text-sm font-medium">Source</span>
                    </div>
                    <Input
                      placeholder="Source (e.g., New York Times)"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bulk-pdf' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                <p>Upload multiple PDF files at once with options to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Auto-extract metadata from PDFs</li>
                  <li>Use filenames as document titles</li>
                  <li>Set common metadata for all documents</li>
                </ul>
              </div>
              
              <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FileUp className="w-4 h-4" /> Upload Multiple PDF Files
                </h3>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  className="mb-2 block"
                />
                {files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="text-sm font-medium">Selected files:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {files.map((file, index) => (
                        <div 
                          key={`${file.name}-${index}`} 
                          className="flex items-center justify-between p-2 border rounded-md bg-muted/30"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm truncate" title={file.name}>
                              {file.name}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => handleRemoveFile(index)}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove file</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mt-2">
                        <label className="inline-flex items-center">
                          <Checkbox
                            id="auto-fill"
                            checked={isAutofill}
                            onCheckedChange={(e) => setIsAutofill(e === true)}
                            className="mr-2 peer h-5 w-5 rounded-md border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                          <label
                            htmlFor="auto-fill"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Auto-fill metadata from PDFs
                          </label>
                        </label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Automatically extract and fill metadata from PDF files</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="mt-2">
                        <label className="inline-flex items-center">
                          <Checkbox
                            id="use-filenames"
                            checked={useFilenamesAsTitles}
                            onCheckedChange={(e) => setUseFilenamesAsTitles(e === true)}
                            className="mr-2 peer h-5 w-5 rounded-md border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                          <label
                            htmlFor="use-filenames"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Use filenames as titles
                          </label>
                        </label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Use PDF filenames as document titles instead of extracted metadata</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          {activeTab === 'bulk-url' && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                <p>Bulk scrape content from multiple URLs:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Add multiple URLs to scrape</li>
                  <li>Scrape all URLs at once</li>
                  <li>Select which articles to save</li>
                  <li>Preview content before saving</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddUrl}>Add URL</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {urlList.map((item, index) => (
                    <Badge key={index} variant={item.status === 'success' ? 'default' : item.status === 'error' ? 'destructive' : 'secondary'}>
                      {item.url}
                      {item.status === 'scraping' && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                      <Trash2 className="ml-2 h-4 w-4 cursor-pointer" onClick={() => setUrlList(urlList.filter((_, i) => i !== index))} />
                    </Badge>
                  ))}
                </div>

                <Button type="button" onClick={handleScrapeUrls} disabled={urlList.length === 0 || urlList.every(u => u.status === 'success')}>Scrape All URLs</Button>

                {urlList.filter(u => u.status === 'success').map((item, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <Checkbox
                      checked={selectedArticles.includes(index)}
                      onCheckedChange={(checked) => {
                        setSelectedArticles(prev => checked ? [...prev, index] : prev.filter(i => i !== index));
                      }}
                    />
                    <h4 className="font-medium">{item.data?.title}</h4>
                    <p className="text-sm">{item.data?.summary || item.data?.meta_summary}</p>
                    {item.data?.top_image && <img src={item.data.top_image} alt="Thumbnail" className="w-full h-32 object-cover mt-2" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between w-full gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save and Close
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}