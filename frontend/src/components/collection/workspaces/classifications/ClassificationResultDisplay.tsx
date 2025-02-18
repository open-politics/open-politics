import React from 'react';
import { ClassificationResultRead, ClassificationSchemeRead } from '@/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const ClassificationResultDisplay: React.FC<{ 
  result: ClassificationResultRead, 
  scheme: ClassificationSchemeRead,
  compact?: boolean
}> = ({ result, scheme, compact = false }) => {

  const formatValue = (value: any, level: number = 0): React.ReactNode => {
    if (!value) return null;

    // Parse JSON string if needed
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
      try {
        const parsedValue = JSON.parse(value);
        return formatValue(parsedValue, level);
      } catch (e) {
        return <Badge variant="outline">{value}</Badge>;
      }
    }

    // Handle numeric values with scale
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const num = Number(value);
      if (scheme.scale_min !== undefined && scheme.scale_max !== undefined) {
        return (
          <Badge variant="outline">
            {num.toFixed(2)} (Scale: {scheme.scale_min}-{scheme.scale_max})
          </Badge>
        );
      }
      return <Badge variant="outline">{num.toFixed(2)}</Badge>;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return (
        <div className={`flex flex-col gap-1 ${level > 0 ? 'ml-4' : ''}`}>
          {value.map((item, index) => (
            <div key={index}>
              {formatValue(item, level + 1)}
            </div>
          ))}
        </div>
      );
    }

    // Handle objects
    if (typeof value === 'object' && value !== null) {
      return (
        <div className={`flex flex-col ml-6 gap-1 ${level > 0 ? 'ml-4' : ''}`}>
          {Object.entries(value).map(([key, val], index) => {
            // If the value is an object or array, show the key separately
            if (typeof val === 'object' && val !== null) {
              return (
                <div key={index} className="flex flex-col gap-1">
                  <Badge variant="secondary" className="text-left font-medium">
                    {key}
                  </Badge>
                  {formatValue(val, level + 1)}
                </div>
              );
            }
            // For simple values, show key-value pair in one badge
            return (
              <Badge key={index} variant="outline" className="text-left">
                {key}: {String(val)}
              </Badge>
            );
          })}
        </div>
      );
    }

    // Handle simple values
    return <Badge variant="outline">{value}</Badge>;
  };

  const content = formatValue(result.value);

  if (compact) {
    return (
      <ScrollArea className="max-h-24">
        <div className="space-y-2 p-1">
          {content}
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="inline-flex flex-wrap gap-1">
      {content}
    </div>
  );
};

export default ClassificationResultDisplay;