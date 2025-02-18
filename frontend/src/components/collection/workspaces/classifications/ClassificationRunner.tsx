'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { FileText, Microscope, Loader2, X } from 'lucide-react';
import {
  ClassificationSchemeRead,
  ClassificationResultRead,
  DocumentRead,
  ClassificationResultCreate,
} from '@/client/models';
import ClassificationResultsChart from '@/components/collection/workspaces/classifications/ClassificationResultsChart';
import { useDocumentStore } from '@/zustand_stores/storeDocuments';
import { useClassificationSchemeStore } from '@/zustand_stores/storeSchemas';
import { useClassificationResultStore } from '@/zustand_stores/storeClassificationResults';
import { useSavedResultSetStore } from '@/zustand_stores/storeSavedResults';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { format } from 'date-fns';
import { Switch } from "@/components/ui/switch"
import { 
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper
} from '@tanstack/react-table';
import { ResultFilters } from './ResultFilters';
import { colorPalette } from '@/components/collection/workspaces/classifications/ClassificationResultsChart';
import { formatClassificationValue, safeFormatDate } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SchemePreview } from "@/components/collection/workspaces/schemes/SchemePreview";
import { SchemeFormData } from '@/lib/abstract-classification-schema';
import ClassificationResultDisplay from './ClassificationResultDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import DraggableDocumentManager from '../documents/DraggableDocumentManager';
import DraggableWrapper from '../../wrapper/draggable-wrapper';
import ClassificationSchemeManager from './ClassificationSchemeManager';
import DraggableSchemeManager from './DraggableSchemeManager';

interface ClassificationRun {
  id: string; // Unique identifier for the run
  timestamp: Date;
  documentIds: number[];
  schemeIds: number[];
  results: ClassificationResultRead[];
  name?: string; // Optional name for the run
  description?: string; // Optional description for the run
}

interface ResultFilter {
  schemeId: number;
  operator: 'equals' | 'contains' | 'range';
  value: any;
}

const formatDisplayValue = (value: any, scheme: ClassificationSchemeRead) => {
  if (!value) return null;

  switch (scheme.type) {
    case 'int':
      // Check scale range to determine binary vs scale
      if (scheme.scale_min === 0 && scheme.scale_max === 1) {
        return value > 0.5 ? 'Positive' : 'Negative';
      }
      return typeof value === 'number' ? Number(value.toFixed(2)) : value;
      
    case 'List[str]':
      if (scheme.is_set_of_labels && scheme.labels) {
        // If value is already a label, return it
        if (typeof value === 'string' && scheme.labels.includes(value)) {
          return value;
        }
        // If value is an index, convert to label
        if (typeof value === 'number' && scheme.labels[value]) {
          return scheme.labels[value];
        }
      }
      return value;
      
    default:
      return value;
  }
};

export default function ClassificationRunner() {
  const { activeWorkspace } = useWorkspaceStore();
  const { fetchDocuments } = useDocumentStore();
  const { classificationSchemes, fetchClassificationSchemes } = useClassificationSchemeStore();
  const { classificationResults, fetchClassificationResults, createClassificationResult } = useClassificationResultStore();
  const { savedResults, fetchSavedResults, saveResultSet, loadResultSet } = useSavedResultSetStore();
  const documents = useDocumentStore(state => state.documents);
  const schemes = useClassificationSchemeStore(state => state.classificationSchemes);

  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [selectedSchemes, setSelectedSchemes] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [runs, setRuns] = useState<ClassificationRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [runName, setRunName] = useState<string>('');
  const [runDescription, setRunDescription] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [filters, setFilters] = useState<ResultFilter[]>([]);
  const [selectedResult, setSelectedResult] = useState<ClassificationResultRead | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [isDocumentManagerOpen, setIsDocumentManagerOpen] = useState(false);
  const [isSchemesOpen, setIsSchemesOpen] = useState(false);
  const [isSchemesDraggableOpen, setIsSchemesDraggableOpen] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      fetchDocuments();
      fetchClassificationSchemes(activeWorkspace.uid);
      fetchSavedResults();
    }
  }, [activeWorkspace, fetchDocuments, fetchClassificationSchemes, fetchSavedResults]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!activeWorkspace || selectedDocs.length === 0) return;
      
      try {
        // Fetch results for all selected documents
        for (const docId of selectedDocs) {
          await fetchClassificationResults(docId, activeWorkspace.uid);
        }
      } catch (error) {
        console.error("Error fetching classification results:", error);
      }
    };

    fetchResults();
  }, [activeWorkspace, selectedDocs, fetchClassificationResults]);

  // Get active run results
  const activeResults = useMemo(() => {
    const activeRun = runs.find(run => run.id === activeRunId);
    return activeRun?.results || [];
  }, [runs, activeRunId]);

  useEffect(() => {
    // Function to transform classification results into chart data
    const transformResultsToChartData = (results: ClassificationResultRead[]) => {
      const grouped = new Map<string, ClassificationResultRead[]>();

      results.forEach(result => {
        const date = new Date(result.timestamp).toLocaleDateString();
        if (!grouped.has(date)) {
          grouped.set(date, []);
        }
        grouped.get(date)?.push(result);
      });

      const chartData = Array.from(grouped.entries()).map(([date, results]) => ({
        date,
        // Example: count of results for each date
        count: results.length,
        // Add more aggregated data as needed
      }));
      return chartData;
    };

    // Update chart data whenever activeResults change
    if (activeResults) {
      const newChartData = transformResultsToChartData(activeResults);
      setChartData(newChartData);
    }
  }, [activeResults]);

  const toggleDocSelection = (docId: number) => {
    setSelectedDocs(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const toggleSchemeSelection = (schemeId: number) => {
    setSelectedSchemes(prev =>
      prev.includes(schemeId) ? prev.filter(id => id !== schemeId) : [...prev, schemeId]
    );
  };

  const handleRunClassification = async () => {
    if (!selectedDocs.length || !selectedSchemes.length) return;
    
    setIsRunning(true);
    const runId = `run_${Date.now()}`;
    
    try {
      const results = await Promise.all(
        selectedDocs.map(async (docId) => {
          return Promise.all(
            selectedSchemes.map(async (schemeId) => {
              const result = await createClassificationResult({
                document_id: docId,
                scheme_id: schemeId,
                value: {}, // The backend will populate this
                timestamp: new Date().toISOString(),
                run_name: runId,
                run_description: runDescription
              }, activeWorkspace!.uid);
              return result;
            })
          );
        })
      );

      const newRun: ClassificationRun = {
        id: runId,
        timestamp: new Date(),
        documentIds: selectedDocs,
        schemeIds: selectedSchemes,
        results: results.flat(),
        name: runName,
        description: runDescription
      };

      setRuns(prev => [...prev, newRun]);
      setActiveRunId(runId);
    } catch (error) {
      console.error('Error running classification:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveResultSet = async (name: string) => {
    if (!activeWorkspace) return;

    // Implement save result set logic here
  };

  const handleLoadResultSet = async (resultSetId: number) => {
    if (!activeWorkspace) return;

    // Implement load result set logic here
  };

  const groupedResults = useMemo(() => {
    if (!activeResults.length) return new Map();

    const grouped = new Map<string, ClassificationResultRead[]>();
    
    activeResults.forEach(result => {
      const date = new Date(result.timestamp).toLocaleDateString();
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)?.push(result);
    });

    return grouped;
  }, [activeResults]);

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
        value={activeRunId || ''}
        onChange={(e) => setActiveRunId(e.target.value || null)}
        className="p-2 rounded border"
      >
        <option value="">Select a run...</option>
        {runs.map(run => (
          <option key={run.id} value={run.id}>
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
      columnHelper.accessor('scheme', {
        header: 'Scheme',
        cell: (info) => info.getValue()?.name,
      }),
      columnHelper.accessor('value', {
        header: 'Value',
        cell: (info) => {
          const result = info.row.original;
          const scheme = result.scheme;
          return (
            <div className="p-2 bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{scheme?.name}</span>
                  </div>
                  <ClassificationResultDisplay 
                    result={result}
                    scheme={scheme}
                    compact={true}
                  />
                </div>
                <div className="text-xs text-muted-foreground pl-4">
                  {format(new Date(result.timestamp), "PP · p")}
                </div>
              </div>
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

  const table = useReactTable({
    data: classificationResults,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  // Filtered results calculation
  const filteredResults = useMemo(() => {
    return activeResults.filter(result => {
      return filters.every(filter => {
        const scheme = schemes.find(s => s.id === filter.schemeId);
        if (!scheme) return true;
        
        const value = formatDisplayValue(result.value, scheme);
        
        switch(filter.operator) {
          case 'equals': return value === filter.value;
          case 'contains': return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'range': 
            return value !== null && value >= filter.value[0] && value <= filter.value[1];
          default: return true;
        }
      });
    });
  }, [activeResults, filters, schemes]);

  if (!activeWorkspace) {
    return (
      <p className="text-center text-red-400">
        Please select a workspace to continue.
      </p>
    );
  }

  return (
    <Card className="bg-primary-900 border-secondary-700">
      <CardHeader>
        <CardTitle className="text-secondary-500 text-center">
          Document Classification Runner
        </CardTitle>
        <CardDescription>
          Run classifications on a set of documents and schemes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2 justify-start">
            <Button
              variant="outline"
              className="inline-flex items-center min-w-32 h-12"
              onClick={() => setIsDocumentManagerOpen(true)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Manage Documents
            </Button>
            <Button
              variant="outline"
              className="inline-flex items-center min-w-32 h-12"
              onClick={() => setIsSchemesDraggableOpen(true)}
            >
              <Microscope className="mr-2 h-4 w-4" />
              Manage Schemes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Documents Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-secondary-400 mb-2">Select Documents</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const allDocIds = documents.map(doc => doc.id);
                  setSelectedDocs(prev => 
                    prev.length === documents.length ? [] : allDocIds
                  );
                }}
                disabled={documents.length === 0}
                className="text-secondary-300 hover:text-secondary-100"
              >
                {selectedDocs.length === documents.length && documents.length > 0 
                  ? 'Deselect All' 
                  : 'Select All'}
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-2 p-1 hover:bg-primary-800">
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => toggleDocSelection(doc.id)}
                    className="accent-secondary-500"
                  />
                  <span className="text-sm text-secondary-300 truncate">
                    {doc.title || `Document ${doc.id}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Schemes Selection */}
          <div className="space-y-2">
            <h3 className="text-secondary-400 mb-2">Select Classification Schemes</h3>
            <div className="max-h-40 overflow-y-auto">
              {schemes.map(scheme => (
                <div key={scheme.id} className="flex items-center gap-2 p-1 hover:bg-primary-800">
                  <input
                    type="checkbox"
                    checked={selectedSchemes.includes(scheme.id)}
                    onChange={() => toggleSchemeSelection(scheme.id)}
                    className="accent-secondary-500"
                  />
                  <span className="text-sm text-secondary-300 truncate">
                    {scheme.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Run controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex flex-col gap-2 flex-1">
            <Input
              type="text"
              placeholder="Run Name"
              value={runName}
              onChange={(e) => setRunName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Run Description"
              value={runDescription}
              onChange={(e) => setRunDescription(e.target.value)}
            />
          </div>
          <Button
            onClick={handleRunClassification}
            disabled={isRunning || !selectedDocs.length || !selectedSchemes.length}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Classifying...
              </>
            ) : 'Run Classification'}
          </Button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-2 mb-4">
          <label htmlFor="view-mode" className="text-sm font-medium">View Mode:</label>
          <Switch id="view-mode" checked={viewMode === 'table'} onCheckedChange={(checked) => setViewMode(checked ? 'table' : 'chart')} />
          <span className="text-sm text-secondary-300">{viewMode === 'chart' ? 'Chart' : 'Table'}</span>
        </div>

        <div className="space-y-4">
          <ResultFilters
            filters={filters}
            schemes={schemes}
            onChange={setFilters}
          />
          
          {/* Results Display */}
          {activeRunId && (
            <>
              {activeResults.length === 0 ? (
                <div>No results for the selected run.</div>
              ) : (
                <div>
                  {viewMode === 'chart' ? (
                    <ClassificationResultsChart 
                      results={activeResults} 
                      schemes={schemes.filter(s => selectedSchemes.includes(s.id))}
                      documents={documents}
                      onDocumentSelect={(documentId) => {
                        const docResults = activeResults.filter(
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
                              onClick={() => {
                                setSelectedResult(row.original);
                                setIsResultDialogOpen(true);
                              }}
                            >
                              {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="p-2 border-b">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>

      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Classification Result Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            {selectedResult && (
              <div className="space-y-4 p-4">
                <div>
                  <h3 className="font-medium">Document</h3>
                  <p>{selectedResult.document?.title || `Document ${selectedResult.document_id}`}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Scheme</h3>
                  <p>{selectedResult.scheme?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedResult.scheme?.description}</p>
                </div>

                <div>
                  <h3 className="font-medium">Classification</h3>
                  <ClassificationResultDisplay 
                    result={selectedResult}
                    scheme={selectedResult.scheme!}
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  {selectedResult.run_name && (
                    <p>Run: {selectedResult.run_name}</p>
                  )}
                  <p>Classified on: {format(new Date(selectedResult.timestamp), 'PPp')}</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <DraggableDocumentManager
        isOpen={isDocumentManagerOpen}
        onClose={() => setIsDocumentManagerOpen(false)}
      />

      <DraggableSchemeManager
        isOpen={isSchemesDraggableOpen}
        onClose={() => setIsSchemesDraggableOpen(false)}
      />

      {isSchemesOpen && (
        <DraggableWrapper
          title="Classification Schemes"
          width="w-[800px]"
          height="h-[600px]"
          defaultPosition={{ x: 100, y: 100 }}
          className="z-[101] bg-background"
          onMinimizeChange={(isMinimized) => {
            if (isMinimized) setIsSchemesOpen(false);
          }}
          headerContent={
            <div className="flex items-center justify-between w-full px-6 py-2 border-b">
              <span className="text-base font-semibold">Classification Schemes</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSchemesOpen(false)}
                className="h-8 w-8 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <div className="h-full overflow-hidden bg-background flex flex-col">
            <ClassificationSchemeManager />
          </div>
        </DraggableWrapper>
      )}
    </Card>
  );
}