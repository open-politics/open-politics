// Define the interface for an article
export interface Article {
    headline: string;
    url: string;
  }
  
  // Define the interface for the properties of a feature in geoJSON data
  export interface FeatureProperties {
    location: string;
    articles: Article[];
  }
  
  // Define the interface for a feature in geoJSON data
  export interface Feature {
    properties: FeatureProperties;
  }
  
  // Define the interface for the entire geoJSON data
  export interface GeoJSONData {
    features: Feature[];
  }
  
  // Define the interface for the data context of a map polygon
  export interface DataContext {
    name: string;
  }
  
  // Define the interface for the target of the 'active' event
  export interface MapPolygonTarget {
    dataItem: {
      dataContext: DataContext;
    };
  }
  