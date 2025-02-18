'use client';

import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';

export default function WorkspaceSelector() {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore();

  return (
    <div>
      <label htmlFor="workspace-select" className="block text-sm font-medium text-gray-700">
        Select Active Workspace
      </label>
      <select
        id="workspace-select"
        value={activeWorkspace?.uid || ''}
        onChange={(e) => {
          const workspace = workspaces.find((w) => w.uid === Number(e.target.value));
          if (workspace) setActiveWorkspace(workspace);
        }}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="" disabled>
          -- Select Workspace --
        </option>
        {workspaces.map((workspace) => (
          <option key={workspace.uid} value={workspace.uid}>
            {workspace.name}
          </option>
        ))}
      </select>
    </div>
  );
}