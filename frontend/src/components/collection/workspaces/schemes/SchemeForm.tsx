"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon } from "lucide-react"
import { useWorkspaceStore } from "@/zustand_stores/storeWorkspace"
import { SchemaFieldInput } from "./SchemaFieldInput"
import { useClassificationSchemeStore } from "@/zustand_stores/storeSchemas"
import { FieldType, IntType, SchemeFormData, SchemeFormDataInterface } from "@/lib/abstract-classification-schema"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SCHEMA_EXAMPLES } from "@/lib/schema-examples"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ClassificationSchemeRead, ClassificationSchemeCreate } from "@/client/models"
import { SCHEME_TYPE_OPTIONS } from "@/lib/abstract-classification-schema"

interface Field {
  name: string
  type: FieldType
  description: string
  scale_min?: number
  scale_max?: number
  is_set_of_labels?: boolean
  labels?: string[]
  dict_keys?: Record<string, string>[]
}

interface SchemeFormProps {
  formData: SchemeFormDataInterface;
  setFormData: React.Dispatch<React.SetStateAction<SchemeFormDataInterface>>;
  showTutorial?: boolean;
  readOnly?: boolean;
  onSubmit?: () => void;
}

export function SchemeForm({ formData, setFormData, showTutorial = false, readOnly = false, onSubmit }: SchemeFormProps) {
  const { activeWorkspace } = useWorkspaceStore()
  const { createClassificationScheme } = useClassificationSchemeStore()
  const [fields, setFields] = useState<Field[]>([])
  const [currentField, setCurrentField] = useState<Field>({
    name: "",
    type: "str",
    description: "",
  })
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const addField = () => {
    setFields([...fields, currentField])
    setCurrentField({
      name: '',
      description: '',
      type: 'str',
      scale_min: 0,
      scale_max: 1,
      is_set_of_labels: false,
      labels: [],
      dict_keys: []
    })
  }

  const addLabel = (label: string) => {
    setCurrentField({
      ...currentField,
      labels: [...(currentField.labels || []), label],
    })
  }

  const addDictKey = (key: string, type: "str" | "int" | "List[str]") => {
    setCurrentField({
      ...currentField,
      dict_keys: [...(currentField.dict_keys || []), { name: key, type }],
    })
  }

  const handleFieldChange = (fieldData: SchemeFormDataInterface) => {
    setCurrentField({
      name: fieldData.name,
      type: fieldData.type,
      description: fieldData.description,
      scale_min: fieldData.scale_min ?? undefined,
      scale_max: fieldData.scale_max ?? undefined,
      is_set_of_labels: fieldData.is_set_of_labels ?? undefined,
      labels: fieldData.labels ?? undefined,
      dict_keys: fieldData.dict_keys ?? undefined,
    });
  }

  return (
    <form 
      id="scheme-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!activeWorkspace?.uid) return;

        try {
          await createClassificationScheme({
            ...formData,
            scale_min: formData.type === 'int' ? Number(formData.scale_min) : null,
            scale_max: formData.type === 'int' ? Number(formData.scale_max) : null,
          }, activeWorkspace.uid);

          onSubmit?.();
        } catch (error) {
          console.error('Error creating classification scheme:', error);
        }
      }}
      className="space-y-6"
    >
      {showTutorial && (
        <div className="bg-secondary/10 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">
            {SCHEMA_EXAMPLES[formData.type as keyof typeof SCHEMA_EXAMPLES]?.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {SCHEMA_EXAMPLES[formData.type as keyof typeof SCHEMA_EXAMPLES]?.description}
          </p>
          
          <div className="space-y-4">
            {SCHEMA_EXAMPLES[formData.type as keyof typeof SCHEMA_EXAMPLES]?.examples.map((example, idx) => (
              <div key={idx} className="border-l-2 border-primary/20 pl-4">
                <h4 className="font-medium">{example.name}</h4>
                <p className="text-sm text-muted-foreground">{example.description}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setFormData({
                    ...formData,
                    name: example.name,
                    description: example.description,
                    model_instructions: example.modelInstructions,
                    type: "List[str]",
                    scale_min: example.scale_min,
                    scale_max: example.scale_max,
                    is_set_of_labels: example.is_set_of_labels,
                    labels: example.labels,
                    dict_keys: example.dict_keys,
                  })}
                >
                  Use this template
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Info Section */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="modelName">Name</Label>
          <Input
            id="modelName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., PoliticalSentiment"
            readOnly={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label>Scheme Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as FieldType })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {SCHEME_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="modelDescription">Description</Label>
          <Textarea
            id="modelDescription"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What does this classification scheme measure?"
            className="h-40"
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Fields Section - Visual Builder */}
      <div className="space-y-4">
        {/* Existing Fields */}
        <div className="space-y-2">
          {fields.map((field, index) => (
            <Card key={index} className="bg-secondary/5 hover:bg-secondary/10 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{field.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20">
                      {field.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                  {field.type === "int" && field.scale_min === 0 && field.scale_max === 1 && (
                    <p className="text-xs text-muted-foreground">
                      Yes/No (0/1)
                    </p>
                  )}
                  {field.type === "int" && field.scale_min !== undefined && field.scale_max !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Scale: {field.scale_min} to {field.scale_max}
                    </p>
                  )}
                  {field.type === "List[Dict[str, any]]" && field.is_set_of_labels && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {field.labels?.map((label, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10">
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setFields(fields.filter((_, i) => i !== index))
                  }}
                  disabled={readOnly}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Field Section */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-[1fr,1fr,2fr] gap-4">
                <div>
                  <Label htmlFor="fieldName">Field Name</Label>
                  <Input
                    id="fieldName"
                    value={currentField.name}
                    onChange={(e) => setCurrentField({ ...currentField, name: e.target.value })}
                    placeholder="e.g., sentiment"
                  />
                </div>
                <div>
                  <Label htmlFor="fieldType">Type</Label>
                  <Select
                    value={currentField.type}
                    onValueChange={(value: FieldType) => setCurrentField({ ...currentField, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="str">Text</SelectItem>
                      <SelectItem value="int">Number</SelectItem>
                      <SelectItem value="List[str]">Multiple Choice</SelectItem>
                      <SelectItem value="List[Dict[str, any]]">Complex Structure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fieldDescription">Description</Label>
                  <Input
                    id="fieldDescription"
                    value={currentField.description}
                    onChange={(e) => setCurrentField({ ...currentField, description: e.target.value })}
                    placeholder="What does this field measure?"
                  />
                </div>
              </div>

              {/* Field Type Specific Options */}
              <SchemaFieldInput
                field={currentField.type}
                value={{
                  name: currentField.name,
                  description: currentField.description,
                  type: currentField.type,
                  scale_min: currentField.scale_min,
                  scale_max: currentField.scale_max,
                  is_set_of_labels: currentField.is_set_of_labels,
                  labels: currentField.labels,
                  dict_keys: currentField.dict_keys as { name: string; type: string }[],
                  model_instructions: formData.model_instructions,
                  validation_rules: formData.validation_rules
                }}
                onChange={handleFieldChange}
                scheme={{
                  ...formData,
                  id: 0, // Placeholder for SchemeFieldInput
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }}
              />

              <div className="flex justify-end">
                <Button 
                  onClick={addField}
                  disabled={!currentField.name || !currentField.type || readOnly}
                >
                  Add Field
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section - Collapsible */}
      {fields.length > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            disabled={readOnly}
          >
            <span className="font-medium">Classification Structure Preview</span>
            {isPreviewOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {isPreviewOpen && (
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{formData.name}</p>
                  <p className="text-muted-foreground">{formData.description}</p>
                  <div className="pl-4 border-l-2 border-primary/20 space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <div key={index}>
                        <span className="font-medium">{field.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({getFieldTypeDescription(field)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </form>
  )
}

function getFieldTypeDescription(field: Field): string {
  switch (field.type) {
    case "int":
      if (field.scale_min === 0 && field.scale_max === 1) {
        return "Yes/No (0/1)"
      }
      return `Number scale from ${field.scale_min || 0} to ${field.scale_max || 10}`
    case "str":
      return field.is_set_of_labels && field.labels?.length ? `Choose from: ${field.labels.join(", ")}` : "Text"
    case "List[Dict[str, any]]":
      return "Complex structure"
    default:
      return "Text"
  }
}

export const transformFormDataToApi = (formData: SchemeFormDataInterface): ClassificationSchemeCreate => ({
  name: formData.name,
  description: formData.description,
  type: formData.type,
  scale_min: formData.type === 'int' ? Number(formData.scale_min) : null,
  scale_max: formData.type === 'int' ? Number(formData.scale_max) : null,
  is_set_of_labels: formData.is_set_of_labels,
  labels: formData.labels,
  dict_keys: formData.dict_keys?.map(key => ({
    name: key.name,
    type: key.type
  })) || null,
  model_instructions: formData.model_instructions,
  validation_rules: formData.validation_rules
});

