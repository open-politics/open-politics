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
        
        <tbody>
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

export function IssueAreas({ countryName }) {
  const [selectedIndicators, setSelectedIndicators] = useState(['GDP', 'GDP_GROWTH']);
  const { data, isLoading, error } = useCountryData(countryName);
  const [chartKey, setChartKey] = useState(0);

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
                        row.original.status === "rejected"
                          ? "bg-red-500"
                          : row.original.status === "pending"
                          ? "bg-yellow-500"
                          : row.original.status === "accepted"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {row.original.status === "rejected"
                        ? "Proposal rejected"
                        : row.original.status === "pending"
                        ? "Proposal under review"
                        : "Proposal accepted"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer">{row.original.law}</span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">{row.original.law}</h4>
                  <p className="text-sm">
                    Status: {row.original.status}
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

  const availableIndicators = ['GDP', 'GDP_GROWTH', 'CPI', 'UNEMP_RATE'];

  if (error.legislative && error.economic) {
    return <div>Error loading data: Unable to fetch legislative and economic data.</div>;
  }

  return (
    <div className="relative w-full py-2 px-0">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Select Indicators:</h3>
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
      <Tabs defaultValue="economic-data" className="w-full px-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="economic-data">Econ. Data</TabsTrigger>
          <TabsTrigger value="legislation">Legislation</TabsTrigger>
        </TabsList>
        <TabsContent value="economic-data">
          <Card>
            <CardHeader>
              <CardTitle>Economic Data for {countryName}</CardTitle>
              <CardDescription>
                Key economic indicators and market trends.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
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
              {isLoading ? (
                <p>Loading legislative data...</p>
              ) : error.legislative ? (
                <p>Error loading legislative data: {error.legislative.message}</p>
              ) : data?.legislativeData && data.legislativeData.length > 0 ? (
                <DataTable columns={legislationColumns} data={data.legislativeData} />
              ) : (
                <p>No legislative data available for {countryName}.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}