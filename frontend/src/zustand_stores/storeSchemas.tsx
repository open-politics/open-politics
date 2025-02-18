import { create } from 'zustand';
import {
  ClassificationSchemesService,
} from '@/client/services';
import { ClassificationSchemeRead, ClassificationSchemeCreate, ClassificationSchemeUpdate } from '@/client/models';

interface ClassificationSchemeState {
  classificationSchemes: ClassificationSchemeRead[];
  error: string | null;
  fetchClassificationSchemes: (workspaceId: number) => Promise<void>;
  createClassificationScheme: (scheme: ClassificationSchemeCreate, workspaceId: number) => Promise<void>;
  updateClassificationScheme: (schemeId: number, data: ClassificationSchemeUpdate, workspaceId: number) => Promise<void>;
  deleteClassificationScheme: (schemeId: number, workspaceId: number) => Promise<void>;
  getSchemeDisplayValue: (scheme: ClassificationSchemeRead, score: number) => string | number;
  formatSchemeValue: (scheme: ClassificationSchemeRead, value: any) => string | number | string[];
}

export const useClassificationSchemeStore = create<ClassificationSchemeState>((set, get) => ({
  classificationSchemes: [],
  error: null,

  fetchClassificationSchemes: async (workspaceId: number) => {
    if (!workspaceId) return;
    try {
      const response = await ClassificationSchemesService.readClassificationSchemes({
        workspaceId: workspaceId,
        skip: 0,
        limit: 100,
      });
      set({ classificationSchemes: response, error: null });
    } catch (error: any) {
      set({ error: "Error fetching classification schemes", classificationSchemes: [] });
      console.error(error);
    }
  },

  createClassificationScheme: async (scheme: ClassificationSchemeCreate, workspaceId: number) => {
    try {
      // Validate labels for List[str] type
      if (scheme.type === 'List[str]' && scheme.is_set_of_labels && (!scheme.labels || scheme.labels.length < 2)) {
        throw new Error('At least 2 labels are required for label-based schemes');
      }

      const response = await ClassificationSchemesService.createClassificationScheme({
        workspaceId,
        requestBody: scheme
      });
      
      set(state => ({
        classificationSchemes: [...state.classificationSchemes, response],
        error: null
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateClassificationScheme: async (schemeId: number, data: ClassificationSchemeUpdate, workspaceId: number) => {
    if (!workspaceId) return;
    try {
      const response = await ClassificationSchemesService.updateClassificationScheme({
        workspaceId: workspaceId,
        schemeId: schemeId,
        requestBody: data
      });
      set(state => ({
        classificationSchemes: state.classificationSchemes.map(scheme => 
          scheme.id === schemeId ? response : scheme
        ),
        error: null
      }));
    } catch (error: any) {
      set({ error: "Error updating classification scheme" });
      console.error(error);
    }
  },

  deleteClassificationScheme: async (schemeId: number, workspaceId: number) => {
    if (!workspaceId) return;
    try {
      await ClassificationSchemesService.deleteClassificationScheme({
        workspaceId: workspaceId,
        schemeId: schemeId,
      });
      set(state => ({
        classificationSchemes: state.classificationSchemes.filter(scheme => scheme.id !== schemeId),
        error: null
      }));
    } catch (error: any) {
      set({ error: "Error deleting classification scheme" });
      console.error(error);
    }
  },

  // Helper function to format classification results based on scheme type
  getSchemeDisplayValue: (scheme: ClassificationSchemeRead, score: number) => {
    if (scheme.type === 'int') {
      if (scheme.scale_min === 0 && scheme.scale_max === 1) {
        return score > 0.5 ? 'Positive' : 'Negative';
      }
      return Number(score.toFixed(2));
    }
    
    if (scheme.type === 'List[str]' && scheme.is_set_of_labels && scheme.labels) {
      const index = Math.round(score);
      return scheme.labels[index] || 'Unknown';
    }
    
    if (scheme.type === 'str') {
      return score.toString();
    }
    
    return score;
  },

  formatSchemeValue: (scheme: ClassificationSchemeRead, value: any) => {
    if (!value) return '';
    
    // Handle complex structures
    if (scheme.type === 'List[Dict[str, any]]' && typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    
    if (scheme.type === 'List[str]' && Array.isArray(value)) {
      return value.join(', ');
    }

    switch (scheme.type) {
      case 'int':
        if (scheme.scale_min === 0 && scheme.scale_max === 1) {
          return value > 0.5 ? 'True' : 'False';
        }
        return typeof value === 'number' ? value.toFixed(2) : value;

      case 'List[str]':
        if (scheme.is_set_of_labels && scheme.labels) {
          if (Array.isArray(value)) {
            return value.filter(v => scheme.labels?.includes(v));
          }
          return [];
        }
        return Array.isArray(value) ? value : [];

      case 'str':
        return String(value);

      default:
        return value;
    }
  },
}));