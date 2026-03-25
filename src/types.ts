export type BikeType = 'road' | 'mountain' | 'hybrid' | 'electric';

export interface RoutePoint {
  lat: number;
  lng: number;
  label?: string;
  notes?: string;
}

export interface ElevationData {
  distance: number;
  elevation: number;
  gradient: number;
}

export interface RouteInfo {
  distance: number; // meters
  duration: number; // seconds
  ascent: number; // meters
  descent: number; // meters
  points: [number, number][]; // [lat, lng]
  elevationProfile: ElevationData[];
}

export interface POI {
  id: number;
  lat: number;
  lng: number;
  type: string;
  name?: string;
}
