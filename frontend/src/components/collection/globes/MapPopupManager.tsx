import React, { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useGeoDataStore } from '@/zustand_stores/storeGeodata';

interface MapPopupManagerProps {
  map: mapboxgl.Map | null;
  layerIds?: string[];
  onFeatureClick?: (feature: mapboxgl.GeoJSONFeature, lngLat: mapboxgl.LngLat) => void;
  onClusterClick?: (clusterId: number, source: string, coordinates: [number, number]) => void;
  createPopupContent?: (feature: mapboxgl.GeoJSONFeature) => string;
  debug?: boolean; // Add debug mode option
}

/**
 * A reusable component to manage hover and click popups for Mapbox maps
 * Can be used with any Mapbox implementation including gGlobe
 */
const MapPopupManager: React.FC<MapPopupManagerProps> = ({
  map,
  layerIds = [],
  onFeatureClick,
  onClusterClick,
  createPopupContent,
  debug = false
}) => {
  const { setSelectedLocation, setSelectedEventType } = useGeoDataStore();
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null);
  const clickPopupRef = useRef<mapboxgl.Popup | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const lastFeatureIdRef = useRef<string | null>(null);
  
  // Default popup content creator if none provided
  const defaultCreatePopupContent = (feature: mapboxgl.GeoJSONFeature): string => {
    const properties = feature.properties || {};
    const locationName = properties.name || properties.NAME || properties.location_name || 'Unknown Location';
    const eventType = properties.event_type || null;
    const contentCount = properties.content_count || properties.point_count || 0;
    
    let html = `<div class="popup-content">`;
    html += `<h3 class="text-sm font-bold">${locationName}</h3>`;
    
    if (eventType) {
      html += `<p class="text-xs text-muted-foreground">${eventType}</p>`;
    }
    
    if (contentCount > 0) {
      html += `<p class="text-xs mt-1">${contentCount} articles</p>`;
      html += `<button class="popup-view-btn text-xs text-blue-500 hover:text-blue-700 mt-1">View Articles</button>`;
    }
    
    html += `</div>`;
    return html;
  };

  // Debounced function to show hover popup
  const debouncedShowPopup = useCallback((feature: mapboxgl.GeoJSONFeature, lngLat: mapboxgl.LngLat, popupContentCreator: (feature: mapboxgl.GeoJSONFeature) => string) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set a new timeout to show the popup after a delay
    hoverTimeoutRef.current = window.setTimeout(() => {
      if (!map) return;
      
      // Generate a unique ID for the feature to prevent duplicate popups
      const featureId = feature.id?.toString() || 
        `${feature.properties?.id || ''}-${feature.geometry.type}-${
          feature.geometry.type === 'GeometryCollection' 
            ? 'collection' 
            : JSON.stringify((feature.geometry as any).coordinates || [])
        }`;
      
      // Skip if it's the same feature we're already showing
      if (featureId === lastFeatureIdRef.current) return;
      lastFeatureIdRef.current = featureId;
      
      // Close existing hover popup if any
      if (hoverPopupRef.current) {
        hoverPopupRef.current.remove();
      }
      
      // Create new hover popup
      hoverPopupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'map-popup-hover',
        anchor: 'bottom',
        offset: 10,
        maxWidth: '300px'
      })
        .setLngLat(lngLat)
        .setHTML(popupContentCreator(feature))
        .addTo(map);
    }, 100); // 100ms delay to prevent flickering
  }, [map]);

  useEffect(() => {
    if (!map) return;
    
    // Use provided or default popup content creator
    const popupContentCreator = createPopupContent || defaultCreatePopupContent;
    
    // Helper function to check if a layer exists in the map
    const layerExists = (layerId: string): boolean => {
      try {
        return !!map.getLayer(layerId);
      } catch (e) {
        return false;
      }
    };
    
    // Helper function to get all existing layers that match a pattern
    const getMatchingLayers = (pattern: string): string[] => {
      if (!pattern.includes('*')) return layerExists(pattern) ? [pattern] : [];
      
      const regex = new RegExp(pattern.replace('*', '.*'));
      const allLayers: string[] = [];
      
      // Get all layers from the map style
      const style = map.getStyle();
      const layers = style && style.layers ? style.layers : [];
      
      for (const layer of layers) {
        if (layer.id && regex.test(layer.id)) {
          allLayers.push(layer.id);
        }
      }
      
      return allLayers;
    };
    
    // Get all existing layers that match the provided patterns
    const getExistingLayers = (layerPatterns: string[]): string[] => {
      const existingLayers: string[] = [];
      const missingLayers: string[] = [];
      
      for (const pattern of layerPatterns) {
        if (pattern.includes('*')) {
          const matched = getMatchingLayers(pattern);
          existingLayers.push(...matched);
          if (matched.length === 0 && debug) {
            missingLayers.push(pattern);
          }
        } else if (layerExists(pattern)) {
          existingLayers.push(pattern);
        } else {
          missingLayers.push(pattern);
        }
      }
      
      if (debug) {
        console.log('MapPopupManager - Existing layers:', existingLayers);
        if (missingLayers.length > 0) {
          console.warn('MapPopupManager - Missing layers:', missingLayers);
        }
        
        // Log all available layers in the map for debugging
        const mapStyle = map.getStyle();
        const allMapLayers = mapStyle && mapStyle.layers ? mapStyle.layers.map(l => l.id || '') : [];
        console.log('MapPopupManager - All map layers:', allMapLayers);
      }
      
      return existingLayers;
    };
    
    // Determine which layers to monitor (only those that exist)
    const defaultLayers = ['country-boundaries', 'clusters-*', 'unclustered-point-*'];
    const targetLayerPatterns = layerIds.length > 0 ? layerIds : defaultLayers;
    const availableLayers = getExistingLayers(targetLayerPatterns);
    
    // Skip if no layers exist yet
    if (availableLayers.length === 0) {
      console.warn('MapPopupManager: No matching layers found in the map');
      return;
    }
    
    // Handle hover events
    const handleMouseEnter = (e: mapboxgl.MapMouseEvent & any) => {
      try {
        const features = map.queryRenderedFeatures(e.point, {
          layers: availableLayers
        });
        
        if (features.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          
          // Only show popup for the top feature
          const feature = features[0];
          
          // Don't show hover popup for country boundaries
          if (feature.layer?.id === 'country-boundaries') return;
          
          // Use the debounced function to show the popup
          debouncedShowPopup(feature, e.lngLat, popupContentCreator);
        } else {
          // Reset the last feature ID if we're not hovering over any feature
          lastFeatureIdRef.current = null;
          
          // Clear any pending hover timeout
          if (hoverTimeoutRef.current !== null) {
            window.clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
          
          map.getCanvas().style.cursor = '';
        }
      } catch (error) {
        console.error('Error in hover handler:', error);
      }
    };
    
    const handleMouseLeave = () => {
      // Clear any pending hover timeout
      if (hoverTimeoutRef.current !== null) {
        window.clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      
      map.getCanvas().style.cursor = '';
      if (hoverPopupRef.current) {
        hoverPopupRef.current.remove();
        hoverPopupRef.current = null;
      }
      
      // Reset the last feature ID
      lastFeatureIdRef.current = null;
    };
    
    // Handle click events
    const handleClick = (e: mapboxgl.MapMouseEvent & any) => {
      try {
        const features = map.queryRenderedFeatures(e.point, {
          layers: availableLayers
        });
        
        if (debug) {
          console.log('MapPopupManager - Click features:', features);
        }
        
        if (features.length > 0) {
          const feature = features[0];
          const properties = feature.properties || {};
          
          // Handle country boundaries
          if (feature.layer?.id === 'country-boundaries') {
            const countryName = properties.name_en || properties.name || 'Unknown Country';
            setSelectedLocation(countryName);
            
            if (onFeatureClick) {
              onFeatureClick(feature, e.lngLat);
            }
            return;
          }
          
          // Handle clusters
          if (feature.layer?.id?.includes('cluster') && properties.cluster_id) {
            const clusterId = properties.cluster_id;
            const source = feature.source || '';
            const coordinates = (feature.geometry as any).coordinates as [number, number];
            
            if (debug) {
              console.log('MapPopupManager - Cluster clicked:', { clusterId, source, coordinates });
            }
            
            if (onClusterClick) {
              onClusterClick(clusterId, source, coordinates);
            } else {
              // Default cluster click behavior if no custom handler provided
              const mapSource = map.getSource(source);
              if (mapSource) {
                try {
                  // Check if it's a GeoJSONSource with getClusterExpansionZoom method
                  if ('getClusterExpansionZoom' in mapSource) {
                    (mapSource as any).getClusterExpansionZoom(
                      clusterId,
                      (err: Error | null, zoom: number) => {
                        if (err) {
                          if (debug) console.error('Error getting cluster expansion zoom:', err);
                          return;
                        }
                        
                        // Extract longitude and latitude from coordinates for clarity
                        const [lng, lat] = coordinates;
                        
                        if (isNaN(lng) || isNaN(lat)) {
                          console.error('Invalid coordinates:', coordinates);
                          return;
                        }
                        
                        map.flyTo({
                          center: coordinates,
                          zoom: zoom
                        });
                        
                        // Dispatch a custom event that can be listened to elsewhere
                        // Use lng and lat properties instead of coordinates array
                        const event = new CustomEvent('zoomToCluster', {
                          detail: { 
                            clusterId, 
                            source, 
                            lng, 
                            lat, 
                            zoom,
                            locationName: properties.name || properties.location_name || 'Cluster'
                          }
                        });
                        window.dispatchEvent(event);
                      }
                    );
                  } else if (debug) {
                    console.warn('Source does not have getClusterExpansionZoom method:', source);
                  }
                } catch (error) {
                  console.error('Error expanding cluster:', error);
                }
              }
            }
            return;
          }
          
          // Handle individual points
          const locationName = properties.name || properties.location_name || 'Unknown Location';
          const eventType = properties.event_type || null;
          
          if (debug) {
            console.log('MapPopupManager - Point clicked:', { locationName, eventType, properties });
          }
          
          setSelectedLocation(locationName);
          if (eventType) {
            setSelectedEventType(eventType);
          }
          
          if (onFeatureClick) {
            onFeatureClick(feature, e.lngLat);
          }
          
          // Create a more detailed popup for clicked points
          if (clickPopupRef.current) {
            clickPopupRef.current.remove();
          }
          
          clickPopupRef.current = new mapboxgl.Popup({
            closeButton: true,
            className: 'map-popup-click',
            maxWidth: '350px',
            anchor: 'bottom',
            offset: 15
          })
            .setLngLat(e.lngLat)
            .setHTML(popupContentCreator(feature))
            .addTo(map);
            
          // Add event listener to the "View Articles" button
          setTimeout(() => {
            const viewBtn = document.querySelector('.popup-view-btn');
            if (viewBtn) {
              viewBtn.addEventListener('click', () => {
                setSelectedLocation(locationName);
                if (eventType) {
                  setSelectedEventType(eventType);
                }
                // Close the popup after clicking the button
                if (clickPopupRef.current) {
                  clickPopupRef.current.remove();
                }
              });
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error in click handler:', error);
      }
    };
    
    // Add event listeners
    map.on('mousemove', handleMouseEnter);
    map.on('mouseleave', handleMouseLeave);
    map.on('click', handleClick);
    
    // Cleanup
    return () => {
      // Clear any pending hover timeout
      if (hoverTimeoutRef.current !== null) {
        window.clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      
      if (hoverPopupRef.current) {
        hoverPopupRef.current.remove();
      }
      if (clickPopupRef.current) {
        clickPopupRef.current.remove();
      }
      
      map.off('mousemove', handleMouseEnter);
      map.off('mouseleave', handleMouseLeave);
      map.off('click', handleClick);
    };
  }, [map, layerIds, onFeatureClick, onClusterClick, createPopupContent, setSelectedLocation, setSelectedEventType, debug, debouncedShowPopup]);

  return null;
};

export default MapPopupManager;