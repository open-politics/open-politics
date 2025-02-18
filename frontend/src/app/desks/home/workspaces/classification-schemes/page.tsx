'use client';

import ClassificationSchemeManager from '@/components/collection/workspaces/classifications/ClassificationSchemeManager';
  
export default function ClassificationSchemesPage() {
  return (
    <div className="relative flex flex-col items-center mx-auto top-4 min-h-screen overflow-visible bg-primary-950">
      <div className="flex flex-col items-center w-full max-w-8xl p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <ClassificationSchemeManager />
      </div>
    </div>
  );
};