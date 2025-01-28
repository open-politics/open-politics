import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkspacesService } from "@/client/services";
import { WorkspaceCreate, WorkspaceRead, WorkspacesOut } from "@/client/models";

// Fetch all workspaces
const fetchWorkspaces = async (): Promise<WorkspacesOut> => {
  const response = await WorkspacesService.readWorkspaces({});
  return response;
};

// Create a new workspace
const createWorkspace = async (workspace: WorkspaceCreate): Promise<WorkspaceRead> => {
  const response = await WorkspacesService.createWorkspace({ requestBody: workspace });
  return response;
};

// Delete a workspace
const deleteWorkspace = async (workspaceId: number): Promise<void> => {
  await WorkspacesService.deleteWorkspace({ workspaceId });
};

// New function to update a workspace
const updateWorkspace = async ({
  workspaceId,
  data,
}: {
  workspaceId: number;
  data: WorkspaceCreate;
}): Promise<WorkspaceRead> => {
  // This assumes your autogen client has an updateWorkspace method, 
  // otherwise you could use fetch or axios.
  const response = await WorkspacesService.updateWorkspace({
    workspaceId,
    requestBody: data
  });
  return response;
};

const useWorkspaces = () => {
  const queryClient = useQueryClient();

  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
    onSuccess: (data) => {
      // Set the first workspace as active if none is set
      if (!activeWorkspace && data?.data?.length > 0) {
        setActiveWorkspace(data.data[0]);
      }
    },
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  // Add the new update mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: updateWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  return {
    workspacesQuery,
    createWorkspace: createWorkspaceMutation.mutateAsync,
    deleteWorkspace: deleteWorkspaceMutation.mutateAsync,
    updateWorkspace: updateWorkspaceMutation.mutateAsync,
  };
};

export default useWorkspaces;