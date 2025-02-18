import React, { useState, useEffect, useCallback } from 'react';
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { format } from "date-fns"
import { Textarea } from '@/components/ui/text-area';
import { Button } from '@/components/ui/button';
import { DocumentRead, ClassificationResultRead, ClassificationSchemeRead, EnhancedClassificationResultRead } from '@/client/models';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import useClassificationSchemes from '@/hooks/useClassify';
import { useClassificationResultStore } from '@/zustand_stores/storeClassificationResults';
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDocumentStore } from '@/zustand_stores/storeDocuments';
import { ClassificationResultsService, ClassificationSchemesService } from '@/client/services';
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useClassificationSchemeStore } from '@/zustand_stores/storeSchemas';
import { cn } from "@/lib/utils";
import { safeFormatDate } from "@/lib/utils";
import ClassificationResultDisplay from '../classifications/ClassificationResultDisplay';
import { PlusCircle, Lock, Unlock, ArrowRight, Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";

interface DocumentDetailViewProps {
  documents: DocumentRead[];
  newlyInsertedDocumentIds: number[];
  onEdit: (document: DocumentRead) => void;
  schemes: ClassificationSchemeRead[];
  selectedDocumentId: number | null;
}

const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({ documents, newlyInsertedDocumentIds = [], onEdit, schemes, selectedDocumentId }) => {
  const { setSelectedDocumentId, extractPdfContent } = useDocumentStore();
  const { updateDocument, fetchDocuments } = useDocumentStore();
  const document = documents.find((item) => item.id === selectedDocumentId) || null;
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { classificationSchemesQuery, runClassification } = useClassificationSchemes();
  const { workingResult, autoSave, setAutoSave, selectedRun, setSelectedRun } = useClassificationResultStore();
  const [selectedScheme, setSelectedScheme] = useState<number | null>(null);
  const [classificationResult, setClassificationResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<EnhancedClassificationResultRead | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const { activeWorkspace } = useWorkspaceStore();
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [classificationResults, setClassificationResults] = useState<ClassificationResultRead[]>([]);
  const { createClassificationScheme } = useClassificationSchemeStore();
  const [isTextLocked, setIsTextLocked] = useState(true);

  const fetchClassificationResults = useCallback(
    async (documentId: number, workspaceId: string, runName: string | null) => {
      setIsLoadingResults(true);
      setResultsError(null);
      try {
        const results = await ClassificationResultsService.listClassificationResults({
          workspaceId: parseInt(workspaceId),
          documentIds: [documentId],
          runName: runName || undefined,
        });
        setClassificationResults(results);
      } catch (error: any) {
        console.error("Error fetching classification results:", error);
        setResultsError("Failed to load classification results.");
      } finally {
        setIsLoadingResults(false);
      }
    },
    []
  );

  const handleRefreshClassificationResults = async () => {
    if (!document?.id || !activeWorkspace?.uid) return;
    await fetchClassificationResults(document.id, activeWorkspace.uid.toString(), selectedRun);
  };

  useEffect(() => {
    const loadResults = async () => {
      if (!selectedDocumentId || !activeWorkspace?.uid) return;

      setIsLoadingResults(true);
      setResultsError(null);

      try {
        if (document && document.id) {
          await fetchClassificationResults(document.id, activeWorkspace.uid.toString(), selectedRun);
        } else {
          console.warn("Document or document.id is undefined, skipping fetchClassificationResults");
          return;
        }
      } catch (error: any) {
        console.error("Error fetching classification results:", error);
        setResultsError("Failed to load classification results.");
      } finally {
        setIsLoadingResults(false);
      }
    };

    if (document) {
      loadResults();
    }
  }, [document, activeWorkspace?.uid, fetchClassificationResults, selectedRun, selectedDocumentId]);

  const handleRunClassification = async () => {
    if (!selectedScheme || !document?.id || !activeWorkspace?.uid) return;
    setIsLoading(true);

    try {
      const result = await runClassification({
        schemeId: selectedScheme,
        documentId: document.id,
      });
      setClassificationResult(result);
      await fetchClassificationResults(document.id, activeWorkspace.uid.toString(), selectedRun);
    } catch (error) {
      console.error("Classification failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the current document is newly inserted
  const isNewDocument = selectedDocumentId ? newlyInsertedDocumentIds.includes(selectedDocumentId) : false;

  const formatDisplayValue = (value: any, scheme: ClassificationSchemeRead | undefined) => {
    if (!scheme || !value) return null;

    // Extract value from scheme-specific field if exists
    const schemeValue = value[scheme.name] || value?.value || value;

    switch (scheme.type) {
      case 'int':
        if (scheme.scale_min === 0 && scheme.scale_max === 1) {
          return schemeValue > 0.5 ? 'Positive' : 'Negative';
        }
        return typeof schemeValue === 'number' ? schemeValue.toFixed(2) : schemeValue;
        
      case 'List[str]':
        if (Array.isArray(schemeValue)) {
          return schemeValue.join(', ');
        }
        return schemeValue;
        
      case 'str':
        return schemeValue;
        
      default:
        if (typeof schemeValue === 'object' && schemeValue !== null) {
          try {
            if (Array.isArray(schemeValue)) {
              return schemeValue.map((item, index) => {
                const key = index;
                const val = item;
                if (typeof val === 'object' && val !== null) {
                  return Object.entries(val)
                    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                    .join(', ');
                }
                return `${key}: ${JSON.stringify(val)}`;
              }).join(', ');
            } else {
              return Object.entries(schemeValue)
                .map(([key, val]) => `${key}: ${JSON.stringify(val)}`)
                .join(', ');
            }
          } catch (error) {
            console.error("Error stringifying object:", error);
            return "Error displaying value";
          }
        }
        return JSON.stringify(schemeValue);
    }
  };

  const renderClassificationBadges = () => (
    <div className="space-y-4">
      {classificationResults.map((result) => {
        const scheme = schemes.find(s => s.id === result.scheme_id);
        return (
          <div key={result.id} className="space-y-2">
            <div className="font-medium">{scheme?.name}</div>
            <ClassificationResultDisplay 
              result={result}
              scheme={scheme!}
            />
          </div>
        );
      })}
    </div>
  );

  const QuickSchemeCreator = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("str");
    const { activeWorkspace } = useWorkspaceStore();
    const { createClassificationScheme } = useClassificationSchemeStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
      if (!activeWorkspace?.uid || !name) return;
      setIsLoading(true);
      try {
        await createClassificationScheme({
          name,
          description,
          type,
        }, activeWorkspace.uid);
        // Reset form
        setName("");
        setDescription("");
        setType("str");
      } catch (error) {
        console.error("Error creating scheme:", error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="p-4 space-y-4 w-[300px]">
        <h4 className="font-medium">Quick Create Scheme</h4>
        <div className="space-y-2">
          <Input
            placeholder="Scheme name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 rounded-md border"
          >
            <option value="str">String</option>
            <option value="int">Integer</option>
            <option value="list">List</option>
          </select>
          <Button 
            className="w-full"
            onClick={handleCreate}
            disabled={!name || isLoading}
          >
            {isLoading ? "Creating..." : "Create Scheme"}
          </Button>
        </div>
      </div>
    );
  };

  const renderClassificationSection = () => (
    // <div className="grid grid-cols-[20%_80%]">
    //   <div className="grid-cols-1"></div>
      <div className="p-6 w-full backdrop-blur-md bg-secondary/70 rounded-lg shadow-md relative overflow-hidden">

        {/* <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Classification Results</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Auto-save results</span>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <QuickSchemeCreator />
              </PopoverContent>
            </Popover>
          </div>
        </div> */}

        {/* Unified Results List */}
        <div className="space-y-4">
          {classificationResults.map((result) => {
            const scheme = schemes.find(s => s.id === result.scheme_id);
            return (
              <div 
                key={result.id} 
                className="p-4 bg-card rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  setSelectedResult(result);
                  setIsResultDialogOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">{scheme?.name}</span>
                    </div>
                    <ClassificationResultDisplay 
                      result={result}
                      scheme={scheme!}
                      compact={true}
                      />
                     </div>
                    <div className="text-xs text-muted-foreground">
                      {result.timestamp && format(new Date(result.timestamp), "PP · p")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );


  const handleExtractPdfContent = async (fileId: number) => {
    if (!document?.id || !activeWorkspace?.uid) return;
    
    try {
      await extractPdfContent(document.id, fileId);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-none bg-background z-10">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-xl font-bold">Detail View</h1>
          {document && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(document)}
            >
              Edit
            </Button>
          )}
        </div>
        <Separator />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 rounded-lg overflow-y-auto">
        {document ? (
          <div className={cn(
            "space-y-2",
            isNewDocument && "border-2 border-green-500"
          )}>
            <div className="flex items-start p-4">
              <div className="flex items-start gap-4 text-sm">
                <Avatar>
                  <AvatarImage alt={document.title} />
                  <AvatarFallback>
                    {document.title
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="font-semibold">{document.title}</div>
                  <div className="line-clamp-1 text-xs">{document.content_type}</div>
                  <div className="line-clamp-1 text-xs">
                    <span className="font-medium">Source:</span> {document.source}
                  </div>
                </div>
              </div>
              {document.insertion_date && (
                <div className="ml-auto text-xs">
                  {format(new Date(document.insertion_date), "PPpp")}
                </div>
              )}
            </div>
            {document.files && document.files.length > 0 && (
              <div className="p-0 px-4">
                <h4 className="text-sm font-medium mb-2">Files</h4>
                <div className="flex flex-wrap items-center gap-2">
                {(document?.files || []).map((file) => (
                  <div key={file.id} className="flex items-center">
                    <Badge variant="outline" className="truncate max-w-[350px] h-8">
                      <a
                        href={file.url || ''}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-xs"
                      >
                        {file.name}
                      </a>
                    </Badge>
                    {file.filetype?.toLowerCase().includes('pdf') && (
                      <Button
                        variant={useDocumentStore.getState().isExtractedPdf(file.id) ? "ghost" : "ghost"}
                        size="sm"
                        onClick={() => handleExtractPdfContent(file.id)}
                        className={cn(
                          "ml-1 text-xs",
                          useDocumentStore.getState().isExtractedPdf(file.id) && "text-green-500 hover:text-green-600"
                        )}
                        disabled={useDocumentStore.getState().isExtractingPdf(file.id)}
                      >
                        {useDocumentStore.getState().isExtractingPdf(file.id) ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            Extracting...
                          </>
                        ) : useDocumentStore.getState().isExtractedPdf(file.id) ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Extracted
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Extract Text
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
                </div>
              </div>
            )}
            {document.top_image && (
              <>
            <Separator />
            <div className="h-44 w-1/2 p-4 relative overflow-hidden">
              {document.top_image && (
                <>
                  <div className="absolute inset-6 cursor-pointer hover:scale-110 transition-transform duration-200" onClick={() => setIsImageOpen(true)}>
                    <Image
                      src={document.top_image}
                      alt={document.title}
                      className="rounded-lg object-cover w-full h-full"
                      width={500}
                      height={200}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                    <div className="absolute inset-0 shadow-lg rounded-lg"></div>
                  </div>
                  <Dialog open={isImageOpen} onOpenChange={() => setIsImageOpen(false)}>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{document.title}</DialogTitle>
                      </DialogHeader>
                      <Image
                        src={document.top_image}
                        alt={document.title}
                        className="rounded-lg object-cover w-full h-full"
                        width={800}
                        height={600}
                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                      />
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
            </>
            )}

            

            <Separator />
            <div className="p-4 ">
              <div className="flex items-center justify-start mb-2">
                <h4 className="text-sm font-medium">Document Content</h4>
                
              </div>
              <div 
                className={cn(
                  "whitespace-pre-wrap text-sm backdrop-blur-md bg-secondary/70 md:p-2 rounded-lg relative",
                  isTextLocked ? "line-clamp-6" : "max-h-[300px] overflow-y-auto"
                )}
              >
                {document.text_content}
                {isTextLocked && (
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-secondary/70 to-transparent"></div>
                )}
              </div>
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTextLocked(!isTextLocked)}
                  className="flex rounded-xl bg-secondary/20 p-2 mt-2 justify-center hover:bg-secondary/70 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {isTextLocked ? "Show More" : "Show Less"}
                      </span>
                    </div>
                    {isTextLocked ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </div>
            </div>

            {/* Classification Section - Always visible */}
            <div className="p-4 pt-0">
            <h4 className="text-lg font-semibold">Classification Results</h4>
            </div>
            <div className="p-4 pt-0 h-full rounded-lg">
              {renderClassificationSection()}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            No document selected
          </div>
        )}
      </div>

      {/* Result Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedResult?.scheme_id && schemes.find(s => s.id === selectedResult.scheme_id)?.name}
              {selectedResult?.run_name && (
                <Badge variant="outline" className="text-sm">
                  {selectedResult.run_name}
                </Badge>
              )}
            </DialogTitle>
            {selectedResult?.timestamp && (
              <p className="text-xs text-muted-foreground -mt-2">
                Created: {format(new Date(selectedResult.timestamp), "PPpp")}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {selectedResult && (
              <ClassificationResultDisplay 
                result={selectedResult}
                scheme={schemes.find(s => s.id === selectedResult.scheme_id)!}
              />
            )}
            {selectedResult?.document_id && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onEdit(documents.find(d => d.id === selectedResult.document_id) || document!);
                    setIsResultDialogOpen(false);
                  }}
                  className="text-primary"
                >
                  View Full Document →
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentDetailView;