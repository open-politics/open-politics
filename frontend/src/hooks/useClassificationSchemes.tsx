import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClassificationSchemesService } from "@/client/services";
import { ClassificationSchemeRead, ClassificationSchemeCreate, ClassificationSchemeUpdate } from "@/client/models";
import { useWorkspaceDataStore } from "@/store/useWorkspaceDataStore";

const fetchClassificationSchemes = async (workspaceId: number): Promise<ClassificationSchemeRead[]> => {
  const response = await ClassificationSchemesService.readClassificationSchemes({ workspaceId });
  return response;
};

const createClassificationScheme = async ({
  workspaceId,
  scheme,
}: {
  workspaceId: number;
  scheme: ClassificationSchemeCreate;
}): Promise<ClassificationSchemeRead> => {
  console.log("Creating classification scheme for workspaceId:", workspaceId);
  
  const response = await ClassificationSchemesService.createClassificationScheme({ requestBody: scheme, workspaceId });
  return response;
};

const deleteClassificationScheme = async ({
  workspaceId,
  schemeId,
}: {
  workspaceId: number;
  schemeId: number;
}): Promise<void> => {
  await ClassificationSchemesService.deleteClassificationScheme({ schemeId, workspaceId });
};

const updateClassificationScheme = async ({
  workspaceId,
  schemeId,
  data,
}: {
  workspaceId: number;
  schemeId: number;
  data: ClassificationSchemeUpdate;
}): Promise<ClassificationSchemeRead> => {
  const response = await ClassificationSchemesService.updateClassificationScheme({
    schemeId,
    workspaceId,
    requestBody: data
  });
  return response;
};

const useClassificationSchemes = () => {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspaceDataStore();

  const classificationSchemesQuery = useQuery({
    queryKey: ["classificationSchemes", activeWorkspace?.uid],
    queryFn: () => activeWorkspace ? fetchClassificationSchemes(activeWorkspace.uid) : [],
    enabled: !!activeWorkspace,
  });

  const createClassificationSchemeMutation = useMutation({
    mutationFn: (scheme: ClassificationSchemeCreate) => createClassificationScheme({ workspaceId: activeWorkspace!.uid, scheme }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classificationSchemes", activeWorkspace?.uid] });
    },
    onError: (error) => {
      console.error("Error in createClassificationSchemeMutation:", error);
    },
  });

  const deleteClassificationSchemeMutation = useMutation({
    mutationFn: (schemeId: number) => deleteClassificationScheme({ workspaceId: activeWorkspace!.uid, schemeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classificationSchemes", activeWorkspace?.uid] });
    },
  });

  const updateClassificationSchemeMutation = useMutation({
    mutationFn: ({ schemeId, data }: { schemeId: number; data: ClassificationSchemeUpdate }) => updateClassificationScheme({ workspaceId: activeWorkspace!.uid, schemeId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classificationSchemes", activeWorkspace?.uid] });
    },
  });

  return {
    classificationSchemesQuery,
    createClassificationScheme: createClassificationSchemeMutation.mutateAsync,
    deleteClassificationScheme: deleteClassificationSchemeMutation.mutateAsync,
    updateClassificationScheme: updateClassificationSchemeMutation.mutateAsync,
  };
};

export default useClassificationSchemes; 