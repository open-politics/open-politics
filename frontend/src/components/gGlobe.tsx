import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';

import 'mapbox-gl/dist/mapbox-gl.css';

interface GlobeProps {
  geojsonUrl: string;
  onLocationClick: (countryName: string) => void;
}

const Globe: React.FC<GlobeProps> = ({ geojsonUrl, onLocationClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const eventTypes = [
    { type: "Elections", color: "#4CAF50" },
    { type: "Protests", color: "#2196F3" },
    { type: "Economic", color: "#FF9800" },
    { type: "War", color: "#FF6347" },
  ];

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
        zoom: 2
      });

      mapRef.current.on('load', () => {
        setMapLoaded(true);

        mapRef.current?.setFog({
          color: 'rgb(186, 210, 235)', // Lower atmosphere
          'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
          'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
          'space-color': 'rgb(11, 11, 25)', // Background color
          'star-intensity': 0.6 // Background star brightness (default 0.35 at low zooms)
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
    const loadGeoJSONData = async () => {
      try {
        const response = await axios.get('/api/v1/locations/geojson/');
        const data = response.data;
        // console.log('GeoJSON data:', data);

        if (mapRef.current) {
          const adjustedData = {
            ...data,
            features: data.features.map((feature: any) => {
              const [lat, lon] = feature.geometry.coordinates;
              return {
                ...feature,
                geometry: {
                  ...feature.geometry,
                  coordinates: [lon - 0.05, lat] // Subtract 0.1 from the horizontal axis
                }
              };
            })
          };

          mapRef.current.addSource('geojson', {
            'type': 'geojson',
            'data': adjustedData
          });

          mapRef.current.addLayer({
            'id': 'geojson-layer',
            'type': 'circle',
            'source': 'geojson',
            'paint': {
              'circle-radius': {
                  base: 1.5, // Adjust the base to control scaling rate
                  stops: [
                    [5, 6],   // Larger radius at lower zoom levels
                    [12, 10], // Moderate radius at mid zoom levels
                    [22, 50]  // Larger maximum radius at high zoom levels
                  ]
                },
              'circle-color': "#00abff",
              'circle-opacity': 0.8
            },
            'layout': {
              'circle-sort-key': ['get', 'article_count'] // Use article_count to sort
            }
          });

          mapRef.current.on('click', 'geojson-layer', (e) => {
            const features = mapRef.current?.queryRenderedFeatures(e.point, {
              layers: ['geojson-layer']
            });

            if (features && features.length > 0) {
              const feature = features[0];
              const countryName = feature.properties?.name;
              const articles = Array.isArray(feature.properties?.articles) ? feature.properties.articles : [];

              onLocationClick(countryName);

              const articleContent = articles.map((article: any) => 
                `<a href="${article.url}" target="_blank">${article.headline}</a>`
              ).join('<hr style="margin: 10px 0; border: 0; border-top: 1px solid #ccc;">');

              const popupContent = `
                <div class="custom-popup">
                  <strong>${countryName}</strong><br>
                  ${articleContent}
                </div>
              `;

              new mapboxgl.Popup({ closeButton: false })
                .setLngLat(feature.geometry.coordinates)
                .setHTML(popupContent)
                .addTo(mapRef.current);
            }
          });

          mapRef.current.on('mouseenter', 'geojson-layer', (e) => {
            if (mapRef.current) {
              mapRef.current.getCanvas().style.cursor = 'pointer';

              const features = mapRef.current.queryRenderedFeatures(e.point, {
                layers: ['geojson-layer']
              });

              if (features && features.length > 0) {
                const feature = features[0];
                const countryName = feature.properties?.name;

                new mapboxgl.Popup({ closeButton: false })
                  .setLngLat(feature.geometry.coordinates)
                  .setHTML(`<strong>${countryName}</strong>`)
                  .addTo(mapRef.current);
              }
            }
          });

          mapRef.current.on('mouseleave', 'geojson-layer', () => {
            if (mapRef.current) {
              mapRef.current.getCanvas().style.cursor = '';
              const popups = document.getElementsByClassName('mapboxgl-popup');
              while (popups.length > 0) {
                popups[0].remove();
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching GeoJSON:', error);
      }
    };

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
              'layout': {
                'text-field': ['get', 'name'],
                'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                'text-radial-offset': 0.5,
                'text-justify': 'auto',
                'icon-allow-overlap': false,
                'text-allow-overlap': false,
                'icon-ignore-placement': false,
                'text-ignore-placement': false,
                'circle-sort-key': ['get', 'article_count'] // Use article_count to sort
              },
              'paint': {
                'circle-color': eventType.color,
                'circle-radius': {
                    base: 2, // Adjust the base to control scaling rate
                    stops: [
                      [5, 3],  // Increase the radius at lower zoom levels
                      [12, 6], // Adjust the radius at mid zoom levels
                      [22, 100] // Decrease the maximum radius at high zoom levels
                    ]
                },
                'circle-opacity': 1
              }
            });

            mapRef.current.on('click', `geojson-events-layer-${eventType.type}`, (e) => {
              const features = mapRef.current?.queryRenderedFeatures(e.point, {
                layers: [`geojson-events-layer-${eventType.type}`]
              });

              if (features && features.length > 0) {
                const feature = features[0];
                const countryName = feature.properties?.name;
                const eventTypeName = eventType.type;

                onLocationClick(countryName);

                const popupContent = `
                  <div class="custom-popup">
                    <strong>${countryName}</strong><br>
                    <strong>Event Type:</strong> ${eventTypeName}
                  </div>
                `;

                new mapboxgl.Popup({ closeButton: false })
                  .setLngLat(feature.geometry.coordinates)
                  .setHTML(popupContent)
                  .addTo(mapRef.current);
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
                    .setHTML(`<strong>${eventTypeName} @ ${countryName}</strong>`)
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
      loadGeoJSONData();
      loadGeoJSONEventsData();
    }
  }, [mapLoaded]);

  return (
    <div
      style={{ height: '50%', width: '100%' }}
      ref={mapContainerRef}
      className="map-container"
    ></div>
  );
};

export default Globe;