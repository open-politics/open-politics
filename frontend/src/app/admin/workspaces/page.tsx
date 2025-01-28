'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import withAdminAuth from '@/hooks/withAdminAuth';
import { useWorkspaceDataStore } from '@/store/useWorkspaceDataStore';

function WorkspaceManagementPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sources, setSources] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    workspaces,
    fetchWorkspaces,
    createWorkspace,
    deleteWorkspace
  } = useWorkspaceDataStore();

  useEffect(() => {
    fetchWorkspaces(); // on mount
  }, [fetchWorkspaces]);

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
    <div className="relative flex justify-center items-center mx-auto top-4 min-h-screen bg-primary-950">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-8xl p-4">
        {/* Manage Workspaces Card */}
        <Card className="bg-primary-900 shadow-morphic p-6 rounded-3xl col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-secondary-500 text-center">Manage Workspaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-primary-800 rounded-xl shadow-inner">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-secondary-300 uppercase tracking-wider">UID</th>
                    <th className="px-6 py-3 text-left text-secondary-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-secondary-300 uppercase tracking-wider">Owner ID</th>
                    <th className="px-6 py-3 text-left text-secondary-300 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-left text-secondary-300 uppercase tracking-wider">Sources</th>
                    <th className="px-6 py-3 text-left text-secondary-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workspaces.map((workspace) => (
                    <tr key={workspace.uid} className="even:bg-primary-850">
                      <td className="px-6 py-4 text-secondary-200">{workspace.uid}</td>
                      <td className="px-6 py-4 text-secondary-200">{workspace.name}</td>
                      <td className="px-6 py-4 text-secondary-200">{workspace.user_id_ownership}</td>
                      <td className="px-6 py-4 text-secondary-200">{new Date(workspace.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-secondary-200">{workspace.sources ? workspace.sources.length : 0}</td>
                      <td className="px-6 flex flex-wrap py-4 text-secondary-200 max-h-16 overflow-y-auto">
                        {workspace.sources ? workspace.sources.map((source, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-800 rounded-md shadow-inner mr-2 mb-2">{source}</span>
                        )) : <span className="px-2 py-1 bg-primary-800 rounded-md shadow-inner mr-2 mb-2">No sources</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(workspace.uid)}
                          className="bg-red-500 hover:bg-red-600 text-primary-950 font-semibold py-1 px-3 rounded-xl shadow-morphic"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {workspaces.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-secondary-400">
                        No workspaces found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
              <Button type="submit" className="w-full bg-secondary-500 hover:bg-secondary-600 text-primary-950 font-semibold py-2 rounded-xl shadow-morphic">
                Create Workspace
              </Button>
            </form>
          </CardContent>
        </Card>

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

      </div>
    </div>
  );
}

export default withAdminAuth(WorkspaceManagementPage);