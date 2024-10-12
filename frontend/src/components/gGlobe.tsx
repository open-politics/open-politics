import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import useGeocode from '@/hooks/useGeocder';
import { Input } from "@/components/ui/input"
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapLegend from './MapLegend'; 


interface GlobeProps {
  geojsonUrl: string;
  onLocationClick: (countryName: string) => void;
}

const Globe: React.FC<GlobeProps> = ({ geojsonUrl, onLocationClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { geocodeLocation, loading, error } = useGeocode();
  const [inputLocation, setInputLocation] = useState('');
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);

  const eventTypes = [
    { type: "Elections", color: "#4CAF50", icon: "building" },
    { type: "Protests", color: "#2196F3", icon: "marker" },
    { type: "Economic", color: "#FF9800", icon: "bank" },
    { type: "War", color: "#FF6347", icon: "danger" },
  ];

  const flyToLocation = (longitude: number, latitude: number, zoom: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: zoom,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
      });
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
              { layers: ['country-boundaries-layer'] } // Ensure this layer exists in your style
            );

            if (features && features.length > 0) {
              const feature = features[0];
              const countryName = feature.properties?.name; // Adjust property name as needed

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
        style: 'mapbox://styles/jimvw/cm237n93v000601qp9tts27w9', 
        projection: 'globe',
        center: [13.4, 52.5],
        zoom: isMobile ? 0 : 1
      });

      mapRef.current.on('styleimagemissing', (e) => {
        const id = e.id;
        if (eventTypes.some(eventType => eventType.icon === id)) {
          const img = new Image();
          img.src = `/maki-icons/${id}.svg`;
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

        // Add a click event listener for the map
        mapRef.current?.on('click', (e) => {
          const features = mapRef.current?.queryRenderedFeatures(e.point, {
            layers: ['country-boundaries-layer'] // Ensure this layer exists in your style
          });

          if (features && features.length > 0) {
            const feature = features[0];
            const countryName = feature.properties?.name; // Adjust property name as needed

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

        mapRef.current.addControl(new mapboxgl.NavigationControl());
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
            params: { event_type: eventType.type }
          });
        });

        const results = await Promise.all(promises);
        results.forEach((result, index) => {
          const eventType = eventTypes[index];
          const data = result.data;

          if (mapRef.current) {
            const adjustedData = {
              ...data,
              features: data.features.map((feature: any) => {
                const [lat, lon] = feature.geometry.coordinates;
                return {
                  ...feature,
                  geometry: {
                    ...feature.geometry,
                    coordinates: [lon, lat] // Swap to [longitude, latitude]
                  }
                };
              })
            };

            mapRef.current.addSource(`geojson-events-${eventType.type}`, {
              'type': 'geojson',
              'data': adjustedData
            });

            mapRef.current.addLayer({
              'id': `geojson-events-layer-${eventType.type}`,
              'type': 'circle',
              'source': `geojson-events-${eventType.type}`,
              'paint': {
                'circle-color': eventType.color, // Use the color from eventTypes
                'circle-radius': 10, // Adjust the radius as needed
                'circle-opacity': 0.5 // Adjust the opacity as needed
              }
            });

            mapRef.current.on('click', `geojson-events-layer-${eventType.type}`, (e) => {
              const features = mapRef.current?.queryRenderedFeatures(e.point, {
                layers: [`geojson-events-layer-${eventType.type}`]
              });
            
              if (features && features.length > 0) {
                const feature = features[0];
                const countryName = feature.properties?.name;
                const coordinates = feature.geometry.coordinates;
            
                // Center the map on the clicked feature
                mapRef.current?.flyTo({
                  center: coordinates,
                  zoom: 6, // Adjust zoom level as needed
                  essential: true
                });
                onLocationClick(countryName);
                // resize
              }
            });

            mapRef.current.on('mouseenter', `geojson-events-layer-${eventType.type}`, (e) => {
              if (mapRef.current) {
                mapRef.current.getCanvas().style.cursor = 'pointer';
            
                const features = mapRef.current.queryRenderedFeatures(e.point, {
                  layers: [`geojson-events-layer-${eventType.type}`]
                });
            
                if (features && features.length > 0) {
                  const feature = features[0];
                  const countryName = feature.properties?.name;
                  const eventTypeName = eventType.type;
            
                  new mapboxgl.Popup({ closeButton: false })
                    .setLngLat(feature.geometry.coordinates)
                    .setHTML(`
                      <div class="custom-popup" style="color: black; background-color: white; padding: 5px; border-radius: 5px;">
                        <strong>${eventTypeName} @ ${countryName}</strong>
                      </div>
                    `)
                    .addTo(mapRef.current);
                }
              }
            });

            mapRef.current.on('mouseleave', `geojson-events-layer-${eventType.type}`, () => {
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
          layers: ['country-boundaries-layer']
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

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapContainerRef} className="map-container" style={{ height: '100%' }}></div>
      <div className="absolute bottom-1 left-1 z-10 flex max-w-screen overflow-x-auto space-x-4">
        <div className="flex w-full min-w-8 max-w-sm items-center space-x-2">
          <Input
            className='min-w-8 bg-white dark:bg-black'
            type="text"
            value={inputLocation}
            onChange={(e) => setInputLocation(e.target.value)}
            placeholder="Enter location"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFlyToInputLocation();
              }
            }}
          />
          <Button variant="destructive" onClick={handleFlyToInputLocation} disabled={loading}>
            {loading ? 'Loading...' : 'Fly to..'}
          </Button>
        </div>
        <Button onClick={() => flyToLocation(13.4050, 52.5200, 6)}>Fly to Berlin</Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline"><MapPin /></Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col space-y-2">
              <Button onClick={() => flyToLocation(-77.0369, 38.9072, 6)}>Fly to Washington</Button>
              <Button onClick={() => flyToLocation(34.7661, 31.0461, 6)}>Fly to Israel</Button>
              <Button onClick={() => flyToLocation(30.5238, 50.4500, 6)}>Fly to Kyiv</Button>
              <Button onClick={() => flyToLocation(31.3069, 7.7778, 6)}>Fly to South Sudan</Button>
              <Button onClick={() => flyToLocation(121.5319, 25.0478, 6)}>Fly to Taiwan</Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button onClick={() => setShowLegend(!showLegend)}>
          {showLegend ? 'Hide Legend' : 'Show Legend'}
        </Button>
        {error && <div className="text-red-500">{error}</div>}
      </div>
      {showLegend && <MapLegend />} {/* Conditionally render the MapLegend */}
      {hoveredFeature && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000
          }}
        >
          <pre>{JSON.stringify(hoveredFeature, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Globe;