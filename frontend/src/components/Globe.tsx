import React, { useLayoutEffect, useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import axios from 'axios';

interface GlobeProps {
  geojsonUrl: string;
  setArticleContent: (content: string) => void;
  onCountryClick: (country: string) => void;
  isBrowseMode: boolean;
  toggleMode: () => void;
  setLegislativeData: (data: any) => void;
  setEconomicData: (data: any) => void; // Add setEconomicData prop
}

const Globe = forwardRef<{}, GlobeProps>(({ geojsonUrl, setArticleContent, onCountryClick, isBrowseMode, toggleMode, setLegislativeData, setEconomicData }, ref) => {
  const chartRef = useRef<am5.Root | null>(null);
  const polygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const pointSeriesRef = useRef<am5map.MapPointSeries | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const rotationAnimationRef = useRef<am5.Animation | null>(null);
  const chartInstanceRef = useRef<am5map.MapChart | null>(null);
  const [zoomLevel, setZoomLevel] = useState(0.1);

  const initialRotationX = 0;
  const initialRotationY = 0;
  const initialZoomLevel = 0.1;

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

    const root = am5.Root.new("chartdiv");
    chartRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "rotateY",
        projection: am5map.geoOrthographic(),
        homeGeoPoint: { longitude: initialRotationX, latitude: initialRotationY },
        homeZoomLevel: initialZoomLevel,
        wheelY: "zoom",
      })
    );
    chartInstanceRef.current = chart;

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

    fetch(geojsonUrl)
      .then(response => response.json())
      .then(data => {
        pointSeries.data.setAll(data.features.map((feature: any) => ({
          geometry: feature.geometry,
          title: feature.properties.location,
          articles: feature.properties.articles
        })));
      })
      .catch(error => console.error('Error fetching GeoJSON data:', error));

    pointSeries.bullets.push(function() {
      const circle = am5.Circle.new(root, {
        radius: 2.5,
        fill: am5.color(0xcc0000), // Dimmer red color
        fillOpacity: 0.5,
        tooltipText: "{title}\n{articles[0].headline}",
      });

      circle.events.on("click", function(ev) {
        const dataItem = ev.target.dataItem;
        const articles = dataItem.dataContext.articles;
        const articleContent = articles.map((article: any) => `<a href="${article.url}" target="_blank">${article.headline}</a>`).join('<br/>');
        const content = `<div><strong>${dataItem.dataContext.title}</strong><br/>${articleContent}</div>`;
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
      // fill: am5.color(0x0e1a36), // Dark Blue
      fill: am5.color(0xfcfcfc), // White
      fillOpacity: 1,
      stroke: am5.color(0x0e1a36), 
      strokeWidth: 0.25,
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x6e6e6e),
    });

    polygonSeries.mapPolygons.template.states.create("active", {
      fill: am5.color(0x6e6e6e),
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
    zoomToCountry: async (latitude: number, longitude: number, countryName: string) => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.animate({ key: "rotationX", to: -longitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
        chartInstanceRef.current.animate({ key: "rotationY", to: -latitude, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
        chartInstanceRef.current.zoomToGeoPoint({ latitude, longitude }, 1.5);
        if (rotationAnimationRef.current) {
          rotationAnimationRef.current.stop();
        }
        setTimeout(() => {
          if (isRotating) {
            startRotationAnimation();
          }
        }, 1600);
        await handleCountrySelection(latitude, longitude, countryName);
      }
    },
    loadGeoJSON: () => {
      fetch(geojsonUrl)
        .then(response => response.json())
        .then(data => {
          pointSeriesRef.current.data.setAll(data.features.map((feature: any) => ({
            geometry: feature.geometry,
            title: feature.properties.location,
            articles: feature.properties.articles
          })));
        })
        .catch(error => console.error('Error fetching GeoJSON data:', error));
    }
  }));

  const fetchWikipediaContent = async (countryName: string) => {
    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${countryName}`);
      const data = await response.json();
      return data.extract ? `<div><strong>${countryName}</strong><br>${data.extract}</div>` : `<div><strong>${countryName}</strong>: No information available.</div>`;
    } catch (error) {
      console.error('Error fetching Wikipedia content:', error);
      return `<div><strong>${countryName}</strong>: Error fetching information.</div>`;
    }
  };

  const handleCountrySelection = async (latitude, longitude, countryName) => {
    const content = await fetchWikipediaContent(countryName);
    setArticleContent(content);
    onCountryClick(countryName);
  
    // Fetch legislative data for the selected country
    const legislativeDataUrl = `http://dev.open-politics.org/api/v1/countries/legislation/${countryName}`;
    try {
      const legislativeResponse = await axios.get(legislativeDataUrl);
      console.log('Legislative info:', legislativeResponse.data);
      setLegislativeData(legislativeResponse.data); // Ensure you have setLegislativeData in the props
    } catch (error) {
      console.error('Error fetching legislative data:', error);
    }
  
    // Fetch economic data for the selected country
    const economicDataUrl = `http://dev.open-politics.org/api/v1/countries/econ_data/${countryName}`;
    try {
      const economicResponse = await axios.get(economicDataUrl);
      console.log('Economic info:', economicResponse.data);
      setEconomicData(economicResponse.data); // Ensure you have setEconomicData in the props
    } catch (error) {
      console.error('Error fetching economic data:', error);
    }
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

      chartInstanceRef.current.animate({ key: "rotationX", to: -initialRotationX, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
      chartInstanceRef.current.animate({ key: "rotationY", to: -initialRotationY, duration: 1500, easing: am5.ease.inOut(am5.ease.cubic) });
      chartInstanceRef.current.zoomToGeoPoint({ latitude: initialRotationY, longitude: initialRotationX }, initialZoomLevel);

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

  if (!isClient) return null;
  return (
    <div className="relative">
      <div id="chartdiv" className="" style={{ width: "100%", height: "400px", marginTop: "4rem", position: "relative" }}>
        <div id="mover" className="absolute bottom-0 left-0 w-14 h-12 bg-white dark:bg-background text-zinc-100" style={{ zIndex: 1 }}></div>
      </div>
      {isBrowseMode && (
        <div className="absolute top-0 left-0 flex gap-2 pt-4 ml-8">
          <Button className='mt-2' variant="outline" onClick={handlePlayPause}>
            {isRotating ? 'Pause' : 'Play'}
          </Button>
          <Button className='mt-2' variant="outline" onClick={handleHome}>
            Home/Restart
          </Button>
          <Button className='mt-2' variant="outline" onClick={handleResume}>
            Reset
          </Button>
          <div className="flex items-center">
            <span className="text-white bg-transparent ml-2">+ -</span>
            <Slider
              value={[zoomLevel]}
              onValueChange={handleZoomChange}
              min={0.4}
              max={3}
              step={0.35}
              className="w-32"
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default Globe;

