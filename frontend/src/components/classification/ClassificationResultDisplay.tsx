import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormattedClassificationResult } from '@/lib/classification/types';
import { ClassificationSchemeRead } from '@/client/models';
import { format } from 'date-fns';
import { BrainCircuit } from 'lucide-react';

interface ClassificationResultDisplayProps {
  result: FormattedClassificationResult;
  compact?: boolean;
  showSchemeInfo?: boolean;
  showTimestamp?: boolean;
}

export function ClassificationResultDisplay({
  result,
  compact = false,
  showSchemeInfo = true,
  showTimestamp = true
}: ClassificationResultDisplayProps) {
  if (!result.scheme) {
    return <div className="text-sm text-muted-foreground">No scheme information available</div>;
  }

  const scheme = result.scheme;
  const value = result.value;
  
  // Helper function to format field values based on type
  const formatFieldValue = (value: any, field: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">N/A</span>;
    }

    // Handle special case for "N/A"
    if (value === "N/A" || (typeof value === 'string' && value.toLowerCase() === 'n/a')) {
      return <span className="text-gray-400">N/A</span>;
    }

    // Handle default_field case (common for complex types)
    if (typeof value === 'object' && value !== null && 'default_field' in value) {
      return (
        <div className="text-sm p-2 bg-muted/10 rounded border border-muted">
          <p className="italic text-muted-foreground text-xs mb-1">Summary:</p>
          <p>{value.default_field}</p>
        </div>
      );
    }

    // Format based on field type
    switch (field.type) {
      case 'int':
        const num = Number(value);
        if (!isNaN(num)) {
          // Binary classification (0-1 scale)
          if ((field.scale_min === 0 || (field.config && field.config.scale_min === 0)) && 
              (field.scale_max === 1 || (field.config && field.config.scale_max === 1))) {
            return <Badge variant={num > 0.5 ? "default" : "outline"}>{num > 0.5 ? 'True' : 'False'}</Badge>;
          }
          // Regular numeric scale
          return <Badge variant="outline">{num.toFixed(2)}</Badge>;
        }
        return <span>{String(value)}</span>;

      case 'List[str]':
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.map((item, i) => (
                <Badge key={i} variant="secondary">{item}</Badge>
              ))}
            </div>
          );
        }
        return <span>{String(value)}</span>;

      case 'str':
        return <span>{String(value)}</span>;

      case 'List[Dict[str, any]]':
        // Special handling for entity statements
        if (Array.isArray(value) && value.length > 0 && 
            typeof value[0] === 'object' && 
            'entity' in value[0] && 'statement' in value[0]) {
          return (
            <div className="space-y-2">
              {value.map((item, i) => (
                <div key={i} className="p-2 bg-muted/10 rounded border border-muted mb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.entity || 'Unknown Entity'}</span>
                    {item.sentiment !== undefined && (
                      <Badge variant={item.sentiment > 0 ? "default" : 
                                      item.sentiment < 0 ? "destructive" : "outline"}>
                        {item.sentiment > 0 ? 'Positive' : 
                         item.sentiment < 0 ? 'Negative' : 'Neutral'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm mt-1">{item.statement || 'No statement'}</p>
                </div>
              ))}
            </div>
          );
        }
        
        // Generic handling for List[Dict[str, any]]
        if (Array.isArray(value)) {
          return (
            <div className="space-y-1">
              {value.map((item, i) => (
                <div key={i} className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">
                  {typeof item === 'object' && item !== null
                    ? Object.entries(item).map(([k, v], idx) => (
                        <span key={idx} className="inline-block mr-1">
                          <span className="font-medium">{k}:</span> {String(v)}
                          {idx < Object.entries(item).length - 1 ? ', ' : ''}
                        </span>
                      ))
                    : String(item)
                  }
                </div>
              ))}
            </div>
          );
        } else if (typeof value === 'object' && value !== null) {
          // Handle case where the value is an object but not an array
          return (
            <div className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">
              {Object.entries(value).map(([k, v], idx) => (
                <span key={idx} className="inline-block mr-1">
                  <span className="font-medium">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                  {idx < Object.entries(value).length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          );
        }
        return <pre className="text-xs overflow-auto">{JSON.stringify(value, null, 2)}</pre>;

      default:
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            return (
              <div className="space-y-1">
                {value.map((item, i) => (
                  <div key={i} className="text-xs">
                    {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                  </div>
                ))}
              </div>
            );
          }
          return <pre className="text-xs overflow-auto">{JSON.stringify(value, null, 2)}</pre>;
        }
        return <span>{String(value)}</span>;
    }
  };

  // Extract field values from the result
  const getFieldValues = () => {
    // If the value is a simple value and we have only one field, use it directly
    if (scheme.fields.length === 1 && (typeof value !== 'object' || value === null)) {
      return { [scheme.fields[0].name]: value };
    }
    
    // If the value is an object, use it directly
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value;
    }
    
    // If the value is an array and we have a field of type List[str] or List[Dict[str, any]]
    if (Array.isArray(value) && scheme.fields.length === 1) {
      return { [scheme.fields[0].name]: value };
    }
    
    // Fallback
    return { value };
  };

  const fieldValues = getFieldValues();

  const content = (
    <div className="space-y-4">
      {showSchemeInfo && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-1">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <span>{scheme.name}</span>
          </h3>
          {showTimestamp && result.timestamp && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(result.timestamp), 'PP p')}
            </span>
          )}
        </div>
      )}
      
      <div className="space-y-3">
        {scheme.fields.map((field, idx) => {
          // Get the value for this field
          const fieldValue = fieldValues[field.name];
          
          return (
            <div key={idx} className="space-y-1">
              <div className="text-sm font-medium">{field.name}</div>
              <div className="text-sm">{formatFieldValue(fieldValue, field)}</div>
              {field.description && !compact && (
                <div className="text-xs text-muted-foreground">{field.description}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (compact) {
    return (
      <ScrollArea className="max-h-24">
        <div className="p-1">{content}</div>
      </ScrollArea>
    );
  }

  return content;
} 