import { ClassificationSchemeRead } from "@/client/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Info, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ResultFilter {
  schemeId: number;
  operator: 'equals' | 'contains' | 'range';
  value: any;
}

interface ResultFiltersProps {
  filters: ResultFilter[];
  schemes: ClassificationSchemeRead[];
  onChange: (filters: ResultFilter[]) => void;
}

export const ResultFilters = ({ filters, schemes, onChange }: ResultFiltersProps) => {
  const addFilter = () => {
    if (schemes.length === 0) return;
    onChange([...filters, { schemeId: schemes[0].id, operator: 'equals', value: '' }]);
  };

  const updateFilter = (index: number, filter: ResultFilter) => {
    const newFilters = [...filters];
    newFilters[index] = filter;
    onChange(newFilters);
  };

  const removeFilter = (index: number) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  // Get appropriate operators based on field type
  const getOperatorsForScheme = (schemeId: number) => {
    const scheme = schemes.find(s => s.id === schemeId);
    if (!scheme || !scheme.fields || scheme.fields.length === 0) {
      return ['equals', 'contains'];
    }

    const fieldType = scheme.fields[0].type;
    
    switch (fieldType) {
      case 'int':
        return ['equals', 'range'];
      case 'List[str]':
        return ['contains', 'equals'];
      case 'List[Dict[str, any]]':
        // For entity statements, 'contains' is the most appropriate
        // as it can search within entity names or statements
        return ['contains']; 
      case 'str':
      default:
        return ['equals', 'contains'];
    }
  };

  // Get a helpful tooltip for the filter based on field type
  const getFilterTooltip = (schemeId: number) => {
    const scheme = schemes.find(s => s.id === schemeId);
    if (!scheme || !scheme.fields || scheme.fields.length === 0) {
      return "Filter results based on this classification scheme";
    }

    const fieldType = scheme.fields[0].type;
    
    switch (fieldType) {
      case 'int':
        return "Filter numeric values. Use 'equals' for exact matches or 'range' to filter between min and max values.";
      case 'List[str]':
        return "Filter text lists. Use 'contains' to find items containing your text or 'equals' for exact matches.";
      case 'List[Dict[str, any]]':
        return "Filter entity statements by searching for text within entity names or statements.";
      case 'str':
        return "Filter text values. Use 'equals' for exact matches or 'contains' to find text containing your search term.";
      default:
        return "Filter results based on this classification scheme";
    }
  };

  // Check if a scheme has predefined labels
  const hasLabels = (schemeId: number) => {
    const scheme = schemes.find(s => s.id === schemeId);
    return scheme?.fields?.[0]?.is_set_of_labels && 
           Array.isArray(scheme?.fields?.[0]?.labels) && 
           scheme?.fields?.[0]?.labels.length > 0;
  };

  // Get labels for a scheme if available
  const getLabelsForScheme = (schemeId: number) => {
    const scheme = schemes.find(s => s.id === schemeId);
    return scheme?.fields?.[0]?.labels || [];
  };

  // Get a display name for the field type
  const getFieldTypeDisplay = (schemeId: number) => {
    const scheme = schemes.find(s => s.id === schemeId);
    if (!scheme || !scheme.fields || scheme.fields.length === 0) {
      return "Unknown";
    }

    const fieldType = scheme.fields[0].type;
    
    switch (fieldType) {
      case 'int':
        return "Number";
      case 'List[str]':
        return "Text List";
      case 'List[Dict[str, any]]':
        return "Entity Statements";
      case 'str':
        return "Text";
      default:
        return fieldType;
    }
  };

  if (schemes.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No classification schemes available to filter by.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filter Results</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Filter results based on classification values. Documents will be shown only if they match all filters. Different operators are available depending on the data type.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {filters.map((filter, index) => {
        const operators = getOperatorsForScheme(filter.schemeId);
        const showLabelsDropdown = hasLabels(filter.schemeId) && filter.operator === 'equals';
        const labels = getLabelsForScheme(filter.schemeId);
        const fieldTypeDisplay = getFieldTypeDisplay(filter.schemeId);
        const filterTooltip = getFilterTooltip(filter.schemeId);
        
        return (
          <div key={index} className="flex gap-2 items-center flex-wrap p-3 border rounded-md bg-muted/20">
            <div className="flex items-center gap-2 w-full mb-2">
              <Select
                value={filter.schemeId.toString()}
                onValueChange={value => {
                  const newSchemeId = parseInt(value);
                  // When changing scheme, also update operator if current one isn't valid
                  const newOperators = getOperatorsForScheme(newSchemeId);
                  const newOperator = newOperators.includes(filter.operator) 
                    ? filter.operator 
                    : newOperators[0];
                  
                  updateFilter(index, { 
                    ...filter, 
                    schemeId: newSchemeId,
                    operator: newOperator as 'equals' | 'contains' | 'range',
                    value: '' // Reset value when changing scheme
                  });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select scheme" />
                </SelectTrigger>
                <SelectContent>
                  {schemes.map(scheme => (
                    <SelectItem key={scheme.id} value={scheme.id.toString()}>
                      {scheme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Badge variant="outline" className="text-xs">
                {fieldTypeDisplay}
              </Badge>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{filterTooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(index)}
                className="ml-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 items-center w-full">
              <Select
                value={filter.operator}
                onValueChange={value => updateFilter(index, { 
                  ...filter, 
                  operator: value as 'equals' | 'contains' | 'range',
                  // Reset value when changing operator
                  value: value === 'range' ? [0, 100] : ''
                })}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  {operators.includes('equals') && (
                    <SelectItem value="equals">Equals</SelectItem>
                  )}
                  {operators.includes('contains') && (
                    <SelectItem value="contains">Contains</SelectItem>
                  )}
                  {operators.includes('range') && (
                    <SelectItem value="range">Range</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {filter.operator === 'range' ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    type="number"
                    value={Array.isArray(filter.value) ? filter.value[0] || '' : ''}
                    onChange={e => updateFilter(index, {
                      ...filter,
                      value: [parseFloat(e.target.value) || 0, Array.isArray(filter.value) ? filter.value[1] || 0 : 0]
                    })}
                    className="w-full"
                    placeholder="Min"
                  />
                  <Input
                    type="number"
                    value={Array.isArray(filter.value) ? filter.value[1] || '' : ''}
                    onChange={e => updateFilter(index, {
                      ...filter,
                      value: [Array.isArray(filter.value) ? filter.value[0] || 0 : 0, parseFloat(e.target.value) || 0]
                    })}
                    className="w-full"
                    placeholder="Max"
                  />
                </div>
              ) : showLabelsDropdown ? (
                <Select
                  value={String(filter.value || '')}
                  onValueChange={value => updateFilter(index, { 
                    ...filter, 
                    value: value
                  })}
                  className="flex-1"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    {labels.map((label, i) => (
                      <SelectItem key={i} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={filter.value || ''}
                  onChange={e => updateFilter(index, { 
                    ...filter, 
                    value: e.target.value 
                  })}
                  className="flex-1"
                  placeholder={filter.operator === 'contains' ? 
                    getFieldTypeDisplay(filter.schemeId) === "Entity Statements" ? 
                      "Search entity names or statements..." : 
                      "Search text..." 
                    : "Value"}
                />
              )}
            </div>
          </div>
        );
      })}

      <Button onClick={addFilter} variant="outline" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Filter
      </Button>
    </div>
  );
}; 