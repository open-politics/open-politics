import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { CalendarDays } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, differenceInDays } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface EntityScoresViewProps {
  entity: string;
  fetchEntityScores: (scoreType: string, timeframeFrom: string, timeframeTo: string) => Promise<void>;
  scoreData: any;
  isLoading: boolean;
  onDateSelect?: (date: string) => void;
}

const SCORE_TYPES = [
  { value: 'geopolitical_relevance', label: 'Geopolitical Relevance' },
  { value: 'legislative_influence_score', label: 'Legislative Influence' },
  { value: 'international_relevance_score', label: 'International Relevance' },
  { value: 'democratic_process_implications_score', label: 'Democratic Process Impact' },
  { value: 'general_interest_score', label: 'General Interest' },
  { value: 'spam_score', label: 'Spam Score' },
  { value: 'clickbait_score', label: 'Clickbait Score' },
  { value: 'fake_news_score', label: 'Fake News Score' },
  { value: 'satire_score', label: 'Satire Score' }
];

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
];

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formattedDate = format(parseISO(label), 'dd MMMM yyyy');
    return (    
      <div className="custom-tooltip p-2 bg-opacity-80 shadow-xl backdrop-blur-lg">
        <p className="label">{`Date: ${formattedDate}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-blue-500">
            {`Score: ${entry.value !== null && entry.value !== undefined 
              ? entry.value.toFixed(2)
              : 'N/A'}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function EntityScoresView({ 
  entity, 
  fetchEntityScores, 
  scoreData, 
  isLoading,
  onDateSelect 
}: EntityScoresViewProps) {
  const [selectedScoreType, setSelectedScoreType] = useState(SCORE_TYPES[0].value);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date()
  });

  const handleFetchScores = () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    fetchEntityScores(
      selectedScoreType,
      format(dateRange.from, 'yyyy-MM-dd'),
      format(dateRange.to, 'yyyy-MM-dd')
    );
  };

  useEffect(() => {
    handleFetchScores();
  }, [selectedScoreType, dateRange]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const formatData = (data: any[]) => {
    if (!data) return [];
    return data.map(item => ({
      ...item,
      date: item.date,
      average_score: parseFloat(item.average_score)
    }));
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  const handleChartClick = (data: any) => {
    if (data && data.activeLabel && onDateSelect) {
      onDateSelect(data.activeLabel);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleFormSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Entity Scores for {entity}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4 flex-wrap">
              <Select value={selectedScoreType} onValueChange={setSelectedScoreType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select score type" />
                </SelectTrigger>
                <SelectContent>
                  {SCORE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Button 
                type="submit"
                onClick={(e) => e.stopPropagation()}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>

            {scoreData && scoreData.scores && (
              <div className="highlight-bar-charts" style={{ userSelect: 'none', width: '100%', maxWidth: '100%' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={formatData(scoreData.scores)}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    onClick={handleChartClick}
                  >
                    <XAxis dataKey="date" tickFormatter={(date) => format(parseISO(date), 'MM/dd/yyyy')} />
                    <YAxis domain={[0, 10]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone" 
                      dataKey="average_score"
                      stroke="#8884d8"
                      activeDot={{ r: 8, onClick: (data) => {
                        if (onDateSelect && data.payload.date) {
                          onDateSelect(data.payload.date);
                        }
                      }}} 
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}