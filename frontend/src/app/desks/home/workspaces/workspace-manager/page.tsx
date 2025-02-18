'use client';

import WorkspaceManager from '@/components/collection/workspaces/management/WorkspaceManager';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';

export default function WorkspaceDashboardPage() {
  const { activeWorkspace } = useWorkspaceStore();
  return (
    <div className="relative flex flex-col items-center mx-auto top-4 min-h-screen overflow-visible bg-primary-950">
      <div className="flex flex-col items-center w-full max-w-8xl p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <WorkspaceManager activeWorkspace={activeWorkspace} />
      </div>
    </div>
  );
};