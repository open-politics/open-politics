'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Microscope, Loader2, X, AlertCircle, Info, History, Clock, RefreshCw, Search, CheckCircle, ChevronUp, ChevronDown, Star, StarOff, ArrowUp, ArrowDown, Pencil, Play, BarChart3, Table as TableIcon } from 'lucide-react';
import {
  ClassificationSchemeRead,
  ClassificationResultRead,
  DocumentRead,
  ClassificationResultCreate,
} from '@/client/models';
import { FormattedClassificationResult } from '@/lib/classification/types';
import ClassificationResultsChart from '@/components/collection/workspaces/classifications/ClassificationResultsChart';
import { useDocumentStore } from '@/zustand_stores/storeDocuments';
import { useSchemes } from '@/hooks/useSchemes';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { format } from 'date-fns';
import { 
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper
} from '@tanstack/react-table';
import { ResultFilters } from './ResultFilters';
import { ClassificationService } from '@/lib/classification/service';
import { schemesToSchemeReads, resultsToResultReads } from '@/lib/classification/adapters';

import ClassificationResultDisplay from './ClassificationResultDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import DocumentManagerOverlay from '../documents/DocumentManagerOverlay';
import SchemeManagerOverlay from './SchemeManagerOverlay';
import { useApiKeysStore } from '@/zustand_stores/storeApiKeys';
import { ClassificationService as ApiClassificationService } from '@/client/services';
import { useClassificationSystem } from '@/hooks/useClassificationSystem';
import ProviderSelector from '@/components/collection/workspaces/management/ProviderSelector';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from "@/components/ui/badge"
import { useFavoriteRunsStore, FavoriteRun } from '@/zustand_stores/storeFavoriteRuns';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import DocumentDetailProvider from '../documents/DocumentDetailProvider';
import DocumentDetailWrapper from '../documents/DocumentDetailWrapper';
import DocumentLink from '../documents/DocumentLink';
import { useRunHistoryStore, RunHistoryItem } from '@/zustand_stores/storeRunHistory';
import { useTutorialStore } from '../../../../zustand_stores/storeTutorial';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';

// Extend TableMeta type to include our custom onRowClick property
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    onRowClick?: (row: any) => void;
  }
}

interface ClassificationRun {
  id: number;
  timestamp: Date;
  documentIds: number[];
  schemeIds: number[];
  results: ClassificationResultRead[];
  name?: string;
  description?: string;
}

interface ResultFilter {
  schemeId: number;
  operator: 'equals' | 'contains' | 'range';
  value: any;
}

interface SchemeData {
  scheme: ClassificationSchemeRead;
  values: number[];
  counts: Map<string, number>;
}

// New interface for result grouping
interface ResultGroup {
  date: string;
  schemes: Record<number, SchemeData>;
}

const formatDisplayValue = (value: any, scheme: ClassificationSchemeRead) => {
  if (!value) return null;

  try {
    return ClassificationService.getFormattedValue(value as any, scheme as any);
  } catch (error) {
    console.error('Error formatting value:', error);
    
    // Fallback to original implementation
    switch (scheme.fields[0].type) {
      case 'int':
        // Check scale range to determine binary vs scale
        if (scheme.fields[0].scale_min === 0 && scheme.fields[0].scale_max === 1) {
          return value > 0.5 ? 'Positive' : 'Negative';
        }
        return typeof value === 'number' ? Number(value.toFixed(2)) : value;
        
      case 'List[str]':
        if (scheme.fields[0].is_set_of_labels && scheme.fields[0].labels) {
          // If value is already a label, return it
          if (typeof value === 'string' && scheme.fields[0].labels.includes(value)) {
            return value;
          }
          // If value is an index, convert to label
          if (typeof value === 'number' && scheme.fields[0].labels[value]) {
            return scheme.fields[0].labels[value];
          }
        }
        return value;
        
      default:
        return value;
    }
  }
};

// Run History Panel Component
const RunHistoryPanel: React.FC<{
  runs: RunHistoryItem[];
  activeRunId?: number | null;
  onSelectRun: (runId: number, runName: string, runDescription?: string) => void;
  onToggleFavorite?: (run: RunHistoryItem) => void;
  favoriteRunIds?: number[];
}> = ({ runs, activeRunId, onSelectRun, onToggleFavorite, favoriteRunIds = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter runs based on search term
  const filteredRuns = useMemo(() => {
    return runs.filter(run => 
      run.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [runs, searchTerm]);

  // Sort runs based on criteria
  const sortedRuns = useMemo(() => {
    return [...filteredRuns].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return sortOrder === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      } else {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });
  }, [filteredRuns, sortBy, sortOrder]);

  // Find the active run
  const activeRun = useMemo(() => {
    return runs.find(run => run.id === activeRunId);
  }, [runs, activeRunId]);

  return (
    <div className="flex flex-col h-full">
      {/* Current Run Header */}
      {activeRun && (
        <div className="mb-4 p-3 bg-muted/30 border rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Current Run</h3>
              <div className="text-sm text-muted-foreground">{activeRun.name}</div>
            </div>
            <Badge variant="outline" className="ml-2">
              Active
            </Badge>
          </div>
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
            <div>{activeRun.timestamp}</div>
            <div>•</div>
            <div>{activeRun.documentCount} documents</div>
            <div>•</div>
            <div>{activeRun.schemeCount} schemes</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search runs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(value) => {
            const [newSortBy, newSortOrder] = value.split('-') as ['date' | 'name', 'asc' | 'desc'];
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest first</SelectItem>
            <SelectItem value="date-asc">Oldest first</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        {sortedRuns.length > 0 ? (
          <div className="space-y-2">
            {sortedRuns.map((run) => (
              <div
                key={run.id}
                className={cn(
                  "p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors",
                  activeRunId === run.id && "bg-muted border-primary"
                )}
                onClick={() => onSelectRun(run.id, run.name, run.description)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{run.name}</div>
                  {onToggleFavorite && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(run);
                      }}
                    >
                      {favoriteRunIds.includes(run.id) ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {run.timestamp}
                </div>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  <div>{run.documentCount} documents</div>
                  <div>{run.schemeCount} schemes</div>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-8 text-muted-foreground">
            No runs match your search
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No run history available
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

// Update the RunHistoryDialog component to use the runHistory from the store
function RunHistoryDialog({ 
  isOpen, 
  onClose, 
  activeRunId, 
  onSelectRun 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  activeRunId: number | null; 
  onSelectRun: (runId: number, runName: string, runDescription?: string) => void 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const { runs, isLoading, fetchRunHistory } = useRunHistoryStore();
  const { favoriteRuns } = useFavoriteRunsStore();
  const { activeWorkspace } = useWorkspaceStore();
  
  // Filter runs based on search term
  const filteredRuns = useMemo(() => {
    return runs.filter(run => 
      run.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [runs, searchTerm]);

  // Get favorite run IDs
  const favoriteRunIds = useMemo(() => {
    return favoriteRuns.map(run => run.id);
  }, [favoriteRuns]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Run History</DialogTitle>
          <DialogDescription>
            Select a previous run to load its results into the runner
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading run history...</span>
            </div>
          ) : (
            <RunHistoryPanel 
              runs={filteredRuns} 
              activeRunId={activeRunId} 
              onSelectRun={onSelectRun} 
              favoriteRunIds={favoriteRunIds}
              onToggleFavorite={(run) => {
                const { addFavoriteRun, removeFavoriteRun, isFavorite } = useFavoriteRunsStore.getState();
                const workspaceId = useWorkspaceStore.getState().activeWorkspace?.uid || '';
                
                if (isFavorite(run.id)) {
                  removeFavoriteRun(run.id);
                } else {
                  addFavoriteRun({
                    id: run.id,
                    name: run.name,
                    timestamp: run.timestamp,
                    documentCount: run.documentCount || 0,
                    schemeCount: run.schemeCount || 0,
                    workspaceId: String(workspaceId),
                    description: run.description
                  });
                }
              }}
            />
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button 
            variant="default" 
            onClick={() => {
              if (activeWorkspace?.uid) {
                const workspaceId = typeof activeWorkspace.uid === 'string' 
                  ? parseInt(activeWorkspace.uid, 10) 
                  : activeWorkspace.uid;
                
                fetchRunHistory(workspaceId);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Runs
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add a new component for the circular timeline visualization of run history
const RunHistoryTimeline: React.FC<{
  runs: RunHistoryItem[];
  activeRunId: number | null;
  onSelectRun: (runId: number, runName: string, runDescription?: string) => void;
  maxItems?: number;
}> = ({ runs, activeRunId, onSelectRun, maxItems = 5 }) => {
  const displayRuns = runs.slice(0, maxItems);
  
  return (
    <div className="relative w-full h-24 my-4">
      {/* Timeline track */}
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted/50 rounded-full transform -translate-y-1/2"></div>
      
      {/* Run markers */}
      <div className="relative h-full">
        {displayRuns.map((run, index) => {
          // Calculate position along the timeline
          const position = `${(index / (maxItems - 1)) * 100}%`;
          const isActive = run.id === activeRunId;
          
          return (
            <div 
              key={run.id}
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-300"
              style={{ left: position }}
            >
              <div 
                className={cn(
                  "flex flex-col items-center cursor-pointer group",
                  isActive && "scale-110"
                )}
                onClick={() => onSelectRun(run.id, run.name, run.description)}
              >
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  <span className="text-xs font-medium">{index + 1}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 absolute -bottom-12 bg-popover shadow-md rounded-md p-2 text-xs w-40 text-center transition-all duration-200">
                  <div className="font-medium truncate">{run.name}</div>
                  <div className="text-muted-foreground text-[10px] mt-1">{run.timestamp}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Add a compact favorite runs display component
const FavoriteRunsDisplay: React.FC<{
  runs: FavoriteRun[];
  activeRunId: number | null;
  onSelectRun: (runId: number, runName: string, runDescription?: string) => void;
}> = ({ runs, activeRunId, onSelectRun }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (runs.length === 0) return null;
  
  return (
    <div className="mb-4 bg-muted/20 rounded-lg border p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium flex items-center">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-2" />
          Favorite Runs
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded ? (
        <div className="space-y-2 mt-2">
          {runs.map(run => (
            <div 
              key={run.id}
              className={cn(
                "p-2 rounded border cursor-pointer hover:bg-muted/50 transition-colors",
                activeRunId === run.id && "bg-muted border-primary"
              )}
              onClick={() => onSelectRun(run.id, run.name, run.description)}
            >
              <div className="font-medium text-sm">{run.name}</div>
              <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                <div>{run.timestamp}</div>
                <div>•</div>
                <div>{run.documentCount} docs</div>
                <div>•</div>
                <div>{run.schemeCount} schemes</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {runs.slice(0, 3).map(run => (
            <div 
              key={run.id}
              className={cn(
                "p-2 rounded border cursor-pointer hover:bg-muted/50 transition-colors flex-shrink-0",
                activeRunId === run.id && "bg-muted border-primary"
              )}
              onClick={() => onSelectRun(run.id, run.name, run.description)}
            >
              <div className="font-medium text-sm truncate max-w-[120px]">{run.name}</div>
            </div>
          ))}
          {runs.length > 3 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-shrink-0 h-auto"
              onClick={() => setIsExpanded(true)}
            >
              +{runs.length - 3} more
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default function ClassificationRunner() {
  const { activeWorkspace } = useWorkspaceStore();
  const { fetchDocuments } = useDocumentStore();
  const { schemes, loadSchemes: fetchSchemes } = useSchemes();
  const documents = useDocumentStore(state => state.documents);

  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [selectedSchemes, setSelectedSchemes] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [runs, setRuns] = useState<ClassificationRun[]>([]);
  const [runName, setRunName] = useState<string>('');
  const [runDescription, setRunDescription] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [filters, setFilters] = useState<ResultFilter[]>([]);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [isDocumentManagerOpen, setIsDocumentManagerOpen] = useState(false);
  const [isSchemeManagerOpen, setIsSchemeManagerOpen] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);
  const [activeRunInfo, setActiveRunInfo] = useState<{
    id: number;
    name: string;
    timestamp?: string;
    documentCount?: number;
    schemeCount?: number;
  } | null>(null);
  // New state for run history
  const [runHistory, setRunHistory] = useState<RunHistoryItem[]>([]);
  const [isRunHistoryOpen, setIsRunHistoryOpen] = useState(false);
  // Update the state type to store document ID instead of a single result
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  // Add local state for activeRunId
  const [activeRunId, setActiveRunId] = useState<number | null>(null);

  const {
    results: classificationResults,
    loadResultsByRun,
    error: resultsError,
    isLoadingResults: isLoading,
  } = useClassificationSystem({
    autoLoadRuns: true
  });

  // Add a type assertion for classificationResults to help TypeScript understand its structure
  const typedResults = classificationResults as FormattedClassificationResult[];

  const { toast } = useToast();
  const { runs: runHistoryStore, isLoading: isLoadingRunHistory, fetchRunHistory } = useRunHistoryStore();
  const { showClassificationRunnerTutorial, toggleClassificationRunnerTutorial } = useTutorialStore();

  // Add useEffect to load documents and classification schemes once on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (!activeWorkspace?.uid) return;
      
      setIsLoadingInitialData(true);
      try {
        // Load documents and classification schemes in parallel
        await Promise.all([
          fetchDocuments(),
          fetchSchemes()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    loadInitialData();
    // Only run this effect once when the component mounts and activeWorkspace is available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace?.uid]);

  // Add useEffect to load run history when the component mounts
  useEffect(() => {
    if (activeWorkspace?.uid) {
      const workspaceId = typeof activeWorkspace.uid === 'string' 
        ? parseInt(activeWorkspace.uid, 10) 
        : activeWorkspace.uid;
      
      fetchRunHistory(workspaceId);
    }
  }, [activeWorkspace?.uid, fetchRunHistory]);

  // Effect to update run history when activeRunId changes
  useEffect(() => {
    if (activeRunId && typedResults.length > 0) {
      // Check if this run is already in the history
      const existingRunIndex = runHistory.findIndex(run => run.id === activeRunId);
      
      if (existingRunIndex === -1) {
        // Get unique document and scheme counts
        const uniqueDocIds = [...new Set(typedResults.map(r => r.document_id))];
        const uniqueSchemeIds = [...new Set(typedResults.map(r => r.scheme_id))];
        
        // Get the first result to extract run info
        const firstResult = typedResults[0];
        
        // Create a new run history item
        const newRunItem: RunHistoryItem = {
          id: activeRunId,
          name: firstResult.run_name || `Run ${activeRunId}`,
          timestamp: firstResult.timestamp ? format(new Date(firstResult.timestamp), 'PPp') : format(new Date(), 'PPp'),
          documentCount: uniqueDocIds.length,
          schemeCount: uniqueSchemeIds.length
        };
        
        // Add to run history
        setRunHistory(prev => [newRunItem, ...prev]);
      }
    }
  }, [activeRunId, typedResults, runHistory]);

  // Effect to fetch results when activeRunId changes
  useEffect(() => {
    if (activeRunId && activeWorkspace) {
      const workspaceId = typeof activeWorkspace.uid === 'string' 
        ? parseInt(activeWorkspace.uid, 10) 
        : activeWorkspace.uid;
        
      loadResultsByRun(activeRunId, workspaceId);
    }
  }, [activeRunId, activeWorkspace, loadResultsByRun]);

  // Effect to update run info when results are loaded
  useEffect(() => {
    if (typedResults.length > 0 && activeRunId) {
      // Get the first result to extract run info
      const firstResult = typedResults[0];
      
      // Get unique document and scheme counts
      const uniqueDocIds = [...new Set(typedResults.map(r => r.document_id))];
      const uniqueSchemeIds = [...new Set(typedResults.map(r => r.scheme_id))];
      
      const runInfo = {
        id: activeRunId,
        name: firstResult.run_name || `Run ${activeRunId}`,
        timestamp: firstResult.timestamp ? format(new Date(firstResult.timestamp), 'PPp') : format(new Date(), 'PPp'),
        documentCount: uniqueDocIds.length,
        schemeCount: uniqueSchemeIds.length
      };
      
      setActiveRunInfo(runInfo);
      
      // Set the selected documents and schemes
      setSelectedDocs(uniqueDocIds);
      setSelectedSchemes(uniqueSchemeIds);
    } else if (!activeRunId) {
      setActiveRunInfo(null);
    }
  }, [typedResults, activeRunId]);

  const handleRunNameChange = (newName: string) => {
    setRunName(newName);
    if (activeRunInfo) {
      setActiveRunInfo({
        ...activeRunInfo,
        name: newName
      });
    }
  };

  const handleRunDescriptionChange = (newDescription: string) => {
    setRunDescription(newDescription);
    // We don't update activeRunInfo here since it doesn't have a description field
  };

  // Fetch classification results
  const fetchResults = async (specificRunId?: number) => {
    if (!activeWorkspace) return;
    
    setIsLoadingResults(true);
    
    try {
      // Convert workspace ID to number if needed
      const workspaceId = typeof activeWorkspace.uid === 'string' 
        ? parseInt(activeWorkspace.uid, 10) 
        : activeWorkspace.uid;
      
      // Use loadResultsByRun directly
      await loadResultsByRun(specificRunId || activeRunId || 0, workspaceId);
      
      // After fetching results, update the run info if needed
      if (typedResults.length > 0) {
        // Get unique document and scheme counts
        const uniqueDocIds = [...new Set(typedResults.map(r => r.document_id))];
        const uniqueSchemeIds = [...new Set(typedResults.map(r => r.scheme_id))];
        
        // Get the first result to extract run info
        const firstResult = typedResults[0];
        
        // If we're loading a specific run or don't have active run info yet
        if (specificRunId || !activeRunInfo) {
          const runInfo = {
            id: specificRunId || firstResult.run_id,
            name: firstResult.run_name || `Run ${firstResult.run_id}`,
            timestamp: firstResult.timestamp ? format(new Date(firstResult.timestamp), 'PPp') : format(new Date(), 'PPp'),
            documentCount: uniqueDocIds.length,
            schemeCount: uniqueSchemeIds.length
          };
          
          setActiveRunInfo(runInfo);
          setActiveRunId(runInfo.id);
          setRunName(runInfo.name);
          
          // Add to run history if not already there
          if (!runHistory.some(r => r.id === runInfo.id)) {
            setRunHistory(prev => [runInfo, ...prev]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching classification results:", error);
      toast({
        title: "Error fetching results",
        description: "Failed to fetch classification results",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Fix for the toast notification without using icon property
  useEffect(() => {
    if (typedResults.length > 0 && activeRunId) {
      toast({
        title: "Run loaded successfully",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Loaded {typedResults.length} classification results</span>
          </div>
        ),
        variant: "default",
        duration: 3000,
      });
    }
  }, [typedResults, activeRunId, toast]);

  const handleRunClassification = async () => {
    if (!selectedDocs.length || !selectedSchemes.length || !activeWorkspace) return;
    
    setIsRunning(true);
    const runId = Date.now() % 1000000000;
    
    try {
      const { apiKeys, selectedProvider, selectedModel } = useApiKeysStore.getState();
      
      if (!selectedProvider || !apiKeys[selectedProvider]) {
        throw new Error('API key not found for selected provider');
      }
      
      // Get the API key for the selected provider
      const apiKey = apiKeys[selectedProvider];
      console.log(`ClassificationRunner: Using API key: ${apiKey ? 'Yes (key hidden)' : 'No'}`);

      await Promise.all(
        selectedDocs.map(async (docId) => {
          return Promise.all(
            selectedSchemes.map(async (schemeId) => {
              return ApiClassificationService.classifyDocument({
                documentId: docId,
                schemeId: schemeId,
                provider: selectedProvider,
                model: selectedModel,
                runId: runId,
                runName: runName || `Run ${runId}`,
                runDescription: runDescription,
                xApiKey: apiKey // Pass the API key
              });
            })
          );
        })
      );

      // Use the hook's setActiveRunId
      setActiveRunId(runId);
      
      // Add a new run to the history
      const newRunInfo = {
        id: runId,
        name: runName || `Run ${runId}`,
        timestamp: format(new Date(), 'PPp'),
        documentCount: selectedDocs.length,
        schemeCount: selectedSchemes.length
      };
      
      setRunHistory(prev => [newRunInfo, ...prev]);
      setActiveRunInfo(newRunInfo);
      
      // Fetch the results for the new run
      const workspaceId = typeof activeWorkspace.uid === 'string' 
        ? parseInt(activeWorkspace.uid, 10) 
        : activeWorkspace.uid;
        
      // Wait a moment for the backend to process the results
      setTimeout(async () => {
        await loadResultsByRun(runId, workspaceId);
        
        toast({
          title: "Classification completed",
          description: `Successfully classified ${selectedDocs.length} documents with ${selectedSchemes.length} schemes`,
          duration: 5000,
        });
      }, 1000);
      
    } catch (error) {
      console.error('Classification failed:', error);
      toast({
        title: "Classification failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Function to handle loading from a selected run
  const handleLoadFromRun = async (runId: number, runName: string, runDescription?: string) => {
    if (!activeWorkspace) return;
    
    setIsLoadingResults(true);
    toast({
      title: "Loading run",
      description: `Loading results from run: ${runName} (ID: ${runId})`,
    });
    
    try {
      // Convert workspace ID to number if needed
      const workspaceId = typeof activeWorkspace.uid === 'string' 
        ? parseInt(activeWorkspace.uid, 10) 
        : activeWorkspace.uid;
        
      // Fetch results for the selected run
      await loadResultsByRun(runId, workspaceId);
      
      // After fetching, extract unique document and scheme IDs
      const uniqueDocIds = [...new Set(typedResults.map(r => r.document_id))];
      const uniqueSchemeIds = [...new Set(typedResults.map(r => r.scheme_id))];
      
      // Update selected documents and schemes
      setSelectedDocs(uniqueDocIds);
      setSelectedSchemes(uniqueSchemeIds);
      
      // Update active run information
      setActiveRunId(runId);
      setRunName(runName);
      setRunDescription(runDescription || '');
      
      toast({
        title: "Run loaded successfully",
        description: `Loaded ${uniqueDocIds.length} documents and ${uniqueSchemeIds.length} schemes from run "${runName}"`,
        variant: "default",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error loading run:", error);
      toast({
        title: "Error loading run",
        description: "Failed to load results from the selected run",
        variant: "destructive",
      });
    } finally {
      setIsLoadingResults(false);
      setIsRunHistoryOpen(false);
    }
  };

  const groupedResults = useMemo(() => {
    if (!typedResults.length) return new Map();

    // Convert to compatible types for grouping
    const compatibleResultsForGrouping = resultsToResultReads(typedResults);
    
    const grouped = new Map<string, ClassificationResultRead[]>();
    
    compatibleResultsForGrouping.forEach(result => {
      const date = new Date(result.timestamp).toLocaleDateString();
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)?.push(result);
    });

    return grouped;
  }, [typedResults]);

  // Simplified filtered results calculation
  const filteredResults = useMemo(() => {
    if (filters.length === 0) return typedResults;
    
    console.log(`Applying ${filters.length} filters to ${typedResults.length} results`);
    
    // Convert results to a format that's easier to work with
    const resultsById = typedResults.reduce<Record<number, FormattedClassificationResult[]>>((acc, result) => {
      const docId = result.document_id;
      if (!acc[docId]) acc[docId] = [];
      acc[docId].push(result);
      return acc;
    }, {});
    
    // Filter document IDs based on the filters
    const filteredDocIds = Object.keys(resultsById)
      .map(Number)
      .filter(docId => {
        const docResults = resultsById[docId];
        
        // Check if this document matches all filters
        return filters.every(filter => {
          // Get results for this scheme
          const schemeResults = docResults.filter(r => r.scheme_id === filter.schemeId);
          
          // If no results for this scheme, skip this filter
          if (schemeResults.length === 0) return true;
          
          // Check if any result matches the filter
          return schemeResults.some(result => {
            // Get the scheme
            const scheme = schemes.find(s => s.id === filter.schemeId);
            if (!scheme) return true;
            
            // Special handling for entity statements (List[Dict[str, any]])
            if (scheme.fields?.[0]?.type === 'List[Dict[str, any]]' && filter.operator === 'contains') {
              // For entity statements, search within entity names and statements
              if (Array.isArray(result.value)) {
                const searchTerm = String(filter.value || '').toLowerCase();
                
                // Check if any entity or statement contains the search term
                return result.value.some(item => {
                  if (typeof item !== 'object' || item === null) {
                    return String(item).toLowerCase().includes(searchTerm);
                  }
                  
                  // Check entity field
                  if ('entity' in item && typeof item.entity === 'string') {
                    if (item.entity.toLowerCase().includes(searchTerm)) {
                      return true;
                    }
                  }
                  
                  // Check statement field
                  if ('statement' in item && typeof item.statement === 'string') {
                    if (item.statement.toLowerCase().includes(searchTerm)) {
                      return true;
                    }
                  }
                  
                  // Check all other fields
                  return Object.values(item).some(val => 
                    typeof val === 'string' && val.toLowerCase().includes(searchTerm)
                  );
                });
              }
              
              // If it has a default_field, search in that
              if (typeof result.value === 'object' && 
                  result.value !== null && 
                  'default_field' in result.value &&
                  typeof result.value.default_field === 'string') {
                return result.value.default_field.toLowerCase().includes(String(filter.value || '').toLowerCase());
              }
              
              // Fallback to string representation
              return String(result.value || '').toLowerCase().includes(String(filter.value || '').toLowerCase());
            }
            
            // Get the display value
            const displayValue = result.displayValue;
            
            // Apply the filter based on the operator
            switch (filter.operator) {
              case 'equals':
                if (typeof displayValue === 'string' && typeof filter.value === 'string') {
                  return displayValue.toLowerCase() === filter.value.toLowerCase();
                }
                if (typeof displayValue === 'number' && typeof filter.value === 'number') {
                  return displayValue === filter.value;
                }
                return String(displayValue) === String(filter.value);
                
              case 'contains':
                // Convert both to strings for comparison
                return String(displayValue || '').toLowerCase().includes(String(filter.value || '').toLowerCase());
                
              case 'range':
                if (typeof displayValue === 'number' && Array.isArray(filter.value) && filter.value.length === 2) {
                  const [min, max] = filter.value as number[];
                  return displayValue >= min && displayValue <= max;
                }
                return true;
                
              default:
                return true;
            }
          });
        });
      });
    
    // Return only results for filtered documents
    const filtered = typedResults.filter(result => filteredDocIds.includes(result.document_id));
    console.log(`Filtered results: ${filtered.length} of ${typedResults.length}`);
    return filtered;
  }, [typedResults, filters, schemes]) as FormattedClassificationResult[];

  const handleDataPointClick = (date: string) => {
    const results = groupedResults.get(date);
    if (results) {
      // Explicitly type the arrays as numbers
      const docIds = [...new Set(results.map(r => r.document_id))] as number[];
      const schemeIds = [...new Set(results.map(r => r.scheme_id))] as number[];
      setSelectedDocs(docIds);
      setSelectedSchemes(schemeIds);
    }
  };

  // Render run selector
  const renderRunSelector = () => (
    <div className="flex items-center gap-4 mb-4">
      <label htmlFor="run-selector" className="text-sm font-medium">Select Run:</label>
      <select
        id="run-selector"
        value={activeRunId?.toString() || ''}
        onChange={(e) => setActiveRunId(e.target.value ? Number(e.target.value) : null)}
        className="p-2 rounded border"
      >
        <option value="">Select a run...</option>
        {runs.map(run => (
          <option key={run.id} value={run.id.toString()}>
            {run.name ? `${run.name} - ` : ''}{format(run.timestamp, 'MMM d, yyyy HH:mm:ss')}
          </option>
        ))}
      </select>
    </div>
  );

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<any>();
    return [
      columnHelper.accessor('document', {
        header: 'Document',
        cell: (info) => {
          const doc = info.getValue();
          return (
            <div className="font-medium">
              {doc?.title || `Document ${doc?.id}`}
            </div>
          );
        },
      }),
      columnHelper.accessor('schemes', {
        header: 'Scheme',
        cell: (info) => {
          const schemes = info.getValue();
          return (
            <div className="space-y-1">
              {schemes.map((scheme: any) => (
                <div key={scheme.id} className="text-sm font-medium">{scheme.name}</div>
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor('results', {
        header: 'Value',
        cell: (info) => {
          const results = info.getValue();
          return (
            <div className="space-y-3">
              {results.map((result: any) => (
                <div key={result.id} className="p-2 bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">{result.scheme?.name}</span>
                      </div>
                      <ClassificationResultDisplay 
                        result={result}
                        scheme={result.scheme}
                        compact={true}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground pl-4">
                      {format(new Date(result.timestamp), "PP · p")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor('timestamp', {
        header: 'Date',
        cell: (info) => format(new Date(info.getValue()), 'PP p'),
      }),
      columnHelper.accessor('run_name', {
        header: 'Run',
        cell: (info) => info.getValue() || '-',
      }),
    ];
  }, []);

  // Table data preparation
  const tableData = useMemo(() => {
    // Group results by document
    const resultsByDocument = typedResults.reduce<Record<number, any[]>>((acc, result) => {
      if (!acc[result.document_id]) {
        acc[result.document_id] = [];
      }
      
      // Find the scheme for this result
      const scheme = schemes.find(s => s.id === result.scheme_id);
      
      // Convert to ClassificationResultRead for compatibility with the table
      const resultAsRead = {
        id: result.id,
        document_id: result.document_id,
        scheme_id: result.scheme_id,
        value: result.value,
        timestamp: result.timestamp,
        run_id: result.run_id,
        run_name: result.run_name,
        run_description: result.run_description,
        document: result.document as unknown as DocumentRead,
        scheme: scheme as unknown as ClassificationSchemeRead
      } as ClassificationResultRead & { scheme?: ClassificationSchemeRead };
      
      acc[result.document_id].push(resultAsRead);
      return acc;
    }, {});
    
    // Convert to array format for the table
    return Object.entries(resultsByDocument).map(([docId, results]) => {
      const doc = documents.find(d => d.id === Number(docId));
      const uniqueSchemes = [...new Set(results.map(r => r.scheme_id))].map(
        schemeId => schemes.find(s => s.id === schemeId)
      ).filter(Boolean);
      
      // Use the most recent timestamp for the document row
      const latestResult = results.reduce((latest, current) => 
        new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
      );
      
      return {
        document_id: Number(docId),
        document: doc,
        schemes: uniqueSchemes,
        results: results,
        timestamp: latestResult.timestamp
      };
    });
  }, [typedResults, schemes, documents]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onRowClick: (row: any) => {
        setSelectedDocumentId(row.original.document_id);
        setIsResultDialogOpen(true);
      }
    }
  });

  // Add a new function to handle tutorial dismissal
  const handleDismissTutorial = () => {
    toggleClassificationRunnerTutorial();
    toast({
      title: "Tutorial hidden",
      description: "You can re-enable tutorials in settings",
      variant: "default",
    });
  };

  // Replace the header section with enhanced version
  const renderHeader = () => (
    <div className="flex flex-col space-y-3 mb-6 bg-secondary-900/50 p-4 rounded-lg border border-secondary-800">
      <div className="flex items-center justify-between">
        {activeRunInfo ? (
          <div className="flex-1">
            <div 
              className="text-lg font-medium text-secondary-300 cursor-pointer hover:text-secondary-100 group flex items-center"
              onClick={() => {
                setRunName(activeRunInfo.name);
                const nameElement = document.getElementById('run-name-editable');
                if (nameElement) {
                  nameElement.contentEditable = 'true';
                  nameElement.focus();
                  const selection = window.getSelection();
                  const range = document.createRange();
                  range.selectNodeContents(nameElement);
                  selection?.removeAllRanges();
                  selection?.addRange(range);
                }
              }}
            >
              <span id="run-name-editable" 
                className="border-b border-dashed border-transparent group-hover:border-secondary-500 px-1"
                onBlur={(e) => {
                  e.currentTarget.contentEditable = 'false';
                  if (e.currentTarget.textContent) {
                    handleRunNameChange(e.currentTarget.textContent);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
              >
                {activeRunInfo.name}
              </span>
              <Pencil className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to edit the name of this classification run</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Enter run name..."
                value={runName}
                onChange={(e) => setRunName(e.target.value)}
                className="text-lg font-medium bg-transparent border-b border-dashed border-secondary-700 focus:border-secondary-500 focus:outline-none px-1 text-secondary-300 w-64"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter a name for this classification run</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>
      
      {/* Editable description */}
      <div 
        className="text-sm text-secondary-400 cursor-pointer hover:text-secondary-200 group flex items-center"
        onClick={() => {
          const descElement = document.getElementById('run-description-editable');
          if (descElement) {
            descElement.contentEditable = 'true';
            descElement.focus();
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(descElement);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }}
      >
        <span id="run-description-editable" 
          className="italic border-b border-dashed border-transparent group-hover:border-secondary-700 px-1"
          onBlur={(e) => {
            e.currentTarget.contentEditable = 'false';
            if (e.currentTarget.textContent !== null) {
              handleRunDescriptionChange(e.currentTarget.textContent);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {runDescription || "Add a description..."}
        </span>
        <Pencil className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to add a description for this classification run</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Tutorial banner */}
      {showClassificationRunnerTutorial && (
        <div className="bg-secondary-900 border border-secondary-700 rounded-md p-3 mt-1 text-sm flex items-start">
          <Info className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium mb-1">Classification Runner</p>
            <p className="text-secondary-300">
              This tool allows you to run classification models on your documents. 
              Configure your run by selecting documents and classification schemes, 
              then click "Run Classification" to start the process.
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full"
            onClick={handleDismissTutorial}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      )}
    </div>
  );

  // Convert our new types to the old API types for compatibility
  const compatibleSchemes = useMemo(() => schemesToSchemeReads(schemes), [schemes]);
  const compatibleResults = useMemo(() => resultsToResultReads(typedResults), [typedResults]);

  if (!activeWorkspace) {
    return (
      <p className="text-center text-red-400">
        Please select a workspace to continue.
      </p>
    );
  }

  return (
    <DocumentDetailProvider>
      <DocumentDetailWrapper onLoadIntoRunner={(runId, runName) => handleLoadFromRun(runId, runName)}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex-1 overflow-auto">
            {/* Use the new header component */}
            {renderHeader()}
            
            <div className="flex flex-col space-y-6">
              {/* Configuration section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document selection - Changed to list view */}
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-secondary-300 flex items-center">
                      Documents
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Select documents to analyze with classification models</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (selectedDocs.length === documents.length) {
                            setSelectedDocs([]);
                          } else {
                            setSelectedDocs(documents.map(doc => doc.id));
                          }
                        }}
                      >
                        {selectedDocs.length === documents.length ? 'Deselect All' : 'Select All'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDocumentManagerOpen(true)}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-secondary-800 rounded-md p-2">
                    {documents.length === 0 ? (
                      <div className="text-sm text-secondary-500 p-2 text-center">
                        No documents available. Click "Manage" to add documents.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {documents.map(doc => (
                          <div key={doc.id} className="flex items-start p-2 hover:bg-primary-900/50 rounded-md">
                            <Checkbox
                              checked={selectedDocs.includes(doc.id)}
                              onCheckedChange={(checked) => {
                                setSelectedDocs(prev =>
                                  checked 
                                    ? [...prev, doc.id] 
                                    : prev.filter(id => id !== doc.id)
                                );
                              }}
                              id={`doc-${doc.id}`}
                              className="mt-0.5 mr-2"
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={`doc-${doc.id}`}
                                className="text-sm font-medium text-secondary-300 cursor-pointer block"
                              >
                                {doc.title || `Document ${doc.id}`}
                              </label>
                              {doc.summary && (
                                <p className="text-xs text-secondary-500 mt-0.5 line-clamp-1">
                                  {doc.summary}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-secondary-500">
                    {selectedDocs.length} document{selectedDocs.length !== 1 ? 's' : ''} selected
                  </div>
                </div>

                {/* Classification scheme selection - Keeping as card grid */}
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-secondary-300 flex items-center">
                      Classification Schemes
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Select classification schemes to apply to your documents</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (selectedSchemes.length === schemes.length) {
                            setSelectedSchemes([]);
                          } else {
                            setSelectedSchemes(schemes.map(scheme => scheme.id));
                          }
                        }}
                      >
                        {selectedSchemes.length === schemes.length ? 'Deselect All' : 'Select All'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSchemeManagerOpen(true)}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-secondary-800 rounded-md p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {schemes.length === 0 ? (
                      <div className="text-sm text-secondary-500 p-2 text-center col-span-full">
                        No schemes available. Click "Manage" to add schemes.
                      </div>
                    ) : (
                      schemes.map(scheme => (
                        <div key={scheme.id} className="flex flex-col p-2 bg-primary-900/50 hover:bg-primary-800 rounded-md border border-secondary-800 shadow-sm">
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={selectedSchemes.includes(scheme.id)}
                              onCheckedChange={(checked) => {
                                setSelectedSchemes(prev =>
                                  checked 
                                    ? [...prev, scheme.id] 
                                    : prev.filter(id => id !== scheme.id)
                                );
                              }}
                              id={`scheme-${scheme.id}`}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={`scheme-${scheme.id}`}
                                className="text-sm font-medium text-secondary-300 cursor-pointer block"
                              >
                                {scheme.name}
                              </label>
                              {scheme.description && (
                                <p className="text-xs text-secondary-500 mt-1 line-clamp-2">
                                  {scheme.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Display fields */}
                          {scheme.fields && scheme.fields.length > 0 && (
                            <div className="mt-2 pl-6 border-t border-secondary-800 pt-2">
                              <p className="text-xs font-medium text-secondary-400 mb-1">Fields:</p>
                              <div className="space-y-1">
                                {scheme.fields.map((field, idx) => (
                                  <div key={idx} className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                    <span className="text-xs text-secondary-300">{field.name}</span>
                                    <span className="text-xs text-secondary-500 ml-auto">{field.type}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-1 text-xs text-secondary-500">
                    {selectedSchemes.length} scheme{selectedSchemes.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              </div>

              {/* Provider selector and run controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-secondary-300 flex items-center">
                    Run Controls
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Run classification or view history</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsRunHistoryOpen(true)}
                      className="flex items-center w-full"
                    >
                      <History className="h-4 w-4 mr-2" />
                      Run History
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleRunClassification}
                      disabled={isRunning || selectedDocs.length === 0 || selectedSchemes.length === 0}
                      className="flex items-center w-full"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-secondary-300">Model Provider</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select the AI model provider to use for classification</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <ProviderSelector className="w-full" />
                </div>
              </div>

              {/* Results section */}
              {activeRunId && (
                <div className="mt-4 border-t border-secondary-800 pt-4">
                  <h3 className="text-sm font-medium text-secondary-300 mb-2 flex items-center">
                    Results
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View and analyze classification results</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  
                  {/* View mode toggle */}
                  <div className="flex items-center space-x-3 mb-4">
                    <label className="text-sm font-medium text-secondary-300">View Mode:</label>
                    <div className="relative bg-secondary-900 border border-secondary-800 rounded-lg p-1 flex items-center">
                      {/* Animated highlight background */}
                      <div 
                        className={`absolute inset-y-1 transition-all duration-200 ease-in-out rounded-md ${
                          viewMode === 'table' ? 'left-1 right-[calc(50%+1px)]' : 'left-[calc(50%+1px)] right-1'
                        }`}
                        style={{
                          background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      
                      {/* Table button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`relative z-10 px-3 py-1.5 rounded-md flex items-center gap-1.5 min-w-[80px] justify-center ${
                          viewMode === 'table' 
                            ? 'text-primary-500 font-medium' 
                            : 'text-secondary-400 hover:text-secondary-300'
                        }`}
                        onClick={() => setViewMode('table')}
                      >
                        <TableIcon className="h-4 w-4" />
                        <span className="text-xs">Table</span>
                      </Button>
                      
                      {/* Divider */}
                      <div className="h-5 w-px bg-secondary-800 mx-1" />
                      
                      {/* Chart button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`relative z-10 px-3 py-1.5 rounded-md flex items-center gap-1.5 min-w-[80px] justify-center ${
                          viewMode === 'chart' 
                            ? 'text-primary-500 font-medium' 
                            : 'text-secondary-400 hover:text-secondary-300'
                        }`}
                        onClick={() => setViewMode('chart')}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-xs">Chart</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Results content */}
                  <div className="space-y-4">
                    <ResultFilters
                      filters={filters}
                      schemes={schemes as unknown as ClassificationSchemeRead[]}
                      onChange={setFilters}
                    />
                    
                    {filters.length > 0 && (
                      <div className="flex items-center justify-between text-sm text-muted-foreground mt-2 mb-4 p-2 bg-muted/20 rounded-md border">
                        <div>
                          <span className="font-medium">{filteredResults.length}</span> of <span className="font-medium">{typedResults.length}</span> results match your filters
                          <span className="mx-2">•</span>
                          <span className="font-medium">{new Set(filteredResults.map(r => r.document_id)).size}</span> of <span className="font-medium">{new Set(typedResults.map(r => r.document_id)).size}</span> documents
                        </div>
                        {filteredResults.length !== typedResults.length && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setFilters([])}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {typedResults.length === 0 ? (
                      <div className="text-center py-8 text-secondary-400">
                        No results for the selected run.
                      </div>
                    ) : (
                      <div>
                        {viewMode === 'chart' ? (
                          <ClassificationResultsChart 
                            results={filteredResults as unknown as ClassificationResultRead[]} 
                            schemes={schemes.filter(s => selectedSchemes.includes(s.id)) as unknown as ClassificationSchemeRead[]}
                            documents={documents}
                            onDocumentSelect={(documentId) => {
                              const docResults = filteredResults.filter(
                                result => result.document_id === documentId
                              );
                              const doc = documents.find(d => d.id === documentId);
                              if (doc) {
                                setSelectedDate(new Date(doc.insertion_date).toLocaleDateString());
                              }
                            }}
                            chartData={chartData}
                            onDataPointClick={handleDataPointClick}
                          />
                        ) : (
                          <div className="overflow-x-auto">
                            {isLoadingResults ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                              </div>
                            ) : (
                              <table className="w-full">
                                <thead>
                                  {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                      {headerGroup.headers.map(header => (
                                        <th key={header.id} className="text-left p-2 border-b">
                                          {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                      ))}
                                    </tr>
                                  ))}
                                </thead>
                                <tbody>
                                  {table.getRowModel().rows.map(row => (
                                    <tr 
                                      key={row.id} 
                                      className="hover:bg-muted/50 cursor-pointer"
                                      onClick={() => table.options.meta?.onRowClick?.(row)}
                                    >
                                      {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-2 border-b max-h-10 overflow-y-auto">
                                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Run History Dialog */}
          <RunHistoryDialog
            isOpen={isRunHistoryOpen}
            onClose={() => setIsRunHistoryOpen(false)}
            activeRunId={activeRunId}
            onSelectRun={(runId, runName, runDescription) => {
              handleLoadFromRun(runId, runName, runDescription);
              setIsRunHistoryOpen(false);
            }}
          />

          {/* Result Detail Dialog */}
          <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Classification Results</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[80vh]">
                {selectedDocumentId && (
                  <div className="space-y-6 p-4">
                    <div>
                      <h3 className="font-medium text-lg">Document</h3>
                      {documents.find(d => d.id === selectedDocumentId)?.title || `Document ${selectedDocumentId}`}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Classifications</h3>
                      {typedResults
                        .filter(result => result.document_id === selectedDocumentId)
                        .map(result => {
                          const scheme = schemes.find(s => s.id === result.scheme_id);
                          if (!scheme) return null;
                          
                          return (
                            <div key={result.id} className="border-b pb-4 last:border-b-0">
                              <div className="font-medium text-base mb-2">{scheme.name}</div>
                              <ClassificationResultDisplay 
                                result={result as unknown as ClassificationResultRead}
                                scheme={scheme as unknown as ClassificationSchemeRead}
                              />
                              <div className="text-sm text-muted-foreground mt-2">
                                {result.run_name && (
                                  <p>Run: {result.run_name}</p>
                                )}
                                <p>Classified on: {format(new Date(result.timestamp), 'PPp')}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Document Manager */}
          {isDocumentManagerOpen && (
            <DocumentManagerOverlay
              isOpen={isDocumentManagerOpen}
              onClose={() => setIsDocumentManagerOpen(false)}
              onLoadIntoRunner={(runId, runName) => {
                // Create a RunHistoryItem from the runId and runName
                const runItem: RunHistoryItem = {
                  id: runId,
                  name: runName,
                  timestamp: format(new Date(), 'PPp'),
                  documentCount: 0,  // These will be updated after loading
                  schemeCount: 0
                };
                handleLoadFromRun(runId, runName);
              }}
            />
          )}

          {/* Classification Scheme Manager */}
          {isSchemeManagerOpen && (
            <SchemeManagerOverlay
              isOpen={isSchemeManagerOpen}
              onClose={() => setIsSchemeManagerOpen(false)}
            />
          )}
          
          <Toaster />
        </div>
      </DocumentDetailWrapper>
    </DocumentDetailProvider>
  );
}