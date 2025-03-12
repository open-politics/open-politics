'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Download, FileText } from "lucide-react"
import { DocumentRead, FileRead } from '@/client/models';
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import ClassificationResultDisplay from "../../classifications/ClassificationResultDisplay"
import { format } from "date-fns"
import DocumentLink from '../../documents/DocumentLink';

export const columns: ColumnDef<DocumentRead>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <DocumentLink documentId={row.original.id}>
        {row.original.title || `Document ${row.original.id}`}
      </DocumentLink>
    ),
  },
  {
    accessorKey: 'content_type',
    header: 'Content Type',
  },
  {
    accessorKey: 'source',
    header: 'Source',
  },
  // {
  //   accessorKey: 'classification_results',
  //   header: 'Classifications',
  //   cell: ({ row }) => {
  //     const { classificationResults } = useClassificationResultStore.getState();
  //     const documentId = row.original.id;
  //     const documentResults = classificationResults.filter(result => result.document_id === documentId);
  //     const [isDialogOpen, setIsDialogOpen] = useState(false);

  //     return (
  //       <>
  //         <Badge 
  //           variant="secondary" 
  //           className="cursor-pointer hover:bg-secondary/80"
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             setIsDialogOpen(true);
  //           }}
  //         >
  //           {documentResults.length} results
  //         </Badge>

  //         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  //           <DialogContent className="max-w-2xl">
  //             <DialogHeader>
  //               <DialogTitle>Classification Results</DialogTitle>
  //             </DialogHeader>
  //             <div className="space-y-4">
  //               {documentResults.map((result) => (
  //                 <div key={result.id} className="p-4 bg-card rounded-lg space-y-2">
  //                   <div className="flex items-center justify-between">
  //                     <span className="font-medium">{result.scheme.name}</span>
  //                     {result.run_name && (
  //                       <Badge variant="outline" className="text-xs">
  //                         {result.run_name}
  //                       </Badge>
  //                     )}
  //                   </div>
  //                   <ClassificationResultDisplay 
  //                     result={result}
  //                     scheme={result.scheme}
  //                   />
  //                   <div className="text-xs text-muted-foreground">
  //                     {format(new Date(result.timestamp), "PP · p")}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </DialogContent>
  //         </Dialog>
  //       </>
  //     );
  //   },
  // },
  {
    id: 'files',
    header: 'Files',
    cell: ({ row }) => (
      <div className="flex flex-col space-y-2">
        {row.original.files?.map((file: FileRead) => (
          <div 
          key={file.id} 
          className="flex items-center justify-between w-full bg-muted/50 rounded-sm px-2 py-1"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <DocumentLink 
                documentId={row.original.id}
                className="truncate text-sm"
              >
                {file.name}
              </DocumentLink>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-2 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/api/v1/documents/files/${file.id}/download`, '_blank');
              }}
              >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'insertion_date',
    header: 'Insertion Date',
    cell: ({ row }) =>
      new Date(row.original.insertion_date).toLocaleString(),
  },
];
