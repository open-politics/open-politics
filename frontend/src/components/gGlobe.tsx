import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import useGeocode from '@/hooks/useGeocder';
import { Input } from "@/components/ui/input"
import { ChevronUp, ChevronDown, Locate, List } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapLegend from './MapLegend'; 
import { useCoordinatesStore } from '@/store/useCoordinatesStore'; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useArticleTabNameStore } from '@/hooks/useArticleTabNameStore';


interface GlobeProps {
  geojsonUrl: string;
  onLocationClick: (countryName: string) => void;
  coordinates?: { latitude: number; longitude: number }; 
  onBboxChange?: (bbox: number[] | null) => void;
}

// Add this type and mapping near the top of your file
type LocationType = 'continent' | 'country' | 'locality' | 'region' | 'city' | 'address';

// Update the zoom level mapping with more granular levels
const getZoomLevelForLocation = (locationType: LocationType): number => {
  const zoomLevels: Record<LocationType, number> = {
    continent: 2,
    country: 4,
    region: 5,
    locality: 6,
    city: 11,
    address: 12
  };
  
  return zoomLevels[locationType] || 4; // Default to country zoom if type not found
};

// Add this helper function at the top of the file
const calculateZoomLevel = (bbox: number[]): number => {
  if (!bbox || bbox.length !== 4) return 4; // Default country zoom

  // Calculate the box dimensions
  const width = Math.abs(bbox[2] - bbox[0]);
  const height = Math.abs(bbox[3] - bbox[1]);
  const area = width * height;

  // Much more conservative zoom levels
  if (area > 1000) return 2;     // Extremely large (Russia)
  if (area > 500) return 2.5;    // Very large continents
  if (area > 200) return 3;      // Large countries (Brazil, China)
  if (area > 100) return 3.5;    // Medium-large countries
  if (area > 50) return 4;       // Medium countries
  if (area > 20) return 4.5;     // Medium-small countries
  if (area > 10) return 5;       // Small countries
  if (area > 5) return 5.5;      // Very small countries
  if (area > 1) return 6;        // City regions
  return 7;                      // Cities and small areas
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

  const eventTypes = [
    { type: "Protests", color: "#2196F3", icon: "protest", zIndex: 4 },
    { type: "Elections", color: "#4CAF50", icon: "ballot", zIndex: 5 },
    { type: "Politics", color: "#9C27B0", icon: "politics", zIndex: 1 },
    { type: "Economic", color: "#FF9800", icon: "economy", zIndex: 3 },
    { type: "Social", color: "#FFD700", icon: "social", zIndex: 2 }, 
    { type: "Crisis", color: "#FF4500", icon: "new_war", zIndex: 2 }, 
    { type: "War", color: "#FF5722", icon: "new_war", zIndex: 2 },
  ];

  // Fly to location from coordinates and with zoomlevel
  const flyToLocation = useCallback((longitude: number, latitude: number, zoom: number, locationType?: LocationType) => {
    if (mapRef.current) {
      if (isNaN(longitude) || isNaN(latitude)) {
        console.error('Invalid coordinates:', { longitude, latitude });
        return;
      }

      // Stop spinning before flying
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
      
      // Wait a brief moment for any layout changes to settle
      setTimeout(() => {
        // Force a map resize to handle any container size changes
        if (mapRef.current) {
          mapRef.current.resize();
          
          if (bbox) {
            // Use the highlightBbox function if we have a bounding box
            highlightBbox(bbox, type || 'locality');
          } else {
            // Fall back to simple flyTo if no bounding box
            flyToLocation(longitude, latitude, 6, type);
          }
        }
        
        // Set location after map has been resized and centered
        setTimeout(() => {
          onLocationClick(inputLocation);
        }, 600); // Reduced delay since we're already waiting for resize
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

    // Add styles to head
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/jimvw/cm27kipx600fw01pbg59k9w97', 
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
          // If we just clicked a cluster or point, don't process the country click
          if (lastClickedCluster) {
            setLastClickedCluster(null); // Reset for next click
            return;
          }

          // Add a check for clicked points/clusters before processing country click
          const clickedFeatures = mapRef.current?.queryRenderedFeatures(e.point, {
            layers: [
              ...eventTypes.map(type => `clusters-${type.type}`),
              ...eventTypes.map(type => `unclustered-point-${type.type}`)
            ]
          });

          // If we clicked a cluster or point, don't process the country click
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
            layers: ['country-boundaries']
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
          color: 'rgb(186, 210, 235)', // Lower atmosphere
          'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
          'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
          'space-color': 'rgb(11, 11, 25)', // Background color
          'star-intensity': 0.44 // Background star brightness (default 0.35 at low zooms)
        });

        // mapRef.current.addControl(new mapboxgl.NavigationControl());
      });

      // Add these event listeners
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
      styleSheet.remove(); // Clean up styles on unmount
    };
  }, []);

  useEffect(() => {
    const loadGeoJSONEventsData = async () => {
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
            // Transform and validate the data
            const adjustedData = {
              ...data,
              features: data.features.map((feature: any) => {
                // Ensure contents is properly handled
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

            // Add source with adjusted data
            mapRef.current.addSource(`geojson-events-${eventType.type}`, {
              type: 'geojson',
              data: adjustedData,
              cluster: true,
              clusterMaxZoom: 14,
              clusterRadius: 5
            });

            // Modified clusters layer with improved hover area
            mapRef.current.addLayer({
              id: `clusters-${eventType.type}`,
              type: 'circle',
              source: `geojson-events-${eventType.type}`,
              filter: ['has', 'point_count'],
              paint: {
                'circle-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'point_count'],
                  1, `rgba(${hexToRgb(eventType.color)}, 1)`,   // Base color
                  100, `rgba(${hexToRgb(eventType.color)}, 0.8)`, // Lighter shade
                  750, `rgba(${hexToRgb(eventType.color)}, 0.6)`  // Even lighter shade
                ],
                'circle-radius': [
                  'step',
                  ['get', 'point_count'],
                  20,  // Base size
                  100, 30,  // Increase size
                  750, 40   // Max size
                ],
                'circle-opacity': 0.7,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff',
                'circle-blur': 0.5
              }
            });

            // Modified unclustered point layer with better positioning
            mapRef.current.addLayer({
              id: `unclustered-point-${eventType.type}`,
              type: 'symbol',
              source: `geojson-events-${eventType.type}`,
              filter: ['!', ['has', 'point_count']],
              layout: {
                'icon-image': eventType.icon,
                'icon-size': 1,  // Reduced from 1.2 for sharper rendering
                'icon-allow-overlap': false,  // Changed to true to prevent disappearing
                'icon-ignore-placement': false,  // Changed to true to ensure visibility
                'symbol-placement': 'point',
                'symbol-spacing': 50,
                'icon-padding': 5,
                'symbol-sort-key': ['get', 'content_count'],
                'icon-pitch-alignment': 'viewport',  // Changed to 'map' for better perspective
                'icon-rotation-alignment': 'viewport',  // Changed to 'map' for better perspective
                'text-field': ['get', 'content_cozaunt'],
                'text-size': 24,  // Increased from 1 for better visibility
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

            // Track hover states
            let hoveredStateId: string | number | null = null;

            // Improved cluster hover handling
            mapRef.current.on('mouseenter', `clusters-${eventType.type}`, async (e) => {
              if (!mapRef.current || !e.features || !e.features[0]) return;
              
              mapRef.current.getCanvas().style.cursor = 'pointer';
              
              const clusterId = e.features[0].properties.cluster_id;
              const clusterCount = e.features[0].properties.point_count;
              const source = mapRef.current.getSource(`geojson-events-${eventType.type}`) as mapboxgl.GeoJSONSource;
              const coordinates = (e.features[0].geometry as any).coordinates;

              try {
                // Get first 3 leaves from the cluster
                const leaves = await new Promise((resolve, reject) => {
                  (source as any).getClusterLeaves(
                    clusterId,
                    3, // Limit to 3 items for preview
                    0,
                    (err: any, features: any) => {
                      if (err) reject(err);
                      resolve(features);
                    }
                  );
                });

                let popupContent = `
                  <div class="w-[250px] p-0 bg-transparent">
                    <div class="rounded-xl border bg-background text-foreground shadow-lg">
                      <div class="flex flex-col space-y-1.5 p-3">
                        <div class="flex items-center justify-between">
                          <h3 class="font-semibold tracking-tight text-sm">
                            ${eventType.type} Cluster
                          </h3>
                          <span class="text-xs text-muted-foreground">
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
                                  <span class="text-primary">📍${locationName}</span>
                                  <span class="text-xs text-muted-foreground">${contentCount} items</span>
                                </div>
                              </div>
                            `;
                          }).join('')}
                          ${clusterCount > 3 ? `
                            <div class="text-xs text-muted-foreground mt-2 pt-2 border-t">
                              And ${clusterCount - 3} more locations...
                            </div>
                          ` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                `;

                new mapboxgl.Popup({
                  closeButton: false,
                  maxWidth: 'none',
                  className: 'custom-popup-container hover-popup',
                })
                  .setLngLat(coordinates)
                  .setHTML(popupContent)
                  .addTo(mapRef.current);
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

            // Add cluster count layer
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

            // hover effects for unclustered points
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

                  // Filter valid contents
                  const validContents = Array.isArray(contents) 
                    ? contents.filter(content => 
                        content?.url && 
                        content?.title && 
                        content?.insertion_date
                      )
                    : [];

                  let popupContent = `
                    <div class="w-[300px] p-0 bg-transparent">
                      <div class="rounded-xl border bg-background text-foreground shadow-lg">
                        <div class="flex flex-col space-y-1.5 p-4">
                          <div class="flex items-center justify-between">
                            <h3 class="font-semibold tracking-tight">
                              <a href="#" 
                                 class="text-primary hover:underline cursor-pointer"
                                 onclick="window.dispatchEvent(new CustomEvent('setLocation', {detail:'${countryName}'}))"
                              >
                                ${eventTypeName} @ 📍 ${countryName}
                              </a>
                            </h3>
                            <span class="text-sm text-muted-foreground">
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
                                         class="text-sm text-primary hover:underline block">
                                        ${content.title}
                                      </a>
                                      <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
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
                                : '<div class="text-sm text-muted-foreground py-2">No content available</div>'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    `;
                  

                  new mapboxgl.Popup({ 
                    closeButton: true,
                    maxWidth: 'none',
                    offset: [0, -15 * eventTypes.findIndex(et => et.type === eventType.type)],
                    className: 'custom-popup-container'
                  })
                    .setLngLat(feature.geometry.coordinates)
                    .setHTML(popupContent)
                    .addTo(mapRef.current);
                }
              }
            });

            // Add click handler for unclustered points
            mapRef.current.on('click', `unclustered-point-${eventType.type}`, (e) => {
              if (mapRef.current) {
                const features = mapRef.current.queryRenderedFeatures(e.point, {
                  layers: [`unclustered-point-${eventType.type}`]
                });

                if (features && features.length > 0) {
                  const feature = features[0];
                  const locationName = feature.properties?.name;

                  if (locationName) {
                    setActiveTab('articles'); // Set tab before triggering location click
                    onLocationClick(locationName);
                  }
                }
              }
            });

            // Add click handlers for clusters
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

            // Fix for cluster click handling
            mapRef.current.on('click', `clusters-${eventType.type}`, (e) => {
              const features = mapRef.current?.queryRenderedFeatures(e.point, {
                layers: [`clusters-${eventType.type}`]
              });
              
              if (features && features.length > 0 && features[0].properties) {
                const clusterId = features[0].properties.cluster_id;
                const source = mapRef.current?.getSource(`geojson-events-${eventType.type}`);
                
                // Type assertion to access getClusterExpansionZoom
                if ('getClusterExpansionZoom' in source) {
                  (source as any).getClusterExpansionZoom(
                    clusterId,
                    (err: any, zoom: number) => {
                      if (err) return;

                      const coordinates = (features[0].geometry as any).coordinates;
                      const offset: [number, number] = [0, -(mapRef.current!.getContainer().offsetHeight * 0.2)];
                      
                      const limitedZoom = Math.min(zoom, 4); // Limit maximum zoom to 6
                      
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

            // Add hover effects
            mapRef.current.on('mouseenter', `clusters-${eventType.type}`, () => {
              if (mapRef.current) {
                mapRef.current.getCanvas().style.cursor = 'pointer';
              }
            });

            mapRef.current.on('mouseleave', `clsters-${eventType.type}`, () => {
              if (mapRef.current) {
                mapRef.current.getCanvas().style.cursor = '';
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

            // Add this to the clusters click handler
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
                // Get cluster leaves for popup content
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

                // Create popup with more conservative zoom level in the button
                const popupContent = `
                  <div class="w-[350px] p-0 bg-transparent">
                    <div class="rounded-xl border bg-background text-foreground shadow-lg">
                      <div class="flex flex-col space-y-1.5 p-4">
                        <div class="flex items-center justify-between">
                          <h3 class="font-semibold tracking-tight">
                            ${eventType.type} Cluster
                          </h3>
                          <span class="text-sm text-muted-foreground">
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
                                       class="text-primary hover:underline cursor-pointer"
                                       onclick="window.dispatchEvent(new CustomEvent('setLocation', {detail:'${locationName}'}))"
                                    >
                                      📍${locationName}
                                    </a>
                                  </h4>
                                  <span class="text-xs text-muted-foreground">${contentCount} items</span>
                                </div>
                                ${Array.isArray(contents) ? contents.slice(0, 2).map(content => `
                                  <div class="ml-2 mb-2 last:mb-0 text-sm">
                                    <a href="${content.url}" 
                                       target="_blank" 
                                       class="text-primary hover:underline block">
                                      ${content.title}
                                    </a>
                                    <div class="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
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
                                  <div class="ml-2 text-xs text-muted-foreground">
                                    And ${contents.length - 2} more...
                                  </div>
                                ` : ''}
                              </div>
                            `;
                          }).join('')}
                        </div>
                        <div class="mt-4 pt-4 border-t text-center">
                          <button 
                            class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                            onclick="window.dispatchEvent(new CustomEvent('zoomToCluster', {
                              detail: {
                                lng: ${coordinates[0]},
                                lat: ${coordinates[1]},
                                zoom: ${Math.min(mapRef.current.getZoom() + 1, 4)}
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
                  className: 'custom-popup-container cluster-popup'
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
      }
    };

    if (mapLoaded) {
      loadGeoJSONEventsData();
    }
  }, [mapLoaded]);

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
      flyToLocation(longitude, latitude, 6); // Use the coordinates from the store
    }
  }, [longitude, latitude]);

  useEffect(() => {
    const inputElement = document.querySelector('.location-input');
    if (inputElement) {
      inputElement.addEventListener('focus', (e) => {
        e.preventDefault(); // Prevent default focus behavior
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

  // Add this effect to handle the custom event
  useEffect(() => {
    const handleSetLocation = (e: CustomEvent) => {
      onLocationClick(e.detail);
    };

    window.addEventListener('setLocation', handleSetLocation as EventListener);

    return () => {
      window.removeEventListener('setLocation', handleSetLocation as EventListener);
    };
  }, [onLocationClick]);

  // Add this effect to handle the zoom event
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

  // Simplify to just an array of location names
  const locationButtons = [
    "Berlin",
    "Washington D.C.",
    "Israel",
    "Kyiv",
    "Tokyo",
    "Taiwan"
  ];

  const styles = `
      .custom-popup-container .mapboxgl-popup-content {
        padding: 0 !important;
        background: rgba(255, 255, 255, 0.8) !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
        border-radius: 0.75rem;
        backdrop-filter: blur(10px);
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

      .hover-popup .mapboxgl-popup-content {
        padding: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        border-radius: 0.75rem;
      }
  `;

  // Update the highlightBbox function
  const highlightBbox = useCallback((
    bbox: string[] | number[], 
    locationType: LocationType = 'locality',
    dynamicZoom?: number
  ) => {
    if (!mapRef.current || !bbox || bbox.length !== 4) return;

    const numericBbox = bbox.map(coord => typeof coord === 'string' ? parseFloat(coord) : coord);
    const zoomLevel = dynamicZoom || getZoomLevelForLocation(locationType);

    // Remove existing bbox layer if any
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
      // Create a GeoJSON polygon from the bbox
      const bboxPolygon = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [bbox[0], bbox[1]], // SW
            [bbox[2], bbox[1]], // SE
            [bbox[2], bbox[3]], // NE
            [bbox[0], bbox[3]], // NW
            [bbox[0], bbox[1]]  // SW (close the polygon)
          ]]
        }
      };

      // Add the bbox source and layers
      mapRef.current.addSource('bbox', {
        type: 'geojson',
        data: bboxPolygon
      });

      // Add fill layer
      mapRef.current.addLayer({
        id: 'bbox-fill',
        type: 'fill',
        source: 'bbox',
        paint: {
          'fill-color': '#000000', // Changed to black
          'fill-opacity': 0.1
        }
      });

      // Add outline layer
      mapRef.current.addLayer({
        id: 'bbox-outline',
        type: 'line',
        source: 'bbox',
        paint: {
          'line-color': '#000000', // Changed to black
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });

      // Update fitBounds with more padding and looser zoom constraints
      mapRef.current.fitBounds(
        [[numericBbox[0], numericBbox[1]], [numericBbox[2], numericBbox[3]]],
        { 
          padding: 150, // Increased padding
          duration: 2000,
          maxZoom: zoomLevel,
          minZoom: Math.max(2, zoomLevel - 1.5) // Allow more zoom out, but never less than 2
        }
      );
    }

    setCurrentBbox(bbox);
    if (onBboxChange) {
      onBboxChange(bbox);
    }
  }, [onBboxChange]);

  // Update the ref implementation
  React.useImperativeHandle(ref, () => ({
    zoomToCountry: (
      latitude: number, 
      longitude: number, 
      country: string, 
      bbox?: string[] | number[],
      locationType: 'continent' | 'country' | 'locality' = 'country',
      dynamicZoom?: number
    ) => {
      // Add validation
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
          
          // Create a GeoJSON polygon from the bbox
          const bboxPolygon = {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [bbox[0], bbox[1]], // SW
                [bbox[2], bbox[1]], // SE
                [bbox[2], bbox[3]], // NE
                [bbox[0], bbox[3]], // NW
                [bbox[0], bbox[1]]  // SW (close the polygon)
              ]]
            }
          };

          // Remove existing bbox layers if any
          if (mapRef.current.getLayer('bbox-fill')) {
            mapRef.current.removeLayer('bbox-fill');
          }
          if (mapRef.current.getLayer('bbox-outline')) {
            mapRef.current.removeLayer('bbox-outline');
          }
          if (mapRef.current.getSource('bbox')) {
            mapRef.current.removeSource('bbox');
          }

          // Add the bbox source and layers
          mapRef.current.addSource('bbox', {
            type: 'geojson',
            data: bboxPolygon
          });

          // Add fill layer
          mapRef.current.addLayer({
            id: 'bbox-fill',
            type: 'fill',
            source: 'bbox',
            paint: {
              'fill-color': '#000000',
              'fill-opacity': 0.1
            }
          });

          // Add outline layer
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

          // Use fitBounds with the calculated zoom
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

  // Add this function to handle the spinning animation
  const spin = useCallback(() => {
    if (!mapRef.current || !isSpinning) return;
    
    const rotationSpeed = 0.0115; // Degrees per frame
    const currentCenter = mapRef.current.getCenter();
    currentCenter.lng += rotationSpeed;
    
    mapRef.current.setCenter([currentCenter.lng, currentCenter.lat]);
    spinningRef.current = requestAnimationFrame(spin);
  }, [isSpinning]);

  // Add this effect to manage spinning state
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

  // Add this new handler function
  const handleLocationButtonClick = async (locationName: string) => {
    setIsSpinning(false);
    
    const result = await geocodeLocation(locationName);
    if (result) {
      const { longitude, latitude, bbox, type } = result;
      
      // Wait a brief moment for any layout changes to settle
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
          
          if (bbox) {
            highlightBbox(bbox, type || 'locality');
          } else {
            flyToLocation(longitude, latitude, 6, type);
          }
        }
        
        // Set location after map has been resized and centered
        setTimeout(() => {
          onLocationClick(locationName);
        }, 600);
      }, 100);
    }
  };

  // Handle location click
  const handleLocationClick = (coords: [number, number], locationName: string, zoom: number) => {
    handleLocationButtonClick(locationName);
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapContainerRef} className="map-container" style={{ height: '100%', padding: '10px', borderRadius: '12px' }}></div>
      <div className={`absolute ${isMobile ? 'top-4 left-2 space-x-2' : 'top-8 left-2 space-x-4'} z-10 flex max-w-[90%] md:max-w-full overflow-x-auto`}>
        <div className="flex w-full min-w-8 max-w-sm items-center space-x-2">
          <Input
            className='location-input min-w-12 bg-white dark:bg-black'
            type="text"
            value={inputLocation}
            onChange={(e) => setInputLocation(e.target.value)}
            placeholder="Enter location"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFlyToInputLocation();
              }
            }}
            onFocus={(e) => e.preventDefault()} // to prevent default focus behavior
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
        <Button onClick={() => setShowLegend(!showLegend)}>
          {showLegend ? 'Hide Legend' : 'Legend'}
        </Button>
        {error && <div className="text-red-500">{error}</div>}
        <Button 
          variant={isSpinning ? "secondary" : "outline"}
          onClick={() => setIsSpinning(!isSpinning)}
        >
          {isSpinning ? '🌐⏸️' : '🌐🔄'}
        </Button>
      </div>
      {showLegend && <MapLegend />} {/* Conditionally render the MapLegend */}
      {hoveredFeature && (
        <div
          className="absolute bottom-12 left-2 bg-white dark:bg-black bg-opacity-40 p-2 rounded z-10 backdrop-filter backdrop-blur-lg"
        >
          <pre>{JSON.stringify(hoveredFeature.name_en, null, 2).replace(/"/g, '')}</pre>
        </div>
      )}
      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="absolute top-16 left-2 md:hidden">
          <Button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? 'Close Menu' : <><MapPin /><List /></>}
          </Button>
        </div>
      )}
      {/* Mobile Menu */}
      {isMobile && menuOpen && (
        <div className="absolute top-32 z-[52] left-4 bg-white dark:bg-black p-4 rounded shadow-lg space-y-2">
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
    </div>
  );
});

export default Globe;

