import { useState, useEffect, useCallback } from 'react';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { useToast } from '@/components/ui/use-toast';
import { 
  ClassificationScheme,
  SchemeFormData
} from '@/lib/classification/types';
import { ClassificationService } from '@/lib/classification/service';

interface UseSchemesOptions {
  autoLoad?: boolean;
}

/**
 * Hook for managing classification schemes
 * Provides functionality for loading, creating, updating, and deleting schemes
 */
export function useSchemes(options: UseSchemesOptions = {}) {
  const { activeWorkspace } = useWorkspaceStore();
  const { toast } = useToast();
  
  const [schemes, setSchemes] = useState<ClassificationScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<ClassificationScheme | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get workspace ID as a number
  const getWorkspaceId = useCallback(() => {
    if (!activeWorkspace?.uid) {
      throw new Error('No active workspace');
    }
    
    return typeof activeWorkspace.uid === 'string' 
      ? parseInt(activeWorkspace.uid) 
      : activeWorkspace.uid;
  }, [activeWorkspace?.uid]);
  
  // Load all schemes
  const loadSchemes = useCallback(async (workspaceId?: number) => {
    if (!activeWorkspace?.uid) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const wsId = workspaceId || getWorkspaceId();
      const loadedSchemes = await ClassificationService.getSchemes(wsId);
      
      setSchemes(loadedSchemes);
    } catch (err: any) {
      console.error('Error loading schemes:', err);
      setError(`Failed to load schemes: ${err.message}`);
      toast({
        title: 'Error',
        description: `Failed to load schemes: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.uid, getWorkspaceId, toast]);
  
  // Load a specific scheme
  const loadScheme = useCallback(async (schemeId: number) => {
    if (!activeWorkspace?.uid) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const workspaceId = getWorkspaceId();
      const scheme = await ClassificationService.getScheme(workspaceId, schemeId);
      
      setSelectedScheme(scheme);
      return scheme;
    } catch (err: any) {
      console.error('Error loading scheme:', err);
      setError(`Failed to load scheme: ${err.message}`);
      toast({
        title: 'Error',
        description: `Failed to load scheme: ${err.message}`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.uid, getWorkspaceId, toast]);
  
  // Create a new scheme
  const createScheme = useCallback(async (schemeData: SchemeFormData) => {
    if (!activeWorkspace?.uid) {
      toast({
        title: 'Error',
        description: 'No active workspace',
        variant: 'destructive',
      });
      return null;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      const workspaceId = getWorkspaceId();
      const createdScheme = await ClassificationService.createScheme(workspaceId, schemeData);
      
      // Update schemes list
      setSchemes(prev => [...prev, createdScheme]);
      
      toast({
        title: 'Success',
        description: `Created scheme: ${createdScheme.name}`,
      });
      
      return createdScheme;
    } catch (err: any) {
      console.error('Error creating scheme:', err);
      setError(`Failed to create scheme: ${err.message}`);
      toast({
        title: 'Error',
        description: `Failed to create scheme: ${err.message}`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [activeWorkspace?.uid, getWorkspaceId, toast]);
  
  // Update an existing scheme
  const updateScheme = useCallback(async (schemeId: number, schemeData: SchemeFormData) => {
    if (!activeWorkspace?.uid) {
      toast({
        title: 'Error',
        description: 'No active workspace',
        variant: 'destructive',
      });
      return null;
    }
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const workspaceId = getWorkspaceId();
      const updatedScheme = await ClassificationService.updateScheme(workspaceId, schemeId, schemeData);
      
      // Update schemes list
      setSchemes(prev => prev.map(scheme => 
        scheme.id === schemeId ? updatedScheme : scheme
      ));
      
      // Update selected scheme if it's the one being updated
      if (selectedScheme?.id === schemeId) {
        setSelectedScheme(updatedScheme);
      }
      
      toast({
        title: 'Success',
        description: `Updated scheme: ${updatedScheme.name}`,
      });
      
      return updatedScheme;
    } catch (err: any) {
      console.error('Error updating scheme:', err);
      setError(`Failed to update scheme: ${err.message}`);
      toast({
        title: 'Error',
        description: `Failed to update scheme: ${err.message}`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [activeWorkspace?.uid, getWorkspaceId, toast, selectedScheme]);
  
  // Delete a scheme
  const deleteScheme = useCallback(async (schemeId: number) => {
    if (!activeWorkspace?.uid) {
      toast({
        title: 'Error',
        description: 'No active workspace',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const workspaceId = getWorkspaceId();
      await ClassificationService.deleteScheme(workspaceId, schemeId);
      
      // Update schemes list
      setSchemes(prev => prev.filter(scheme => scheme.id !== schemeId));
      
      // Clear selected scheme if it's the one being deleted
      if (selectedScheme?.id === schemeId) {
        setSelectedScheme(null);
      }
      
      toast({
        title: 'Success',
        description: 'Scheme deleted successfully',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting scheme:', err);
      setError(`Failed to delete scheme: ${err.message}`);
      toast({
        title: 'Error',
        description: `Failed to delete scheme: ${err.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [activeWorkspace?.uid, getWorkspaceId, toast, selectedScheme]);
  
  // Load schemes on mount if requested
  useEffect(() => {
    if (options.autoLoad && activeWorkspace?.uid) {
      loadSchemes();
    }
  }, [options.autoLoad, activeWorkspace?.uid, loadSchemes]);
  
  return {
    schemes,
    selectedScheme,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    loadSchemes,
    loadScheme,
    createScheme,
    updateScheme,
    deleteScheme,
    setSelectedScheme
  };
} 