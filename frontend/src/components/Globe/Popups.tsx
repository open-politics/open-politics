// components/Globe/Popups.tsx

import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const Popups: React.FC = () => {
  const mapRef = React.useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;

      const layersWithPopups = [
        { layerId: 'protests-unclustered', getContent: getProtestPopupContent },
        { layerId: 'elections-unclustered', getContent: getElectionPopupContent },
        { layerId: 'wars-unclustered', getContent: getWarPopupContent },
        // Add more layers as needed
      ];

      layersWithPopups.forEach(({ layerId, getContent }) => {
        map.on('mouseenter', layerId, (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
          if (!features.length) return;
          const feature = features[0];

          const popupContent = getContent(feature);

          new mapboxgl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setHTML(popupContent)
            .addTo(map);
        });

        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
      });
    }
  }, []);

  const getProtestPopupContent = (feature: mapboxgl.MapboxGeoJSONFeature) => {
    // Generate HTML content for protest popup
    return `<h3>${feature.properties.title}</h3>`;
  };

  const getElectionPopupContent = (feature: mapboxgl.MapboxGeoJSONFeature) => {
    // Generate HTML content for election popup
    return `<h3>${feature.properties.title}</h3>`;
  };

  const getWarPopupContent = (feature: mapboxgl.MapboxGeoJSONFeature) => {
    // Generate HTML content for war popup
    return `<h3>${feature.properties.title}</h3>`;
  };

  return null;
};

export default Popups;
