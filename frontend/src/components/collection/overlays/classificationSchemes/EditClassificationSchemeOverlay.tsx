import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useClassificationSchemes from "@/hooks/useClassificationSchemes";

interface EditClassificationSchemeOverlayProps {
  open: boolean;
  onClose: () => void;
  schemeId: number;
  defaultName?: string;
  defaultDescription?: string;
  defaultType?: string;
  defaultExpectedDatatype?: string;
  defaultInputText?: string;
}

/**
 * Displays an overlay (dialog) allowing the user to edit an existing classification scheme.
 * Update logic is handled via the useClassificationSchemes hook.
 */
export default function EditClassificationSchemeOverlay({
  open,
  onClose,
  schemeId,
  defaultName,
  defaultDescription,
  defaultType = 'minimal',
  defaultExpectedDatatype,
  defaultInputText,
}: EditClassificationSchemeOverlayProps) {
  const [name, setName] = useState(defaultName || "");
  const [description, setDescription] = useState(defaultDescription || "");
  const [type, setType] = useState(defaultType);
  const [expected_datatype, setExpectedDatatype] = useState(defaultExpectedDatatype || "");
  const [input_text, setInputText] = useState(defaultInputText || "");
  const [errorMessage, setErrorMessage] = useState("");

  const { updateClassificationScheme } = useClassificationSchemes();

  const handleSave = async () => {
    setErrorMessage("");
    try {
      await updateClassificationScheme({
        schemeId,
        data: {
          name,
          description,
          type,
          expected_datatype,
          input_text,
        },
      });
      onClose();
    } catch (error) {
      setErrorMessage("Failed to update classification scheme. Please try again.");
      console.error("Error updating classification scheme:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-lg shadow-xl bg-primary-900 m-4 max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-secondary-500">
            Edit Classification Scheme: <span className="text-blue-800 dark:text-green-500">{name}</span>
          </DialogTitle>
          <DialogDescription>
            Use this dialog to edit the classification scheme details.
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
            <label className="block text-sm text-secondary-300 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
            >
              <option value="minimal">Minimal</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-secondary-300 mb-1">Expected Datatype</label>
            <Input
              type="text"
              value={expectedDatatype}
              onChange={(e) => setExpectedDatatype(e.target.value)}
              className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
            />
          </div>

          <div>
            <label className="block text-sm text-secondary-300 mb-1">Input Text</label>
            <Input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 bg-primary-800 border border-secondary-700 rounded-xl shadow-inner"
            />
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