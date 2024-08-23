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
import { CountriesService } from 'src/client'; // Import the CountriesService
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import { OpenAPI } from 'src/client';

interface GlobeProps {
  geojsonUrl: string;
  setArticleContent: (content: string) => void;
  onCountryClick: (country: string) => void;
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

OpenAPI.BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const Globe = React.forwardRef<any, GlobeProps>(({ geojsonUrl, setArticleContent, onCountryClick, isBrowseMode, toggleMode, setLegislativeData, setEconomicData, onCountryZoom }, ref) => {
  const chartRef = useRef<am5.Root | null>(null);
  const polygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const pointSeriesRef = useRef<am5map.MapPointSeries | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const rotationAnimationRef = useRef<any>(null);
  const chartInstanceRef = useRef<am5map.MapChart | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0.1);
  const { toast } = useToast(); 

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
      fillOpacity: .05,
      stroke: am5.color(0x1e90ff),
      blur: 0.5,
    });
    backgroundSeries.data.push({
      geometry: am5map.getGeoRectangle(90, 180, -90, -180),
    });

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
      })
    );
    polygonSeriesRef.current = polygonSeries;

    const pointSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {
        autoScale: true,
      })
    );
    pointSeriesRef.current = pointSeries;

    const fetchGeoJSONData = async (retries = 3) => {
      try {
        const data = await CountriesService.geojsonView();
        pointSeries.data.setAll(data.features.map((feature: any) => ({
          geometry: feature.geometry,
          title: feature.properties.name,
          articles: feature.properties.articles,
          articleCount: feature.properties.article_count
        })));
      } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
        if (retries > 0) {
          toast({
            title: "Fetching data failed",
            description: `Retrying... (${retries} attempts left)`,
          });
          setTimeout(() => fetchGeoJSONData(retries - 1), 2000); // Retry after 2 seconds
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch GeoJSON data. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      }
    };

    fetchGeoJSONData();

    pointSeries.bullets.push(function() {
      const circle = am5.Circle.new(root, {
        radius: 2.5,
        fill: am5.color(0xcc0000),
        fillOpacity: 0.5,
        tooltipText: "{title}\n{articles[0].headline}",
      });

      circle.events.on("click", function(ev) {
        const dataItem = ev.target.dataItem as am5.DataItem<DataContext>;
        const articles = dataItem.dataContext.articles;
        const articleContent = articles.map((article: any) => `<a href="${article.url}" target="_blank">${article.headline}</a>`).join('<hr style="margin: 10px 0; border: 0; border-top: 1px solid #ccc;">');
        const content = `<div>Articles for location: <strong>${dataItem.dataContext.title}</strong><br/>${articleContent}</div>`;
        setArticleContent(content);
        onCountryClick(dataItem.dataContext.title);
      });

      circle.states.create("hover", {
        fill: am5.color(0x0000ff),
        fillOpacity: 1,
        tooltipText: "{title}\n{articles[0].headline}",
      });

      return am5.Bullet.new(root, {
        sprite: circle
      });
    });

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      toggleKey: "active",
      interactive: true,
      fill: am5.color(0xfcfcfc),
      fillOpacity: 1,
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
      if (previousPolygon && previousPolygon !== target) {
        previousPolygon.set("active", false);
      }
      if (target.get("active")) {
        const centroid = target.geoCentroid();
        if (centroid) {
          chart.animate({ key: "rotationX", to: -centroid.longitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
          chart.animate({ key: "rotationY", to: -centroid.latitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
        }

        const countryName = target.dataItem.dataContext.name;
        await handleCountrySelection(centroid.latitude, centroid.longitude, countryName);
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
  }, [geojsonUrl, isClient]);

  useImperativeHandle(ref, () => ({
    loadGeoJSON: () => {
      const fetchGeoJSONData = async (retries = 3) => {
        try {
          const data = await CountriesService.geojsonView();
          pointSeriesRef.current.data.setAll(data.features.map((feature) => ({
            geometry: feature.geometry,
            title: feature.properties.location,
            articles: feature.properties.articles
          })));
        } catch (error) {
          console.error('Error fetching GeoJSON data:', error);
          if (retries > 0) {
            toast({
              title: "Fetching data failed",
              description: `Retrying... (${retries} attempts left)`,
            });
            setTimeout(() => fetchGeoJSONData(retries - 1), 2000); 
          } else {
            toast({
              title: "Error",
              description: "Failed to fetch GeoJSON data. Please try refreshing the page.",
              variant: "destructive",
            });
          }
        }
      };
      fetchGeoJSONData();
    },
    zoomToCountry: (latitude: number, longitude: number, countryName: string) => {
      handleCountryZoom(latitude, longitude, countryName);
    }
  }));
  
  const handleCountryZoom = (latitude: number, longitude: number, countryName: string) => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.animate({ key: "rotationX", to: -longitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
      chartInstanceRef.current.animate({ key: "rotationY", to: -latitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
      chartInstanceRef.current.zoomToGeoPoint({ latitude, longitude }, 3.5);
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

  const handleCountrySelection = async (latitude, longitude, countryName) => {
    const content = await fetchWikipediaContent(countryName);
    setArticleContent(content);
    onCountryClick(countryName);
    handleCountryZoom(latitude, longitude, countryName);
    
    const legislativeDataUrl = `/api/v1/countries/legislation/${countryName}`;
    try {
      const legislativeResponse = await axios.get(legislativeDataUrl);
      setLegislativeData(legislativeResponse.data);
    } catch (error) {}

    const economicDataUrl = `/api/v1/countries/econ_data/${countryName}`;
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
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
  });
  
  export default Globe;