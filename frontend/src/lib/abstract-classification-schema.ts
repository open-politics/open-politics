import { ClassificationSchemeCreate, ClassificationSchemeRead } from "@/client/models";

// Base types that match the API
export type FieldType = "int" | "str" | "List[str]" | "List[Dict[str, any]]";
export type IntType = "binary" | "scale";

// Type guard for IntType
export const isIntType = (value: string | null | undefined): value is IntType => {
  return value === "binary" || value === "scale";
};

// Type guard for FieldType
export const isFieldType = (value: string): value is FieldType => {
  return ["int", "str", "List[str]", "List[Dict[str, any]]"].includes(value);
};

// Frontend form data interface
export interface SchemeFormDataInterface {
  name: string;
  description: string;
  type: FieldType;
  scale_min?: number | null;
  scale_max?: number | null;
  is_set_of_labels?: boolean | null;
  max_labels?: number | null;
  labels?: string[] | null;
  dict_keys?: Array<{ name: string; type: string }> | null;
  model_instructions?: string | null;
  validation_rules?: Record<string, any> | null;
}

// Helper function to transform form data to API format
export const transformFormDataToApi = (formData: SchemeFormDataInterface): ClassificationSchemeCreate => ({
  name: formData.name,
  description: formData.description,
  type: formData.type,
  scale_min: formData.type === 'int' ? Number(formData.scale_min) : null,
  scale_max: formData.type === 'int' ? Number(formData.scale_max) : null,
  is_set_of_labels: formData.type === 'List[str]' ? formData.is_set_of_labels : null,
  max_labels: formData.type === 'List[str]' && !formData.is_set_of_labels ? 
    Number(formData.max_labels) : null,
  labels: formData.type === 'List[str]' && formData.is_set_of_labels ? 
    formData.labels || [] : null,
  dict_keys: formData.type === 'List[Dict[str, any]]' ? 
    formData.dict_keys?.map(key => ({
      name: key.name,
      type: key.type
    })) || [] 
    : null,
  model_instructions: formData.model_instructions,
  validation_rules: formData.validation_rules
});

// Helper function to transform API data to form format
export const transformApiToFormData = (apiData: ClassificationSchemeRead): SchemeFormDataInterface => {
  return {
    name: apiData.name,
    description: apiData.description,
    type: apiData.type as FieldType,
    scale_min: apiData.scale_min,
    scale_max: apiData.scale_max,
    is_set_of_labels: apiData.is_set_of_labels,
    labels: apiData.labels,
    dict_keys: apiData.dict_keys?.map(key => ({
      name: key.name,
      type: key.type
    })) || null,
    model_instructions: apiData.model_instructions,
    validation_rules: apiData.validation_rules
  };
};

export type SchemeFormData = SchemeFormDataInterface;

// In your form component:
const isBinaryField = (scheme: SchemeFormData) => 
  scheme.type === "str" && scheme.labels?.length === 2;

// Display logic
function getFieldTypeDescription(scheme: ClassificationSchemeRead) {
  if (scheme.type === "str" && scheme.labels?.length === 2) {
    return `Binary (${scheme.labels.join("/")})`;
  }
  switch(scheme.type) {
    case 'int': 
      return `Scale (${scheme.scale_min}-${scheme.scale_max})`;
    case 'List[str]':
      return 'Labels/Categories';
    case 'List[Dict[str, any]]':
      return 'Structured Data';
    default:
      return 'Text Value';
  }
}

export const SCHEME_TYPE_OPTIONS = [
  { value: 'int', label: 'Number' },
  { value: 'str', label: 'Text' },
  { value: 'List[str]', label: 'Labels/Categories' },
  { value: 'List[Dict[str, any]]', label: 'Structured Data' }
];

export const mapFieldTypeToLabel = (type: FieldType) => {
  return SCHEME_TYPE_OPTIONS.find(t => t.value === type)?.label || type;
};

// Determine binary dynamically
export const isBinaryScale = (scheme: ClassificationSchemeRead) => 
  scheme.type === 'int' && scheme.scale_min === 0 && scheme.scale_max === 1;