import { create } from 'zustand';
import {
  WorkspacesService,
} from '@/client/services';
import { WorkspaceRead, WorkspaceCreate, WorkspaceUpdate } from '@/client/models';
import { useDocumentStore } from './storeDocuments';

interface WorkspaceState {
  workspaces: WorkspaceRead[];
  activeWorkspace: WorkspaceRead | null;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (workspace: WorkspaceCreate) => Promise<void>;
  updateWorkspace: (workspaceId: number, data: WorkspaceUpdate) => Promise<void>;
  deleteWorkspace: (workspaceId: number) => Promise<void>;
  setActiveWorkspace: (workspaceId: number) => void;
  fetchWorkspaceById: (workspaceId: number) => Promise<void>;
}

const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

export const useWorkspaceStore = create<WorkspaceState>()(
    (set, get) => ({
      workspaces: [],
      activeWorkspace: null,
      error: null,

      fetchWorkspaces: async () => {
        try {
          const response = await WorkspacesService.readWorkspaces();
          const storedId = localStorage.getItem('activeWorkspaceId');
          const active = response.find(w => w.uid === Number(storedId)) || response[0] || null;
          
          set(state => ({
            ...state,
            workspaces: response,
            activeWorkspace: active,
            error: null
          }));

          if (active) {
            localStorage.setItem('activeWorkspaceId', String(active.uid));
          } else {
            localStorage.removeItem('activeWorkspaceId');
          }
        } catch (error: any) {
          set(state => ({ ...state, error: "Error fetching workspaces", workspaces: [] }));
          console.error(error);
        }
      },

      fetchWorkspaceById: async (workspaceId: number) => {
        try {
          const response = await WorkspacesService.readWorkspaceById({ workspaceId });
          set(state => ({
            ...state,
            activeWorkspace: response,
            error: null
          }));
          localStorage.setItem('activeWorkspaceId', String(workspaceId));
        } catch (error: any) {
          set(state => ({ ...state, error: "Error fetching workspace" }));
          console.error(error);
        }
      },

      createWorkspace: async (workspace: WorkspaceCreate) => {
        try {
          const response = await WorkspacesService.createWorkspace({ requestBody: workspace });
          await get().fetchWorkspaces();
          // Set newly created workspace as active
          if (response) {
            get().setActiveWorkspace(response.uid);
          }
        } catch (error: any) {
          set(state => ({ ...state, error: "Error creating workspace" }));
          console.error(error);
        }
      },

      updateWorkspace: async (workspaceId: number, data: WorkspaceUpdate) => {
        try {
          await WorkspacesService.updateWorkspace({ workspaceId, requestBody: data });
          await get().fetchWorkspaces(); // Refresh workspaces after updating
          // Update active workspace if it was the one updated
          if (get().activeWorkspace?.uid === workspaceId) {
            const updatedWorkspace = await WorkspacesService.readWorkspaceById({ workspaceId });
            if (updatedWorkspace) {
              set(state => ({ ...state, activeWorkspace: updatedWorkspace }));
            }
          }
        } catch (error: any) {
          set(state => ({ ...state, error: "Error updating workspace" }));
          console.error(error);
        }
      },

      deleteWorkspace: async (workspaceId: number) => {
        try {
          await WorkspacesService.deleteWorkspace({ workspaceId });
          await get().fetchWorkspaces(); // Refresh workspaces after deleting
          // Clear active workspace if it was the one deleted
          if (get().activeWorkspace?.uid === workspaceId) {
            set(state => ({ ...state, activeWorkspace: null }));
          }
        } catch (error: any) {
          set(state => ({ ...state, error: "Error deleting workspace" }));
          console.error(error);
        }
      },

      setActiveWorkspace: (workspaceId: number) => {
        const workspace = get().workspaces.find(w => w.uid === workspaceId);
        if (workspace) {
          localStorage.setItem('activeWorkspaceId', String(workspaceId));
          set(state => ({ ...state, activeWorkspace: workspace }));
        }
      },
    })

  );