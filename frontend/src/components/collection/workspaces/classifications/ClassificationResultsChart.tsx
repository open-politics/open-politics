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
} from 'recharts';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { ClassificationResultRead, ClassificationSchemeRead, DocumentRead } from '@/client';
import ClassificationResultDisplay from './ClassificationResultDisplay';


interface CustomizedDotProps extends DotProps {
  payload?: any;
}


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
  date: string;
  count?: number;
  dateString?: string;
  documentId?: number;
  documents?: any[];
  [key: string]: any;
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
  documents: DocumentRead[];
  onDocumentSelect: (documentId: number) => void;
  chartData: ChartData;
  onDataPointClick: (point: any) => void;
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

const CustomizedDot: React.FC<CustomizedDotProps> = (props) => {
  const { cx, cy, payload } = props;
  
  if (!cx || !cy) return null;

  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={4} 
      fill={props.stroke || '#8884d8'} 
      style={{ cursor: 'pointer' }}
    />
  );
};

const formatDisplayValue = (value: any, scheme: ClassificationSchemeRead) => {
  if (!value) return null;

  // Extract value from scheme-specific field if exists
  const schemeValue = value[scheme.name] || value?.value || value;

  switch (scheme.type) {
    case 'int':
      // Determine binary dynamically from scale range
      if (scheme.scale_min === 0 && scheme.scale_max === 1) {
        return schemeValue > 0.5 ? 'Positive' : 'Negative';
      }
      return typeof schemeValue === 'number' ? schemeValue.toFixed(2) : schemeValue;
      
    case 'List[str]':
      if (scheme.is_set_of_labels && scheme.labels) {
        if (Array.isArray(schemeValue)) {
          return schemeValue.join(', ');
        }
        return scheme.labels[schemeValue] || schemeValue;
      }
      return Array.isArray(schemeValue) ? schemeValue.join(', ') : schemeValue;
      
    case 'str':
      return schemeValue;
      
    default:
      return JSON.stringify(schemeValue);
  }
};

const ClassificationResultsChart: React.FC<Props> = ({ results, schemes, documents, onDocumentSelect, chartData, onDataPointClick }) => {
  const [isGrouped, setIsGrouped] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const data: ChartData = useMemo(() => {
    if (!results || results.length === 0) return [];
    
    const resultGroups = results.reduce((acc: Record<string, ResultGroup>, result) => {
      const scheme = schemes.find(s => s.id === result.scheme_id);
      if (!scheme) return acc;
      
      // Format the display value based on scheme type
      const displayValue = formatDisplayValue(result.value, scheme);
      
      // Group by date
      const dateKey = format(new Date(result.timestamp), 'PP');
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          schemes: {}
        };
      }

      if (!acc[dateKey].schemes[scheme.id]) {
        acc[dateKey].schemes[scheme.id] = {
          scheme,
          values: [],
          counts: new Map()
        };
      }

      // Store the formatted value
      acc[dateKey].schemes[scheme.id].values.push(displayValue);
      
      // Update counts for this value
      const currentCount = acc[dateKey].schemes[scheme.id].counts.get(String(displayValue)) || 0;
      acc[dateKey].schemes[scheme.id].counts.set(String(displayValue), currentCount + 1);

      return acc;
    }, {});

    // Transform the grouped data into chart format
    return Object.entries(resultGroups).map(([date, group]) => {
      const chartPoint: ChartDataPoint = {
        date,
        dateString: date,
        count: 0,
        documents: []
      };

      // Add scheme-specific data
      Object.entries(group.schemes).forEach(([schemeId, schemeData]) => {
        const schemeName = schemeData.scheme.name;
        
        if (isGrouped) {
          // For grouped view, add counts for each value
          schemeData.counts.forEach((count, label) => {
            chartPoint[`${schemeName}_${label}`] = count;
          });
        } else {
          // For individual view, use the values directly
          chartPoint[schemeName] = schemeData.values[0];
        }
      });

      return chartPoint;
    });
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
      return <circle cx={cx} cy={cy} r={r} fill="#8884d8" />;
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
        <label htmlFor="group-switch">Group by date</label>
      </div>

      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <ComposedChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={handleChartClick}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dateString" />
            <YAxis />
            <Tooltip content={<CustomTooltip isGrouped={isGrouped} />} />
            <Legend />
            {schemes.map((scheme, index) => (
              <Line
                key={`line-${scheme.id}`}
                type="monotone"
                dataKey={scheme.name}
                stroke={colorPalette[index % colorPalette.length]}
                dot={<CustomizedDot />}
              />
            ))}
            {isGrouped && (
              <Bar
                key="count-bar"
                dataKey="count"
                fill="#8884d8"
                opacity={0.3}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Documents for {selectedPoint?.dateString}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            {selectedPoint && (
              <div className="space-y-4">
                {(isGrouped 
                  ? selectedPoint.documents ?? [] 
                  : selectedPoint.documentId ? [selectedPoint.documentId] : []
                ).map((docId: number) => {
                  const document = documents.find((d: DocumentRead) => d.id === docId);
                  const documentResults = results.filter(r => r.document_id === docId);
                  if (!document) return null;
                  return (
                    <div
                      key={`doc-${docId}`}
                      className="p-4 hover:bg-accent rounded-md cursor-pointer space-y-2"
                      onClick={() => {
                        onDocumentSelect(docId);
                        setIsDialogOpen(false);
                      }}
                    >
                      <h3 className="font-medium">{document.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(document.insertion_date), 'PP p')}
                      </p>
                      <div className="space-y-2 pt-2">
                        {documentResults.map((result) => {
                          const scheme = schemes.find(s => s.id === result.scheme_id);
                          if (!scheme) return null;
                          return (
                            <div key={`result-${result.id}`} className="space-y-1">
                              <div className="text-sm font-medium">{scheme.name}</div>
                              <ClassificationResultDisplay 
                                result={result}
                                scheme={scheme}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, isGrouped }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border rounded shadow-md">
        <p className="font-bold">{label}</p>
        {payload.map((item, index) => {
          const value = item.value;
          let displayValue: string;
          
          if (typeof value === 'number') {
            displayValue = value.toFixed(2);
          } else if (typeof value === 'object') {
            displayValue = JSON.stringify(value);
          } else {
            displayValue = String(value);
          }
          
          return (
            <p key={`tooltip-${index}`} className="text-gray-800">
              {item.name}: {displayValue}
            </p>
          );
        })}
        {!isGrouped && payload[0]?.payload?.timestampString && (
          <p className="text-xs text-gray-500">
            {payload[0].payload.timestampString}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default React.memo(ClassificationResultsChart);