'use client'

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle
} from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, Locate, List, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import "mapbox-gl/dist/mapbox-gl.css";
import * as d3 from "d3";
import MapLegend from "./MapLegend";
import { useCoordinatesStore } from "@/zustand_stores/storeCoordinates";
import { useArticleTabNameStore } from "@/hooks/useArticleTabNameStore";
import { useLocationData } from "@/hooks/useLocationData";
import { useTheme } from "next-themes";
import useGeocode from "@/hooks/useGeocder";
import LottiePlaceholder from "@/components/ui/lottie-placeholder";

// Distance used by Mapbox for clustering
const CLUSTER_RADIUS = 30;

// Helper to map location type to a zoom level
type LocationType = "continent" | "country" | "locality" | "region" | "city" | "address";

const getZoomLevelForLocation = (locationType: LocationType): number => {
  const zoomLevels: Record<LocationType, number> = {
    continent: 2,
    country: 4,
    region: 5,
    locality: 6,
    city: 11,
    address: 12,
  };
  return zoomLevels[locationType] || 4;
};

// Calculate a somewhat dynamic zoom level based on bounding box area
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

interface GlobeProps {
  geojsonUrl: string;
  onLocationClick: (locationName: string, eventType?: string) => void;
  coordinates?: { latitude: number; longitude: number };
  onBboxChange?: (bbox: number[] | null) => void;
}

const Globe = forwardRef<any, GlobeProps>(
  ({ geojsonUrl, onLocationClick, coordinates, onBboxChange }, ref) => {
    // Refs and states
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    const [mapLoaded, setMapLoaded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showLegend, setShowLegend] = useState(false);
    const [hoveredFeature, setHoveredFeature] = useState<any>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentBbox, setCurrentBbox] = useState<number[] | null>(null);
    const setActiveTab = useArticleTabNameStore((state) => state.setActiveTab);
    const [isSpinning, setIsSpinning] = useState(true);
    const spinningRef = useRef<number | null>(null);
    const [isRoutePlaying, setIsRoutePlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [controlsOpen, setControlsOpen] = useState(false);

    const { latitude, longitude } = useCoordinatesStore();
    const { theme } = useTheme();

    const [inputLocation, setInputLocation] = useState("");
    const { geocodeLocation, loading, error } = useGeocode();

    // To avoid reloading geoJSON on every theme change, keep a flag
    const [geojsonLoaded, setGeojsonLoaded] = useState(false);

    // Modify the eventTypes array to use simpler icon names
    const eventTypes = [
      {
        type: "Protests",
        color: theme === "dark" ? "#FF6B6B" : "#E63946",
        icon: "protest",
        zIndex: 51,
      },
      {
        type: "Elections",
        color: theme === "dark" ? "#4ECDC4" : "#2A9D8F",
        icon: "ballot",
        zIndex: 51,
      },
      {
        type: "Politics",
        color: theme === "dark" ? "#95A5A6" : "#6C757D",
        icon: "politics",
        zIndex: 51,
      },
      {
        type: "Economic",
        color: theme === "dark" ? "#FFD93D" : "#F4A261",
        icon: "economy",
        zIndex: 51,
      },
      {
        type: "Social",
        color: theme === "dark" ? "#6C5CE7" : "#4361EE",
        icon: "social",
        zIndex: 51,
      },
      {
        type: "Crisis",
        color: theme === "dark" ? "#FF8C00" : "#E67E22",
        icon: "crisis",
        zIndex: 51,
      },
      {
        type: "War",
        color: theme === "dark" ? "#FF4757" : "#DC2626",
        icon: "new_war",
        zIndex: 51,
      },
    ];

    // A couple of example routes
    const routes = [
      {
        name: "Global Tour",
        locations: [
          {
            name: "Berlin",
            coordinates: [13.4050, 52.5200],
            description: "Capital of Germany",
          },
          {
            name: "Washington D.C.",
            coordinates: [-77.0369, 38.9072],
            description: "Capital of USA",
          },
          {
            name: "Tokyo",
            coordinates: [139.6917, 35.6895],
            description: "Capital of Japan",
          },
          {
            name: "Sydney",
            coordinates: [151.2093, -33.8688],
            description: "Largest city in Australia",
          },
        ],
      },
      {
        name: "Conflict Zones",
        locations: [
          { name: "Kyiv", coordinates: [30.5238, 50.4547], description: "Capital of Ukraine" },
          { name: "Damascus", coordinates: [36.2786, 33.5138], description: "Capital of Syria" },
          { name: "Kabul", coordinates: [69.2075, 34.5553], description: "Capital of Afghanistan" },
          { name: "Baghdad", coordinates: [44.3661, 33.3152], description: "Capital of Iraq" },
        ],
      },
    ];

    // Minimally used location shortcuts
    const locationButtons = ["Germany", "Japan", "USA", "Ukraine", "Israel", "Taiwan"];

    // Visible layers state (checkbox toggles)
    const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(() => {
      // By default, maybe War & Politics are visible; the rest are off
      const initialLayers: Record<string, boolean> = {};
      for (const et of eventTypes) {
        // example defaults
        initialLayers[et.type] = et.type === "War" || et.type === "Politics";
      }
      return initialLayers;
    });

    // Modify the addIconsToMap function to use theme-specific icons
    const addIconsToMap = useCallback(() => {
      if (!mapRef.current) return;
      
      eventTypes.forEach((eventType) => {
        const iconName = eventType.icon;
        // Get theme from current state rather than prop
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        const themePrefix = currentTheme === 'dark' ? '_light' : '_dark';
        const imageUrl = `/animations/maki-icons/${iconName}${themePrefix}.svg`;

        // Remove existing image before adding new one
        if (mapRef.current && mapRef.current.hasImage(iconName)) {
          mapRef.current.removeImage(iconName);
        }

        const img = new Image();
        img.onload = () => {
          // Double check the image doesn't exist and map is still valid
          if (mapRef.current && !mapRef.current.hasImage(iconName)) {
            try {
              mapRef.current.addImage(iconName, img);
            } catch (error) {
              console.warn(`Failed to add image ${iconName}:`, error);
            }
          }
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${imageUrl}`);
        };
        img.src = imageUrl;
      });
    }, [eventTypes]);

    /**
     * LOAD GEOJSON (EVENTS) & SETUP CLUSTER LAYERS
     * Called once after the map is loaded (or manually on "Reload" button).
     */
    const loadGeoJSONEventsData = useCallback(async () => {
      if (!mapRef.current || !mapLoaded) return;
      setIsLoading(true);

      try {
        // Check if data is already loaded
        const firstSourceId = `geojson-events-${eventTypes[0].type}`;
        if (mapRef.current.getSource(firstSourceId)) {
          setIsLoading(false);
          return; // Data already loaded
        }

        // Load data for each event type in parallel
        const promises = eventTypes.map((eventType) => {
          return axios.get(`/api/v2/geo/geojson_events`, {
            params: {
              event_type: eventType.type,
            },
          });
        });
        const results = await Promise.all(promises);

        // Sort eventTypes by zIndex for layering
        const sortedEventTypes = [...eventTypes].sort((a, b) => b.zIndex - a.zIndex);

        // Make sure icons are available:
        await Promise.all(
          eventTypes.map(
            (eventType) =>
              new Promise<void>((resolve) => {
                const checkInterval = setInterval(() => {
                  if (mapRef.current?.hasImage(eventType.icon)) {
                    clearInterval(checkInterval);
                    resolve();
                  }
                }, 50);
              })
          )
        );

        // Now create each cluster/unclustered layer
        sortedEventTypes.forEach((eventType) => {
          const indexOfData = eventTypes.findIndex((et) => et.type === eventType.type);
          const result = results[indexOfData];
          const data = result?.data;
          if (!data || !mapRef.current) return;

          const sourceId = `geojson-events-${eventType.type}`;

          // If the source (and layers) exist from a previous load, remove them first
          if (mapRef.current.getSource(sourceId)) {
            ["clusters-", "unclustered-point-", "cluster-count-"].forEach((prefix) => {
              const layerId = `${prefix}${eventType.type}`;
              if (mapRef.current?.getLayer(layerId)) {
                mapRef.current.removeLayer(layerId);
              }
            });
            mapRef.current.removeSource(sourceId);
          }

          // Adjust the feature properties for easier usage
          const adjustedData = {
            ...data,
            features: data.features.map((feature: any) => {
              let contents;
              try {
                contents =
                  typeof feature.properties.contents === "string"
                    ? JSON.parse(feature.properties.contents)
                    : feature.properties.contents;
              } catch (error) {
                contents = [];
              }
              return {
                ...feature,
                properties: {
                  ...feature.properties,
                  contents: contents,
                },
              };
            }),
          };

          // Add as a cluster source
          mapRef.current.addSource(sourceId, {
            type: "geojson",
            data: adjustedData,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: CLUSTER_RADIUS,
          });

          // Add the cluster layer (circles)
          mapRef.current.addLayer({
            id: `clusters-${eventType.type}`,
            type: "circle",
            source: sourceId,
            filter: ["has", "point_count"],
            paint: {
              "circle-color": eventType.color,
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "point_count"],
                1,
                15,
                50,
                30,
                200,
                40,
              ],
              "circle-opacity": 1,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            },
          });

          // Single unclustered points
          mapRef.current.addLayer({
            id: `unclustered-point-${eventType.type}`,
            type: "symbol",
            source: sourceId,
            filter: ["!", ["has", "point_count"]],
            layout: {
              "icon-image": eventType.icon,
              "icon-size": 1,
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
              "symbol-placement": "point",
              "symbol-spacing": 50,
              "icon-padding": 5,
              "symbol-sort-key": ["get", "content_count"],
              "icon-pitch-alignment": "viewport",
              "icon-rotation-alignment": "viewport",
              "text-size": 18,
              "text-offset": [0, 0],
              "text-allow-overlap": true,
              "text-ignore-placement": true,
              "text-anchor": "top",
            },
            paint: {
              "text-color": eventType.color,
              "text-halo-color": "#fff",
              "text-halo-width": 1,
            },
          });

          // Cluster count label
          mapRef.current.addLayer({
            id: `cluster-count-${eventType.type}`,
            type: "symbol",
            source: sourceId,
            filter: ["has", "point_count"],
            layout: {
              "text-field": "{point_count_abbreviated}",
              "text-size": 14,
              "text-allow-overlap": true,
            },
            paint: {
              "text-color": "#ffffff",
            },
          });

          // On hover for cluster => quick preview popup
          mapRef.current.on("mouseenter", `clusters-${eventType.type}`, async (e) => {
            if (!mapRef.current || !e.features || !e.features[0]) return;

            const clusterId = e.features[0].properties?.cluster_id;
            const clusterCount = e.features[0].properties?.point_count;
            const source = mapRef.current.getSource(sourceId) as mapboxgl.GeoJSONSource;
            const coordinates = (e.features[0].geometry as any)?.coordinates;

            mapRef.current.getCanvas().style.cursor = "pointer";

            if (clusterId && clusterCount && source && coordinates) {
              try {
                const leaves = await new Promise<any[]>((resolve, reject) => {
                  (source as any).getClusterLeaves(clusterId, 5, 0, (err: any, feats: any) => {
                    if (err) reject(err);
                    resolve(feats);
                  });
                });

                const popupContent = `
                  <div class="w-[250px] bg-background/70 p-0">
                    <div class="flex flex-col space-y-1.5 p-3">
                      <div class="flex items-center justify-between">
                        <h3 class="font-semibold tracking-tight text-sm">
                          ${eventType.type} Cluster
                        </h3>
                        <span class="text-xs">
                          ${clusterCount} events
                        </span>
                      </div>
                    </div>
                    <div class="p-3 pt-0">
                      <div class="max-h-[150px] overflow-y-auto custom-scrollbar">
                        ${leaves
                          .map((feature) => {
                            const locationName = feature.properties.location_name;
                            const contentCount = feature.properties.content_count;
                            return `
                            <div class="mb-2 last:mb-0 text-sm">
                              <div class="flex items-center justify-between">
                                <span>📍${locationName}</span>
                                <span class="text-xs text-slate-600">${contentCount} items</span>
                              </div>
                            </div>
                          `;
                          })
                          .join("")}
                        ${
                          clusterCount > 5
                            ? `<div class="text-xs mt-2 pt-2 border-t">And ${
                                clusterCount - 5
                              } more ...</div>`
                            : ""
                        }
                      </div>
                    </div>
                  </div>
                `;

                const popup = new mapboxgl.Popup({
                  closeButton: false,
                  maxWidth: "none",
                  className: "custom-popup-container hover-popup",
                })
                  .setLngLat(coordinates ?? [0, 0])
                  .setHTML(popupContent)
                  .addTo(mapRef.current);

                // Keep the popup open if hovered
                const popupElement = popup.getElement();
                let popupTimeout = setTimeout(() => {
                  popup.remove();
                }, 15000);

                popupElement?.addEventListener("mouseenter", () => {
                  clearTimeout(popupTimeout);
                  popupElement.style.animation = "none";
                });
                popupElement?.addEventListener("mouseleave", () => {
                  if (popupElement) {
                    popupElement.style.animation = "";
                    popupTimeout = setTimeout(() => {
                      popup.remove();
                    }, 4500);
                  }
                });
              } catch (error) {
                console.error("Error getting cluster preview:", error);
              }
            }
          });

          mapRef.current.on("mouseleave", `clusters-${eventType.type}`, () => {
            if (mapRef.current) {
              mapRef.current.getCanvas().style.cursor = "";
              const popups = document.getElementsByClassName("hover-popup");
              while (popups.length > 0) {
                popups[0].remove();
              }
            }
          });

          // Single event hover => popup
          mapRef.current.on("mouseenter", `unclustered-point-${eventType.type}`, (e) => {
            if (!mapRef.current || !e.point) return;
            mapRef.current.getCanvas().style.cursor = "pointer";

            const features = mapRef.current.queryRenderedFeatures(e.point, {
              layers: [`unclustered-point-${eventType.type}`],
            });
            if (features && features.length > 0) {
              const feature = features[0];
              const locationName = feature.properties?.location_name;
              const eventTypeName = eventType.type;
              const contentCount = feature.properties?.content_count || 0;
              let contents = feature.properties?.contents || [];

              if (typeof contents === "string") {
                try {
                  contents = JSON.parse(contents);
                } catch {
                  contents = [];
                }
              }
              const validContents = Array.isArray(contents)
                ? contents.filter((c) => c?.url && c?.title && c?.insertion_date)
                : [];

              const popupContent = `
                <div class="w-[300px] p-0 border-none bg-background/70">
                  <div class="rounded-xl">
                    <div class="flex flex-col space-y-1.5 p-4">
                      <div class="flex items-center justify-between">
                        <h3 class="font-semibold tracking-tight">
                          <a href="#" class="hover:underline" onclick="window.dispatchEvent(new CustomEvent('setLocation', {detail: '${locationName}'}))">
                            ${eventTypeName} @ 📍 ${locationName}
                          </a>
                        </h3>
                        <span class="text-sm text-green-500">${contentCount} items</span>
                      </div>
                    </div>
                    <div class="p-4 pt-0">
                      <div class="max-h-[200px] overflow-y-auto custom-scrollbar">
                        ${
                          validContents.length > 0
                            ? validContents
                                .map(
                                  (content: any) => `
                                  <div class="mb-3 last:mb-0 border-b border-border pb-2 last:border-0 last:pb-0">
                                    <a href="#" onclick="window.dispatchEvent(new CustomEvent('setLocation', {detail: '${locationName}'}))" class="text-sm hover:underline block">
                                      ${content.title}
                                    </a>
                                    <div class="flex items-center gap-2 mt-1 text-xs">
                                      <span>${new Date(content.insertion_date).toLocaleDateString()}</span>
                                      ${
                                        content.source
                                          ? `<span class="inline-flex items-center"><span class="mx-1">•</span>${content.source}</span>`
                                          : ""
                                      }
                                    </div>
                                  </div>
                                `
                                )
                                .join("")
                            : `<div class="text-sm py-2">No content available</div>`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              `;

              new mapboxgl.Popup({
                closeButton: true,
                maxWidth: "none",
                offset: [0, -15],
                className: "custom-popup-container hover-popup",
              })
                .setLngLat(feature.geometry?.coordinates ?? [0, 0])
                .setHTML(popupContent)
                .addTo(mapRef.current);
            }
          });

          mapRef.current.on("mouseleave", `unclustered-point-${eventType.type}`, () => {
            if (mapRef.current) {
              mapRef.current.getCanvas().style.cursor = "";
              const popups = document.getElementsByClassName("hover-popup");
              while (popups.length > 0) {
                popups[0].remove();
              }
            }
          });

          // Single event click => open location details
          mapRef.current.on("click", `unclustered-point-${eventType.type}`, (e) => {
            if (!mapRef.current || !e.point) return;
            const features = mapRef.current.queryRenderedFeatures(e.point, {
              layers: [`unclustered-point-${eventType.type}`],
            });
            if (!features || features.length === 0) return;

            const feature = features[0];
            const locationName = feature.properties?.location_name;
            if (!locationName) return;
            onLocationClick(locationName, eventType.type);
          });

          // Clicking a cluster => bigger popup with breakdown
          mapRef.current.on("click", `clusters-${eventType.type}`, async (e) => {
            if (!mapRef.current || !e.features || e.features.length === 0) return;
            const feature = e.features[0];
            const coords = (feature.geometry as any)?.coordinates as [number, number] | undefined;

            if (coords) {
              const clusterId = feature.properties?.cluster_id;
              const source = mapRef.current.getSource(sourceId) as mapboxgl.GeoJSONSource;
              if (!source) return;

              source.getClusterLeaves(clusterId, Infinity, 0, function (err, leafFeatures) {
                if (err) {
                  console.error("Error fetching cluster leaves:", err);
                  return;
                }

                // Collect all contents from the cluster leaves
                let allContents: any[] = [];
                leafFeatures?.forEach((lf: any) => {
                  let contents = lf.properties?.contents || lf.properties?.properties?.contents;
                  if (typeof contents === "string") {
                    try {
                      contents = JSON.parse(contents);
                    } catch {
                      contents = [];
                    }
                  }
                  if (Array.isArray(contents)) {
                    allContents = allContents.concat(contents);
                  }
                });

                // Create a simple list of articles
                const popupContainer = document.createElement("div");
                popupContainer.className = "p-2";
                popupContainer.innerHTML = `<h3 class="font-semibold mb-2 text-sm">Articles in Cluster</h3>`;

                if (allContents.length > 0) {
                  const articleList = document.createElement("ul");
                  articleList.className = "list-disc pl-5";
                  allContents.slice(0, 10).forEach((content: any) => { // Limit to 10 articles
                    const listItem = document.createElement("li");
                    listItem.className = "text-sm";
                    const link = document.createElement("a");
                    link.href = "#";
                    link.textContent = content.title;
                    link.className = "hover:underline";
                    link.onclick = () => {
                      onLocationClick(content.location_name, eventType.type); // Assuming location_name exists
                    };
                    listItem.appendChild(link);
                    articleList.appendChild(listItem);
                  });
                  popupContainer.appendChild(articleList);
                  if (allContents.length > 10) {
                    popupContainer.innerHTML += `<div class="text-xs mt-2">...and ${allContents.length - 10} more.</div>`;
                  }
                } else {
                  popupContainer.innerHTML += `<div class="text-sm">No articles available in this cluster.</div>`;
                }

                new mapboxgl.Popup({ closeButton: true, maxWidth: "none" })
                  .setLngLat(coords ?? [0, 0])
                  .setDOMContent(popupContainer)
                  .addTo(mapRef.current!);
              });
            }
          });
        });

        setGeojsonLoaded(true);
      } catch (error) {
        console.error("Error fetching GeoJSON events data:", error);
      } finally {
        setIsLoading(false);
      }
    }, [eventTypes, onLocationClick]);

    /**
     * CREATE A SIMPLE SPIKE CHART USING D3
     */
    const createClusterSpikeChart = useCallback(
      (
        typeMap: Record<string, { count: number; color: string }>,
        contentsArrays: any[]
      ) => {
        const container = document.createElement("div");
        container.style.width = "250px";

        const data = Object.entries(typeMap).map(([k, v]) => ({ type: k, ...v }));
        data.sort((a, b) => b.count - a.count);
        const maxVal = d3.max(data, (d) => d.count) || 1;

        const margin = { top: 10, right: 10, bottom: 10, left: 10 };
        const width = 230;
        const height = 100;

        const svg = d3
          .select(container)
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .style("overflow", "visible");

        const xScale = d3
          .scaleBand()
          .domain(data.map((d) => d.type))
          .range([margin.left, width - margin.right])
          .padding(0.3);

        const yScale = d3.scaleLinear().domain([0, maxVal]).range([height, 0]);

        const g = svg
          .append("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);

        g.selectAll(".spike")
          .data(data)
          .enter()
          .append("path")
          .attr("class", "spike")
          .attr("transform", (d) => {
            const x = xScale(d.type) ?? 0;
            return `translate(${x + (xScale.bandwidth() ?? 0) / 2}, ${yScale(d.count)})`;
          })
          .attr("d", (d) => {
            const spikeHeight = (d.count / maxVal) * 80;
            return `M${-xScale.bandwidth()! / 4},0 L0,${-spikeHeight} L${
              xScale.bandwidth()! / 4
            },0`;
          })
          .style("fill", (d) => d.color || "#777")
          .style("stroke", "#333")
          .style("stroke-width", "0.5px");

        g.selectAll(".label")
          .data(data)
          .enter()
          .append("text")
          .attr("class", "label")
          .attr("x", (d) => (xScale(d.type) ?? 0) + (xScale.bandwidth() ?? 0) / 2)
          .attr("y", (d) => yScale(d.count) - 5)
          .attr("text-anchor", "middle")
          .style("fill", "#333")
          .style("font-size", "10px")
          .text((d) => d.count);

        return container;
      },
      []
    );

    /**
     * HELPERS & EVENT HANDLERS
     */
    const flyToLocation = useCallback(
      (
        longitude: number,
        latitude: number,
        zoom: number,
        locationType?: LocationType
      ) => {
        if (!mapRef.current) return;
        if (isNaN(longitude) || isNaN(latitude)) {
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
      },
      []
    );

    const handleFlyToInputLocation = async () => {
      setIsSpinning(false);
      const result = await geocodeLocation(inputLocation);
      if (result) {
        const { longitude, latitude, bbox, type } = result;
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.resize();
            if (bbox) {
              highlightBbox(bbox, type || "locality");
            } else {
              flyToLocation(longitude, latitude, 6, type);
            }
          }
          setTimeout(() => {
            onLocationClick(inputLocation, type);
          }, 600);
        }, 100);
      }
    };

    const handleLocationButtonClick = async (locName: string) => {
      setIsSpinning(false);
      const result = await geocodeLocation(locName);
      if (result) {
        const { longitude, latitude, bbox, type } = result;
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.resize();
            if (bbox) {
              highlightBbox(bbox, type || "locality");
            } else {
              flyToLocation(longitude, latitude, 6, type);
            }
          }
          setTimeout(() => {
            onLocationClick(locName, type);
          }, 600);
        }, 100);
      }
    };

    const toggleLayerVisibility = useCallback(
      (layerId: string, visibility: "visible" | "none") => {
        if (mapRef.current && mapRef.current.getLayer(layerId)) {
          mapRef.current.setLayoutProperty(layerId, "visibility", visibility);
        }
      },
      []
    );

    const highlightBbox = useCallback(
      (bbox: string[] | number[], locationType: LocationType = "locality", dynamicZoom?: number) => {
        if (!mapRef.current || !bbox || bbox.length !== 4) return;
        const numericBbox = bbox.map((coord) =>
          typeof coord === "string" ? parseFloat(coord) : coord
        );
        const maxZoom = dynamicZoom || getZoomLevelForLocation(locationType);

        if (mapRef.current.getLayer("bbox-fill")) {
          mapRef.current.removeLayer("bbox-fill");
        }
        if (mapRef.current.getLayer("bbox-outline")) {
          mapRef.current.removeLayer("bbox-outline");
        }
        if (mapRef.current.getSource("bbox")) {
          mapRef.current.removeSource("bbox");
        }

        const bboxPolygon: mapboxgl.GeoJSONSourceOptions["data"] = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [numericBbox[0], numericBbox[1]],
                [numericBbox[2], numericBbox[1]],
                [numericBbox[2], numericBbox[3]],
                [numericBbox[0], numericBbox[3]],
                [numericBbox[0], numericBbox[1]],
              ],
            ],
          },
          properties: {},
        };

        mapRef.current.addSource("bbox", {
          type: "geojson",
          data: bboxPolygon,
        });

        mapRef.current.addLayer({
          id: "bbox-fill",
          type: "fill",
          source: "bbox",
          paint: {
            "fill-color": "#000000",
            "fill-opacity": 0.1,
          },
        });

        mapRef.current.addLayer({
          id: "bbox-outline",
          type: "line",
          source: "bbox",
          paint: {
            "line-color": "#000000",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });

        mapRef.current.fitBounds(
          [
            [numericBbox[0], numericBbox[1]],
            [numericBbox[2], numericBbox[3]],
          ],
          {
            padding: 50,
            duration: 2000,
            maxZoom,
            minZoom: Math.max(1, maxZoom - 1.5),
          }
        );
        setCurrentBbox(numericBbox);
        if (onBboxChange) {
          onBboxChange(numericBbox);
        }
      },
      [onBboxChange]
    );

    // IMPERATIVE HANDLE
    useImperativeHandle(ref, () => ({
      zoomToLocation: (
        lat: number,
        lng: number,
        bbox?: string[] | number[],
        locationType: LocationType = "country",
        dynamicZoom?: number
      ) => {
        if (isNaN(lat) || isNaN(lng)) {
          return;
        }
        if (!mapRef.current) return;

        if (bbox && bbox.length === 4) {
          const numericBbox = bbox.map((coord) =>
            typeof coord === "string" ? parseFloat(coord) : coord
          );
          const calcZoom = calculateZoomLevel(numericBbox);

          if (mapRef.current.getLayer("bbox-fill")) {
            mapRef.current.removeLayer("bbox-fill");
          }
          if (mapRef.current.getLayer("bbox-outline")) {
            mapRef.current.removeLayer("bbox-outline");
          }
          if (mapRef.current.getSource("bbox")) {
            mapRef.current.removeSource("bbox");
          }

          mapRef.current.addSource("bbox", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [numericBbox[0], numericBbox[1]],
                    [numericBbox[2], numericBbox[1]],
                    [numericBbox[2], numericBbox[3]],
                    [numericBbox[0], numericBbox[3]],
                    [numericBbox[0], numericBbox[1]],
                  ],
                ],
              },
              properties: {},
            },
          });

          mapRef.current.addLayer({
            id: "bbox-fill",
            type: "fill",
            source: "bbox",
            paint: {
              "fill-color": "#000000",
              "fill-opacity": 0.1,
            },
          });

          mapRef.current.addLayer({
            id: "bbox-outline",
            type: "line",
            source: "bbox",
            paint: {
              "line-color": "#000000",
              "line-width": 2,
              "line-dasharray": [2, 2],
            },
          });

          mapRef.current.fitBounds(
            [
              [numericBbox[0], numericBbox[1]],
              [numericBbox[2], numericBbox[3]],
            ],
            {
              padding: 100,
              duration: 2000,
              maxZoom: calcZoom,
              minZoom: Math.max(1, calcZoom - 1),
            }
          );
        } else {
          flyToLocation(lng, lat, dynamicZoom || 6, locationType);
        }
      },
    }));

    // Separate map initialization from theme changes
    useEffect(() => {
      if (!mapboxgl.accessToken) {
        mapboxgl.accessToken = 'pk.eyJ1IjoiamltdnciLCJhIjoiY20xd2U3Z2pqMGprdDJqczV2OXJtMTBoayJ9.hlSx0Nc19j_Z1NRgyX7HHg';
      }

      const styleSheet = document.createElement("style");
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);

      if (!mapRef.current && mapContainerRef.current) {
        const mapStyle = theme === 'dark' 
          ? 'mapbox://styles/jimvw/cm466rsf0014101sibqumbyfs' 
          : 'mapbox://styles/jimvw/cm237n93v000601qp9tts27w9';

        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          projection: 'globe',
          center: [13.4, 52.5],
          zoom: 3.5,
          minZoom: 1
        });

        // Add missing image handler
        mapRef.current.on('styleimagemissing', (e) => {
          const id = e.id;
          if (eventTypes.some(eventType => eventType.icon === id)) {
            const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            const themePrefix = currentTheme === 'dark' ? '_light' : '_dark';
            const img = new Image();
            img.src = `/animations/maki-icons/${id}${themePrefix}.svg`;
            img.onload = () => {
              if (mapRef.current && !mapRef.current.hasImage(id)) {
                mapRef.current.addImage(id, img);
              }
            };
          }
        });

        mapRef.current.on('load', () => {
          setMapLoaded(true);
          addIconsToMap();
        });
      }

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        styleSheet.remove();
      };
    }, []);

    // Handle theme changes separately
    useEffect(() => {
      if (mapRef.current && mapRef.current.loaded()) {
        const mapStyle = theme === 'dark' 
          ? 'mapbox://styles/jimvw/cm466rsf0014101sibqumbyfs' 
          : 'mapbox://styles/jimvw/cm237n93v000601qp9tts27w9';
        
        mapRef.current.setStyle(mapStyle);
        
        // Wait for style to load before re-adding icons, applying fog, and reloading GeoJSON
        mapRef.current.once('style.load', () => {
          addIconsToMap();
          setFogProperties(theme || 'dark');
          // Reset geojsonLoaded flag to trigger a reload
          setGeojsonLoaded(false);
          // Force reload GeoJSON data
          loadGeoJSONEventsData();
        });

        // Add missing image handler with theme-specific icons
        mapRef.current.on('styleimagemissing', (e) => {
          const id = e.id;
          if (eventTypes.some(eventType => eventType.icon === id)) {
            const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            const themePrefix = currentTheme === 'dark' ? '_light' : '_dark';
            const img = new Image();
            img.src = `/animations/maki-icons/${id}${themePrefix}.svg`;
            img.onload = () => {
              if (mapRef.current && !mapRef.current.hasImage(id)) {
                mapRef.current.addImage(id, img);
              }
            };
          }
        });

      }
    }, [theme]);

    // MAP FOG HELPER
    const setFogProperties = (currentTheme: string) => {
      if (!mapRef.current) return;
      if (currentTheme === "dark") {
        mapRef.current.setFog({
          color: "rgba(30, 30, 30, 0.2)",
          "high-color": "rgba(10, 10, 10, 0.2)",
          "horizon-blend": 0.1,
          "space-color": "rgba(5, 5, 20, 0.2)",
          "star-intensity": 0.2,
        });
      } else {
        mapRef.current.setFog({
          color: "rgba(30, 30, 30, 1)",
          "high-color": "rgba(10, 10, 10, 1)",
          "horizon-blend": 0.1,
          "space-color": "rgba(5, 5, 20, 1)",
          "star-intensity": 0.2,
        });
      }
    };

    // Mouse move over map => show hovered boundaries
    useEffect(() => {
      if (!mapLoaded || !mapRef.current) return;
      mapRef.current.on("mousemove", (e) => {
        const features = mapRef.current?.queryRenderedFeatures(e.point, {
          layers: ["country-boundaries"],
        });
        if (features && features.length > 0) {
          setHoveredFeature(features[0].properties);
        } else {
          setHoveredFeature(null);
        }
      });
    }, [mapLoaded]);

    // If user picks coords from store => fly
    useEffect(() => {
      if (latitude !== null && longitude !== null) {
        flyToLocation(longitude, latitude, 6);
      }
    }, [longitude, latitude, flyToLocation]);

    // External event for setLocation from popups
    useEffect(() => {
      const handleSetLocation = (e: CustomEvent) => {
        onLocationClick(e.detail, e.detail.event_type);
      };
      window.addEventListener("setLocation", handleSetLocation as EventListener);
      return () => {
        window.removeEventListener("setLocation", handleSetLocation as EventListener);
      };
    }, [onLocationClick]);

    // Zoom to cluster from external event
    useEffect(() => {
      const handleZoomToCluster = (e: CustomEvent) => {
        if (!mapRef.current) return;
        const { lng, lat, zoom } = e.detail;
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: zoom
        });
      };
      window.addEventListener("zoomToCluster", handleZoomToCluster as EventListener);
      return () => {
        window.removeEventListener("zoomToCluster", handleZoomToCluster as EventListener);
      };
    }, []);

    // Route playback
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const { data, fetchContents, fetchEntities } = useLocationData(null);

    const loadLocationData = useCallback(
      async (locationName: string) => {
        await fetchContents({ skip: 0 });
        await fetchEntities(locationName, 10, 20);
      },
      [fetchContents, fetchEntities]
    );

    function createPopupContent(locationName: string) {
      const articles = data.contents.slice(0, 4);
      const entities = data.entities.slice(0, 4);
      return `
        <div class="popup-content">
          <h3>${locationName}</h3>
          <div class="articles">
            <h4>Articles</h4>
            ${articles
              .map(
                (a) => `
                <div>
                  <a href="${a.url}" target="_blank">${a.title}</a>
                  <p>${a.source}</p>
                </div>`
              )
              .join("")}
          </div>
          <div class="entities">
            <h4>Entities</h4>
            ${entities
              .map(
                (e) => `
                <div>
                  <span>${e.name} (${e.entity_type})</span>
                </div>`
              )
              .join("")}
          </div>
        </div>
      `;
    }

    const startRoute = useCallback(
      async (route) => {
        if (!mapRef.current) return;
        setIsSpinning(false);
        setIsRoutePlaying(true);

        for (const location of route.locations) {
          const { name, coordinates } = location;
          await loadLocationData(name);

          mapRef.current.flyTo({
            center: [coordinates[0], coordinates[1]],
            zoom: 5,
            speed: 0.5,
            curve: 1.42,
            easing: (t) => t * t * (3 - 2 * t),
            essential: true
          });
          await new Promise((resolve) => {
            mapRef.current!.once("moveend", resolve);
          });

          const popupContent = createPopupContent(name);
          const popup = new mapboxgl.Popup({
            closeButton: false,
            maxWidth: "none",
            className: "custom-popup-container route-popup",
          })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(mapRef.current);

          await new Promise((resolve) => setTimeout(resolve, 5000));
          popup.remove();
        }
        setIsRoutePlaying(false);
      },
      [loadLocationData]
    );

    // Spinning logic
    const spin = useCallback(() => {
      if (!mapRef.current || !isSpinning || isRoutePlaying) return;
      const rotationSpeed = 0.0115;
      const currentCenter = mapRef.current.getCenter();
      currentCenter.lng += rotationSpeed;
      // This is just for demonstration
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

    /**
     * RENDER
     */
    const reloadGeoJSONData = useCallback(() => {
      // Force reload if needed
      loadGeoJSONEventsData();
    }, [loadGeoJSONEventsData]);

    // Keep toggling layers in sync
    useEffect(() => {
      if (!mapLoaded || !mapRef.current) return;
      eventTypes.forEach((et) => {
        toggleLayerVisibility(
          `clusters-${et.type}`,
          visibleLayers[et.type] ? "visible" : "none"
        );
        toggleLayerVisibility(
          `unclustered-point-${et.type}`,
          visibleLayers[et.type] ? "visible" : "none"
        );
        toggleLayerVisibility(
          `cluster-count-${et.type}`,
          visibleLayers[et.type] ? "visible" : "none"
        );
      });
    }, [mapLoaded, visibleLayers, eventTypes, toggleLayerVisibility]);

    // Add useEffect to load GeoJSON data once
    useEffect(() => {
      if (mapLoaded && !geojsonLoaded) {
        loadGeoJSONEventsData();
        setGeojsonLoaded(true);
      }
    }, [mapLoaded, loadGeoJSONEventsData, geojsonLoaded]);

    // Some extra styles
    const styles = `
      .custom-popup-container .mapboxgl-popup-content {
        padding: 0 !important;
        border-radius: 0.75rem;
        backdrop-filter: blur(3px);
        background: rgba(59, 51, 51, 0.2) !important;
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

    useEffect(() => {
      if (!mapRef.current) return;

      // Immediately stop spinning on any interaction
      const disableSpin = () => {
        if (isSpinning) {
          setIsSpinning(false);
          if (spinningRef.current) {
            cancelAnimationFrame(spinningRef.current);
          }
        }
      };

      // Add listeners for all common map interaction events
      const events = ['mousedown', 'touchstart', 'dragstart', 'wheel', 'boxzoom'];
      events.forEach(event => {
        mapRef.current?.on(event, disableSpin);
      });

      // Cleanup
      return () => {
        events.forEach(event => {
          mapRef.current?.off(event, disableSpin);
        });
      };
    }, [isSpinning]);

    return (
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        <div
          ref={mapContainerRef}
          className="map-container"
          style={{ height: "100%", padding: "10px", borderRadius: "12px" }}
        />
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              zIndex: 1000,
            }}
          >
            <div>
              <LottiePlaceholder />
            </div>
          </div>
        )}

        {/* Controls Popup */}
        <div className="absolute top-4 left-4 z-10">
          <Popover open={controlsOpen} onOpenChange={setControlsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="p-2">
                <List className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4 space-y-4">
              {/* Location Search */}
              <div className="space-y-2">
                <h3 className="font-semibold">Location Search</h3>
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    type="text"
                    value={inputLocation}
                    onChange={(e) => setInputLocation(e.target.value)}
                    placeholder="Enter location"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFlyToInputLocation();
                    }}
                  />
                  <Button 
                    variant="secondary" 
                    onClick={handleFlyToInputLocation} 
                    disabled={loading}
                  >
                    {loading ? "Loading..." : <Locate className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Quick Locations */}
              <div className="space-y-2">
                <h3 className="font-semibold">Quick Locations</h3>
                <div className="grid grid-cols-2 gap-2">
                  {locationButtons.map((locName) => (
                    <Button 
                      key={locName} 
                      variant="outline" 
                      onClick={() => handleLocationButtonClick(locName)}
                      className="truncate"
                    >
                      {locName}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Routes */}
              <div className="space-y-2">
                <h3 className="font-semibold">Routes</h3>
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-2 rounded-md border border-input bg-background"
                    value={selectedRoute ? selectedRoute.name : ""}
                    onChange={(e) => {
                      const routeName = e.target.value;
                      const route = routes.find((r) => r.name === routeName);
                      setSelectedRoute(route);
                    }}
                  >
                    <option value="" disabled>Select a Route</option>
                    {routes.map((routeOption) => (
                      <option key={routeOption.name} value={routeOption.name}>
                        {routeOption.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => selectedRoute && startRoute(selectedRoute)}
                    disabled={!selectedRoute || isRoutePlaying}
                  >
                    {isRoutePlaying ? "Playing..." : "Start"}
                  </Button>
                </div>
              </div>

              {/* Map Controls */}
              <div className="space-y-2">
                <h3 className="font-semibold">Map Controls</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowLegend(!showLegend)}
                  >
                    {showLegend ? "Hide Legend" : "Show Legend"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={reloadGeoJSONData}
                  >
                    Reload Data
                  </Button>
                  <Button
                    variant={isSpinning ? "secondary" : "outline"}
                    onClick={() => setIsSpinning(!isSpinning)}
                    disabled={isRoutePlaying}
                    className="col-span-2"
                  >
                    {isSpinning ? "Pause Rotation" : "Start Rotation"}
                  </Button>
                </div>
              </div>

              {/* Event Type Filters */}
              <div className="space-y-2">
                <h3 className="font-semibold">Event Filters</h3>
                <div className="grid grid-cols-2 gap-2">
                  {eventTypes.map((et) => (
                    <label key={et.type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={visibleLayers[et.type]}
                        onChange={() =>
                          setVisibleLayers((prev) => ({
                            ...prev,
                            [et.type]: !prev[et.type],
                          }))
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">{et.type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {showLegend && (
          <div>
            <MapLegend />
          </div>
        )}

        {error && (
          <div className="absolute top-4 right-4 bg-highlighted border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
      </div>
    );
  }
);

Globe.displayName = "Globe";

export default Globe;
