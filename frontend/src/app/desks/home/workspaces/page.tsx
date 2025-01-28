'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useAuth from "@/hooks/useAuth";
import withAdminAuth from '@/hooks/withAdminAuth';
import { useWorkspaceDataStore } from '@/store/useWorkspaceDataStore';
import { Pencil } from 'lucide-react';

import EditWorkSpaceOverlay from '@/components/collection/overlays/workspaces/EditWorkSpaceOverlay';

export default withAdminAuth(function WorkspaceManagementPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sources, setSources] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { user, isLoading } = useAuth();
  const { workspacesQuery, createWorkspace, deleteWorkspace } = useWorkspaceDataStore();
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceDataStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      await createWorkspace({
        name,
        description,
        sources: sources ? sources.split(',') : [],
      });
      setName('');
      setDescription('');
      setSources('');
      alert('Workspace created successfully');
    } catch (error) {
      setErrorMessage('Failed to create workspace. Please try again.');
      console.error('Error creating workspace:', error);
    }
  };

  const handleDelete = async (workspaceId: number) => {
    if (confirm('Are you sure you want to delete this workspace?')) {
      try {
        await deleteWorkspace(workspaceId);
        alert('Workspace deleted successfully');
      } catch (error) {
        console.error('Error deleting workspace:', error);
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center mx-auto top-4 min-h-screen bg-primary-950">
      <div className="flex flex-col items-center w-full max-w-8xl p-4">
        <div className="flex items-center justify-start w-full bg-primary-900 p-2 px-6 rounded-lg shadow-morphic mb-4">
          <div className="flex flex-col text-left">
            <div className="text-md font-bold text-secondary-500 mb-2">Active Workspace:</div>
            <div className="text-sm font-bold text-green-500">{activeWorkspace?.name}</div>
            <div className="text-sm font-bold text-secondary-500">
              Sources: {activeWorkspace?.sources ? activeWorkspace?.sources.length : 0}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Info Card */}
          <Card className="bg-primary-900 shadow-morphic p-4 rounded-3xl col-span-1"> 
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-secondary-500 text-center">What is a Workspace?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-300">
                A workspace is a collection of sources that you want to analyze. You can create a workspace by adding sources and then analyzing the data in the workspace.
              </p>
            </CardContent>
          </Card>

          {/* Create Workspace Card */}
          <Card className="bg-primary-900 shadow-morphic p-4 rounded-3xl col-span-1">
            <CardHeader>
              <CardTitle className="text-3xl font-semibold text-secondary-500 text-center">Create New Workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-secondary-300 mb-1">Name</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Workspace Name"
                    required
                    className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm text-secondary-300 mb-1">Description</label>
                  <Input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm text-secondary-300 mb-1">Sources (comma-separated URLs)</label>
                  <Input
                    type="text"
                    value={sources}
                    onChange={(e) => setSources(e.target.value)}
                    placeholder="http://example.com, http://another.com"
                    className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
                  />
                </div>
                {errorMessage && <p className="text-red-400">{errorMessage}</p>}
                <Button variant="default" type="submit" className="w-full py-2 rounded-xl shadow-morphic">
                  Create Workspace
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Manage Workspaces Card */}
          <Card className="bg-primary-900 shadow-morphic p-4 rounded-3xl col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-secondary-500">Manage Workspaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-72 overflow-x-auto overflow-y-auto">
                <table className="min-w-full bg-primary-800 rounded-xl shadow-inner">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-secondary-300 uppercase tracking-wider">Edit</th>
                      <th className="px-4 py-2 text-left text-secondary-300 uppercase tracking-wider">UID</th>
                      <th className="px-4 py-2 text-left text-secondary-300 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-secondary-300 uppercase tracking-wider">Owner ID</th>
                      <th className="px-4 py-2 text-left text-secondary-300 uppercase tracking-wider">Created At</th>
                      <th className="px-4 py-2 text-left text-secondary-300 uppercase tracking-wider">Nr Sources</th>
                      <th className="px-4 py-2 text-left text-secondary-300 uppercase tracking-wider">Sources</th>
                      <th className="px-4 py-2 text-left text-secondary-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspacesQuery.data?.data.map((workspace) => (
                      <tr key={workspace.uid} className="even:bg-primary-850">
                        <td className="px-4 py-2 text-secondary-200">
                          <Button variant="ghost" onClick={() => {
                            setSelectedWorkspaceId(workspace.uid);
                            setIsEditDialogOpen(true);
                          }}>
                            <Pencil className="w-4 h-4 text-secondary-500" />
                          </Button>
                        </td>
                        <td className="px-4 py-2 text-secondary-200">{workspace.uid}</td>
                        <td className="px-4 py-2 text-secondary-200">{workspace.name}</td>
                        <td className="px-4 py-2 text-secondary-200">{workspace.user_id_ownership}</td>
                        <td className="px-4 py-2 text-secondary-200">{new Date(workspace.created_at).toLocaleString()}</td>
                        <td className="px-4 py-2 text-secondary-200">{workspace.sources ? workspace.sources.length : 0}</td>
                        <td className="px-4 py-2 text-secondary-200">
                          {workspace.sources ? workspace.sources.map((source, index) => (
                            <span key={index} className="px-1 py-1 bg-primary-800 rounded-md shadow-inner mr-1 mb-1">{source}</span>
                          )) : <span className="px-1 py-1 bg-primary-800 rounded-md shadow-inner mr-1 mb-1">No sources</span>}
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(workspace.uid)}
                            className="bg-red-500 hover:bg-red-600 text-primary-950 font-semibold py-1 px-2 rounded-xl shadow-morphic"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {workspacesQuery.data?.data.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-2 text-center text-secondary-400">
                          No workspaces found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <EditWorkSpaceOverlay
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        workspaceId={selectedWorkspaceId ?? 0}
        defaultName={activeWorkspace?.name}
        defaultDescription={activeWorkspace?.description}
        defaultSources={activeWorkspace?.sources}
      />
    </div>
  );
});