import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BrainCircuit, Check, RefreshCw } from "lucide-react";
import { ClassifiableContent, FormattedClassificationResult } from '@/lib/classification/types';
import { useToast } from '@/components/ui/use-toast';
import { useClassificationSystem } from '@/hooks/useClassificationSystem';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { useClassificationSettingsStore } from '@/zustand_stores/storeClassificationSettings';
import { ClassificationService } from '@/lib/classification/service';
import { useApiKeysStore } from '@/zustand_stores/storeApiKeys';

interface ClassificationWidgetProps {
  content: ClassifiableContent;
  onClassificationComplete?: (result: FormattedClassificationResult) => void;
  compact?: boolean;
  showResults?: boolean;
  className?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  runId?: number;
  runName?: string;
  loadResultsOnMount?: boolean;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

function ClassificationWidgetComponent({
  content,
  onClassificationComplete,
  compact = false,
  showResults = true,
  className = '',
  buttonVariant = 'outline',
  buttonSize = 'sm',
  runId,
  runName,
  loadResultsOnMount = true,
  buttonRef
}: ClassificationWidgetProps) {
  const { toast } = useToast();
  const { activeWorkspace } = useWorkspaceStore();
  const { apiKeys, selectedProvider, selectedModel } = useApiKeysStore();
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasLoggedDebugInfo, setHasLoggedDebugInfo] = useState(false);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  
  // Use our consolidated hook instead of useClassification
  const { 
    schemes,
    results: classificationResults,
    isLoadingSchemes,
    isClassifying,
    error,
    loadSchemes,
    loadResults,
    classifyContent,
    getDefaultSchemeId,
    setDefaultSchemeId
  } = useClassificationSystem({
    autoLoadSchemes: true,
    contentId: content.id,
    runId,
    // Only load results if we should show them and loadResultsOnMount is true
    autoLoadDocuments: false,
    autoLoadRuns: false
  });
  
  // Memoize the validated content to prevent unnecessary recalculations
  const validatedContent = useMemo(() => ({
    ...content,
    id: content.id || 0,
    title: content.title || 'Untitled Content',
    text_content: content.text_content || content.content || '',
    url: content.url || '',
    source: content.source || '',
    content_type: content.content_type || 'article'
  }), [content]);
  
  // Debug logging - only run once when component mounts or when these dependencies change
  // Use a flag to ensure we only log once per significant change
  useEffect(() => {
    if (!hasLoggedDebugInfo) {
      console.log("ClassificationWidget - Content ID:", validatedContent.id);
      console.log("ClassificationWidget - Show Results:", showResults);
      console.log("ClassificationWidget - Results:", classificationResults);
      setHasLoggedDebugInfo(true);
    }
  }, [validatedContent.id, showResults, classificationResults, hasLoggedDebugInfo]);

  // Reset the debug log flag when key dependencies change
  useEffect(() => {
    setHasLoggedDebugInfo(false);
  }, [validatedContent.id, showResults]);

  // Load results when the component mounts or when content ID changes
  // Add runId to dependencies to reload when it changes
  useEffect(() => {
    // Skip if results are already loaded or if we shouldn't load on mount
    if (!loadResultsOnMount || resultsLoaded) {
      return;
    }
    
    // Only load results if we should show results
    if (showResults) {
      console.log("Loading results for content ID:", validatedContent.id);
      loadResults(validatedContent.id, runId);
      setResultsLoaded(true);
    }
  }, [validatedContent.id, showResults, loadResults, runId, loadResultsOnMount, resultsLoaded]);

  // Select the first scheme by default if none is selected
  useEffect(() => {
    if (schemes.length > 0 && !selectedSchemeId) {
      // Try to get the default scheme ID first
      const defaultId = getDefaultSchemeId();
      if (defaultId) {
        setSelectedSchemeId(defaultId);
      } else {
        // Otherwise use the first scheme
        setSelectedSchemeId(schemes[0].id);
      }
    }
  }, [schemes, selectedSchemeId, getDefaultSchemeId]);

  // Memoize the handleClassify function to prevent unnecessary recreations
  const handleClassify = useCallback(async () => {
    if (!selectedSchemeId) {
      toast({
        title: 'Error',
        description: 'Please select a classification scheme',
        variant: 'destructive',
      });
      return;
    }
    
    console.log(`ClassificationWidget: Starting classification with scheme ID ${selectedSchemeId}`);
    console.log(`ClassificationWidget: Content ID: ${validatedContent.id}`);
    console.log(`ClassificationWidget: Run ID: ${runId || 'not provided'}`);
    
    try {
      // Use the classifyContent method from the hook
      const result = await classifyContent(
        validatedContent,
        selectedSchemeId,
        runId,
        runName
      );
      
      if (!result) {
        console.error('ClassificationWidget: Classification returned null result');
        toast({
          title: 'Classification failed',
          description: 'The classification process did not return a valid result',
          variant: 'destructive',
        });
        return;
      }
      
      console.log(`ClassificationWidget: Classification result:`, result);
      
      if (result && onClassificationComplete) {
        onClassificationComplete(result);
      }
      
      // Close the popover on success
      if (result) {
        setIsOpen(false);
        setResultsLoaded(true); // Mark results as loaded after successful classification
      }
    } catch (error: any) {
      console.error('ClassificationWidget: Error during classification:', error);
      
      // Log detailed error information
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        response: error.response,
        stack: error.stack
      });
      
      toast({
        title: 'Classification failed',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  }, [selectedSchemeId, classifyContent, validatedContent, runId, runName, toast, onClassificationComplete]);

  // Manual refresh function
  const handleRefreshResults = useCallback(() => {
    if (validatedContent.id) {
      loadResults(validatedContent.id, runId);
    }
  }, [validatedContent.id, runId, loadResults]);

  // Memoize the classification button
  const classificationButton = useMemo(() => (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize}
          className={className}
          ref={buttonRef}
          data-classification-button
        >
          <BrainCircuit className="h-4 w-4 mr-2" />
          {compact ? 'Classify' : 'Classify Content'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Classify Content</h4>
          {error && (
            <div className="text-sm text-red-500 mb-2">{error}</div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Classification Scheme
            </label>
            <Select
              value={selectedSchemeId?.toString() || ''}
              onValueChange={(value) => setSelectedSchemeId(parseInt(value))}
              disabled={isLoadingSchemes}
            >
              <SelectTrigger>
                {isLoadingSchemes ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <SelectValue placeholder="Select scheme" />
                )}
              </SelectTrigger>
              <SelectContent>
                {schemes.map((scheme) => (
                  <SelectItem key={scheme.id} value={scheme.id.toString()}>
                    {scheme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedSchemeId && (
            <div className="flex items-center space-x-2 pt-2 pb-2">
              <Switch 
                id="set-default" 
                onCheckedChange={(checked) => {
                  if (checked && selectedSchemeId) {
                    // Set as default scheme
                    setDefaultSchemeId(selectedSchemeId);
                    
                    toast({
                      title: 'Default scheme updated',
                      description: `Set "${schemes.find(s => s.id === selectedSchemeId)?.name}" as the default classification scheme.`,
                    });
                  }
                }}
              />
              <Label htmlFor="set-default" className="text-xs">Set as default scheme</Label>
            </div>
          )}
          
          <Button
            className="w-full"
            onClick={handleClassify}
            disabled={!selectedSchemeId || isClassifying}
          >
            {isClassifying ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Classifying...
              </div>
            ) : (
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Classify
              </div>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ), [isOpen, buttonVariant, buttonSize, className, compact, error, selectedSchemeId, isLoadingSchemes, schemes, handleClassify, isClassifying, setDefaultSchemeId, toast]);

  // Memoize the results display
  const resultsDisplay = useMemo(() => {
    if (!showResults) {
      return null;
    }
    
    if (classificationResults.length === 0) {
      // Only log this once per render cycle to avoid console spam
      if (!hasLoggedDebugInfo) {
        console.log("No results to display", validatedContent.id);
      }
      return null;
    }
    
    console.log("Displaying results:", classificationResults);
    
    return (
      <div className="space-y-2 mt-2 p-2 border rounded-md bg-muted/10">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <BrainCircuit className="h-3 w-3" />
            <span>Classifications</span>
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshResults}
            className="h-6 w-6 p-0"
            title="Refresh results"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {classificationResults.map((result, index) => {
            // Extract display value safely
            let displayValue = 'N/A';
            let schemeName = 'Unknown';
            
            try {
              // Try to get the scheme name
              schemeName = result.scheme?.name || 'Scheme';
              
              // Check if this is a complex type like List[Dict[str, any]]
              const isComplexType = result.scheme?.fields?.[0]?.type === 'List[Dict[str, any]]';
              
              if (isComplexType) {
                // For complex types, show a more descriptive badge
                if (typeof result.value === 'object' && result.value !== null && 'default_field' in result.value) {
                  // If we have a default_field (summary), use a shortened version
                  const summary = result.value.default_field;
                  displayValue = summary.length > 50 ? summary.substring(0, 50) + '...' : summary;
                } else if (Array.isArray(result.value) && result.value.length > 0) {
                  // If we have structured data, show entity count
                  displayValue = `${result.value.length} entities`;
                } else if (result.displayValue) {
                  // Use the displayValue if available
                  displayValue = typeof result.displayValue === 'string' && result.displayValue.length > 50 
                    ? result.displayValue.substring(0, 50) + '...' 
                    : String(result.displayValue);
                }
              } else {
                // For simple types, use the standard approach
                if (result.displayValue !== undefined) {
                  displayValue = result.displayValue?.toString() || 'N/A';
                } else if (typeof result.value === 'object' && result.value !== null) {
                  // If value is an object, try to stringify it or extract a meaningful value
                  const firstKey = Object.keys(result.value)[0];
                  if (firstKey) {
                    displayValue = String(result.value[firstKey]);
                  } else {
                    displayValue = JSON.stringify(result.value);
                  }
                } else if (result.value !== undefined) {
                  displayValue = String(result.value);
                }
              }
            } catch (error) {
              console.error("Error formatting result:", error, result);
            }
            
            return (
              <Badge 
                key={result.id || index} 
                variant="outline"
                className="flex items-center gap-1 cursor-pointer hover:bg-muted/20"
                onClick={() => {
                  // Open a dialog or tooltip with full details when clicked
                  console.log("Full classification result:", result);
                }}
              >
                <span className="font-medium">{schemeName}:</span>
                <span>{displayValue}</span>
              </Badge>
            );
          })}
        </div>
      </div>
    );
  }, [showResults, classificationResults, hasLoggedDebugInfo, validatedContent.id, handleRefreshResults]);

  return (
    <div className="space-y-2">
      {classificationButton}
      {resultsDisplay}
    </div>
  );
}

// Export a memoized version of the component to prevent unnecessary re-renders
export const ClassificationWidget = React.memo(ClassificationWidgetComponent); 