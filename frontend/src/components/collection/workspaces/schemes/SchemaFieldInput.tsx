import { FieldType, IntType, SchemeFormData } from "@/lib/abstract-classification-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider"

import { ClassificationSchemeRead } from "@/client/models";
interface SchemaFieldInputProps {
  field: FieldType;
  value: SchemeFormData;
  onChange: (value: SchemeFormData) => void;
  scheme: ClassificationSchemeRead;
}

export const SchemaFieldInput = ({ field, value, onChange, scheme }: SchemaFieldInputProps) => {
  const handleDictKeyChange = (index: number, keyChange: { name: string; type: string }) => {
    const newKeys = [...(value.dict_keys || [])];
    newKeys[index] = keyChange;
    onChange({ ...value, dict_keys: newKeys });
  };

  switch (field) {
    case "int":
      return (
        <div className="space-y-2">
          <Label>Integer Configuration</Label>
          <div className="ml-6 space-y-4">
            <div className="space-y-2">
              <Label>Minimum Value</Label>
              <Input
                type="number"
                value={value.scale_min ?? 0}
                onChange={(e) =>
                  onChange({
                    ...value,
                    scale_min: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum Value</Label>
              <Input
                type="number"
                value={value.scale_max ?? 1}
                onChange={(e) =>
                  onChange({
                    ...value,
                    scale_max: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>
      );

    case "List[str]":
      return (
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <Switch
              checked={value.is_set_of_labels || false}
              onCheckedChange={(checked) =>
                onChange({
                  ...value,
                  is_set_of_labels: checked,
                })
              }
            />
            <Label>Use predefined labels</Label>
          </div>

          {value.is_set_of_labels ? (
            <div className="space-y-2">
              {value.labels?.map((label, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={label}
                    onChange={(e) => {
                      const newLabels = [...(value.labels || [])];
                      newLabels[index] = e.target.value;
                      onChange({ ...value, labels: newLabels });
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const newLabels = [...(value.labels || [])];
                      newLabels.splice(index, 1);
                      onChange({ ...value, labels: newLabels });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  onChange({
                    ...value,
                    labels: [...(value.labels || []), ""],
                  })
                }
              >
                Add Label
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Enter labels (comma separated)</Label>
              <Input
                value={value.labels ? value.labels.join(", ") : ""}
                onChange={(e) => {
                  const labels = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  onChange({ ...value, labels });
                }}
              />
            </div>
          )}
        </div>
      );

    case "List[Dict[str, any]]":
      return (
        <div className="space-y-4">
          {value.dict_keys?.map((key, index) => (
            <div key={index} className="grid grid-cols-2 gap-4">
              <Input
                value={key.name}
                onChange={(e) => handleDictKeyChange(index, { ...key, name: e.target.value })}
                placeholder="Key name"
              />
              <Select
                value={key.type}
                onValueChange={(type) => handleDictKeyChange(index, { ...key, type })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="str">String</SelectItem>
                  <SelectItem value="int">Integer</SelectItem>
                  <SelectItem value="List[str]">List of Strings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              onChange({
                ...value,
                dict_keys: [...(value.dict_keys || []), { name: "", type: "str" }],
              })
            }
          >
            Add Key
          </Button>
        </div>
      );

    default:
      return null;
  }
}; 