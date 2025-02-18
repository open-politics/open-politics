import { ClassificationSchemeRead } from "@/client/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

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

  return (
    <div className="space-y-4">
      {filters.map((filter, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Select
            value={filter.schemeId.toString()}
            onValueChange={value => updateFilter(index, { 
              ...filter, 
              schemeId: parseInt(value) 
            })}
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

          <Select
            value={filter.operator}
            onValueChange={value => updateFilter(index, { 
              ...filter, 
              operator: value as 'equals' | 'contains' | 'range' 
            })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="range">Range</SelectItem>
            </SelectContent>
          </Select>

          {filter.operator === 'range' ? (
            <div className="flex gap-2">
              <Input
                type="number"
                value={filter.value[0]}
                onChange={e => updateFilter(index, {
                  ...filter,
                  value: [parseFloat(e.target.value), filter.value[1]]
                })}
                className="w-[100px]"
              />
              <Input
                type="number"
                value={filter.value[1]}
                onChange={e => updateFilter(index, {
                  ...filter,
                  value: [filter.value[0], parseFloat(e.target.value)]
                })}
                className="w-[100px]"
              />
            </div>
          ) : (
            <Input
              value={filter.value}
              onChange={e => updateFilter(index, { 
                ...filter, 
                value: e.target.value 
              })}
              className="w-[200px]"
            />
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFilter(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button onClick={addFilter}>
        Add Filter
      </Button>
    </div>
  );
}; 