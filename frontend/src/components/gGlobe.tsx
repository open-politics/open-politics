import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import useGeocode from '@/hooks/useGeocder';
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, Locate, List, MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import 'mapbox-gl/dist/mapbox-gl.css';
import MapLegend from './MapLegend'; 
import { useCoordinatesStore } from '@/store/useCoordinatesStore'; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useArticleTabNameStore } from '@/hooks/useArticleTabNameStore';
import * as d3 from 'd3';
import { useLocationData } from '@/hooks/useLocationData';

interface GlobeProps {
  geojsonUrl: string;
  onLocationClick: (countryName: string) => void;
  coordinates?: { latitude: number; longitude: number }; 
  onBboxChange?: (bbox: number[] | null) => void;
}

type LocationType = 'continent' | 'country' | 'locality' | 'region' | 'city' | 'address';

const getZoomLevelForLocation = (locationType: LocationType): number => {
  const zoomLevels: Record<LocationType, number> = {
    continent: 2,
    country: 4,
    region: 5,
    locality: 6,
    city: 11,
    address: 12
  };
  
  return zoomLevels[locationType] || 4;
};

const calculateZoomLevel = (bbox: number[]): number => {
  if (!bbox || bbox.length !== 4) return 4;

  const width = Math.abs(bbox[2] - bbox[0]);
  const height = Math.abs(bbox[3] - bbox[1]);
  const area = width * height;

  if (area > 1000) return 2;
  if (area > 500) return 2.5;
  if (area > 200) return 3;
  if (area > 100) return 3.5;
  if (area > 50) return 4;
  if (area > 20) return 4.5;
  if (area > 10) return 5;
  if (area > 5) return 5.5;
  if (area > 1) return 6;
  return 7;
};

const Globe = React.forwardRef<any, GlobeProps>(({ geojsonUrl, onLocationClick, coordinates, onBboxChange }, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { geocodeLocation, loading, error } = useGeocode();
  const [inputLocation, setInputLocation] = useState('');
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);
  const { latitude, longitude } = useCoordinatesStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastClickedCluster, setLastClickedCluster] = useState<string | null>(null);
  const [currentBbox, setCurrentBbox] = useState<number[] | null>(null);
  const setActiveTab = useArticleTabNameStore((state) => state.setActiveTab);
  const [isSpinning, setIsSpinning] = useState(true);
  const spinningRef = useRef<number | null>(null);
  const [currentHighlightedFeature, setCurrentHighlightedFeature] = useState<any>(null);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [isRoutePlaying, setIsRoutePlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const eventTypes = [
    { type: "Protests", color: "#2196F3", icon: "protest", zIndex: 4 },
    { type: "Elections", color: "#4CAF50", icon: "ballot", zIndex: 5 },
    { type: "Politics", color: "#9C27B0", icon: "politics", zIndex: 1 },
    { type: "Economic", color: "#FF9800", icon: "economy", zIndex: 3 },
    { type: "Social", color: "#FFD700", icon: "social", zIndex: 2 }, 
    { type: "Crisis", color: "#FF4500", icon: "new_war", zIndex: 2 }, 
    { type: "War", color: "#FF5722", icon: "new_war", zIndex: 2 },
  ];

  const routes = [
    {
      name: "Global Tour",
      locations: [
        { name: "Berlin", coordinates: [13.4050, 52.5200], description: "Capital of Germany" },
        { name: "Washington D.C.", coordinates: [-77.0369, 38.9072], description: "Capital of USA" },
        { name: "Tokyo", coordinates: [139.6917, 35.6895], description: "Capital of Japan" },
        { name: "Sydney", coordinates: [151.2093, -33.8688], description: "Largest city in Australia" },
      ]
    },
    {
      name: "Conflict Zones",
      locations: [
        { name: "Kyiv", coordinates: [30.5238, 50.4547], description: "Capital of Ukraine" },
        { name: "Damascus", coordinates: [36.2786, 33.5138], description: "Capital of Syria" },
        { name: "Kabul", coordinates: [69.2075, 34.5553], description: "Capital of Afghanistan" },
        { name: "Baghdad", coordinates: [44.3661, 33.3152], description: "Capital of Iraq" },
      ]
    }
  ];

  const flyToLocation = useCallback((longitude: number, latitude: number, zoom: number, locationType?: LocationType) => {
    if (mapRef.current) {
      if (isNaN(longitude) || isNaN(latitude)) {
        console.error('Invalid coordinates:', { longitude, latitude });
        return;
      }

      setIsSpinning(false);

      const finalZoom = locationType ? getZoomLevelForLocation(locationType) : zoom;
      
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: finalZoom,
        essential: true,
        duration: 2000
      });
    }
  }, [setIsSpinning]);

  const handleFlyToInputLocation = async () => {
    setIsSpinning(false);
    
    const result = await geocodeLocation(inputLocation);
    if (result) {
      const { longitude, latitude, bbox, type } = result;
      
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
          
          if (bbox) {
            highlightBbox(bbox, type || 'locality');
          } else {
            flyToLocation(longitude, latitude, 6, type);
          }
        }
        
        setTimeout(() => {
          onLocationClick(inputLocation);
        }, 600);
      }, 100);
    }
  };

  const hexToRgb = (hex: string): string => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = 'pk.eyJ1IjoiamltdnciLCJhIjoiY20xd2U3Z2pqMGprdDJqczV2OXJtMTBoayJ9.hlSx0Nc19j_Z1NRgyX7HHg';
    }

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/jimvw/cm466rsf0014101sibqumbyfs', 
        projection: 'globe',
        center: [13.4, 52.5],
        zoom: 3.5
      });

      mapRef.current.on('styleimagemissing', (e) => {
        const id = e.id;
        if (eventTypes.some(eventType => eventType.icon === id)) {
          const img = new Image();
          img.src = `/animations/maki-icons/${id}.svg`;
          img.onload = () => {
            mapRef.current?.addImage(id, img);
          };
          img.onerror = () => {
            console.error(`Failed to load image for icon: ${id}`);
          };
        }
      });

      mapRef.current.on('load', () => {
        setMapLoaded(true);
        
        mapRef.current?.on('click', (e) => {
          if (lastClickedCluster) {
            setLastClickedCluster(null);
            return;
          }

          const clickedFeatures = mapRef.current?.queryRenderedFeatures(e.point, {
            layers: [
              ...eventTypes.map(type => `clusters-${type.type}`),
              ...eventTypes.map(type => `unclustered-point-${type.type}`)
            ]
          });

          if (clickedFeatures && clickedFeatures.length > 0) {
            return;
          }

          const point = e.point;
          const buffer = 5;
          const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
            [point.x - buffer, point.y - buffer],
            [point.x + buffer, point.y + buffer]
          ];

          const features = mapRef.current?.queryRenderedFeatures(bbox, {
            layers: ['country_boundaries']
          });

          if (features && features.length > 0) {
            const feature = features[0];
            const countryName = feature.properties?.name_en;

            if (countryName) {
              onLocationClick(countryName);
            }
          }
        });

        mapRef.current?.setFog({
          color: 'rgba(30, 30, 30, 1)',
          'high-color': 'rgba(10, 10, 10, 1)',
          'horizon-blend': 0.1,
          'space-color': 'rgba(5, 5, 20, 1)',
          'star-intensity': 0.2
        });
      });

      mapRef.current.on('dragstart', () => setIsSpinning(false));
      mapRef.current.on('touchstart', () => setIsSpinning(false));
      mapRef.current.on('mousedown', () => setIsSpinning(false));
    }
    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.resize();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      resizeObserver.disconnect();
      styleSheet.remove();
    };
  }, []);

  const toggleLayerVisibility = useCallback((layerId: string, visibility: 'visible' | 'none') => {
    if (mapRef.current && mapRef.current.getLayer(layerId)) {
      mapRef.current.setLayoutProperty(layerId, 'visibility', visibility);
    }
  }, []);

  useEffect(() => {
    const loadGeoJSONEventsData = async () => {
      setIsLoading(true);
      try {
        const promises = eventTypes.map(eventType => {
          return axios.get(`/api/v1/locations/geojson_events`, {
            params: {
              event_type: eventType.type
            }
          });
        });

        const results = await Promise.all(promises);
        
        const sortedEventTypes = [...eventTypes].sort((a, b) => b.zIndex - a.zIndex);

        sortedEventTypes.forEach((eventType, index) => {
          const result = results[eventTypes.findIndex(et => et.type === eventType.type)];
          const data = result.data;

          if (mapRef.current) {
            const adjustedData = {
              ...data,
              features: data.features.map((feature: any) => {
                let contents;
                try {
                  contents = typeof feature.properties.contents === 'string'
                    ? JSON.parse(feature.properties.contents)
                    : feature.properties.contents;
                } catch (error) {
                  console.error('Error parsing contents:', error);
                  contents = [];
                }

                return {
                  ...feature,
                  properties: {
                    ...feature.properties,
                    contents: contents
                  },
                  geometry: {
                    ...feature.geometry,
                    coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
                  }
                };
              })
            };

            mapRef.current.addSource(`geojson-events-${eventType.type}`, {
              type: 'geojson',
              data: adjustedData,
              cluster: true,
              clusterMaxZoom: 14,
              clusterRadius: 5
            });

            mapRef.current.addLayer({
              id: `clusters-${eventType.type}`,
              type: 'circle',
              source: `geojson-events-${eventType.type}`,
              filter: ['has', 'point_count'],
              paint: {
                'circle-color': [
                  'step',
                  ['get', 'point_count'],
                  '#ff7f50', // Coral for small clusters
                  100, '#ffd700', // Gold for medium clusters
                  750, '#adff2f' // GreenYellow for large clusters
                ],
                'circle-radius': [
                  'step',
                  ['get', 'point_count'],
                  20,
                  100, 30,
                  750, 40
                ],
                'circle-opacity': 0.9, // High opacity for visibility
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff', // White stroke for contrast
                'circle-blur': 0.1 // Optional: slight blur for effect
              }
            });

            mapRef.current.addLayer({
              id: `unclustered-point-${eventType.type}`,
              type: 'symbol',
              source: `geojson-events-${eventType.type}`,
              filter: ['!', ['has', 'point_count']],
              layout: {
                'icon-image': eventType.icon,
                'icon-size': 1,
                'icon-allow-overlap': false,
                'icon-ignore-placement': false,
                'symbol-placement': 'point',
                'symbol-spacing': 50,
                'icon-padding': 5,
                'symbol-sort-key': ['get', 'content_count'],
                'icon-pitch-alignment': 'viewport',
                'icon-rotation-alignment': 'viewport',
                'text-field': ['get', 'content_count'],
                'text-size': 18,
                'text-offset': [0, 1],
                'text-allow-overlap': false,
                'text-ignore-placement': false,
                'text-anchor': 'top'
              },
              paint: {
                'text-color': eventType.color,
                'text-halo-color': '#fff',
                'text-halo-width': 1
              }
            });

            let hoveredStateId: string | number | null = null;

            mapRef.current.on('mouseenter', `clusters-${eventType.type}`, async (e) => {
              if (!mapRef.current || !e.features || !e.features[0]) return;
              
              mapRef.current.getCanvas().style.cursor = 'pointer';
              
              const clusterId = e.features[0].properties.cluster_id;
              const clusterCount = e.features[0].properties.point_count;
              const source = mapRef.current.getSource(`geojson-events-${eventType.type}`) as mapboxgl.GeoJSONSource;
              const coordinates = (e.features[0].geometry as any).coordinates;

              try {
                const leaves = await new Promise((resolve, reject) => {
                  (source as any).getClusterLeaves(
                    clusterId,
                    3,
                    0,
                    (err: any, features: any) => {
                      if (err) reject(err);
                      resolve(features);
                    }
                  );
                });

                let popupContent = `
                  <div class="w-[250px] p-0 bg-transparent text-white">
                    <div class="bg-transparent">
                      <div class="flex flex-col space-y-1.5 p-3">
                        <div class="flex items-center justify-between">
                          <h3 class="font-semibold tracking-tight text-sm">
                            ${eventType.type} Cluster
                          </h3>
                          <span class="text-xs text-white">
                            ${clusterCount} locations
                          </span>
                        </div>
                      </div>
                      <div class="p-3 pt-0">
                        <div class="max-h-[150px] overflow-y-auto custom-scrollbar">
                          ${(leaves as any[]).map(feature => {
                            const locationName = feature.properties.name;
                            const contentCount = feature.properties.content_count;
                            
                            return `
                              <div class="mb-2 last:mb-0 text-sm">
                                <div class="flex items-center justify-between">
                                  <span class="text-white">📍${locationName}</span>
                                  <span class="text-xs text-green-500">${contentCount} items</span>
                                </div>
                              </div>
                            `;
                          }).join('')}
                          ${clusterCount > 3 ? `
                            <div class="text-xs text-white mt-2 pt-2 border-t">
                              And ${clusterCount - 3} more locations...
                            </div>
                          ` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                `;

                const popup = new mapboxgl.Popup({
                  closeButton: false,
                  maxWidth: 'none',
                  className: 'custom-popup-container hover-popup',
                })
                  .setLngLat(coordinates)
                  .setHTML(popupContent)
                  .addTo(mapRef.current);

                const popupElement = popup.getElement();
                popupElement.addEventListener('mouseenter', () => {
                  clearTimeout(popupTimeout);
                  popupElement.style.animation = 'none';
                });

                popupElement.addEventListener('mouseleave', () => {
                  popupElement.style.animation = '';
                  popupTimeout = setTimeout(() => {
                    popup.remove();
                  }, 4500);
                });

                let popupTimeout = setTimeout(() => {
                  popup.remove();
                }, 15000);

              } catch (error) {
                console.error('Error getting cluster preview:', error);
              }
            });

            mapRef.current.on('mouseleave', `clusters-${eventType.type}`, () => {
              if (mapRef.current) {
                mapRef.current.getCanvas().style.cursor = '';
                const popups = document.getElementsByClassName('hover-popup');
                while (popups.length > 0) {
                  popups[0].remove();
                }
              }
            });

            mapRef.current.addLayer({
              id: `cluster-count-${eventType.type}`,
              type: 'symbol',
              source: `geojson-events-${eventType.type}`,
              filter: ['has', 'point_count'],
              layout: {
                'text-field': '{point_count_abbreviated}',
                'text-size': 14,
                'text-allow-overlap': true
              },
              paint: {
                'text-color': '#ffffff'
              }
            });

            mapRef.current.on('mouseenter', `unclustered-point-${eventType.type}`, (e) => {
              if (mapRef.current) {
                mapRef.current.getCanvas().style.cursor = 'pointer';
                
                const features = mapRef.current.queryRenderedFeatures(e.point, {
                  layers: [`unclustered-point-${eventType.type}`]
                });

                if (features && features.length > 0) {
                  const feature = features[0];
                  
                  const countryName = feature.properties?.name;
                  const eventTypeName = eventType.type;
                  const contentCount = feature.properties?.content_count || 0;
                  
                  let contents = [];
                  try {
                    contents = feature.properties?.contents || [];
                    if (typeof contents === 'string') {
                      contents = JSON.parse(contents);
                    }
                  } catch (error) {
                    console.error('Error parsing contents:', error);
                  }

                  const validContents = Array.isArray(contents) 
                    ? contents.filter(content => 
                        content?.url && 
                        content?.title && 
                        content?.insertion_date
                      )
                    : [];

                  let popupContent = `
                    <div class="w-[300px] p-0 border-none bg-transparent text-white">
                      <div class="rounded-xl bg-transparent">
                        <div class="flex flex-col space-y-1.5 p-4">
                          <div class="flex items-center justify-between">
                            <h3 class="font-semibold tracking-tight">
                              <a href="#" 
                                 class="text-white hover:underline cursor-pointer"
                                 onclick="window.dispatchEvent(new CustomEvent('setLocation', {detail:'${countryName}'}))"
                              >
                                ${eventTypeName} @ 📍 ${countryName}
                              </a>
                            </h3>
                            <span class="text-sm text-green-500">
                              ${contentCount} items
                            </span>
                          </div>
                          </div>
                          <div class="p-4 pt-0">
                            <div class="max-h-[200px] overflow-y-auto custom-scrollbar">
                              ${validContents.length > 0 
                                ? validContents.map(content => `
                                    <div class="mb-3 last:mb-0 border-b border-border pb-2 last:border-0 last:pb-0">
                                      <a href="${content.url}" 
                                         target="_blank" 
                                         class="text-sm text-white hover:underline block">
                                        ${content.title}
                                      </a>
                                      <div class="flex items-center gap-2 mt-1 text-xs text-white">
                                        <span>${new Date(content.insertion_date).toLocaleDateString()}</span>
                                        ${content.source ? `
                                          <span class="inline-flex items-center">
                                            <span class="mx-1">•</span>
                                            ${content.source}
                                          </span>
                                        ` : ''}
                                      </div>
                                    </div>
                                  `).join('')
                                : '<div class="text-sm text-white py-2">No content available</div>'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  `;
                  

                  new mapboxgl.Popup({ 
                    closeButton: true,
                    maxWidth: 'none',
                    offset: [0, -15 * eventTypes.findIndex(et => et.type === eventType.type)],
                    className: 'custom-popup-container hover-popup'
                  })
                    .setLngLat(feature.geometry.coordinates)
                    .setHTML(popupContent)
                    .addTo(mapRef.current);
                }
              }
            });

            mapRef.current.on('click', `unclustered-point-${eventType.type}`, (e) => {
              if (mapRef.current) {
                const features = mapRef.current.queryRenderedFeatures(e.point, {
                  layers: [`unclustered-point-${eventType.type}`]
                });

                if (features && features.length > 0) {
                  const feature = features[0];
                  const locationName = feature.properties?.name;

                  if (locationName) {
                    setActiveTab('articles');
                    onLocationClick(locationName);
                  }
                }
              }
            });

            mapRef.current.on('mouseenter', `clusters-${eventType.type}`, () => {
              if (mapRef.current) {
                mapRef.current.getCanvas().style.cursor = 'pointer';
              }
            });

            mapRef.current.on('mouseleave', `clusters-${eventType.type}`, () => {
              if (mapRef.current) {
                mapRef.current.getCanvas().style.cursor = '';
              }
            });

            mapRef.current.on('click', `clusters-${eventType.type}`, (e) => {
              const features = mapRef.current?.queryRenderedFeatures(e.point, {
                layers: [`clusters-${eventType.type}`]
              });
              
              if (features && features.length > 0 && features[0].properties) {
                const clusterId = features[0].properties.cluster_id;
                const source = mapRef.current?.getSource(`geojson-events-${eventType.type}`);
                
                if ('getClusterExpansionZoom' in source) {
                  (source as any).getClusterExpansionZoom(
                    clusterId,
                    (err: any, zoom: number) => {
                      if (err) return;

                      const coordinates = (features[0].geometry as any).coordinates;
                      const offset: [number, number] = [0, -(mapRef.current!.getContainer().offsetHeight * 0.2)];
                      
                      const limitedZoom = Math.min(zoom, 6);
                      
                      mapRef.current?.flyTo({
                        center: coordinates,
                        zoom: limitedZoom,
                        offset: offset,
                        essential: true
                      });
                    }
                  );
                }
              }
            });

            mapRef.current.on('mouseleave', `unclustered-point-${eventType.type}`, () => {
              if (mapRef.current) {
                mapRef.current.getCanvas().style.cursor = '';
                const popups = document.getElementsByClassName('mapboxgl-popup');
                while (popups.length > 0) {
                  popups[0].remove();
                }
              }
            });

            mapRef.current.on('click', `clusters-${eventType.type}`, async (e) => {
              if (!mapRef.current || !e.features || !e.features[0]) return;
              
              const features = mapRef.current.queryRenderedFeatures(e.point, {
                layers: [`clusters-${eventType.type}`]
              });
              
              if (!features.length || !features[0].properties) return;

              const clusterId = features[0].properties.cluster_id;
              const clusterKey = `${eventType.type}-${clusterId}`;
              const coordinates = (features[0].geometry as any).coordinates;
              const source = mapRef.current.getSource(`geojson-events-${eventType.type}`) as mapboxgl.GeoJSONSource;
              
              setLastClickedCluster(clusterKey);

              try {
                const leaves = await new Promise((resolve, reject) => {
                  (source as any).getClusterLeaves(
                    clusterId,
                    10,
                    0,
                    (err: any, features: any) => {
                      if (err) reject(err);
                      resolve(features);
                    }
                  );
                });

                const popupContent = `
                  <div class="w-[350px] p-0 bg-transparent text-white">
                    <div class="rounded-xl bg-transparent">
                      <div class="flex flex-col space-y-1.5 p-4">
                        <div class="flex items-center justify-between">
                          <h3 class="font-semibold tracking-tight">
                            ${eventType.type} Cluster
                          </h3>
                          <span class="text-sm text-white">
                            ${features[0].properties.point_count} locations
                          </span>
                        </div>
                      </div>
                      <div class="p-4 pt-0">
                        <div class="max-h-[300px] overflow-y-auto custom-scrollbar">
                          ${(leaves as any[]).map(feature => {
                            const contents = feature.properties.contents;
                            const locationName = feature.properties.name;
                            const contentCount = feature.properties.content_count;
                            
                            return `
                              <div class="mb-4 last:mb-0">
                                <div class="flex items-center justify-between mb-2">
                                  <h4 class="font-medium text-sm">
                                    <a href="#" 
                                       class="text-white hover:underline cursor-pointer"
                                       onclick="window.dispatchEvent(new CustomEvent('setLocation', {detail:'${locationName}'}))"
                                    >
                                      📍${locationName}
                                    </a>
                                  </h4>
                                  <span class="text-xs text-white">${contentCount} items</span>
                                </div>
                                ${Array.isArray(contents) ? contents.slice(0, 2).map(content => `
                                  <div class="ml-2 mb-2 last:mb-0 text-sm">
                                    <a href="${content.url}" 
                                       target="_blank" 
                                       class="text-white hover:underline block">
                                      ${content.title}
                                    </a>
                                    <div class="flex items-center gap-2 mt-1 text-xs text-white">
                                      <span>${new Date(content.insertion_date).toLocaleDateString()}</span>
                                      ${content.source ? `
                                        <span class="inline-flex items-center">
                                          <span class="mx-1">•</span>
                                          ${content.source}
                                        </span>
                                      ` : ''}
                                    </div>
                                  </div>
                                `).join('') : ''}
                                ${Array.isArray(contents) && contents.length > 2 ? `
                                  <div class="ml-2 text-xs text-white">
                                    And ${contents.length - 2} more...
                                  </div>
                                ` : ''}
                              </div>
                            `;
                          }).join('')}
                        </div>
                        <div class="mt-4 pt-4 border-t text-center">
                          <button 
                            class="px-4 py-2 text-sm bg-primary text-black rounded-md hover:bg-primary/90"
                            onclick="window.dispatchEvent(new CustomEvent('zoomToCluster', {
                              detail: {
                                lng: ${coordinates[0]},
                                lat: ${coordinates[1]},
                                zoom: ${Math.min(mapRef.current.getZoom() + 8, 4)}
                              }
                            }))"
                          >
                            Zoom to view cluster
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                `;

                new mapboxgl.Popup({
                  closeButton: true,
                  maxWidth: 'none',
                  className: 'custom-popup-container bg-transparent cluster-popup'
                })
                  .setLngLat(coordinates)
                  .setHTML(popupContent)
                  .addTo(mapRef.current)
                  .on('close', () => {
                    setLastClickedCluster(null);
                  });

              } catch (error) {
                console.error('Error getting cluster information:', error);
              }
            });
          }
        });
      } catch (error) {
        console.error('Error fetching GeoJSON events data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (mapLoaded) {
      loadGeoJSONEventsData();
    }
  }, [mapLoaded]);

  const handleToggleLayer = (eventType: string, isVisible: boolean) => {
    const visibility = isVisible ? 'visible' : 'none';
    toggleLayerVisibility(`clusters-${eventType}`, visibility);
    toggleLayerVisibility(`unclustered-point-${eventType}`, visibility);
    toggleLayerVisibility(`cluster-count-${eventType}`, visibility);
  };

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.on('mousemove', (e) => {
        const features = mapRef.current?.queryRenderedFeatures(e.point, {
          layers: ['country-boundaries']
        });

        if (features && features.length > 0) {
          const feature = features[0];
          setHoveredFeature(feature.properties);
        } else {
          setHoveredFeature(null);
        }
      });
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      flyToLocation(longitude, latitude, 6);
    }
  }, [longitude, latitude]);

  useEffect(() => {
    const inputElement = document.querySelector('.location-input');
    if (inputElement) {
      inputElement.addEventListener('focus', (e) => {
        e.preventDefault();
      });
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('focus', (e) => {
          e.preventDefault();
        });
      }
    };
  }, []);

  useEffect(() => {
    const handleSetLocation = (e: CustomEvent) => {
      onLocationClick(e.detail);
    };

    window.addEventListener('setLocation', handleSetLocation as EventListener);

    return () => {
      window.removeEventListener('setLocation', handleSetLocation as EventListener);
    };
  }, [onLocationClick]);

  useEffect(() => {
    const handleZoomToCluster = (e: CustomEvent) => {
      if (mapRef.current) {
        const { lng, lat, zoom } = e.detail;
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: zoom
        });
      }
    };

    window.addEventListener('zoomToCluster', handleZoomToCluster as EventListener);

    return () => {
      window.removeEventListener('zoomToCluster', handleZoomToCluster as EventListener);
    };
  }, []);

  const locationButtons = [
    "Germany",
    "Japan",
    "USA",
    "Ukraine",
    "Israel",
    "Taiwan"
  ];

  const styles = `
      .custom-popup-container .mapboxgl-popup-content {
        padding: 0 !important;
        border-radius: 0.75rem;
        backdrop-filter: blur(3px); /* Increased blur for better transparency effect */
        background: rgba(255, 255, 255, 0.2) !important; /* Added white background with transparency */
      }

      .custom-popup-container .mapboxgl-popup-close-button {
        padding: 0.5rem;
        right: 0.5rem;
        top: -0.25rem;
        z-index: 10;
        color: var(--text-muted);
        transition: color 0.2s;
        background: none !important;
      }

      .custom-popup-container .mapboxgl-popup-close-button:hover {
        color: limegreen;
      }

      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: var(--scrollbar-thumb) transparent;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 0.5rem;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb);
        border-radius: 9999px;
      }

      .cluster-popup .mapboxgl-popup-content {
        max-height: 80vh;
        overflow-y: auto;
      }

      .cluster-popup {
        z-index: 5;
      }

      .hover-popup {
        z-index: 4;
      }

      .hover-popup .mapboxgl-popup-content,
      .spinning-popup .mapboxgl-popup-content {
        background: transparent !important;
        box-shadow: none !important;
      }

      .spinning-popup {
        z-index: 3;
        opacity: 0;
        animation: fadeInOut 5s forwards;
      }

      @keyframes fadeInOut {
        0% { opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { opacity: 0; }
      }
  `;

  const highlightBbox = useCallback((
    bbox: string[] | number[], 
    locationType: LocationType = 'locality',
    dynamicZoom?: number
  ) => {
    if (!mapRef.current || !bbox || bbox.length !== 4) return;

    const numericBbox = bbox.map(coord => typeof coord === 'string' ? parseFloat(coord) : coord);
    const zoomLevel = dynamicZoom || getZoomLevelForLocation(locationType);

    if (mapRef.current.getLayer('bbox-fill')) {
      mapRef.current.removeLayer('bbox-fill');
    }
    if (mapRef.current.getLayer('bbox-outline')) {
      mapRef.current.removeLayer('bbox-outline');
    }
    if (mapRef.current.getSource('bbox')) {
      mapRef.current.removeSource('bbox');
    }

    if (bbox) {
      const bboxPolygon = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [bbox[0], bbox[1]],
            [bbox[2], bbox[1]],
            [bbox[2], bbox[3]],
            [bbox[0], bbox[3]],
            [bbox[0], bbox[1]]
          ]]
        }
      };

      mapRef.current.addSource('bbox', {
        type: 'geojson',
        data: bboxPolygon
      });

      mapRef.current.addLayer({
        id: 'bbox-fill',
        type: 'fill',
        source: 'bbox',
        paint: {
          'fill-color': '#000000',
          'fill-opacity': 0.1
        }
      });

      mapRef.current.addLayer({
        id: 'bbox-outline',
        type: 'line',
        source: 'bbox',
        paint: {
          'line-color': '#000000',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });

      mapRef.current.fitBounds(
        [[numericBbox[0], numericBbox[1]], [numericBbox[2], numericBbox[3]]],
        { 
          padding: 50,
          duration: 2000,
          maxZoom: zoomLevel,
          minZoom: Math.max(2, zoomLevel - 1.5)
        }
      );
    }

    setCurrentBbox(bbox);
    if (onBboxChange) {
      onBboxChange(bbox);
    }
  }, [onBboxChange]);

  React.useImperativeHandle(ref, () => ({
    zoomToCountry: (
      latitude: number, 
      longitude: number, 
      country: string, 
      bbox?: string[] | number[],
      locationType: 'continent' | 'country' | 'locality' = 'country',
      dynamicZoom?: number
    ) => {
      if (isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid coordinates in zoomToCountry:', { latitude, longitude });
        return;
      }

      console.log('zoomToCountry called with:', { 
        latitude, 
        longitude, 
        country, 
        bbox, 
        locationType,
        dynamicZoom 
      });

      if (mapRef.current) {
        if (bbox && bbox.length === 4) {
          const numericBbox = bbox.map(coord => typeof coord === 'string' ? parseFloat(coord) : coord);
          const calculatedZoom = calculateZoomLevel(numericBbox);
          
          const bboxPolygon = {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [bbox[0], bbox[1]],
                [bbox[2], bbox[1]],
                [bbox[2], bbox[3]],
                [bbox[0], bbox[3]],
                [bbox[0], bbox[1]]
              ]]
            }
          };

          if (mapRef.current.getLayer('bbox-fill')) {
            mapRef.current.removeLayer('bbox-fill');
          }
          if (mapRef.current.getLayer('bbox-outline')) {
            mapRef.current.removeLayer('bbox-outline');
          }
          if (mapRef.current.getSource('bbox')) {
            mapRef.current.removeSource('bbox');
          }

          mapRef.current.addSource('bbox', {
            type: 'geojson',
            data: bboxPolygon
          });

          mapRef.current.addLayer({
            id: 'bbox-fill',
            type: 'fill',
            source: 'bbox',
            paint: {
              'fill-color': '#000000',
              'fill-opacity': 0.1
            }
          });

          mapRef.current.addLayer({
            id: 'bbox-outline',
            type: 'line',
            source: 'bbox',
            paint: {
              'line-color': '#000000',
              'line-width': 2,
              'line-dasharray': [2, 2]
            }
          });

          mapRef.current.fitBounds(
            [[numericBbox[0], numericBbox[1]], [numericBbox[2], numericBbox[3]]],
            { 
              padding: 150,
              duration: 2000,
              maxZoom: calculatedZoom,
              minZoom: Math.max(2, calculatedZoom - 1)
            }
          );
        } else {
          flyToLocation(longitude, latitude, dynamicZoom || 6, locationType);
        }
      }
    }
  }));

  const spin = useCallback(() => {
    if (!mapRef.current || !isSpinning || isRoutePlaying) return;

    const rotationSpeed = 0.0115;
    const currentCenter = mapRef.current.getCenter();

    // Adjust the longitude to spin towards Japan
    currentCenter.lng += rotationSpeed;

    // Adjust the latitude to create a path over the Middle East to Japan
    if (currentCenter.lng > 13.4050 && currentCenter.lng < 139.6917) {
      if (currentCenter.lng > 30.0 && currentCenter.lng < 60.0) {
        currentCenter.lat -= 0.002; // Stronger adjustment over the Middle East
      } else {
        currentCenter.lat -= 0.001; // Adjust this value to control the path
      }
    } else {
      currentCenter.lat += 0.001; // Adjust this value to control the path
    }

    mapRef.current.setCenter([currentCenter.lng, currentCenter.lat]);
    spinningRef.current = requestAnimationFrame(spin);
  }, [isSpinning, isRoutePlaying]);

  useEffect(() => {
    if (isSpinning) {
      spin();
    } else if (spinningRef.current) {
      cancelAnimationFrame(spinningRef.current);
    }

    return () => {
      if (spinningRef.current) {
        cancelAnimationFrame(spinningRef.current);
      }
    };
  }, [isSpinning, spin]);

  const handleLocationButtonClick = async (locationName: string) => {
    setIsSpinning(false);
    
    const result = await geocodeLocation(locationName);
    if (result) {
      const { longitude, latitude, bbox, type } = result;
      
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
          
          if (bbox) {
            highlightBbox(bbox, type || 'locality');
          } else {
            flyToLocation(longitude, latitude, 6, type);
          }
        }
        
        setTimeout(() => {
          onLocationClick(locationName);
        }, 600);
      }, 100);
    }
  };

  const handleLocationClick = (coords: [number, number], locationName: string, zoom: number) => {
    handleLocationButtonClick(locationName);
  };

  const createClusterPopupContent = (eventType, feature, map) => {
    const clusterId = feature.properties.cluster_id;
    const clusterCount = feature.properties.point_count;
    const source = map.getSource(`geojson-events-${eventType.type}`) as mapboxgl.GeoJSONSource;
    const coordinates = (feature.geometry as any).coordinates;

    return new Promise((resolve, reject) => {
      (source as any).getClusterLeaves(
        clusterId,
        2,
        0,
        (err: any, features: any) => {
          if (err) reject(err);

          let popupContent = `
            <div class="w-[250px] p-0 bg-transparent">
              <div class="rounded-lg bg-transparent">
                <div class="flex flex-col space-y-1.5 p-3">
                  <div class="flex items-center justify-between">
                    <h3 class="font-semibold tracking-tight text-sm">
                      ${eventType.type} Cluster
                    </h3>
                    <span class="text-xs text-green-500">
                      ${clusterCount} locations
                    </span>
                  </div>
                </div>
                <div class="p-3 pt-0">
                  <div class="max-h-[150px] overflow-y-auto custom-scrollbar">
                    ${features.map(feature => {
                      const locationName = feature.properties.name;
                      const contentCount = feature.properties.content_count;

                      return `
                        <div class="mb-2 last:mb-0 text-sm">
                          <div class="flex items-center justify-between">
                            <span class="text-green-500">📍${locationName}</span>
                            <span class="text-xs text-green-500">${contentCount} items</span>
                          </div>
                        </div>
                      `;
                    }).join('')}
                    ${clusterCount > 3 ? `
                      <div class="text-xs text-green-500 mt-2 pt-2 border-t">
                        And ${clusterCount - 3} more locations...
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;

          resolve(popupContent);
        }
      );
    });
  };

  const createUnclusteredPointPopupContent = (eventType, feature) => {
    const countryName = feature.properties.name;
    const eventTypeName = eventType.type;
    const contentCount = feature.properties.content_count || 0;

    let contents = [];
    try {
      contents = feature.properties.contents || [];
      if (typeof contents === 'string') {
        contents = JSON.parse(contents);
      }
    } catch (error) {
      console.error('Error parsing contents:', error);
    }

    const validContents = Array.isArray(contents) 
      ? contents.filter(content => 
          content?.url && 
          content?.title && 
          content?.insertion_date
        )
      : [];

    let popupContent = `
      <div class="w-[300px] p-0 bg-transparent text-white">
        <div class="rounded-lg bg-transparent ">
          <div class="flex flex-col space-y-1.5 p-4">
            <div class="flex items-center justify-between">
              <h3 class="tracking-tight">
                <a href="#" 
                   class=""
                   onclick="window.dispatchEvent(new CustomEvent('setLocation', {detail:'${countryName}'}))"
                >
                  ${eventTypeName} @ 📍 ${countryName}
                </a>
              </h3>
              <span class="text-green-500">
                ${contentCount} items
              </span>
            </div>
            </div>
            <div class="p-4 pt-0">
              <div class="max-h-[200px] overflow-y-auto custom-scrollbar">
                ${validContents.length > 0 
                  ? validContents.map(content => `
                      <div class="mb-3 last:mb-0 pb-2 last:border-0 last:pb-0">
                        <a href="${content.url}" 
                           target="_blank" 
                           class="text-sm text-white hover:underline block">
                          ${content.title}
                        </a>
                        <div class="flex items-center gap-2 mt-1 text-xs text-white">
                          <span>${new Date(content.insertion_date).toLocaleDateString()}</span>
                          ${content.source ? `
                            <span class="inline-flex items-center">
                              <span class="mx-1">•</span>
                              ${content.source}
                            </span>
                          ` : ''}
                        </div>
                      </div>
                    `).join('')
                  : '<div class="text-sm text-white py-2">No content available</div>'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    return popupContent;
  };

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || isRoutePlaying) return;

    let intervalId;
    const activePopups: mapboxgl.Popup[] = [];

    if (isSpinning) {
      intervalId = setInterval(() => {
        // Get the current viewport bounds
        const bounds = mapRef.current.getBounds();
        const bbox = [
          [bounds.getWest(), bounds.getSouth()],
          [bounds.getEast(), bounds.getNorth()]
        ];

        // Query features within the current viewport
        const features = mapRef.current.queryRenderedFeatures(bbox, {
          layers: [
            ...eventTypes.map(type => `clusters-${type.type}`),
            ...eventTypes.map(type => `unclustered-point-${type.type}`)
          ]
        });

        if (features.length > 0) {
          activePopups.forEach(popup => popup.remove());
          activePopups.length = 0;

          const selectedFeatures = features.slice(0, 3); // Select top 3 features

          selectedFeatures.forEach(feature => {
            const coordinates = (feature.geometry as any).coordinates.slice();
            const layerId = feature.layer.id;
            const eventTypeName = layerId.replace('clusters-', '').replace('unclustered-point-', '');
            const eventType = eventTypes.find(et => et.type === eventTypeName);

            if (!eventType) return;

            let popupContentPromise;
            if (feature.properties.cluster) {
              popupContentPromise = createClusterPopupContent(eventType, feature, mapRef.current);
            } else {
              popupContentPromise = Promise.resolve(createUnclusteredPointPopupContent(eventType, feature));
            }

            popupContentPromise.then(popupContent => {
              const popup = new mapboxgl.Popup({
                closeButton: false,
                maxWidth: 'none',
                className: 'custom-popup-container spinning-popup bg-transparent',
                offset: [0, -10]
              })
              .setLngLat(coordinates)
              .setHTML(popupContent)
              .addTo(mapRef.current);

              activePopups.push(popup);

              setTimeout(() => {
                popup.remove();
                setCurrentHighlightedFeature(null);
              }, 15000);
            }).catch(error => {
              console.error('Error creating popup content:', error);
            });
          });
        }
      }, 6000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      activePopups.forEach(popup => popup.remove());
    };
  }, [mapLoaded, isSpinning, isRoutePlaying]);

  const setVerticalLineViewport = useCallback(() => {
    if (!mapRef.current) return;

    const bounds = mapRef.current.getBounds();
    const mapWidth = mapRef.current.getContainer().offsetWidth;
    const mapHeight = mapRef.current.getContainer().offsetHeight;

    const lineWidth = mapWidth * 0.6;
    const lineHeight = mapHeight * 0.8;

    const centerX = mapWidth / 2;
    const centerY = mapHeight / 2;

    const topLeft = mapRef.current.unproject([centerX - lineWidth / 2, centerY - lineHeight / 2]);
    const bottomRight = mapRef.current.unproject([centerX + lineWidth / 2, centerY + lineHeight / 2]);

    const bbox = [
      topLeft.lng, topLeft.lat,
      bottomRight.lng, bottomRight.lat
    ];

    mapRef.current.fitBounds(
      [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
      { 
        padding: 250,
        duration: 2000,
        maxZoom: 10,
        minZoom: 2
      }
    );
  }, []);

  const { data, fetchContents, fetchEntities } = useLocationData(null);

  // Function to load data for a specific location
  const loadLocationData = useCallback(async (locationName: string) => {
    await fetchContents({ skip: 0 });
    await fetchEntities(0, 10);
  }, [fetchContents, fetchEntities]);

  function createPopupContent(locationName: string) {
    const articles = data.contents.slice(0, 4); // Get up to 4 articles
    const entities = data.entities.slice(0, 4); // Get up to 4 entities

    return `
      <div class="popup-content">
        <h3>${locationName}</h3>
        <div class="articles">
          <h4>Articles</h4>
          ${articles.map(article => `
            <div>
              <a href="${article.url}" target="_blank">${article.title}</a>
              <p>${article.source}</p>
            </div>
          `).join('')}
        </div>
        <div class="entities">
          <h4>Entities</h4>
          ${entities.map(entity => `
            <div>
              <span>${entity.name} (${entity.entity_type})</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const startRoute = useCallback(async (route) => {
    if (!mapRef.current) return;

    setIsSpinning(false);
    setIsRoutePlaying(true);

    for (const location of route.locations) {
      const { name, coordinates } = location;

      // Fetch data for the current location
      await loadLocationData(name);

      // Fly to the location
      mapRef.current.flyTo({
        center: coordinates,
        zoom: 5,
        speed: 0.5,
        curve: 1.42,
        easing: (t) => t * t * (3 - 2 * t),
        essential: true,
      });

      // Wait for the fly animation to complete
      await new Promise((resolve) => {
        mapRef.current.once('moveend', resolve);
      });

      // Create and display a popup with articles and entities
      const popupContent = createPopupContent(name);
      const popup = new mapboxgl.Popup({
        closeButton: false,
        maxWidth: 'none',
        className: 'custom-popup-container bg-transparent route-popup',
      })
        .setLngLat(coordinates)
        .setHTML(popupContent)
        .addTo(mapRef.current);

      // Wait for a few seconds to allow the user to read the popup
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Remove the popup before moving to the next location
      popup.remove();
    }

    setIsRoutePlaying(false);
  }, [loadLocationData, createPopupContent]);

  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(
    eventTypes.reduce((acc, eventType) => {
      acc[eventType.type] = eventType.type === 'War' || eventType.type === 'Politics'; // Preselect War and Politics
      return acc;
    }, {} as Record<string, boolean>)
  );

  useEffect(() => {
    if (!mapRef.current) return;

    // Create an SVG overlay
    const svg = d3.select(mapRef.current.getCanvasContainer())
      .append('svg')
      .attr('class', 'd3-cluster-overlay')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .attr('width', mapRef.current.getCanvas().width)
      .attr('height', mapRef.current.getCanvas().height);

    // Function to render clusters
    const renderClusters = () => {
      const activeEventTypes = eventTypes.filter(et => visibleLayers[et.type]);
      const clusters = mapRef.current!.queryRenderedFeatures({
        layers: activeEventTypes.map(et => `clusters-${et.type}`)
      });

      // Bind data to circles
      const circles = svg.selectAll('circle')
        .data(clusters, d => d.properties.cluster_id);

      // Enter new circles
      circles.enter()
        .append('circle')
        .attr('r', d => Math.sqrt(d.properties.point_count) * 7) // Size based on count
        .attr('fill', d => {
          const eventType = eventTypes.find(et => et.type === d.layer.id.split('-')[1]);
          return eventType ? eventType.color : '#888';
        })
        .attr('opacity', 0.7)
        .attr('transform', d => {
          const coords = mapRef.current!.project(new mapboxgl.LngLat(d.geometry.coordinates[0], d.geometry.coordinates[1]));
          return `translate(${coords.x},${coords.y})`;
        })
        .on('click', (event, d) => {
          // Zoom into cluster on click
          const clusterId = d.properties.cluster_id;
          const source = mapRef.current!.getSource(`geojson-events-${d.layer.id.split('-')[1]}`) as mapboxgl.GeoJSONSource;
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            mapRef.current!.flyTo({ center: d.geometry.coordinates, zoom });
          });
        });

      // Update existing circles
      circles.attr('transform', d => {
        const coords = mapRef.current!.project(new mapboxgl.LngLat(d.geometry.coordinates[0], d.geometry.coordinates[1]));
        return `translate(${coords.x},${coords.y})`;
      });

      // Remove old circles
      circles.exit().remove();
    };

    // Initial render
    renderClusters();

    // Redraw on map movements
    mapRef.current.on('move', renderClusters);
    mapRef.current.on('resize', () => {
      svg.attr('width', mapRef.current!.getCanvas().width)
         .attr('height', mapRef.current!.getCanvas().height);
      renderClusters();
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.off('move', renderClusters);
        mapRef.current.off('resize', renderClusters);
      }
      svg.remove();
    };
  }, [eventTypes, visibleLayers]);

  const handleLayerToggle = (eventType: string) => {
    setVisibleLayers((prev) => {
      const newVisibility = !prev[eventType];
      toggleLayerVisibility(`clusters-${eventType}`, newVisibility ? 'visible' : 'none');
      toggleLayerVisibility(`unclustered-point-${eventType}`, newVisibility ? 'visible' : 'none');
      toggleLayerVisibility(`cluster-count-${eventType}`, newVisibility ? 'visible' : 'none');
      return { ...prev, [eventType]: newVisibility };
    });
  };

  useEffect(() => {
    if (mapLoaded) {
      eventTypes.forEach((eventType) => {
        toggleLayerVisibility(`clusters-${eventType.type}`, visibleLayers[eventType.type] ? 'visible' : 'none');
        toggleLayerVisibility(`unclustered-point-${eventType.type}`, visibleLayers[eventType.type] ? 'visible' : 'none');
        toggleLayerVisibility(`cluster-count-${eventType.type}`, visibleLayers[eventType.type] ? 'visible' : 'none');
      });
    }
  }, [mapLoaded, visibleLayers]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {isLoading && (
        <div className="loading-spinner">
          {/* You can use a CSS spinner or a library like react-spinners */}
          <div className="spinner"></div>
        </div>
      )}
      <div ref={mapContainerRef} className="map-container" style={{ height: '100%', padding: '10px', borderRadius: '12px' }}></div>
      <div className={`absolute ${isMobile ? 'top-4 left-2 space-x-2' : 'top-8 left-2 space-x-4'} z-10 flex max-w-[90%] md:max-w-full overflow-x-auto`}>
        <div className="flex w-full min-w-8 max-w-sm items-center space-x-2">
          <Input
            className='location-input min-w-12 text-white dark:bg-black'
            type="text"
            value={inputLocation}
            onChange={(e) => setInputLocation(e.target.value)}
            placeholder="Enter location"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFlyToInputLocation();
              }
            }}
            onFocus={(e) => e.preventDefault()}
          />
          <Button variant="destructive" onClick={handleFlyToInputLocation} disabled={loading}>
            {loading ? 'Loading...' : <Locate size={24} />}
          </Button>
        </div>
        {!isMobile && (
          <>
            <Button onClick={() => handleLocationButtonClick("Berlin")}>
              Fly to Berlin
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline"><MapPin /><List /></Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col space-y-2">
                  {locationButtons.slice(1).map(locationName => (
                    <Button 
                      key={locationName}
                      onClick={() => handleLocationButtonClick(locationName)}
                    >
                      Fly to {locationName}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
        <div className="flex items-center space-x-2">
          <select
            className="text-white dark:bg-black"
            value={selectedRoute ? selectedRoute.name : ''}
            onChange={(e) => {
              const routeName = e.target.value;
              const route = routes.find(r => r.name === routeName);
              setSelectedRoute(route);
            }}
          >
            <option value="" disabled>Select a Route</option>
            {routes.map(route => (
              <option key={route.name} value={route.name}>{route.name}</option>
            ))}
          </select>
          <Button
            onClick={() => {
              if (selectedRoute) {
                startRoute(selectedRoute);
              }
            }}
            disabled={!selectedRoute || isRoutePlaying}
          >
            {isRoutePlaying ? 'Playing...' : 'Start Route'}
          </Button>
        </div>
        <Button onClick={() => setShowLegend(!showLegend)}>
          {showLegend ? 'Hide Legend' : 'Legend'}
        </Button>
        {error && <div className="text-red-500">{error}</div>}
        <Button 
          variant={isSpinning ? "secondary" : "outline"}
          onClick={() => setIsSpinning(!isSpinning)}
          disabled={isRoutePlaying}
        >
          {isSpinning ? '🌐⏸️' : '🌐🔄'}
        </Button>
      </div>
      {showLegend && <MapLegend />}
      {isMobile && (
        <div className="absolute top-16 left-2 md:hidden">
          <Button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? 'Close Menu' : <><MapPin /><List /></>}
          </Button>
        </div>
      )}
      {isMobile && menuOpen && (
        <div className="absolute top-32 z-[52] left-4 text-white dark:bg-black p-4 rounded shadow-lg space-y-2">
          {locationButtons.map(locationName => (
            <Button 
              key={locationName}
              onClick={() => handleLocationButtonClick(locationName)}
            >
              Fly to {locationName}
            </Button>
          ))}
        </div>
      )}
      <div className="absolute top-8 right-2 z-10 flex flex-col space-y-2">
        {eventTypes.map((eventType) => (
          <label key={eventType.type} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={visibleLayers[eventType.type]}
              onChange={() => handleLayerToggle(eventType.type)}
            />
            <span>{eventType.type}</span>
          </label>
        ))}
      </div>
    </div>
  );
});

export default Globe;