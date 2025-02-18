import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  WorkspaceCreate,
  WorkspaceRead,
  WorkspaceUpdate,
} from '@/client/models';
import { WorkspacesService } from '@/client/services';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';

const fetchWorkspaces = async (): Promise<WorkspaceRead[]> => {
  const response = await WorkspacesService.readWorkspaces({});
  return response;
};

const createWorkspace = async (
  workspace: WorkspaceCreate
): Promise<WorkspaceRead> => {
  const response = await WorkspacesService.createWorkspace({
    requestBody: workspace,
  });
  return response;
};

const deleteWorkspace = async (workspaceId: number): Promise<void> => {
  await WorkspacesService.deleteWorkspace({ workspaceId });
};

const updateWorkspace = async ({
  workspaceId,
  data,
}: {
  workspaceId: number;
  data: WorkspaceUpdate;
}): Promise<WorkspaceRead> => {
  const response = await WorkspacesService.updateWorkspace({
    workspaceId,
    requestBody: data,
  });
  return response;
};

const useWorkspaces = () => {
  const queryClient = useQueryClient();
  const { setActiveWorkspace } = useWorkspaceStore();

  const workspacesQuery = useQuery({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: updateWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
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