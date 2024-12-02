import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useGeoJsonStore, EventType } from '@/store/useGeoJsonStore';
import { useFocusStore } from '@/store/useFocusStore';

interface CoreGlobeProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  onLocationClick: (countryName: string) => void;
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
}

const CoreGlobe: React.FC<CoreGlobeProps> = ({ mapContainerRef, onLocationClick, mapRef }) => {
  const { focusType, focusData } = useFocusStore();

  const eventTypes = useGeoJsonStore((state) => state.eventTypes);

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN || '';
    }

    if (mapContainerRef.current && !mapRef.current) {
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/jimvw/cm27kipx600fw01pbg59k9w97', 
            projection: 'globe',
            center: [13.4, 52.5],
        zoom: 3.5
      });

      mapRef.current.on('load', () => {
        initializeGlobe(mapRef.current!);
        updateGeoJsonLayers(mapRef.current!, eventTypes);
      });
    }

    // Cleanup
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapContainerRef, eventTypes]); // Include eventTypes

  const initializeGlobe = (map: mapboxgl.Map) => {
    // Handle map clicks
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['country-boundaries'],
      });
      if (features.length > 0) {
        const countryName = features[0].properties?.name_en;
        onLocationClick(countryName);
      }
    });

    // Add country boundaries layer
    map.addSource('country-boundaries', {
      type: 'vector',
      url: 'mapbox://mapbox.country-boundaries-v1',
    });
    map.addLayer({
      id: 'country-boundaries',
      type: 'fill',
      source: 'country-boundaries',
      'source-layer': 'country_boundaries',
      paint: {
        'fill-color': '#E0E0E0',
        'fill-opacity': 0.5,
        'fill-outline-color': '#B0B0B0',
      },
    });
  };

  const updateGeoJsonLayers = (map: mapboxgl.Map, eventTypes: EventType[]) => {
    eventTypes.forEach(async (eventType) => {
      const { type, geojsonUrl, color, icon, isVisible, zIndex } = eventType;

      const sourceId = `geojson-events-${type}`;
      const clusterLayerId = `clusters-${type}`;
      const unclusteredLayerId = `unclustered-point-${type}`;
      const clusterCountLayerId = `cluster-count-${type}`;

      // Load icon if not already loaded
      if (!map.hasImage(icon)) {
        try {
          const response = await fetch(`/animations/maki-icons/${icon}.svg`);
          const blob = await response.blob();
          const image = await createImageBitmap(blob);
          map.addImage(icon, image);
        } catch (error) {
          console.error(`Error loading icon ${icon}:`, error);
        }
      }

      // If the event type is visible and the source doesn't exist, add it
      if (isVisible && !map.getSource(sourceId)) {
        // Fetch the GeoJSON data
        try {
          const response = await fetch(geojsonUrl);
          const data = await response.json();

          map.addSource(sourceId, {
            type: 'geojson',
            data,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });

          // Add cluster layer
          map.addLayer({
            id: clusterLayerId,
            type: 'circle',
            source: sourceId,
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': color,
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,
                100,
                20,
                750,
                25,
              ],
            },
          });

          // Add unclustered points layer
          map.addLayer({
            id: unclusteredLayerId,
            type: 'symbol',
            source: sourceId,
            filter: ['!', ['has', 'point_count']],
            layout: {
              'icon-image': icon,
              'icon-size': 0.5,
              'icon-allow-overlap': true,
            },
          });

          // Add cluster count labels
          map.addLayer({
            id: clusterCountLayerId,
            type: 'symbol',
            source: sourceId,
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-size': 12,
            },
          });
        } catch (error) {
          console.error(`Error loading GeoJSON data for ${type}:`, error);
        }
      } else if (!isVisible && map.getSource(sourceId)) {
        // If the event type is not visible and the layer exists, remove it
        if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
        if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
        if (map.getLayer(clusterCountLayerId)) map.removeLayer(clusterCountLayerId);
        map.removeSource(sourceId);
      }
    });
  };

  // Handle focus changes (e.g., zoom to a country)
  useEffect(() => {
    if (
      focusType === 'country' &&
      focusData?.name &&
      mapRef.current &&
      typeof focusData.longitude === 'number' &&
      typeof focusData.latitude === 'number'
    ) {
      if (isNaN(focusData.longitude) || isNaN(focusData.latitude)) {
        console.error('Invalid coordinates:', { longitude: focusData.longitude, latitude: focusData.latitude });
        return;
      }

      mapRef.current.flyTo({
        center: [focusData.longitude, focusData.latitude],
        zoom: 5,
        essential: true, // This ensures the animation is considered essential
      });
    }
  }, [focusType, focusData]);

  return null;
};

export default CoreGlobe;
