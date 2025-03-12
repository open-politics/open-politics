import { useState } from 'react';
import { Check, CopyIcon, FolderIcon, FolderInput} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspaceStore } from '@/zustand_stores/storeWorkspace';
import { useDocumentStore } from '@/zustand_stores/storeDocuments';
import { DocumentsService } from '@/client/services';
import { toast } from 'sonner';

interface DocumentTransferPopoverProps {
  selectedDocumentIds: number[];
  onComplete: () => void;
}

export function DocumentTransferPopover({ 
  selectedDocumentIds,
  onComplete
}: DocumentTransferPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>('');
  const [isCopy, setIsCopy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { workspaces, activeWorkspace } = useWorkspaceStore();
  const { fetchDocuments } = useDocumentStore();

  const handleTransfer = async () => {
    if (!activeWorkspace || !targetWorkspaceId) return;
    
    setIsLoading(true);
    try {
      await DocumentsService.transferDocuments({
        workspaceId: activeWorkspace.uid,
        targetWorkspaceId: parseInt(targetWorkspaceId),
        requestBody: selectedDocumentIds,
        copy: isCopy
      });
      
      toast.success(`Documents ${isCopy ? 'copied' : 'moved'} successfully`);
      setIsOpen(false);
      fetchDocuments();
      onComplete();
    } catch (error) {
      toast.error(`Failed to ${isCopy ? 'copy' : 'move'} documents`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableWorkspaces = workspaces.filter(w => w.uid !== activeWorkspace?.uid);

  if (selectedDocumentIds.length === 0) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <FolderInput className="h-4 w-4 mr-2" />
          Transfer {selectedDocumentIds.length} selected
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">Transfer Documents</h4>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Target Workspace
            </label>
            <Select
              value={targetWorkspaceId}
              onValueChange={setTargetWorkspaceId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {availableWorkspaces.map((workspace) => (
                  <SelectItem key={workspace.uid} value={workspace.uid.toString()}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={!isCopy ? "" : ""}
              onClick={() => setIsCopy(false)}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              Move
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={isCopy ? "" : ""}
              onClick={() => setIsCopy(true)}
            >
              <CopyIcon className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <Button
            className="w-full"
            onClick={handleTransfer}
            disabled={!targetWorkspaceId || isLoading}
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirm {isCopy ? "Copy" : "Move"}
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 