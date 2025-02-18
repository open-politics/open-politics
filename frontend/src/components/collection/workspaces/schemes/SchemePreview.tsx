import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SchemeFormData } from "@/lib/abstract-classification-schema";
import { ClassificationSchemeRead } from "@/client/models";
interface SchemePreviewProps {
  scheme: SchemeFormData | ClassificationSchemeRead;
}

function getFieldTypeDescription(scheme: ClassificationSchemeRead) {
  if (scheme.type === "str" && scheme.labels?.length === 2) {
    return `Binary (${scheme.labels.join("/")})`;
  }
  if (scheme.type === 'List[str]') return 'Labels/Categories';
  if (scheme.type === 'List[Dict[str, any]]') return 'Structured Data';
  switch(scheme.type) {
    case 'int':
      return (scheme.scale_min === 0 && scheme.scale_max === 1) ?
        'True/False' :
        `Scale (${scheme.scale_min}-${scheme.scale_max})`;
    default:
      return 'Text Value';
  }
}

const isSchemeFormData = (scheme: SchemeFormData | ClassificationSchemeRead): scheme is SchemeFormData => {
  return 'intType' in scheme; // More accurate check for form data
};

export function SchemePreview({ scheme }: SchemePreviewProps) {
  return (
    <Card className="bg-primary/5">
      <CardContent className="p-4">
        <div className="space-y-2 text-sm">
          <p className="font-medium">{scheme.name}</p>
          <p className="text-muted-foreground">{scheme.description}</p>
          <div className="pl-4 border-l-2 border-primary/20 space-y-2 mt-2">
            <div>
              <span className="font-medium">Type</span>
              <span className="text-muted-foreground ml-2">
                ({getFieldTypeDescription(scheme as ClassificationSchemeRead)})
              </span>
              {scheme.type === "List[Dict[str, any]]" && isSchemeFormData(scheme) && scheme.is_set_of_labels && scheme.labels && (
                <div className="flex flex-wrap gap-1 mt-1 ml-4">
                  {scheme.labels.map((label, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10">
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {isSchemeFormData(scheme) && scheme.model_instructions && (
            <div className="mt-4">
              <p className="font-medium">Model Instructions:</p>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {scheme.model_instructions}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}