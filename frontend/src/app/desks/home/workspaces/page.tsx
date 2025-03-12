'use client';

import { Separator } from '@/components/ui/separator';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';

// Importing the existing components with designs
import WorkspaceInfo from '@/components/collection/workspaces/management/WorkspaceInfo';
import WorkspaceManager from '@/components/collection/workspaces/management/WorkspaceManager';
import ClassificationSchemeManager from '@/components/collection/workspaces/classifications/ClassificationSchemeManager';
import DocumentManager from '@/components/collection/workspaces/documents/DocumentManager';
import ClassificationRunner from '@/components/collection/workspaces/classifications/ClassificationRunner';

export default function WorkspaceDashboardPage() {
  const { activeWorkspace } = useWorkspaceStore();

  return (
    <div className="relative flex flex-col items-center mx-auto top-4 min-h-screen max-h-[calc(100vh-200px)] overflow-y-auto bg-primary-950">      
      <div className="flex flex-col items-center w-full max-w-8xl p-4 overflow-y-auto">
        {/* Workspace Info */}
        <WorkspaceInfo />

        <Separator className="col-span-1" />
        {/* Classification and Results Section */}
        <div className="w-full mb-8 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Classification Runner */}
            <div className="col-span-1">
              <ClassificationRunner />
            </div>
          </div>
        </div>

        <Separator className="w-full" />

        {/* Grid Layout for Managers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Workspace Manager */}
          <div className="col-span-1 md:col-span-2">
            <WorkspaceManager activeWorkspace={activeWorkspace} />
          </div>

          <Separator className="w-full" />

          {/* Classification Scheme Manager */}
          <div className="col-span-1 md:col-span-2">
            <ClassificationSchemeManager />
          </div>

          <Separator className="w-full" />
          {/* Document Manager */}
          <div className="col-span-1 md:col-span-2">
            <DocumentManager />
          </div>
        </div>
      </div>
    </div>
  );
}