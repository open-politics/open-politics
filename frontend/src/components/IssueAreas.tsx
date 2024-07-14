'use client'
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useCountryData } from "@/hooks/useCountryData";
import DotLoader from 'react-spinners/DotLoader';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import LeaderInfo from "./LeaderInfo";
import axios from 'axios';
import WikipediaView from './WikipediaView';

interface IssueAreasProps {
  countryName: string;
  articleContent: string;
}

const DataTable = ({ columns, data }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        
        <tbody className="max-h-96 overflow-y-auto block">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export function IssueAreas({ countryName, articleContent }: IssueAreasProps) {
  const [leaderInfo, setLeaderInfo] = useState(null);
  const { toast } = useToast();
  const [selectedIndicators, setSelectedIndicators] = useState(['GDP', 'GDP_GROWTH']);
  const { data, isLoading, error } = useCountryData(countryName);
  const [chartKey, setChartKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const economicDataRows = useMemo(() => {
    if (!data?.economicData) return [];
    return data.economicData.map((item) => ({
      name: item.name,
      ...selectedIndicators.reduce((acc, indicator) => {
        acc[indicator] = parseFloat(item[indicator]);
        return acc;
      }, {})
    }));
  }, [data?.economicData, selectedIndicators]);

  useEffect(() => {
    console.log("Selected indicators changed:", selectedIndicators);
    console.log("Current economic data rows:", economicDataRows);
    setChartKey(prev => prev + 1);  // Force chart re-render
  }, [selectedIndicators, economicDataRows]);

  const handleIndicatorSelection = useCallback((indicator) => {
    setSelectedIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator) 
        : [...prev, indicator]
    );
  }, []);


  useEffect(() => {
    const fetchLeaderInfo = async () => {
      if (!countryName) return;
      
      try {
        const response = await axios.get(`https://open-politics.org/api/v1/countries/leaders/${countryName}`);
        setLeaderInfo(response.data);
      } catch (error) {
        console.error("Error fetching leader info:", error);
        toast({
          title: "Error",
          description: `Failed to fetch leader info for ${countryName}. Please try again later.`,
        });
      }
    };

    fetchLeaderInfo();
  }, [countryName, toast]);


  const legislationColumns = useMemo(
    () => [
      {
        accessorKey: "law",
        header: "Law",
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
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer">
                  {row.original.href ? (
                    <a 
                      href={row.original.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
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
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        ),
      },
    ],
    []
  );

  const filteredLegislativeData = useMemo(() => {
    if (!data?.legislativeData) return [];
    return data.legislativeData.filter(item => {
      const matchesSearch = item.law.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.label === statusFilter;
      const matchesDate = dateFilter === "all" || (
        dateFilter === "last30" ? new Date(item.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) :
        dateFilter === "last90" ? new Date(item.date) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) :
        true
      );
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [data?.legislativeData, searchTerm, statusFilter, dateFilter]);

  const availableIndicators = ['GDP', 'GDP_GROWTH', 'CPI', 'UNEMP_RATE'];

  return (
    <div className="relative w-full py-4 px-0">
      <Tabs defaultValue="overview" className="w-full px-2 pt-2">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="economic-data">Econ. Data</TabsTrigger>
          <TabsTrigger value="legislation">Legislation</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview of {countryName}</CardTitle>
            </CardHeader>
            <CardContent>
              {leaderInfo && (
                <LeaderInfo
                  state={leaderInfo['State']}
                  headOfState={leaderInfo['Head of State']}
                  headOfStateImage={leaderInfo['Head of State Image']}
                  headOfGovernment={leaderInfo['Head of Government']}
                  headOfGovernmentImage={leaderInfo['Head of Government Image']}
                />
              )}
              {articleContent && <WikipediaView content={articleContent} />}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="economic-data">
          <Card>
            <CardHeader>
              <CardTitle>Economic Data for {countryName}</CardTitle>
              <CardDescription>
                Key economic indicators and market trends.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {availableIndicators.map(indicator => (
                    <Button 
                      key={indicator}
                      onClick={() => handleIndicatorSelection(indicator)}
                      variant={selectedIndicators.includes(indicator) ? "default" : "outline"}
                    >
                      {indicator}
                    </Button>
                  ))}
                </div>
              </div>
              <div style={{ height: 250 }}>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <DotLoader color="#000" size={50} />
                    <p className="mt-4">Economic data is loading...</p>
                  </div>
                ) : error.economic ? (
                  <p>Error loading economic data: {error.economic.message}</p>
                ) : economicDataRows.length > 0 ? (
                  <EconomicDataChart 
                    key={chartKey} 
                    data={economicDataRows} 
                    indicators={selectedIndicators} 
                  />
                ) : (
                  <p>No economic data available for {countryName}.</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {/* <Button>View detailed report</Button> */}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="legislation">
          <Card>
            <CardHeader>
              <CardTitle>Legislation for {countryName}</CardTitle>
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
                {isLoading ? (
                   <div className="flex flex-col items-center justify-center h-full">
                   <DotLoader color="#000" size={50} />
                   <p className="mt-4">Legislative data is loading...</p>
                 </div>
                ) : error.legislative ? (
                <p>No legislative data available for {countryName}.</p>
                ) : filteredLegislativeData.length > 0 ? (
                  <DataTable columns={legislationColumns} data={filteredLegislativeData} />
                ) : (
                  <p>No legislative data available for {countryName}.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}