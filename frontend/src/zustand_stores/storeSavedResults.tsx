import { create } from 'zustand';
import {
  ClassificationSchemesService,
  DocumentsService,
  // SavedResultsService, // Removed as it's not in the provided services.ts
} from '@/client/services';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { useDocumentStore } from '@/zustand_stores/storeDocuments';
import { useClassificationSchemeStore } from '@/zustand_stores/storeSchemas';
import { ClassificationSchemeRead, DocumentRead } from '@/client/models';

interface SavedResultSetState {
  savedResults: any[]; // Replace 'any' with the correct type if available
  error: string | null;
  fetchSavedResults: () => Promise<void>;
  saveResultSet: (resultSet: any) => Promise<void>; // Replace 'any' with the correct type if available
  loadResultSet: (resultSetId: number) => Promise<void>;
}

export const useSavedResultSetStore = create<SavedResultSetState>((set, get) => ({
  savedResults: [],
  error: null,

  fetchSavedResults: async () => {
    const activeWorkspace = useWorkspaceStore.getState().activeWorkspace;
    if (!activeWorkspace) return;
    try {
      // Assuming there's no direct method to fetch saved result sets, you might need to adjust this part
      // const response = await SavedResultsService.readSavedResultSets({ // Assuming such method exists
      //   workspaceId: activeWorkspace.uid,
      //   skip: 0,
      //   limit: 100,
      // });
      const response: any[] = []; // Placeholder, replace with actual data fetching
      set({ savedResults: response, error: null });
    } catch (error: any) {
      set({ error: "Error fetching saved result sets", savedResults: [] });
      console.error(error);
    }
  },

  saveResultSet: async (resultSet: any) => {
    const activeWorkspace = useWorkspaceStore.getState().activeWorkspace;
    if (!activeWorkspace) return;
    try {
      // Assuming there's a method to create a saved result set
      // await SavedResultsService.createSavedResultSet({ // Assuming such method exists
      //   workspaceId: activeWorkspace.uid,
      //   requestBody: resultSet,
      // });
      await get().fetchSavedResults();
    } catch (error: any) {
      set({ error: "Error saving result set" });
      console.error(error);
    }
  },

  loadResultSet: async (resultSetId: number) => {
    const activeWorkspace = useWorkspaceStore.getState().activeWorkspace;
    if (!activeWorkspace) return;
    try {
      // Assuming there's a method to read a saved result set
      // const resultSet = await SavedResultsService.readSavedResultSet({ // Assuming such method exists
      //   workspaceId: activeWorkspace.uid,
      //   savedResultSetId: resultSetId
      // });

      // Fetch documents and schemes based on the result set
      const documents = await DocumentsService.readDocuments({
        workspaceId: activeWorkspace.uid,
        skip: 0,
        limit: 100,
      });

      const classificationSchemes = await ClassificationSchemesService.readClassificationSchemes({
        workspaceId: activeWorkspace.uid,
        skip: 0,
        limit: 100,
      });

      // Filter documents and schemes based on the result set
      // const filteredDocuments = documents.filter((doc: DocumentRead) => resultSet.document_ids.includes(doc.id));
      // const filteredSchemes = classificationSchemes.filter((scheme: ClassificationSchemeRead) => resultSet.scheme_ids.includes(scheme.id));

      // Update the document and scheme stores
      // useDocumentStore.setState({ documents: filteredDocuments });
      // useClassificationSchemeStore.setState({ classificationSchemes: filteredSchemes });

      // TODO: Fetch ONLY the relevant classification results
      // For now, we are not fetching classification results here
    } catch (error: any) {
      set({ error: "Error loading result set" });
      console.error(error);
    }
  },
}));