// @ts-ignore
import React, { useLayoutEffect, useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Compass, RotateCcw, Cog } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import am5themes_Material from "@amcharts/amcharts5/themes/Material";
import { Animations } from "@amcharts/amcharts5/.internal/core/util/Animation";
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import MapLeged from './MapLeged';
import { Locate } from 'lucide-react';
import { MapPin } from 'lucide-react';

interface GlobeProps {
  geojsonUrl: string;
  setArticleContent: (content: string) => void;
  onLocationClick: (location: string) => void;
  isBrowseMode: boolean;
  toggleMode: () => void;
  setLegislativeData: (data: any) => void;
  setEconomicData: (data: any) => void;
  onCountryZoom: (latitude: number, longitude: number, countryName: string) => void;
}

interface DataContext {
  articles: { headline: string; url: string }[];
  title: string;
}

const Globe = React.forwardRef<any, GlobeProps>(({ geojsonUrl, setArticleContent, onLocationClick, isBrowseMode, toggleMode, setLegislativeData, setEconomicData, onCountryZoom }, ref) => {
  const chartRef = useRef<am5.Root | null>(null);
  const polygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const normalPointSeriesRef = useRef<am5map.MapPointSeries | null>(null);
  const eventsPointSeriesRef = useRef<am5map.MapPointSeries | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const rotationAnimationRef = useRef<any>(null);
  const chartInstanceRef = useRef<am5map.MapChart | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0.1);
  const { toast } = useToast(); 
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isLegendVisible, setLegendVisible] = useState(true);

  const initialRotationX = 0;
  const initialRotationY = 0;
  const initialZoomLevel = 1;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const startRotationAnimation = () => {
    if (chartInstanceRef.current) {
      const rotationAnimation = chartInstanceRef.current.animate({
        key: "rotationX",
        from: chartInstanceRef.current.get("rotationX"),
        to: chartInstanceRef.current.get("rotationX") + 360,
        duration: 30000,
        loops: Infinity,
      });
      rotationAnimationRef.current = rotationAnimation;
    }
  };

  const fetchGeoJSONData = async (retries = 3) => {
    console.log(`Fetching GeoJSON data... Attempts left: ${retries}`);
    try {
      const response = await axios.get(`/api/v1/locations/geojson`);
      const data = response.data;
      console.log('GeoJSON data fetched successfully:', data);
      normalPointSeriesRef.current?.data.setAll(data.features.map((feature: any) => ({
        geometry: {
          type: "Point",
          coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] // Swap coordinates here
        },
        title: feature.properties.name,
        articles: feature.properties.articles,
        articleCount: feature.properties.article_count,
        events: feature.properties.articles.events
      })));
    } catch (error) {
      console.error('Error fetching GeoJSON data:', error);
      if (retries > 0) {
        console.log(`Retrying to fetch GeoJSON data... (${retries} attempts left)`);
        toast({
          title: "Fetching data failed",
          description: `Retrying... (${retries} attempts left)`,
        });
        setTimeout(() => fetchGeoJSONData(retries - 1), 2000); 
      } else {
        console.error('All retries failed for fetching GeoJSON data.');
        toast({
          title: "Error",
          description: "Failed to fetch GeoJSON data. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    }
  };

  const fetchGeoJSONEventsData = async (eventTypes: string[], retries = 3) => {
    console.log(`Fetching GeoJSON events data for event types: ${eventTypes.join(', ')}, with ${retries} retries left.`);
    try {
      const promises = eventTypes.map(eventType => {
        console.log(`Requesting GeoJSON data for event type: ${eventType}`);
        return axios.get(`/api/v1/locations/events/${eventType}`);
      });
      const results = await Promise.all(promises);
      console.log('Received results:', results);
      const allFeatures = results.flatMap(result => result.data.features);
      console.log(`Extracted ${allFeatures.length} features from results.`);
      eventsPointSeriesRef.current?.data.setAll(allFeatures.map((feature: any) => ({
        geometry: {
          type: "Point",
          coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]] // Swap coordinates here
        },
        title: feature.properties.name,
        articles: feature.properties.articles,
        articleCount: feature.properties.article_count,
        events: feature.properties.articles.events
      })));
      console.log('Updated events point series with new data.');
    } catch (error) {
      console.error('Error fetching GeoJSON events data:', error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        toast({
          title: "Fetching data failed",
          description: `Retrying... (${retries} attempts left)`,
        });
        setTimeout(() => fetchGeoJSONEventsData(eventTypes, retries - 1), 2000); 
      } else {
        console.error('All retries failed. Unable to fetch GeoJSON events data.');
        toast({
          title: "Error",
          description: "Failed to fetch GeoJSON events data. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    }
  };

  useLayoutEffect(() => {
    if (!isClient) return;
  
    const root = am5.Root.new("chartdiv", {
      useSafeResolution: false
    });
  
    chartRef.current = root;
  
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
  
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "rotateY",
        projection: am5map.geoOrthographic(),
        homeZoomLevel: initialZoomLevel,
        wheelY: "zoom",
        centerMapOnZoomOut: true,
      })
    );
    chartInstanceRef.current = chart;
  
    const backgroundSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {})
    );
    backgroundSeries.mapPolygons.template.setAll({
      fill: am5.color(0xDCDCDC),
      fillOpacity: 0.05,
      stroke: am5.color(0x1e90ff),
      strokeWidth: 0.2,
      blur: 0.2,
    });
  
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
      })
    );
    polygonSeriesRef.current = polygonSeries;
  
    const normalPointSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {
        autoScale: true,
      })
    );
    normalPointSeriesRef.current = normalPointSeries;
  
    const event_types = [
      { type: "Elections", emoji: "🗳️", color: "#4CAF50" }, // Darker Green
      { type: "Protests", emoji: "✊", color: "#2196F3" }, // Darker Blue
      { type: "Economic", emoji: "💰", color: "#FF9800" }, // Darker Orange
      { type: "Social", emoji: "👥", color: "#E91E63" }, // Darker Pink
      { type: "Crisis", emoji: "🚨", color: "#F44336" }, // Darker Red
      { type: "War", emoji: "⚔️", color: "#FF5722" }, // Darker Orange-Red
      { type: "Peace", emoji: "☮️", color: "#9C27B0" }, // Darker Purple
    ];
  
    const eventSeriesMap = new Map<string, am5map.MapPointSeries>();
  
    event_types.forEach(event => {
      const eventSeries = chart.series.push(
        am5map.MapPointSeries.new(root, {
          autoScale: true,
        })
      );
    
      eventSeries.bullets.push(function() {
        const container = am5.Container.new(root, {
          interactive: true,
          setStateOnChildren: true,
          width: 5,
          height: 5,
        });

        const background = container.children.push(am5.Rectangle.new(root, {
          width: 1,
          height: 2,
          fill: am5.color(0xffffff),
          fillOpacity: 0, 
          strokeOpacity: 0, 
          shadowBlur: 0.2,
          tooltipText: "Location: {title}\nEvent: " + event.type,
          centerX: am5.p50,
          centerY: am5.p50,
          dx: event.type === "Elections" ? 0.8 :
              event.type === "Economic" ? 3.4 :
              event.type === "Social" ? 4.6 :
              event.type === "Protests" ? 2.2 :
              event.type === "Crisis" ? 5.8 :
              event.type === "War" ? 7.0 : 1.0,
        }));

        const label = container.children.push(am5.Label.new(root, {
          text: event.type === "Elections" ? "X" :
                event.type === "Economic" ? "$" :
                event.type === "Social" ? "O" :
                event.type === "Protests" ? "\\/" :
                event.type === "Crisis" ? "!!" :
                event.type === "War" ? "<>" : "[…]",
          fontSize: 2,
          fill: am5.color(event.color),
          centerX: am5.p50,
          centerY: am5.p50,
        }));

        container.events.on("click", function(ev) {
          const dataItem = ev.target.dataItem as am5.DataItem<DataContext>;
          const articles = dataItem.dataContext.articles;
          const articleContent = articles.map((article: any) => 
            `<a href="${article.url}" target="_blank">${article.headline}</a>`
          ).join('<hr style="margin: 10px 0; border: 0; border-top: 1px solid #ccc;">');
          const content = `<div>Articles for location: <strong>${dataItem.dataContext.title}</strong><br/>${articleContent}</div>`;
          setArticleContent(content);
          onLocationClick(dataItem.dataContext.title);
        });

        return am5.Bullet.new(root, {
          sprite: container,
        });
      });
    
      eventSeriesMap.set(event.type, eventSeries);
    });
  
    fetchGeoJSONData();
    fetchGeoJSONEventsData(event_types.map(event => event.type));
  
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      toggleKey: "active",
      interactive: true,
      fill: am5.color(0xfcfcfc),
      fillOpacity: 0.85,
      stroke: am5.color(0x0e1a36), 
      strokeWidth: 0.45,
    });
  
    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x1E40AF),
    });
  
    polygonSeries.mapPolygons.template.states.create("active", {
      fill: am5.color(0x38BDF8),
    });
  
    let previousPolygon: am5map.MapPolygon | null = null;
  
    polygonSeries.mapPolygons.template.on("active", async (active, target) => {
      if (!target) return;
  
      if (previousPolygon && previousPolygon !== target) {
        previousPolygon.set("active", false);
      }
      if (target.get("active")) {
        const centroid = target.geoCentroid();
        if (centroid) {
          chart.animate({ key: "rotationX", to: -centroid.longitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
          chart.animate({ key: "rotationY", to: -centroid.latitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
        }

        const locationName = target.dataItem?.dataContext?.name;
        if (centroid && locationName) {
          await handleLocationSelection(centroid.latitude, centroid.longitude, locationName);
        }
      }
      previousPolygon = target;
    });
  
    polygonSeries.events.on("datavalidated", function() {
      chart.goHome();
    });
  
    startRotationAnimation();
  
    return () => {
      root.dispose();
    };
  }, [isClient]);

  useImperativeHandle(ref, () => ({
    loadGeoJSONEvents: (eventType: string) => {
      fetchGeoJSONEventsData([eventType]);
    },
    zoomToCountry: (latitude: number, longitude: number, countryName: string) => {
      handleCountryZoom(latitude, longitude, countryName);
    }
  }));

  const handleCountryZoom = (latitude: number, longitude: number, countryName: string) => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.animate({ key: "rotationX", to: -longitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
      chartInstanceRef.current.animate({ key: "rotationY", to: -latitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
      if (rotationAnimationRef.current) {
        rotationAnimationRef.current.stop();
      }
    }
  };

  const fetchWikipediaContent = async (countryName: string) => {
    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${countryName}`);
      const data = await response.json();
      return data.extract ? `<div><strong>Wikipedia</strong><br>${data.extract}</div>` : `<div><strong>${countryName}</strong>: No information available.</div>`;
    } catch (error) {
      return `<div><strong>${countryName}</strong>: Error fetching information.</div>`;
    }
  };

  const handleLocationSelection = async (latitude, longitude, locationName) => {
    const content = await fetchWikipediaContent(locationName);
    setArticleContent(content);
    onLocationClick(locationName);
    handleCountryZoom(latitude, longitude, locationName);
    
    const legislativeDataUrl = `/api/v1/locations/legislation/${locationName}`;
    try {
      const legislativeResponse = await axios.get(legislativeDataUrl);
      setLegislativeData(legislativeResponse.data);
    } catch (error) {}

    const economicDataUrl = `/api/v1/locations/econ_data/${locationName}`;
    try {
      const economicResponse = await axios.get(economicDataUrl);
      setEconomicData(economicResponse.data);
    } catch (error) {}
  };

  const handlePlayPause = () => {
    if (rotationAnimationRef.current) {
      if (isRotating) {
        rotationAnimationRef.current.pause();
      } else {
        rotationAnimationRef.current.play();
      }
      setIsRotating(!isRotating);
    } else {
      startRotationAnimation();
      setIsRotating(true);
    }
  };

  useEffect(() => {
    if (selectedEvents.length > 0) {
      fetchGeoJSONEventsData(selectedEvents);
    }
  }, [selectedEvents]);

  const handleEventChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setSelectedEvents(prev =>
      checked ? [...prev, value] : prev.filter(eventType => eventType !== value)
    );
  };

  const handleHome = () => {
    if (chartInstanceRef.current) {
      if (rotationAnimationRef.current) {
        rotationAnimationRef.current.stop();
      }
      chartInstanceRef.current.animate({ key: "rotationX", to: 0, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
      chartInstanceRef.current.animate({ key: "rotationY", to: 0, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
      chartInstanceRef.current.zoomToGeoPoint({ latitude: 0, longitude: 0 }, initialZoomLevel);
      setTimeout(() => {
        if (isRotating) {
          startRotationAnimation();
        }
      }, 1600);
    }
  };

  const handleResume = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.goHome();
      if (rotationAnimationRef.current) {
        rotationAnimationRef.current.stop();
      }
      setTimeout(() => {
        if (isRotating) {
          startRotationAnimation();
        }
      }, 1600);
    }
  };

  const handleZoomChange = (value: number[]) => {
    const zoomValue = value[0];
    setZoomLevel(zoomValue);
    if (chartInstanceRef.current) {
      chartInstanceRef.current.zoomToGeoPoint({ latitude: initialRotationY, longitude: initialRotationX }, zoomValue);
    }
  };

  const getWindowWidth = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 0;
  };

  if (!isClient) return null;

  return (
    <div className="relative flex flex-col items-center">
      <div id="chartdiv" className="w-full h-96 sm:h-128 mt-16 relative z-0">
          <div className="absolute top-0 left-24 z-20 w-full">
            <Button 
              className="text-pink-400 w-14 h-12" 
              variant="outline" 
              onClick={() => setLegendVisible(prev => !prev)}
            >
              <div className="relative">
                <MapPin className="w-6 h-6" />
              </div>
            </Button>
            {isLegendVisible && (
              <div className="absolute left-0 mt-2 shadow-lg rounded-lg p-4 bg-transparent backdrop-blur-lg">
                <MapLeged />
              </div>
            )}
          </div>
          <div className="absolute left-0 mt-2 shadow-lg rounded-lg p-4 bg-transparent backdrop-blur-lg hidden">
            <MapLeged />
          </div>


        <Popover>
          <PopoverTrigger asChild>
            <Button className="bg-background absolute bottom-0 left-0 w-14 h-12 z-20 rounded-tl-none rounded-bl-none rounded-tr-md rounded-br-md" variant="outline">
              <div className="relative">
                <Cog className="text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col items-center">
            <Button className='mt-2 w-full' variant="outline" onClick={handleHome} title="Reset Globe Position">
              <RotateCcw className={`${getWindowWidth() <= 768 ? "w-4 h-4" : "w-6 h-6"}`} />
              <span className="ml-2">Reset View</span>
            </Button>
            <Button className='mt-2 w-full' variant="outline" onClick={handleResume} title="Resume Globe Rotation">
              <Compass className={`${getWindowWidth() <= 768 ? "w-4 h-4" : "w-6 h-6"}`} />
              <span className="ml-2">Resume Rotation</span>
            </Button>
            <div className="flex items-center mt-2 w-full justify-center">
              <span className="text-white bg-transparent mr-2">Zoom:</span>
              <Slider
                value={[zoomLevel]}
                onValueChange={handleZoomChange}
                min={0.4}
                max={3}
                step={0.35}
                className="w-full"
              />
              <span className="text-white bg-transparent ml-2">-  +</span>
            </div>
            <div className="flex flex-col items-start mt-2 w-full">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="Elections"
                  onChange={handleEventChange}
                  className="mr-2"
                />
                Elections
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="Protests"
                  onChange={handleEventChange}
                  className="mr-2"
                />
                Protests
              </label>
              {/* Add more checkboxes as needed */}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
});

export default Globe;