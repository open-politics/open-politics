import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClassificationSchemesService, ClassificationResultsService } from "@/client/services";
import { ClassificationSchemeRead, ClassificationResultRead } from "@/client/models";
import { useWorkspaceStore } from "@/zustand_stores/storeWorkspace";

const fetchClassificationSchemes = async (workspaceId: number): Promise<ClassificationSchemeRead[]> => {
  const response = await ClassificationSchemesService.readClassificationSchemes({ workspaceId });
  return response;
};

const runClassification = async ({
  workspaceId,
  documentId,
  schemeId,
}: {
  workspaceId: number;
  documentId: number;
  schemeId: number;
}): Promise<ClassificationResultRead> => {
  const response = await ClassificationResultsService.createClassificationResult({
    workspaceId,
    requestBody: {
      document_id: documentId,
      scheme_id: schemeId,
      value: {}, 
      timestamp: new Date().toISOString(),
    },
  });
  return response;
};

const useClassificationSchemes = () => {
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspaceStore();

  const classificationSchemesQuery = useQuery({
    queryKey: ["classificationSchemes", activeWorkspace?.uid],
    queryFn: () => activeWorkspace ? fetchClassificationSchemes(activeWorkspace.uid) : [],
    enabled: !!activeWorkspace,
  });

  const runClassificationMutation = useMutation({
    mutationFn: ({ documentId, schemeId }: { documentId: number; schemeId: number }) =>
      runClassification({ workspaceId: activeWorkspace!.uid, documentId, schemeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classificationSchemes", activeWorkspace?.uid] });
    },
    onError: (error) => {
      console.error("Error in runClassificationMutation:", error);
    },
  });

  return {
    classificationSchemesQuery,
    runClassification: runClassificationMutation.mutateAsync,
  };
};

export default useClassificationSchemes; 