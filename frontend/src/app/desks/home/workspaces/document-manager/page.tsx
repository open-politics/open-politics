'use client';

import DocumentManager from '@/components/collection/workspaces/documents/DocumentManager';

export default function DocumentManagerPage() {
  return (
    <div className="flex flex-col w-full h-screen max-h-[100%]">
      <DocumentManager />
    </div>
  );
}