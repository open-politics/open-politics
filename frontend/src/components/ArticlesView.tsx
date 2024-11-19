import React, { useState, useEffect, useMemo } from 'react';
import { ContentCard } from './ContentCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DotLoader from 'react-spinners/DotLoader';
import { useBookMarkStore } from '@/hooks/useBookMarkStore';
import { addDays, differenceInDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentsViewProps {
  locationName: string;
  contents: any[];
  isLoading: boolean;
  error: Error | null;
  fetchContents: (searchQuery: string) => void;
  loadMore: () => void;
  resetContents: () => void;
}

type Content = any;

export function ContentsView({ locationName, contents = [], isLoading, error, fetchContents, loadMore, resetContents }: ContentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30), // Default to last month
    to: new Date()
  });
  const [sortBy, setSortBy] = useState<string>("date"); // Default sort by date
  const { bookmarks, addBookmark, removeBookmark } = useBookMarkStore();

  // Add debug logging to see the full content structure
  useEffect(() => {
    console.log('Full content example:', contents[0]);
    console.log('Available fields:', contents[0] ? Object.keys(contents[0]) : []);
  }, [contents]);

  // Modify the filtering and sorting logic to use insertion_date if publication_date is not available
  const getContentDate = (content: any): Date | null => {
    // Try publication_date first, then insertion_date, then created_at if they exist
    const dateString = content.publication_date || content.insertion_date || content.created_at;
    if (!dateString) return null;
    
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const filteredAndSortedContents = contents
      .filter(content => {
        const matchesSearch = !searchQuery || 
          content.title?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!dateRange?.from || !dateRange?.to) return matchesSearch;
        
        const contentDate = getContentDate(content);
        if (!contentDate) return matchesSearch; // Include undated content when filtering
        
        const isInDateRange = contentDate >= dateRange.from && 
                            contentDate <= addDays(dateRange.to, 1);
        
        return matchesSearch && isInDateRange;
      })
      .sort((a, b) => {
        const dateA = getContentDate(a);
        const dateB = getContentDate(b);
        
        // Put contents with dates first
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        // Sort by date descending (newest first)
        return dateB.getTime() - dateA.getTime();
      });

  // Group contents by date
  const groupedContents = React.useMemo(() => {
    return filteredAndSortedContents.reduce((groups: Record<string, any[]>, content) => {
      const date = getContentDate(content);
      const dateKey = date 
        ? format(date, "MMM dd, yyyy")
        : "Recent";
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(content);
      return groups;
    }, {});
  }, [filteredAndSortedContents]);

  const handleSearch = () => {
    resetContents();
    fetchContents(searchQuery);
  };

  const handleBookmarkAll = () => {
    contents.forEach(content => {
      addBookmark({
        id: content.url,
        title: content.title,
        content_type: content.content_type,
        source: content.source,
        insertion_date: content.insertion_date,
        text_content: content.text_content.slice(0, 350),
        entities: content.entities,
        tags: content.tags,
        classification: content.classification,
        url: content.url,
        content_language: content.content_language || null,
        author: content.author || null,
        publication_date: content.publication_date || null,
        version: content.version || 1,
        is_active: content.is_active || true,
        embeddings: content.embeddings || null,
        media_details: content.media_details || null,
      });
    });
  };

  const handleUnbookmarkAll = () => {
    contents.forEach(content => {
      removeBookmark(content.url);
    });
  };

  const allBookmarked = contents.every(content => bookmarks.some(bookmark => bookmark.url === content.url));

  const handleDatePreset = (days: number) => {
    setDateRange({
      from: addDays(new Date(), -days),
      to: new Date()
    });
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    resetContents();
    fetchContents(searchQuery);
  };

  if (error) {
    return <div className="text-red-500">{error.message}</div>;
  }

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex items-center space-x-2 flex-wrap gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${locationName}'s contents`}
          className="min-w-[200px]"
        />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[350px] justify-start text-left font-normal gap-2",
                !dateRange && "text-muted-foreground bg-transparent"
              )}
            >
              <CalendarDays className="h-4 w-4 shrink-0 bg-transparent" />
              <span className="truncate">
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                      {" "}
                      (Last {differenceInDays(dateRange.to, dateRange.from)} days)
                    </>
                  ) : (
                    format(dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-2 space-y-2">
              <div className="flex gap-2 flex-wrap">
                <Button
                  className="bg-transparent"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDateRangeChange({
                    from: addDays(new Date(), -3),
                    to: new Date()
                  })}
                >
                  Last 3 days
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDateRangeChange({
                    from: addDays(new Date(), -7),
                    to: new Date()
                  })}
                >
                  Last 7 days
                </Button>
                <Button
                  className="bg-transparent"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDateRangeChange({
                    from: addDays(new Date(), -30),
                    to: new Date()
                  })}
                >
                  Last month
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDateRangeChange(undefined)}
                >
                  All
                </Button>
              </div>
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </div>
          </PopoverContent>
        </Popover>

        <Select
          value={sortBy}
          onValueChange={setSortBy}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            {/* Add more sorting options here */}
          </SelectContent>
        </Select>

        {/* <Button onClick={handleSearch}>Search</Button> */}
      </div>

      {/* Add debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-sm text-muted-foreground">
          Total contents: {contents.length}
          Filtered contents: {filteredAndSortedContents.length}
        </div>
      )}

      {isLoading && contents.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <DotLoader color="#000" size={50} />
          <p className="mt-4">Loading contents...</p>
        </div>
      ) : (
        <div className="lex-grow px-4">
          <div className="space-y-6">
            {Object.entries(groupedContents).map(([date, contents]) => (
              <div key={date} className="space-y-2">
                <h2 className="">
                  {date}
                </h2>
                <div className="space-y-2">
                  {contents.map((content: Content) => (
                    <ContentCard key={content.url} {...content} />
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(groupedContents).length === 0 && (
              <p>No § contents found.</p>
            )}
          </div>
          
          {!isLoading && contents.length >= 20 && (
            <Button onClick={loadMore} className="w-full mt-4">Load More</Button>
          )}
          {isLoading && contents.length > 0 && (
            <div className="flex justify-center mt-4">
              <DotLoader color="#000" size={30} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContentsView;
