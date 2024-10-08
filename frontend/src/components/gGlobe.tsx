import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

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

const Globe: React.FC<GlobeProps> = ({ geojsonUrl, onLocationClick, onCountryZoom }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = 'pk.eyJ1IjoiamltdnciLCJhIjoiY20xd2U3Z2pqMGprdDJqczV2OXJtMTBoayJ9.hlSx0Nc19j_Z1NRgyX7HHg';
    }

    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        projection: 'globe',
        center: [0, 0],
        zoom: 2
      });

      mapRef.current.on('load', () => {
        setMapLoaded(true);
      });
      mapRef.current.addControl(new mapboxgl.NavigationControl()); 
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      if (!mapRef.current.getSource('geojson-data')) {
        mapRef.current.addSource('geojson-data', {
          type: 'geojson',
          data: geojsonUrl
        });

        // Fetch and process GeoJSON data to list prominent locations
        fetch(geojsonUrl)
          .then(response => response.json())
          .then(data => {
            const features = data.features;
            const prominentLocations = features
              .map(feature => ({
                name: feature.properties.name,
                articleCount: feature.properties.article_count
              }))
              .sort((a, b) => b.articleCount - a.articleCount)
              .slice(0, 10); // Get top 10 locations

            console.log('Prominent Locations:', prominentLocations);

            // Add dynamic image markers
            for (const feature of features) {
              const el = document.createElement('div');
              const width = 50; // Example size, adjust as needed
              const height = 50;
              el.className = 'marker';
              el.style.backgroundImage = `url(https://picsum.photos/id/${feature.properties.imageId}/${width}/${height})`;
              el.style.width = `${width}px`;
              el.style.height = `${height}px`;
              el.style.backgroundSize = '100%';
              el.style.borderRadius = '50%';
              el.style.cursor = 'pointer';

              el.addEventListener('click', () => {
                window.alert(feature.properties.name);
              });

              new mapboxgl.Marker(el)
                .setLngLat(feature.geometry.coordinates)
                .addTo(mapRef.current);
            }
          })
          .catch(error => console.error('Error fetching GeoJSON:', error));

        // Load a custom marker image
        mapRef.current.loadImage(
          'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
          (error, image) => {
            if (error) throw error;
            mapRef.current.addImage('custom-marker', image);

            // Add a symbol layer for point features
            mapRef.current.addLayer({
              id: 'geojson-layer',
              type: 'symbol',
              source: 'geojson-data',
              layout: {
                'icon-image': 'custom-marker',
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-offset': [0, 1.25],
                'text-anchor': 'top'
              }
            });
          }
        );

        mapRef.current.on('click', 'geojson-layer', (e) => {
          if (e.features && e.features[0].properties) {
            const { name, latitude, longitude } = e.features[0].properties;
            onLocationClick(name);
            onCountryZoom(latitude, longitude, name);
          }
        });

        const secondsPerRevolution = 120;
        const maxSpinZoom = 5;
        const slowSpinZoom = 3;

        let userInteracting = true;
        let spinEnabled = false;

        const spinGlobe = () => {
          if (mapRef.current) {
            const zoom = mapRef.current.getZoom();
            if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
              let distancePerSecond = 360 / secondsPerRevolution;
              if (zoom > slowSpinZoom) {
                const zoomDif =
                  (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
                distancePerSecond *= zoomDif;
              }
              const center = mapRef.current.getCenter();
              center.lng -= distancePerSecond;
              mapRef.current.easeTo({ center, duration: 1000, easing: (n) => n });
            }
          }
        };

        mapRef.current.on('mousedown', () => {
          userInteracting = true;
        });

        mapRef.current.on('dragend', () => {
          userInteracting = false;
          spinGlobe();
        });
        mapRef.current.on('pitchend', () => {
          userInteracting = false;
          spinGlobe();
        });
        mapRef.current.on('rotateend', () => {
          userInteracting = false;
          spinGlobe();
        });

        const btnSpin = document.getElementById('btn-spin');
        if (btnSpin) {
          btnSpin.addEventListener('click', (e) => {
            spinEnabled = !spinEnabled;
            if (spinEnabled) {
              spinGlobe();
              if (e.target instanceof HTMLElement) {
                e.target.innerHTML = 'Pause rotation';
              }
            } else {
              mapRef.current?.stop();
              if (e.target instanceof HTMLElement) {
                e.target.innerHTML = 'Start rotation';
              }
            }
          });
        }
      }
    }
  }, [mapLoaded, geojsonUrl, onLocationClick, onCountryZoom]);

  return (
    <div
      style={{ height: '50vh', width: '100%' }}
      ref={mapContainerRef}
      className="map-container"
    ></div>
  );
};

export default Globe;