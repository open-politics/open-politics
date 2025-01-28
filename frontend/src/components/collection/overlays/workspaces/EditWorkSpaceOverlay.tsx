import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useWorkspaces from "@/hooks/useWorkspaces";

interface EditWorkspaceOverlayProps {
  open: boolean;
  onClose: () => void;
  workspaceId: number;
  defaultName?: string;
  defaultDescription?: string;
  defaultSources?: string[];
}

/**
 * Displays an overlay (dialog) allowing the user to edit an existing workspace.
 * Update logic is handled via the useWorkspaces hook.
 */
export default function EditWorkSpaceOverlay({
  open,
  onClose,
  workspaceId,
  defaultName,
  defaultDescription,
  defaultSources = [],
}: EditWorkspaceOverlayProps) {
  const [name, setName] = useState(defaultName || "");
  const [description, setDescription] = useState(defaultDescription || "");
  const [sourcesList, setSourcesList] = useState<string[]>(defaultSources);
  const [errorMessage, setErrorMessage] = useState("");

  const { updateWorkspace } = useWorkspaces();

  useEffect(() => {
    if (sourcesList !== defaultSources) {
      setSourcesList(defaultSources);
    }
  }, [defaultSources, sourcesList]);

  const handleAddSource = () => {
    setSourcesList([...sourcesList, ""]); // Add an empty string for a new source
  };

  const handleSourceChange = (index: number, value: string) => {
    const newSources = [...sourcesList];
    newSources[index] = value;
    setSourcesList(newSources);
  };

  const handleRemoveSource = (index: number) => {
    const newSources = sourcesList.filter((_, i) => i !== index);
    setSourcesList(newSources);
  };

  const handleSave = async () => {
    setErrorMessage("");
    try {
      await updateWorkspace({
        workspaceId,
        data: {
          name,
          description,
          sources: sourcesList,
        },
      });
      onClose();
    } catch (error) {
      setErrorMessage("Failed to update workspace. Please try again.");
      console.error("Error updating workspace:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-lg shadow-xl bg-primary-900 m-4 max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-secondary-500">
            Edit Workspace: <span className="text-blue-800 dark:text-green-500">{name}</span>
          </DialogTitle>
          <DialogDescription>
            Use this dialog to edit the workspace details.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 mt-4">
          <div>
            <label className="block text-sm text-secondary-300 mb-1">Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-primary-800 border border-[0.2px] border-secondary-700 rounded-xl shadow-inner"
            />
          </div>

          <div>
            <label className="block text-sm text-secondary-300 mb-1">Description</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xl text-secondary-300 mb-1">Sources</label>
            <table className="min-w-full bg-primary-800 rounded-xl shadow-inner">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-secondary-300">Source URL</th>
                  <th className="px-4 py-2 text-left text-secondary-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sourcesList.map((source, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <Input
                        type="text"
                        value={source}
                        onChange={(e) => handleSourceChange(index, e.target.value)}
                        className="w-full p-2 bg-primary-700 border border-[0.05px] border-secondary-600 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Button variant="destructive" onClick={() => handleRemoveSource(index)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center">
              <Button onClick={handleAddSource} variant="default" className="mt-2">
                Add Source
              </Button>
            </div>
          </div>

          {errorMessage && <p className="text-red-400">{errorMessage}</p>}

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-primary-950">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}