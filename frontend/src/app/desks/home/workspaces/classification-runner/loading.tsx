import { Loader2 } from 'lucide-react';

export default function ClassificationRunnerLoading() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading Classification Runner...</p>
      </div>
    </div>
  );
} 