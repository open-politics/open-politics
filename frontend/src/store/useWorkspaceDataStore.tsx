import { create } from "zustand"
import { WorkspacesService, ClassificationSchemesService } from "@/client/services"
import {
  WorkspaceRead,
  WorkspaceCreate,
  WorkspacesOut,
  ClassificationSchemeRead,
  ClassificationSchemeCreate,
  ClassificationSchemeUpdate,
} from "@/client/models"

interface WorkspaceDataState {
  // --------------------------------
  // WORKSPACE DATA
  // --------------------------------
  workspaces: WorkspaceRead[]
  activeWorkspace: WorkspaceRead | null
  error: string | null

  fetchWorkspaces: () => Promise<void>
  createWorkspace: (workspace: WorkspaceCreate) => Promise<void>
  deleteWorkspace: (workspaceId: number) => Promise<void>
  setActiveWorkspace: (workspace: WorkspaceRead) => void

  // --------------------------------
  // CLASSIFICATION SCHEMES
  // --------------------------------
  classificationSchemes: ClassificationSchemeRead[]
  fetchClassificationSchemes: (workspaceId: number) => Promise<void>
  createClassificationScheme: (
    workspaceId: number,
    data: ClassificationSchemeCreate
  ) => Promise<void>
  updateClassificationScheme: (
    workspaceId: number,
    schemeId: number,
    data: ClassificationSchemeUpdate
  ) => Promise<void>
  deleteClassificationScheme: (workspaceId: number, schemeId: number) => Promise<void>
}

export const useWorkspaceDataStore = create<WorkspaceDataState>((set, get) => ({
  // --------------------------------
  // WORKSPACE DATA
  // --------------------------------
  workspaces: [],
  activeWorkspace: null,
  error: null,

  async fetchWorkspaces() {
    try {
      const response: WorkspacesOut = await WorkspacesService.readWorkspaces({})
      let newActive = get().activeWorkspace
      if (!newActive && response?.data?.length > 0) {
        newActive = response.data[0]
      }
      set({
        workspaces: response.data,
        activeWorkspace: newActive,
        error: null,
      })
      if (newActive) {
        await get().fetchClassificationSchemes(newActive.uid)
      }
    } catch (err: any) {
      set({ error: "Error fetching workspaces" })
      console.error(err)
    }
  },

  async createWorkspace(workspaceData) {
    try {
      await WorkspacesService.createWorkspace({
        requestBody: workspaceData,
      })
      // Re-fetch so we see the new workspace
      await get().fetchWorkspaces()
    } catch (err: any) {
      set({ error: "Error creating workspace" })
      console.error(err)
    }
  },

  async deleteWorkspace(workspaceId) {
    try {
      await WorkspacesService.deleteWorkspace({ workspaceId })
      // Re-fetch to see updated list
      await get().fetchWorkspaces()
    } catch (err: any) {
      set({ error: "Error deleting workspace" })
      console.error(err)
    }
  },

  setActiveWorkspace(workspace) {
    set({ activeWorkspace: workspace })
    // Optionally load classification schemes for the new active workspace
    get().fetchClassificationSchemes(workspace.uid).catch(console.error)
    // Debugging: Log the active workspace UID
    console.log("Active Workspace UID:", workspace.uid, "Type:", typeof workspace.uid)
  },

  // --------------------------------
  // CLASSIFICATION SCHEMES
  // --------------------------------
  classificationSchemes: [],

  async fetchClassificationSchemes(workspaceId: number) {
    try {
      const response: ClassificationSchemeRead[] = await ClassificationSchemesService.readClassificationSchemes({
        workspaceId,
      })
      set({ classificationSchemes: response })
    } catch (err: any) {
      set({ error: "Error fetching classification schemes" })
      console.error("Error fetching classification schemes:", err)
    }
  },

  async createClassificationScheme(workspaceId: number, data: ClassificationSchemeCreate) {
    try {
      console.log("Creating classification scheme for workspaceId:", workspaceId, "Data:", data)
      await ClassificationSchemesService.createClassificationScheme({
        workspaceId,
        requestBody: data,
      })
      // Reload the list
      await get().fetchClassificationSchemes(workspaceId)
    } catch (err: any) {
      set({ error: "Error creating classification scheme" })
      console.error("Error creating classification scheme:", err)
      throw err
    }
  },

  async updateClassificationScheme(workspaceId: number, schemeId: number, data: ClassificationSchemeUpdate) {
    try {
      await ClassificationSchemesService.updateClassificationScheme({
        workspaceId,
        schemeId,
        requestBody: data,
      })
      // Reload
      await get().fetchClassificationSchemes(workspaceId)
    } catch (err: any) {
      set({ error: "Error updating classification scheme" })
      console.error("Error updating classification scheme:", err)
      throw err
    }
  },

  async deleteClassificationScheme(workspaceId: number, schemeId: number) {
    try {
      await ClassificationSchemesService.deleteClassificationScheme({
        workspaceId,
        schemeId,
      })
      // Reload
      await get().fetchClassificationSchemes(workspaceId)
    } catch (err: any) {
      set({ error: "Error deleting classification scheme" })
      console.error("Error deleting classification scheme:", err)
      throw err
    }
  },
}))