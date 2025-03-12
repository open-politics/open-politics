import React, { useMemo, useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
  DotProps,
  ComposedChart,
  Bar,
  BarProps,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { ClassificationResultRead, ClassificationSchemeRead, DocumentRead } from '@/client';
import ClassificationResultDisplay from './ClassificationResultDisplay';
import DocumentLink from '../documents/DocumentLink';
import { ClassificationService } from '@/lib/classification/service';
import { Info } from 'lucide-react';

// Define gradient colors for bars
const gradientColors = [
  ['#0088FE', '#0044AA'],
  ['#00C49F', '#007C64'],
  ['#FFBB28', '#CC8800'],
  ['#FF8042', '#CC5500'],
  ['#8884d8', '#5551A8'],
  ['#82ca9d', '#4D9A6C'],
  ['#a4de6c', '#6DAB39'],
  ['#d0ed57', '#A6C229'],
  ['#ffc658', '#D19C29'],
];

// Define base colors for the chart
export const colorPalette = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#a4de6c',
  '#d0ed57',
  '#ffc658',
];

// Custom bar component with gradient
const GradientBar = (props: any) => {
  const { fill, x, y, width, height, index } = props;
  const gradientId = `gradient-${index % gradientColors.length}`;
  
  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientColors[index % gradientColors.length][0]} stopOpacity={0.8} />
          <stop offset="100%" stopColor={gradientColors[index % gradientColors.length][1]} stopOpacity={0.6} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill={`url(#${gradientId})`} rx={4} ry={4} />
    </g>
  );
};

const CustomizedDot: React.FC<CustomizedDotProps> = (props) => {
  const { cx, cy, payload } = props;
  
  if (!cx || !cy) return null;

  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={4} 
      fill={props.stroke || '#8884d8'} 
      fillOpacity={0.8}
      style={{ cursor: 'pointer' }}
    />
  );
};

interface Scheme {
  id: number;
  name: string;
}

interface DataPoint {
  publicationDate: number;
  publicationDateString: string;
  classificationTimestamp: number;
  classificationDateString: string;
  [key: string]: any;
}

interface ChartDataPoint {
  dateString: string;
  timestamp: number;
  count: number;
  documents: number[];
  docSchemeValues?: Record<string, Record<string, any>>;
  [key: string]: string | number | any;
}

type ChartData = ChartDataPoint[];

interface CustomizedCurveEvent {
  payload?: ChartDataPoint;
  value?: any;
}

interface CustomizedDotProps extends DotProps {
  payload?: any;
}

interface Props {
  results: ClassificationResultRead[];
  schemes: ClassificationSchemeRead[];
  documents?: DocumentRead[];
  onDocumentSelect?: (documentId: number) => void;
  chartData?: any[];
  onDataPointClick?: (point: any) => void;
}

interface SchemeData {
  scheme: ClassificationSchemeRead;
  values: number[];
  counts: Map<string, number>;
}

interface ResultGroup {
  date: string;
  schemes: Record<number, SchemeData>;
}

// Helper function to safely stringify any value
const safeStringify = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    // @ts-ignore - TypeScript doesn't like this but it's safe
    return JSON.stringify(value);
  } catch (e) {
    return 'Complex Data';
  }
};

// Helper function to format classification values
const getFormattedClassificationValue = (result: any, scheme: any): any => {
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
  
  // Format the value based on the field type
  switch (field.type) {
    case 'int':
      const num = Number(fieldValue);
      if (!isNaN(num)) {
        if ((field.scale_min === 0) && (field.scale_max === 1)) {
          return num > 0.5 ? 'True' : 'False';
        }
        return typeof num === 'number' ? Number(num.toFixed(2)) : num;
      }
      return String(fieldValue);
      
    case 'List[str]':
      if (Array.isArray(fieldValue)) {
        const isSetOfLabels = field.is_set_of_labels;
        const labels = field.labels;
        
        if (isSetOfLabels && labels) {
          return fieldValue.filter((v: string) => labels.includes(v)).join(', ');
        }
        return fieldValue.join(', ');
      }
      return String(fieldValue);
      
    case 'str':
      return String(fieldValue);
      
    case 'List[Dict[str, any]]':
      // Use the centralized helper function for entity statements
      return ClassificationService.formatEntityStatements(fieldValue, { compact: true });
      
    default:
      if (typeof fieldValue === 'object') {
        if (Object.keys(fieldValue).length === 0) {
          return 'N/A';
        }
        return ClassificationService.safeStringify(fieldValue);
      }
      return String(fieldValue);
  }
};

const ClassificationResultsChart: React.FC<Props> = ({ results, schemes, documents, onDocumentSelect, chartData, onDataPointClick }) => {
  const [isGrouped, setIsGrouped] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const data: ChartData = useMemo(() => {
    if (!results || results.length === 0) {
      console.log('No results to display');
      return [];
    }
    
    console.log('Processing results:', results.length);
    
    // First, group results by document and date
    const resultsByDocAndDate = results.reduce<Record<string, Record<string, ClassificationResultRead[]>>>((acc, result) => {
      const dateKey = format(new Date(result.timestamp), 'yyyy-MM-dd');
      const docKey = `doc-${result.document_id}`;
      
      if (!acc[dateKey]) {
        acc[dateKey] = {};
      }
      
      if (!acc[dateKey][docKey]) {
        acc[dateKey][docKey] = [];
      }
      
      acc[dateKey][docKey].push(result);
      return acc;
    }, {});
    
    console.log('Results grouped by date and document:', Object.keys(resultsByDocAndDate).length);
    
    // Transform grouped data into chart format
    const chartData = Object.entries(resultsByDocAndDate).map(([date, docResults]) => {
      const chartPoint: ChartDataPoint = {
        dateString: date,
        timestamp: new Date(date).getTime(),
        count: Object.keys(docResults).length, // Count of unique documents on this date
        documents: [...new Set(Object.values(docResults).flatMap(results => results.map(r => r.document_id)))]
      };
      
      // For consolidated view, we'll create a map of documents to their scheme results
      const docSchemeValues: Record<string, Record<string, any>> = {};
      
      // Process each document's results
      Object.entries(docResults).forEach(([docKey, docSchemeResults]) => {
        const documentId = docKey.replace('doc-', '');
        docSchemeValues[documentId] = {};
        
        // Group this document's results by scheme
        const schemeGroups = docSchemeResults.reduce<Record<number, ClassificationResultRead[]>>((acc, result) => {
          if (!acc[result.scheme_id]) {
            acc[result.scheme_id] = [];
          }
          acc[result.scheme_id].push(result);
          return acc;
        }, {});
        
        // Add scheme-specific data
        Object.entries(schemeGroups).forEach(([schemeIdStr, schemeResults]) => {
          const schemeId = Number(schemeIdStr);
          const scheme = schemes.find(s => s.id === schemeId);
          if (!scheme) {
            console.log(`Scheme ${schemeId} not found`);
            return;
          }
          
          const schemeName = scheme.name;
          console.log(`Processing scheme ${schemeName} with ${schemeResults.length} results`);
          
          if (isGrouped) {
            // For grouped view, count occurrences of each value
            const valueCounts = new Map<string, number>();
            
            schemeResults.forEach(result => {
              try {
                // Extract display value from result
                let displayValue: any;
                
                // Handle empty values
                if (!result.value || Object.keys(result.value).length === 0) {
                  console.log(`Empty value for scheme ${scheme.name}`);
                  displayValue = 'N/A';
                }
                // Special handling for List[Dict[str, any]] type (entity statements)
                else if (scheme.fields?.[0]?.type === 'List[Dict[str, any]]') {
                  if (Array.isArray(result.value)) {
                    // For entity statements, group by entity
                    if (result.value.length > 0 && result.value.some(item => item.entity)) {
                      // Group by entity
                      result.value.forEach(item => {
                        if (item.entity) {
                          const entityKey = `Entity: ${item.entity}`;
                          const count = valueCounts.get(entityKey) || 0;
                          valueCounts.set(entityKey, count + 1);
                        }
                      });
                    } else {
                      // If no entities, just count the array length
                      displayValue = `${result.value.length} items`;
                      const count = valueCounts.get(displayValue) || 0;
                      valueCounts.set(displayValue, count + 1);
                    }
                  } else if (typeof result.value === 'object' && result.value !== null && 'default_field' in result.value) {
                    // For default_field, use a truncated version
                    const summary = result.value.default_field as string;
                    displayValue = summary.length > 30 ? `Summary: ${summary.substring(0, 30)}...` : summary;
                    const count = valueCounts.get(displayValue as string) || 0;
                    valueCounts.set(displayValue as string, count + 1);
                  } else {
                    // Fallback
                    displayValue = 'Complex Data';
                    const count = valueCounts.get(displayValue) || 0;
                    valueCounts.set(displayValue, count + 1);
                  }
                }
                // If the result value is an object with field names as keys
                else if (typeof result.value === 'object' && !Array.isArray(result.value)) {
                  // If we have a field that matches the scheme name, use that
                  if (scheme.fields && scheme.fields.length > 0) {
                    const fieldName = scheme.fields[0].name;
                    displayValue = result.value[fieldName];
                  } else {
                    // Otherwise use the first value in the object
                    displayValue = Object.values(result.value)[0];
                  }
                  
                  const valueStr = String(displayValue || 'N/A');
                  const count = valueCounts.get(valueStr) || 0;
                  valueCounts.set(valueStr, count + 1);
                } else {
                  // For simple values, use them directly
                  displayValue = result.value;
                  const valueStr = String(displayValue || 'N/A');
                  const count = valueCounts.get(valueStr) || 0;
                  valueCounts.set(valueStr, count + 1);
                }
              } catch (error) {
                console.error('Error formatting value for grouping:', error);
                const count = valueCounts.get('Error') || 0;
                valueCounts.set('Error', count + 1);
              }
            });
            
            // Add counts to chart point
            valueCounts.forEach((count, value) => {
              chartPoint[`${schemeName}_${value}`] = count;
            });
          } else {
            // For individual view, add the raw value for the tooltip to format
            const firstResult = schemeResults[0];
            if (firstResult) {
              // Handle empty values
              if (!firstResult.value || Object.keys(firstResult.value).length === 0) {
                console.log(`Empty value for scheme ${scheme.name} (individual view)`);
                chartPoint[schemeName] = 'N/A';
                docSchemeValues[documentId][schemeName] = 'N/A';
              }
              // Special handling for List[Dict[str, any]] type (entity statements)
              else if (scheme.fields?.[0]?.type === 'List[Dict[str, any]]') {
                if (Array.isArray(firstResult.value)) {
                  // For entity statements in individual view, use a count
                  const entityCount = firstResult.value.length;
                  chartPoint[schemeName] = entityCount;
                  docSchemeValues[documentId][schemeName] = firstResult.value;
                } else if (typeof firstResult.value === 'object' && firstResult.value !== null && 'default_field' in firstResult.value) {
                  // For default_field, use the summary
                  chartPoint[schemeName] = firstResult.value.default_field;
                  docSchemeValues[documentId][schemeName] = firstResult.value.default_field;
                } else {
                  // Fallback
                  chartPoint[schemeName] = 'Complex Data';
                  docSchemeValues[documentId][schemeName] = firstResult.value;
                }
              }
              // Since result.value is the direct output of the Pydantic model,
              // we can use it directly without complex transformations
              else if (typeof firstResult.value === 'object' && !Array.isArray(firstResult.value)) {
                // If we have a field that matches the scheme name, use that
                if (scheme.fields && scheme.fields.length > 0) {
                  const fieldName = scheme.fields[0].name;
                  const fieldValue = firstResult.value[fieldName];
                  
                  if (fieldValue !== undefined) {
                    // If it's a number, use it directly
                    if (typeof fieldValue === 'number') {
                      chartPoint[schemeName] = fieldValue;
                      docSchemeValues[documentId][schemeName] = fieldValue;
                    } 
                    // If it's a string that can be converted to a number, convert it
                    else if (typeof fieldValue === 'string') {
                      const num = Number(fieldValue);
                      if (!isNaN(num)) {
                        chartPoint[schemeName] = num;
                        docSchemeValues[documentId][schemeName] = num;
                      } else {
                        chartPoint[schemeName] = fieldValue;
                        docSchemeValues[documentId][schemeName] = fieldValue;
                      }
                    }
                    // Otherwise use the value as is
                    else {
                      chartPoint[schemeName] = fieldValue;
                      docSchemeValues[documentId][schemeName] = fieldValue;
                    }
                  } else {
                    // If the field doesn't exist, use the first value in the object
                    const firstValue = Object.values(firstResult.value)[0];
                    chartPoint[schemeName] = firstValue;
                    docSchemeValues[documentId][schemeName] = firstValue;
                  }
                } else {
                  // If there are no fields defined, use the first value in the object
                  const firstValue = Object.values(firstResult.value)[0];
                  chartPoint[schemeName] = firstValue;
                  docSchemeValues[documentId][schemeName] = firstValue;
                }
              } else {
                // For simple values, use them directly
                chartPoint[schemeName] = firstResult.value;
                docSchemeValues[documentId][schemeName] = firstResult.value;
              }
            }
          }
        });
      });
      
      // Store the document scheme values for use in tooltips
      chartPoint.docSchemeValues = docSchemeValues;
      
      return chartPoint;
    });
    
    console.log('Chart data:', chartData);
    return chartData;
  }, [results, schemes, isGrouped]);

  const handleClick = useCallback((point: ChartDataPoint) => {
    if (point) {
      setSelectedPoint(point);
      setIsDialogOpen(true);
    }
  }, []);

  const handleChartClick = useCallback((event: any) => {
    if (event && event.activeLabel) {
      const point = data.find((d: ChartDataPoint) => d.dateString === event.activeLabel);
      if (point) handleClick(point);
    }
  }, [data, handleClick]);

  const renderDot = useCallback((props: CustomizedDotProps) => {
    const { cx, cy, r } = props;
    if (!isGrouped) {
      return <circle cx={cx} cy={cy} r={r} fill="#8884d8" fillOpacity={0.8} />;
    }
    return <circle cx={cx} cy={cy} r={0} fill="transparent" />;
  }, [isGrouped]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Switch
          checked={isGrouped}
          onCheckedChange={setIsGrouped}
          id="group-switch"
        />
        <label htmlFor="group-switch">Group by value</label>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
          <Info className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No results to display. Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            {isGrouped ? (
              // Bar chart for grouped data
              <ComposedChart 
                data={data} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                onClick={handleChartClick}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateString" />
                <YAxis />
                <Tooltip content={<CustomTooltip isGrouped={isGrouped} schemes={schemes} documents={documents} results={results} />} />
                <Legend />
                {/* Create bars for each unique scheme_value combination */}
                {data.length > 0 && Object.keys(data[0])
                  .filter(key => key !== 'dateString' && key !== 'timestamp' && key !== 'count' && key !== 'documents' && key !== 'docSchemeValues' && key.includes('_'))
                  .map((key, index) => {
                    return (
                      <Bar
                        key={`bar-${key}`}
                        dataKey={key}
                        fill={colorPalette[index % colorPalette.length]}
                        shape={<GradientBar index={index} />}
                        isAnimationActive={false}
                      />
                    );
                  })}
              </ComposedChart>
            ) : (
              // Line chart for individual data
              <ComposedChart 
                data={data} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                onClick={handleChartClick}
              >
                <CartesianGrid strokeDasharray="0 0" />
                <XAxis dataKey="dateString" />
                <YAxis />
                <Tooltip content={<CustomTooltip isGrouped={isGrouped} schemes={schemes} documents={documents} results={results} />} />
                <Legend />
                {schemes.map((scheme, index) => {
                  // Check if we have any data for this scheme
                  const hasData = data.some(point => {
                    const value = point[scheme.name];
                    return value !== undefined && value !== null;
                  });
                  
                  console.log(`Scheme ${scheme.name} has data: ${hasData}`);
                  
                  if (!hasData) return null;
                  
                  return (
                    <Line
                      key={`line-${scheme.id}`}
                      type="monotone"
                      dataKey={scheme.name}
                      stroke={colorPalette[index % colorPalette.length]}
                      strokeWidth={3}
                      dot={<CustomizedDot />}
                      isAnimationActive={false}
                      strokeOpacity={0.8}
                    />
                  );
                })}
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Documents for {selectedPoint?.dateString}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedPoint && (
              <div className="p-4">
                <DocumentResults 
                  selectedPoint={selectedPoint}
                  results={results}
                  schemes={schemes}
                  documents={documents}
                />
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CustomTooltipProps extends TooltipProps<number, string> {
  isGrouped: boolean;
  schemes: ClassificationSchemeRead[];
  documents?: DocumentRead[];
  results: ClassificationResultRead[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isGrouped, schemes, documents, results }) => {
  if (!active || !payload || !payload.length) return null;
  
  // Get the data point from the payload
  const dataPoint = payload[0]?.payload;
  
  // Safely extract the dataKey and convert to string if needed
  const dataKey = payload[0]?.dataKey;
  const dataKeyStr = typeof dataKey === 'string' ? dataKey : String(dataKey || '');
  
  // Find the scheme based on the dataKey (which is the scheme name)
  let schemeName = dataKeyStr;
  let valueFilter = '';
  
  if (isGrouped && dataKeyStr.includes('_')) {
    const schemeNameParts = dataKeyStr.split('_');
    schemeName = schemeNameParts[0];
    valueFilter = schemeNameParts.slice(1).join('_');
  }
  
  const scheme = schemes.find((s) => s.name === schemeName);
  
  // Find documents for this data point
  const docsToShow: DocumentRead[] = [];
  
  if (documents && results && label) {
    // Filter results by date
    const dateResults = results.filter(r => {
      const resultDate = format(new Date(r.timestamp), 'yyyy-MM-dd');
      return resultDate === label;
    });
    
    // Group results by document
    const docResults = dateResults.reduce<Record<number, ClassificationResultRead[]>>((acc, result) => {
      if (!acc[result.document_id]) {
        acc[result.document_id] = [];
      }
      acc[result.document_id].push(result);
      return acc;
    }, {});
    
    // For each document, check if it has the relevant scheme result
    Object.entries(docResults).forEach(([docIdStr, docSchemeResults]) => {
      const docId = Number(docIdStr);
      
      // If we're looking at a specific scheme
      if (scheme) {
        const schemeResult = docSchemeResults.find(r => r.scheme_id === scheme.id);
        
        // Skip if no result for this scheme
        if (!schemeResult) return;
        
        // For grouped data, also filter by value
        if (isGrouped && valueFilter) {
          // Extract the value from the result
          let resultValue: any;
          
          if (typeof schemeResult.value === 'object' && !Array.isArray(schemeResult.value)) {
            if (scheme.fields && scheme.fields.length > 0) {
              const fieldName = scheme.fields[0].name;
              resultValue = schemeResult.value[fieldName];
            } else {
              resultValue = Object.values(schemeResult.value)[0];
            }
          } else {
            resultValue = schemeResult.value;
          }
          
          // Convert to string for comparison
          const resultValueStr = String(resultValue || '');
          if (resultValueStr !== valueFilter) return;
        }
      }
      
      // Add document to the list
      const doc = documents.find(d => d.id === docId);
      if (doc) docsToShow.push(doc);
    });
  }
  
  return (
    <div className="custom-tooltip bg-secondary/75 p-3 border border-gray-300 rounded-lg shadow-lg max-w-md">
      {scheme ? (
        <p className="font-semibold text-sm">{schemeName}</p>
      ) : (
        <p className="font-semibold text-sm">Multiple Schemas</p>
      )}
      
      {/* For grouped data, show the value counts */}
      {isGrouped ? (
        payload.map((entry: any, index: number) => {
          let displayValue = entry.value;
          let displayName = entry.name;
          
          // For grouped data, extract the value from the dataKey
          const entryDataKey = typeof entry.dataKey === 'string' ? entry.dataKey : String(entry.dataKey || '');
          
          if (entryDataKey.includes('_')) {
            const parts = entryDataKey.split('_');
            if (parts.length > 1) {
              displayName = parts.slice(1).join('_');
              displayValue = entry.value; // This is the count
            }
          }
          
          return (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {`${displayName}: ${displayValue} documents`}
            </p>
          );
        })
      ) : (
        // For non-grouped data, show all schemes for the first few documents
        <div className="mt-2">
          {/* Show scheme values for up to 3 documents */}
          {docsToShow.slice(0, 3).map((doc, docIndex) => {
            // Get all schemes for this document
            const docSchemes = schemes.filter(s => {
              // Check if this document has a result for this scheme
              return results.some(r => r.document_id === doc.id && r.scheme_id === s.id);
            });
            
            return (
              <div key={doc.id} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                <p className="text-xs font-medium">{doc.title || `Document ${doc.id}`}</p>
                <div className="grid grid-cols-1 gap-1 mt-1">
                  {docSchemes.map(s => {
                    // Find the result for this scheme
                    const schemeResult = results.find(r => r.document_id === doc.id && r.scheme_id === s.id);
                    if (!schemeResult) return null;
                    
                    // Special handling for entity statements
                    if (s.fields?.[0]?.type === 'List[Dict[str, any]]') {
                      const formattedItems = ClassificationService.formatEntityStatements(schemeResult.value, {
                        compact: false,
                        maxItems: 3
                      });
                      
                      return (
                        <div key={s.id} className="text-xs p-1 bg-muted/10 rounded">
                          <span className="font-medium">{s.name}: </span>
                          <div className="mt-1 space-y-1">
                            {Array.isArray(formattedItems) && formattedItems.map((item: any, idx: number) => {
                              if (typeof item === 'string') {
                                return (
                                  <div key={idx} className="pl-2 border-l-2 border-primary/30">
                                    <span>{item}</span>
                                  </div>
                                );
                              }
                              
                              return (
                                <div key={idx} className="pl-2 border-l-2 border-primary/30">
                                  {item.entity && <span className="font-medium">{String(item.entity)}: </span>}
                                  {item.statement && <span>{String(item.statement)}</span>}
                                  {item.raw && <span>{item.raw}</span>}
                                  {item.summary && <span className="text-muted-foreground">{item.summary}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    
                    // Extract the value
                    let displayValue: any = 'N/A';
                    
                    if (schemeResult.value) {
                      // Use our local helper function instead
                      displayValue = getFormattedClassificationValue(schemeResult, s);
                    }
                    
                    return (
                      <div key={s.id} className="text-xs">
                        <span className="font-medium">{s.name}: </span>
                        <span>{String(displayValue)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Show document count */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <p className="text-xs font-medium mb-1">Documents ({docsToShow.length}):</p>
        {docsToShow.length > 3 && (
          <div className="text-xs text-gray-500 italic">
            Showing 3 of {docsToShow.length} documents
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-1">{`Date: ${label}`}</p>
    </div>
  );
};

// Component to render document results
const DocumentResults: React.FC<{
  selectedPoint: ChartDataPoint;
  results: ClassificationResultRead[];
  schemes: ClassificationSchemeRead[];
  documents?: DocumentRead[];
}> = ({ selectedPoint, results, schemes, documents }) => {
  // Get all documents for this date point
  const dateResults = results.filter(r => {
    const resultDate = format(new Date(r.timestamp), 'yyyy-MM-dd');
    return resultDate === selectedPoint.dateString;
  });
  
  // Group by document
  const resultsByDoc = dateResults.reduce<Record<number, ClassificationResultRead[]>>((acc, result) => {
    if (!acc[result.document_id]) {
      acc[result.document_id] = [];
    }
    acc[result.document_id].push(result);
    return acc;
  }, {});
  
  // If no results, show a message
  if (Object.keys(resultsByDoc).length === 0) {
    return <div className="text-sm text-gray-500">No classification results found for this date.</div>;
  }
  
  // Render each document with its results
  return (
    <>
      {Object.entries(resultsByDoc).map(([docIdStr, docResults]) => {
        const docId = Number(docIdStr);
        const document = documents?.find(d => d.id === docId);
        
        // Get all schemes for this document's results
        const docSchemeIds = [...new Set(docResults.map(r => r.scheme_id))];
        const docSchemes = schemes.filter(s => docSchemeIds.includes(s.id));
        
        return (
          <div key={docId} className="mb-6 border-b pb-4">
            {document && (
              <div className="mb-2">
                <span className="font-medium">Document: </span>
                <DocumentLink documentId={document.id}>
                  {document.title || `Document ${document.id}`}
                </DocumentLink>
              </div>
            )}
            <div className="space-y-4">
              {docSchemes.map(scheme => {
                const schemeResults = docResults.filter(r => r.scheme_id === scheme.id);
                if (schemeResults.length === 0) return null;
                
                const result = schemeResults[0];
                
                // Special handling for entity statements
                if (scheme.fields?.[0]?.type === 'List[Dict[str, any]]') {
                  const formattedItems = ClassificationService.formatEntityStatements(result.value, {
                    compact: false,
                    maxItems: 10
                  });
                  
                  return (
                    <div key={scheme.id} className="border-l-2 border-primary/30 pl-3">
                      <div className="font-medium mb-2">{scheme.name}</div>
                      <div className="space-y-2">
                        {Array.isArray(formattedItems) && formattedItems.map((item: any, idx: number) => {
                          if (typeof item === 'string') {
                            return (
                              <div key={idx} className="bg-muted/10 p-2 rounded">
                                <span>{item}</span>
                              </div>
                            );
                          }
                          
                          return (
                            <div key={idx} className="bg-muted/10 p-2 rounded">
                              {item.entity && <span className="font-medium">{String(item.entity)}: </span>}
                              {item.statement && <span>{String(item.statement)}</span>}
                              {item.raw && <span>{item.raw}</span>}
                              {item.summary && <span className="text-muted-foreground">{item.summary}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                
                // Default display for other types
                return (
                  <div key={scheme.id} className="border-l-2 border-primary/30 pl-3">
                    <div className="font-medium mb-2">{scheme.name}</div>
                    <ClassificationResultDisplay 
                      result={result} 
                      scheme={scheme} 
                      useTabs={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default React.memo(ClassificationResultsChart);