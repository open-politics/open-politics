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

  const eventTypes = [
    { type: "Elections", color: "#4CAF50", icon: "ballot", zIndex: 5 },
    { type: "Protests", color: "#2196F3", icon: "marker", zIndex: 4 },
    { type: "Economic", color: "#FF9800", icon: "bank", zIndex: 3 },
    { type: "War", color: "#FF6347", icon: "triangle-stroked", zIndex: 2 },
    { type: "News", color: "#FF6347", icon: "circle-stroked", zIndex: 1 }
  ];

  const flyToLocation = (longitude: number, latitude: number, zoom: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
      });

      const handleMoveEnd = () => {
        // Query the map for the country feature at the center
        const center = mapRef.current?.getCenter();
        if (center) {
          const features = mapRef.current?.queryRenderedFeatures(
            [mapRef.current.getContainer().clientWidth / 2, mapRef.current.getContainer().clientHeight / 2],
            { layers: ['country-boundaries'] } // Ensure this layer exists in your style
          );

          if (features && features.length > 0) {
            const feature = features[0];
            const countryName = feature.properties?.name_en; // Adjust property name as needed

            if (countryName) {
              onLocationClick(countryName);
            }
          }
        }
        // Remove the event listener after handling
        mapRef.current?.off('moveend', handleMoveEnd);
      };

      // Add the moveend listener
      mapRef.current.on('moveend', handleMoveEnd);
    }
  };

  const handleFlyToInputLocation = async () => {
    const coordinates = await geocodeLocation(inputLocation);
    if (coordinates) {
      const [longitude, latitude] = coordinates;
      flyToLocation(longitude, latitude, 6);

      if (mapRef.current) {
        const handleMoveEnd = () => {
          // Query the map for the country feature at the center
          const center = mapRef.current?.getCenter();
          if (center) {
            const features = mapRef.current?.queryRenderedFeatures(
              [mapRef.current.getContainer().clientWidth / 2, mapRef.current.getContainer().clientHeight / 2],
              { layers: ['country-boundaries'] } // Ensure this layer exists in your style
            );

            if (features && features.length > 0) {
              const feature = features[0];
              const countryName = feature.properties?.name_en; // Adjust property name as needed
              const locationName = feature.properties?.name;

              if (countryName) {
                onLocationClick(locationName);

              }
            }
          }
          // Remove the event listener after handling
          mapRef.current?.off('moveend', handleMoveEnd);
        };

        // Add the moveend listener
        mapRef.current.on('moveend', handleMoveEnd);
      }
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

    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/jimvw/cm27kipx600fw01pbg59k9w97', 
        projection: 'globe',
        center: [13.4, 52.5],
        zoom: isMobile ? 0 : 3
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
          const point = e.point;
          const buffer = 5; // Adjust this value as needed
          const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
            [point.x - buffer, point.y - buffer],
            [point.x + buffer, point.y + buffer]
          ];

          const features = mapRef.current?.queryRenderedFeatures(bbox, {
            layers: ['country-boundaries'] // Ensure this layer exists in your style
          });

          if (features && features.length > 0) {
            const feature = features[0];
            const countryName = feature.properties?.name_en; // Adjust property name as needed

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

            // Add clusters layer
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
                  30,
                  100,
                  40,
                  750,
                  50
                ],
                'circle-opacity': 0.6,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
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

            // Add unclustered point layer
            mapRef.current.addLayer({
              id: `unclustered-point-${eventType.type}`,
              type: 'symbol',
              source: `geojson-events-${eventType.type}`,
              filter: ['!', ['has', 'point_count']],
              layout: {
                'icon-image': eventType.icon,
                'icon-size': 1,
                'icon-allow-overlap': true,
                'icon-ignore-placement': false,
                'symbol-placement': 'point',
                'symbol-spacing': 10,
                'icon-padding': 2,
                // Remove icon-offset as we'll handle positioning differently
                'symbol-sort-key': ['get', 'content_count'],
                'icon-pitch-alignment': 'viewport',
                'icon-rotation-alignment': 'viewport',
                // Add text field for better identification
                'text-field': ['get', 'content_count'],
                'text-size': 10,
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
                      <div class="custom-popup" style="color: black; background-color: white; padding: 8px; border-radius: 5px;">
                        <div style="margin-bottom: 8px;">
                          <strong>${eventTypeName} @ ${countryName}</strong>
                          <br/>
                          ${contentCount} items
                        </div>
                        <div style="max-height: 200px; overflow-y: auto; font-size: 0.9em;">
                          ${validContents.length > 0 
                            ? validContents.map(content => `
                                <div style="padding: 4px 0; border-bottom: 1px solid #eee;">
                                  <a href="${content.url}" target="_blank" style="color: #2563eb; text-decoration: none; hover:text-decoration: underline;">
                                    ${content.title}
                                  </a>
                                  <div style="font-size: 0.8em; color: #666;">
                                    ${new Date(content.insertion_date).toLocaleDateString()}
                                    ${content.source ? `<span style="margin-left: 4px;">(${content.source})</span>` : ''}
                                  </div>
                                </div>
                              `).join('')
                            : '<div>No content available</div>'
                          }
                        </div>
                      </div>
                    `;
                  } catch (error) {
                    console.error('Error creating popup:', error);
                    popupContent = '<div>Error loading content</div>';
                  }

                  new mapboxgl.Popup({ 
                    closeButton: true,
                    maxWidth: '300px',
                    offset: [0, -15 * eventTypes.findIndex(et => et.type === eventType.type)]
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
                      mapRef.current?.flyTo({
                        center: coordinates,
                        zoom: zoom
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
                      <div class="custom-popup" style="color: black; background-color: white; padding: 8px; border-radius: 5px;">
                        <div style="margin-bottom: 8px;">
                          <strong>${eventTypeName} @ ${countryName}</strong>
                          <br/>
                          ${contentCount} items
                        </div>
                        <div style="max-height: 200px; overflow-y: auto; font-size: 0.9em;">
                          ${validContents.length > 0 
                            ? validContents.map(content => `
                                <div style="padding: 4px 0; border-bottom: 1px solid #eee;">
                                  <a href="${content.url}" target="_blank" style="color: #2563eb; text-decoration: none; hover:text-decoration: underline;">
                                    ${content.title}
                                  </a>
                                  <div style="font-size: 0.8em; color: #666;">
                                    ${new Date(content.insertion_date).toLocaleDateString()}
                                    ${content.source ? `<span style="margin-left: 4px;">(${content.source})</span>` : ''}
                                  </div>
                                </div>
                              `).join('')
                            : '<div>No content available</div>'
                          }
                        </div>
                      </div>
                    `;
                  } catch (error) {
                    console.error('Error creating popup:', error);
                    popupContent = '<div>Error loading content</div>';
                  }

                  new mapboxgl.Popup({ 
                    closeButton: true,
                    maxWidth: '300px',
                    offset: [0, -15 * eventTypes.findIndex(et => et.type === eventType.type)]
                  })
                    .setLngLat(feature.geometry.coordinates)
                    .setHTML(popupContent)
                    .addTo(mapRef.current);
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
