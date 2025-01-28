'use client'
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface SatelliteData {
  location: string;
  coordinates: [number, number];
  date: string;
  cloud_cover: number;
}

export default function SatellitePage() {
  const [location, setLocation] = useState('');
  const [cloudCover, setCloudCover] = useState(30);
  const [loading, setLoading] = useState(false);
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [date, setDate] = useState<Date>();

  const maxDate = new Date();
  const minDate = new Date('2015-06-23'); // Landsat 8 launch date

  const handleSearch = async () => {
    if (!location || !date) return;

    // Validate date range
    if (date > maxDate || date < minDate) {
      setError('Selected date must be between June 23, 2015 and today');
      return;
    }

    setLoading(true);
    setError(null);
    setSatelliteData(null);
    setImageUrl(null);

    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Get metadata
      const metadataResponse = await fetch(
        `/api/v1/locations/satellite/metadata/${encodeURIComponent(location)}?` + 
        `cloudcover=${cloudCover}&` +
        `date=${formattedDate}`
      );

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json().catch(() => null);
        throw new Error(errorData?.detail || `Error: ${metadataResponse.statusText}`);
      }

      const metadata = await metadataResponse.json();
      setSatelliteData(metadata);

      // Create image URL
      const timestamp = new Date().getTime();
      const imageUrlWithParams = `/api/v1/locations/satellite/${encodeURIComponent(location)}?` +
        `cloudcover=${cloudCover}&` +
        `date=${formattedDate}&` +
        `t=${timestamp}`;
      
      setImageUrl(imageUrlWithParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch satellite data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Satellite Imagery Search</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter location (e.g., Berlin)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => 
                      date > maxDate || 
                      date < minDate
                    }
                    footer={
                      <p className="text-sm text-muted-foreground text-center">
                        Select a date between June 23, 2015 and today
                      </p>
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Max Cloud Cover: {cloudCover}%
              </label>
              <Slider
                value={[cloudCover]}
                onValueChange={(value) => setCloudCover(value[0])}
                max={100}
                step={1}
              />
            </div>

            <Button 
              onClick={handleSearch}
              disabled={loading || !location || !date}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {satelliteData && (
        <Card>
          <CardHeader>
            <CardTitle>Satellite Image Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Location:</p>
                  <p>{satelliteData.location}</p>
                </div>
                <div>
                  <p className="font-medium">Coordinates:</p>
                  <p>{satelliteData.coordinates.join(', ')}</p>
                </div>
                <div>
                  <p className="font-medium">Date:</p>
                  <p>{satelliteData.date}</p>
                </div>
                <div>
                  <p className="font-medium">Cloud Cover:</p>
                  <p>{satelliteData.cloud_cover}%</p>
                </div>
              </div>

              {imageUrl && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Satellite Image:</p>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={imageUrl}
                      alt={`Satellite image of ${location}`}
                      className="w-full h-full object-cover"
                      style={{ maxHeight: '500px' }} // Set max height for the image
                      onError={(e) => {
                        setError('Failed to load satellite image');
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {loading && (
                <div className="mt-4 p-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
