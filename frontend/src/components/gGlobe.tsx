import React, { useEffect, useRef, useState } from 'react';
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


interface GlobeProps {
  geojsonUrl: string;
  onLocationClick: (countryName: string) => void;
  coordinates?: { latitude: number; longitude: number }; 
}

const Globe: React.FC<GlobeProps> = ({ geojsonUrl, onLocationClick, coordinates }) => {
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

  const eventTypes = [
    { type: "Elections", color: "#4CAF50", icon: "ballot", zIndex: 5 },
    { type: "Protests", color: "#2196F3", icon: "marker", zIndex: 4 },
    { type: "Economic", color: "#FF9800", icon: "bank", zIndex: 3 },
    { type: "War", color: "#FF6347", icon: "triangle-stroked", zIndex: 2 },
    { type: "News", color: "#FF6347", icon: "circle-stroked", zIndex: 1 }
  ];

  const flyToLocation = (longitude: number, latitude: number, zoom: number) => {
    if (mapRef.current) {
      // Explicitly type the offset as a tuple [number, number]
      const offset: [number, number] = [0, -(mapRef.current.getContainer().offsetHeight * 0.2)];
      
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom,
        offset: offset,
        essential: true
      });
    }
  };

  const handleFlyToInputLocation = async () => {
    const coordinates = await geocodeLocation(inputLocation);
    if (coordinates) {
      const [longitude, latitude] = coordinates;
      onLocationClick(inputLocation);  // This will set the location to the searched query
      flyToLocation(longitude, latitude, 6);  // This will just handle the map movement
    }
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
        zoom: 1
      });

      mapRef.current.on('styleimagemissing', (e) => {
        const id = e.id;
        if (eventTypes.some(eventType => eventType.icon === id)) {
          const img = new Image();
          img.src = `animations/maki-icons/${id}.svg`;
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
              clusterRadius: 100
            });

            // Modified clusters layer with improved hover area
            mapRef.current.addLayer({
              id: `clusters-${eventType.type}`,
              type: 'circle',
              source: `geojson-events-${eventType.type}`,
              filter: ['has', 'point_count'],
              paint: {
                'circle-color': eventType.color,
                'circle-radius': [
                  'step',
                  ['get', 'point_count'],
                  30,  // Base size
                  100, // At this point count
                  40,  // Increase size
                  750, // At this point count
                  50   // Max size
                ],
                'circle-opacity': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.8,  // Hover opacity
                  0.6   // Default opacity
                ],
                'circle-stroke-width': ['case',
                  ['boolean', ['feature-state', 'hover'], false],
                  3,    // Hover stroke width
                  2     // Default stroke width
                ],
                'circle-stroke-color': '#fff'
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
                'icon-size': 1.2,
                'icon-allow-overlap': false,
                'icon-ignore-placement': false,
                'symbol-placement': 'point',
                'symbol-spacing': 50,
                'icon-padding': 5,
                'symbol-sort-key': ['get', 'content_count'],
                'icon-pitch-alignment': 'viewport',
                'icon-rotation-alignment': 'viewport',
                'text-field': ['get', 'content_count'],
                'text-size': 1,
                'text-offset': [0, 1.2],
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
            mapRef.current.on('mouseenter', `clusters-${eventType.type}`, (e) => {
              if (mapRef.current && e.features && e.features[0]) {
                mapRef.current.getCanvas().style.cursor = 'pointer';
                
                if (hoveredStateId !== null) {
                  mapRef.current.setFeatureState(
                    { source: `geojson-events-${eventType.type}`, id: hoveredStateId },
                    { hover: false }
                  );
                }
                
                hoveredStateId = e.features[0].id;
                
                mapRef.current.setFeatureState(
                  { source: `geojson-events-${eventType.type}`, id: hoveredStateId },
                  { hover: true }
                );
              }
            });

            mapRef.current.on('mouseleave', `clusters-${eventType.type}`, () => {
              if (mapRef.current && hoveredStateId !== null) {
                mapRef.current.getCanvas().style.cursor = '';
                mapRef.current.setFeatureState(
                  { source: `geojson-events-${eventType.type}`, id: hoveredStateId },
                  { hover: false }
                );
                hoveredStateId = null;
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

            // Add hover effects for unclustered points
            mapRef.current.on('mouseenter', `unclustered-point-${eventType.type}`, (e) => {
              if (mapRef.current) {
                mapRef.current.getCanvas().style.cursor = 'pointer';
                
                const features = mapRef.current.queryRenderedFeatures(e.point, {
                  layers: [`unclustered-point-${eventType.type}`]
                });

                if (features && features.length > 0) {
                  const feature = features[0];
                  console.log('Feature properties:', feature.properties); // Debug log
                  
                  const countryName = feature.properties?.name;
                  const eventTypeName = eventType.type;
                  const contentCount = feature.properties?.content_count || 0;
                  
                  let contents = [];
                  try {
                    contents = feature.properties?.contents || [];
                    if (typeof contents === 'string') {
                      contents = JSON.parse(contents);
                    }
                    console.log('Parsed contents:', contents); // Debug log
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

                  let popupContent = '';
                  try {
                    popupContent = `
                      <div class="w-[300px] p-0 bg-transparent">
                        <div class="rounded-xl border bg-background text-foreground shadow-lg">
                          <div class="flex flex-col space-y-1.5 p-4">
                            <div class="flex items-center justify-between">
                              <h3 class="font-semibold tracking-tight">
                                ${eventTypeName} @ ${countryName}
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
                  } catch (error) {
                    console.error('Error creating popup:', error);
                    popupContent = `
                      <div class="p-4 bg-destructive text-destructive-foreground rounded-lg">
                        Error loading content
                      </div>
                    `;
                  }

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
                      // Explicitly type the offset as a tuple
                      const offset: [number, number] = [0, -(mapRef.current!.getContainer().offsetHeight * 0.2)];
                      
                      mapRef.current?.flyTo({
                        center: coordinates,
                        zoom: zoom,
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

            mapRef.current.on('mouseleave', `clusters-${eventType.type}`, () => {
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
              if (!mapRef.current) return;
              
              const features = mapRef.current.queryRenderedFeatures(e.point, {
                layers: [`clusters-${eventType.type}`]
              });
              
              if (!features.length || !features[0].properties) return;

              const clusterId = features[0].properties.cluster_id;
              const clusterKey = `${eventType.type}-${clusterId}`;
              
              // Remove the second click behavior that was setting the location
              setLastClickedCluster(clusterKey);

              const source = mapRef.current.getSource(`geojson-events-${eventType.type}`) as mapboxgl.GeoJSONSource;
              const coordinates = (features[0].geometry as any).coordinates;

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

                // Create and show popup content...
                const clusterCount = features[0].properties.point_count;
                
                let popupContent = `
                  <div class="w-[350px] p-0 bg-transparent">
                    <div class="rounded-xl border bg-background text-foreground shadow-lg">
                      <div class="flex flex-col space-y-1.5 p-4">
                        <div class="flex items-center justify-between">
                          <h3 class="font-semibold tracking-tight">
                            ${eventType.type} Cluster
                          </h3>
                          <span class="text-sm text-muted-foreground">
                            ${clusterCount} locations
                          </span>
                        </div>
                        <div class="text-xs text-muted-foreground">
                          Click location names to view details
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
                        ${clusterCount > 5 ? `
                          <div class="mt-4 pt-4 border-t">
                            <button 
                              class="text-sm text-primary hover:underline"
                              onclick="window.dispatchEvent(new CustomEvent('zoomToCluster', {detail:{lng:${coordinates[0]},lat:${coordinates[1]},zoom:6}}))"
                            >
                              Zoom in to see more locations
                            </button>
                          </div>
                        ` : ''}
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
                    // Reset last clicked cluster when popup is closed
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

  const styles = `
      .custom-popup-container .mapboxgl-popup-content {
        padding: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        border-radius: 0.75rem;
        max-height: 12re;
      }

      .custom-popup-container .mapboxgl-popup-tip {
        display: none !important;
      }

      .custom-popup-container .mapboxgl-popup-close-button {
        padding: 0.5rem;
        right: 0.5rem;
        top: 0.5rem;
        z-index: 10;
        color: var(--text-muted);
        transition: color 0.2s;
        background: none !important;
      }

      .custom-popup-container .mapboxgl-popup-close-button:hover {
        background: none !important;
        color: var(--text-foreground);
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
  `;

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
            <Button onClick={() => flyToLocation(13.4050, 52.5200, 6)}>Fly to Berlin</Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline"><MapPin /><List /></Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col space-y-2">
                  <Button onClick={() => flyToLocation(-77.0369, 38.9072, 6)}>Fly to Washington</Button>
                  <Button onClick={() => flyToLocation(34.7661, 31.0461, 6)}>Fly to Israel</Button>
                  <Button onClick={() => flyToLocation(30.5238, 50.4500, 6)}>Fly to Kyiv</Button>
                  <Button onClick={() => flyToLocation(139.767125, 35.681236, 6)}>Fly to Tokyo</Button>
                  <Button onClick={() => flyToLocation(121.5319, 25.0478, 6)}>Fly to Taiwan</Button>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
        <Button onClick={() => setShowLegend(!showLegend)}>
          {showLegend ? 'Hide Legend' : 'Legend'}
        </Button>
        {error && <div className="text-red-500">{error}</div>}
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
          <Button onClick={() => flyToLocation(13.4050, 52.5200, 6)}>Fly to Berlin</Button>
          <Button onClick={() => flyToLocation(-77.0369, 38.9072, 6)}>Fly to Washington</Button>
          <Button onClick={() => flyToLocation(34.7661, 31.0461, 6)}>Fly to Israel</Button>
          <Button onClick={() => flyToLocation(30.5238, 50.4500, 6)}>Fly to Kyiv</Button>
          <Button onClick={() => flyToLocation(139.767125, 35.681236, 6)}>Fly to Tokyo</Button>
          <Button onClick={() => flyToLocation(121.5319, 25.0478, 6)}>Fly to Taiwan</Button>
        </div>
      )}
    </div>
  );
};

export default Globe;
