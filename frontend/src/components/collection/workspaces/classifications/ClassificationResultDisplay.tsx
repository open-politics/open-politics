import React from 'react';
import { ClassificationResultRead, ClassificationSchemeRead } from '@/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { SchemeField } from "@/lib/classification/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassificationService } from '@/lib/classification/service';

// Helper functions to replace the ones from the missing module
const formatSchemeValue = (value: any, field: SchemeField): string => {
  if (value === null || value === undefined) return 'N/A';
  
  switch (field.type) {
    case 'int':
      const num = Number(value);
      if (!isNaN(num)) {
        if (field.config.scale_min === 0 && field.config.scale_max === 1) {
          return num > 0.5 ? 'True' : 'False';
        }
        return num.toFixed(2);
      }
      return String(value);
      
    case 'List[str]':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
      
    case 'List[Dict[str, any]]':
      if (Array.isArray(value)) {
        return `${value.length} items`;
      }
      return String(value);
      
    default:
      return String(value);
  }
};

const getFormattedClassificationValue = (result: ClassificationResultRead, scheme: ClassificationSchemeRead): any => {
  if (!result.value) return '';
  
  // Get the first field of the scheme
  const field = scheme.fields[0];
  if (!field) return '';
  
  // Extract the value for this field
  let fieldValue: any;
  
  // If the value is a simple type, use it directly
  if (typeof result.value !== 'object' || result.value === null) {
    fieldValue = result.value;
  } 
  // If the value is an object, try to extract the field value
  else if (!Array.isArray(result.value)) {
    // Try field name first
    if (result.value[field.name] !== undefined) {
      fieldValue = result.value[field.name];
    }
    // Try scheme name
    else if (result.value[scheme.name] !== undefined) {
      fieldValue = result.value[scheme.name];
    }
    // If it has a value property, use that
    else if ('value' in result.value) {
      fieldValue = result.value.value;
    }
    // If it has only one property, use that
    else if (Object.keys(result.value).length === 1) {
      fieldValue = Object.values(result.value)[0];
    }
    // Otherwise use the whole object
    else {
      fieldValue = result.value;
    }
  }
  // If the value is an array, use it directly
  else {
    fieldValue = result.value;
  }
  
  return fieldValue;
};

interface EnhancedClassificationResultRead extends ClassificationResultRead {
  display_value?: string | number | Record<string, any> | null;
}

// Component for displaying a single classification result
const SingleClassificationResult: React.FC<{ 
  result: ClassificationResultRead, 
  scheme: ClassificationSchemeRead,
  compact?: boolean
}> = ({ result, scheme, compact = false }) => {
  // Helper function to adapt a field from ClassificationFieldCreate to SchemeField
  const adaptFieldToSchemeField = (field: any): SchemeField => ({
    name: field.name,
    type: field.type,
    description: field.description,
    config: {
      scale_min: field.scale_min,
      scale_max: field.scale_max,
      is_set_of_labels: field.is_set_of_labels,
      labels: field.labels,
      dict_keys: field.dict_keys
    }
  });

  // Extract values from the classification result
  const extractFieldValues = () => {
    // Log the result value for debugging
    console.log('Classification result value:', JSON.stringify(result.value, null, 2));
    
    // Handle empty or null values
    if (!result.value || Object.keys(result.value).length === 0) {
      console.log('Empty classification result value');
      return { value: 'No classification data available' };
    }
    
    // Since result.value is the direct output of the Pydantic model from the backend,
    // we can use it directly without complex transformations
    if (typeof result.value === 'object' && !Array.isArray(result.value)) {
      // The result.value should already have the field names as keys
      return result.value;
    }
    
    // Handle simple value case (for single-field schemes)
    if (scheme.fields && scheme.fields.length === 1) {
      return { [scheme.fields[0].name]: result.value };
    }
    
    // Fallback for other cases
    return { value: result.value };
  };

  const fieldValues = extractFieldValues();

  const formatFieldValue = (value: any, field: SchemeField): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-400">N/A</span>;

    // Handle special case for "N/A"
    if (value === "N/A" || (typeof value === 'string' && value.toLowerCase() === 'n/a')) {
      return <span className="text-gray-400">N/A</span>;
    }

    // Handle special case for no data message
    if (value === 'No classification data available') {
      return <span className="text-amber-500 italic">{value}</span>;
    }

    // Format based on field type
    switch (field.type) {
      case 'int':
        const num = Number(value);
        if (!isNaN(num)) {
          // Binary classification (0-1 scale)
          if (field.config.scale_min === 0 && field.config.scale_max === 1) {
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
        // Use the centralized helper function for entity statements
        const formattedItems = ClassificationService.formatEntityStatements(value, {
          compact: false,
          maxItems: 10
        });
        
        if (Array.isArray(formattedItems)) {
          return (
            <div className="space-y-1">
              {formattedItems.map((item, i) => {
                if (typeof item === 'string') {
                  return (
                    <div key={i} className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">
                      {item}
                    </div>
                  );
                }
                
                return (
                  <div key={i} className="text-xs bg-gray-100 dark:bg-gray-800 p-1 rounded">
                    {item.entity && <span className="font-medium">{String(item.entity)}: </span>}
                    {item.statement && <span>{String(item.statement)}</span>}
                    {item.raw && <span>{item.raw}</span>}
                    {item.summary && <span className="text-muted-foreground">{item.summary}</span>}
                  </div>
                );
              })}
            </div>
          );
        }
        
        return <span>{String(formattedItems)}</span>;

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

  const content = (
    <div className="space-y-4">
      {scheme.fields && Array.isArray(scheme.fields) ? scheme.fields.map((field, idx) => {
        // Convert the field to SchemeField format
        const schemeField = adaptFieldToSchemeField(field);
        
        // Get the value for this field directly from fieldValues
        const fieldValue = fieldValues[field.name];
        
        // Log the field and its value for debugging
        console.log(`Field ${field.name} (${field.type}):`, fieldValue);
        
        return (
          <div key={idx} className="space-y-1">
            <div className="text-sm font-medium">{field.name}</div>
            {formatFieldValue(fieldValue, schemeField)}
          </div>
        );
      }) : <div className="text-sm text-gray-500">No fields defined in scheme</div>}
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
};

// Component to display multiple schemes in a consolidated view
const ConsolidatedSchemesView: React.FC<{
  results: ClassificationResultRead[],
  schemes: ClassificationSchemeRead[],
  compact?: boolean,
  useTabs?: boolean
}> = ({ results, schemes, compact = false, useTabs = false }) => {
  // If we should use tabs, use the original tabbed view
  if (useTabs) {
    return (
      <Tabs defaultValue={schemes[0].id?.toString() || "0"} className="w-full">
        <TabsList className="mb-2">
          {schemes.map(s => (
            <TabsTrigger key={s.id} value={s.id?.toString() || "0"}>
              {s.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {schemes.map(s => {
          const schemeResult = results.find(r => r.scheme_id === s.id);
          
          return (
            <TabsContent key={s.id} value={s.id?.toString() || "0"}>
              {schemeResult ? (
                <SingleClassificationResult result={schemeResult} scheme={s} compact={compact} />
              ) : (
                <div className="text-sm text-gray-500">No results for this scheme</div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    );
  }
  
  // Otherwise, display all schemes in a consolidated view
  return (
    <div className="space-y-6 ml-4">
      {schemes.map(scheme => {
        const schemeResult = results.find(r => r.scheme_id === scheme.id);
        
        if (!schemeResult) return null;
        
        return (
          <div key={scheme.id} className="border-b pb-4 last:border-b-0">
            <div className="font-medium text-base mb-2">{scheme.name}</div>
            <SingleClassificationResult 
              result={schemeResult} 
              scheme={scheme} 
              compact={compact} 
            />
          </div>
        );
      })}
    </div>
  );
};

// Main component that can handle multiple results
const ClassificationResultDisplay: React.FC<{ 
  result: ClassificationResultRead | ClassificationResultRead[], 
  scheme: ClassificationSchemeRead | ClassificationSchemeRead[],
  compact?: boolean,
  useTabs?: boolean
}> = ({ result, scheme, compact = false, useTabs = false }) => {
  // Handle array of results with array of schemes
  if (Array.isArray(result) && Array.isArray(scheme)) {
    // If there's only one result, render it directly
    if (result.length === 1 && scheme.length === 1) {
      return <SingleClassificationResult result={result[0]} scheme={scheme[0]} compact={compact} />;
    }
    
    // Use the consolidated view for multiple schemes
    return <ConsolidatedSchemesView results={result} schemes={scheme} compact={compact} useTabs={useTabs} />;
  }
  
  // Handle single result with single scheme
  if (!Array.isArray(result) && !Array.isArray(scheme)) {
    return <SingleClassificationResult result={result} scheme={scheme} compact={compact} />;
  }
  
  // Handle array of results with single scheme
  if (Array.isArray(result) && !Array.isArray(scheme)) {
    // Find the result that matches the scheme
    const matchingResult = result.find(r => r.scheme_id === scheme.id);
    
    if (matchingResult) {
      return <SingleClassificationResult result={matchingResult} scheme={scheme} compact={compact} />;
    }
    
    return <div className="text-sm text-gray-500">No matching result for this scheme</div>;
  }
  
  // Handle single result with array of schemes
  if (!Array.isArray(result) && Array.isArray(scheme)) {
    // Find the scheme that matches the result
    const matchingScheme = scheme.find(s => s.id === result.scheme_id);
    
    if (matchingScheme) {
      return <SingleClassificationResult result={result} scheme={matchingScheme} compact={compact} />;
    }
    
    return <div className="text-sm text-gray-500">No matching scheme for this result</div>;
  }
  
  // Fallback
  return <div className="text-sm text-gray-500">Invalid result or scheme configuration</div>;
};

export default ClassificationResultDisplay;