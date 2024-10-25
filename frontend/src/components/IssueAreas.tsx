import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useLayoutStore } from '@/store/useLayoutStore'; // Import Zustand store
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { CalendarDays } from 'lucide-react';
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import EconomicDataChart from './chart';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocationData } from "@/hooks/useLocationData";
import DotLoader from 'react-spinners/DotLoader';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import EntitiesView from "./EntitiesView";
import WikipediaView from './WikipediaView';
import ArticlesView from './ArticlesView';
import DataTable from "./DataTable";
import Results from '@/components/Results';
import { useArticleTabNameStore } from '@/hooks/useArticleTabNameStore';

interface IssueAreasProps {
  locationName: string;
  results: any;
  summary: string;
  includeSummary: boolean;
}

export function IssueAreas({ locationName, results, summary, includeSummary }: IssueAreasProps) {
  const { data, isLoading, error, fetchContents, resetContents, fetchEconomicData } = useLocationData(locationName);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedIndicators, setSelectedIndicators] = useState(['GDP', 'GDP_GROWTH']);
  const { toast } = useToast();
  const { activeTab, setActiveTab } = useArticleTabNameStore(); // Use Zustand store
  const [isMobile, setIsMobile] = useState(false);


  const filteredLegislativeData = useMemo(() => {
    if (!data?.legislativeData) return [];
    return data.legislativeData.filter(item => {
      const matchesSearch = item.law.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.label === statusFilter;
      const itemDate = new Date(item.date);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
      const matchesDate = 
        dateFilter === 'all' ||
        (dateFilter === 'last30' && itemDate >= thirtyDaysAgo) ||
        (dateFilter === 'last90' && itemDate >= ninetyDaysAgo);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [data?.legislativeData, searchTerm, statusFilter, dateFilter]);

  const legislationColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center">
            {row.original.status && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className={`flex h-3 w-3 mr-2 rounded-full ${
                        row.original.label === "red"
                          ? "bg-red-500"
                          : row.original.label === "yellow"
                          ? "bg-yellow-500"
                          : row.original.label === "green"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{row.original.status}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ),
      },
      {
        accessorKey: "law",
        header: "Law",
        cell: ({ row }) => (
          <HoverCard>
            <HoverCardTrigger asChild>
              <span className="cursor-pointer">
                {row.original.href ? (
                  <a 
                    href={row.original.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-inherit hover:underline"
                  >
                    {row.original.law}
                  </a>
                ) : (
                  row.original.law
                )}
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">{row.original.law}</h4>
                <p className="text-sm">
                  Status: {row.original.status}
                </p>
                <p className="text-sm">
                  Initiative: {row.original.initiative}
                </p>
                <div className="flex items-center pt-2">
                  <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                  <span className="text-xs text-muted-foreground">
                    Date: {row.original.date}
                  </span>
                </div>
                <Button variant='outline'>
                  <a href={row.original.href} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </Button>
              </div>
            </HoverCardContent>
          </HoverCard>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
      },
    ],
    []
  );

  const availableIndicators = useMemo(() => {
    if (!data?.economicData || data.economicData.length === 0) return [];
    return Object.keys(data.economicData[0]).filter(key => key !== 'name');
  }, [data?.economicData]);

  const toggleIndicator = useCallback((indicator: string) => {
    setSelectedIndicators(prev => 
      prev.includes(indicator)
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  }, []);

  useEffect(() => {
    if (error.legislative || error.economic || error.leaderInfo || error.contents) {
      toast({
        title: "Error",
        description: "Failed to fetch some data. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);


  const handleFetchEconomicData = useCallback(() => {
    if (!data.economicData || data.economicData.length === 0) {
      fetchEconomicData();
    }
  }, [data.economicData, fetchEconomicData]);

  // Update the useEffect to only set initial tab state
  useEffect(() => {
    if (results?.tavilyResults && summary && !activeTab) {
      setActiveTab('summary');
    } else if (!activeTab) {
      setActiveTab('articles');
    }
  }, [results, summary, activeTab, setActiveTab]);

  // Add a check for showing summary content
  const showSummaryContent = results?.tavilyResults && summary;

  return (
    <div className="space-y-4 p-2">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value);
        }} 
        className="w-full"
      >
        <TabsList className="max-w-[80%] md:max-w-[calc(100%-60px)] overflow-x-auto flex justify-start scroll-snap-type-x mandatory">
          <TabsTrigger value="articles" className="scroll-snap-align-start">Articles</TabsTrigger>
          <TabsTrigger value="economic-data" className="scroll-snap-align-start" onClick={handleFetchEconomicData}>Economic Data</TabsTrigger>
          <TabsTrigger value="leader-info" className="scroll-snap-align-start">Entities</TabsTrigger>
          {locationName.toLowerCase() === 'germany' && (
            <TabsTrigger value="legislative" className="scroll-snap-align-start">Legislative</TabsTrigger>
          )}
          <TabsTrigger value="wikipedia" className="scroll-snap-align-start">Wikipedia</TabsTrigger>
          {/* Only show summary tab if we have content */}
          {showSummaryContent && (
            <TabsTrigger value="summary" className="scroll-snap-align-start">
              Summary
            </TabsTrigger>
          )}
        </TabsList>
        <div className="flex-grow overflow-hidden">
          <TabsContent value="articles" className="h-full max-h-[70vh] overflow-y-auto">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Articles for {locationName}</CardTitle>
                <CardDescription>
                  Articles related to {locationName}.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden">
                <ArticlesView 
                  locationName={locationName} 
                  contents={data.contents}
                  isLoading={isLoading.contents}
                  error={error.contents}
                  fetchContents={fetchContents}
                  resetContents={resetContents}
                />
              </CardContent>
            </Card>
          </TabsContent>
          {locationName.toLowerCase() === 'germany' && (
            <TabsContent value="legislative">
              <Card>
                <CardHeader>
                  <CardTitle>Legislation for {locationName}</CardTitle>
                  <CardDescription>
                    Recent legislative activities and proposals.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Search legislation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow"
                      />
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by date" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="last30">Last 30 Days</SelectItem>
                          <SelectItem value="last90">Last 90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {isLoading.legislative || isLoading.entities || isLoading.leaderInfo || isLoading.articles ? (
                       <div className="flex flex-col items-center justify-center h-full">
                         <DotLoader color="#000" size={50} />
                         <p className="mt-4">Legislative data is loading...</p>
                       </div>
                    ) : error.legislative ? (
                      <p>No legislative data available for {locationName}. Currently only available for Germany.</p>
                    ) : filteredLegislativeData.length > 0 ? (
                      <DataTable columns={legislationColumns} data={filteredLegislativeData} />
                    ) : (
                      <p>No legislative data available for {locationName}. Currently only available for Germany.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          <TabsContent value="economic-data">
            <Card>
              <CardHeader>
                <CardTitle>Economic Data for {locationName}</CardTitle>
                <CardDescription>
                  Key economic indicators and market trends. (Only OECD Data)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading.economic ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <DotLoader color="#000" size={50} />
                    <p className="mt-4">Economic data is loading...</p>
                  </div>
                ) : error.economic ? (
                  <p>Failed to load economic data.</p>
                ) : data?.economicData && data.economicData.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {availableIndicators.map(indicator => (
                          <Button 
                            key={indicator}
                            variant={selectedIndicators.includes(indicator) ? "default" : "outline"}
                            onClick={() => toggleIndicator(indicator)}
                          >
                            {indicator}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <EconomicDataChart data={data.economicData} selectedIndicators={selectedIndicators} />
                  </>
                ) : (
                  <Button onClick={handleFetchEconomicData}>Load Economic Data</Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="leader-info">
            <Card>
              <CardHeader>
                <CardTitle>Leaders and Entities for {locationName}</CardTitle>
                <CardDescription>
                  Current leadership, key political figures, and relevant entities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading.leaderInfo || isLoading.entities ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <DotLoader color="#000" size={50} />
                    <p className="mt-4">Loading information...</p>
                  </div>
                ) : error.entities ? ( // Only show error if there's an issue with entities
                  <p>Failed to load entity information.</p>
                ) : (
                  <EntitiesView 
                    leaderInfo={error.leaderInfo ? null : data.leaderInfo} // Pass null if there's an error with leaderInfo
                    entities={data.entities} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="wikipedia">
            <Card>
              <CardHeader>
                <CardTitle>Wikipedia Information for {locationName}</CardTitle>
                <CardDescription>
                  General information from Wikipedia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WikipediaView locationName={locationName} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  Data Fragments & A Summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showSummaryContent ? (
                  <Results results={results} summary={summary} includeSummary={includeSummary} />
                ) : (
                  <p>No search results available. They will show up if you use the main search bar.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
