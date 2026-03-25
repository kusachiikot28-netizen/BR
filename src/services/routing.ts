import { BikeType, RouteInfo, RoutePoint } from '../types';

const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions';

const BIKE_PROFILE_MAP: Record<BikeType, string> = {
  road: 'cycling-road',
  mountain: 'cycling-mountain',
  hybrid: 'cycling-regular',
  electric: 'cycling-electric',
};

export async function fetchRoute(
  points: RoutePoint[],
  bikeType: BikeType = 'hybrid'
): Promise<RouteInfo> {
  const apiKey = import.meta.env.VITE_ORS_API_KEY;

  if (!apiKey) {
    console.warn('VITE_ORS_API_KEY is missing. Using mock route.');
    return getMockRoute(points);
  }

  const profile = BIKE_PROFILE_MAP[bikeType];
  const coordinates = points.map(p => [p.lng, p.lat]);

  try {
    const body: any = {
      coordinates,
      elevation: true,
      extra_info: ['steepness'],
    };

    // ORS only supports alternatives for 2-point routes
    if (points.length === 2) {
      body.alternative_routes = {
        target_count: 3,
        weight_factor: 1.4,
        share_factor: 0.6
      };
    }

    const response = await fetch(`${ORS_BASE_URL}/${profile}/geojson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`ORS API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const processFeature = (feature: any, index: number): RouteInfo => {
      const geometry = feature.geometry.coordinates; // [lng, lat, alt]
      const properties = feature.properties;
      const segments = properties.segments[0];
      const instructions = segments.steps.map((step: any) => ({
        distance: step.distance,
        duration: step.duration,
        type: step.type,
        instruction: step.instruction,
        name: step.name,
        way_points: step.way_points,
      }));

      const routePoints: [number, number][] = geometry.map((c: any) => [c[1], c[0]]);
      
      let currentDistance = 0;
      const elevationProfile = geometry.map((c: any, i: number) => {
        if (i > 0) {
          const prev = geometry[i - 1];
          const dist = getDistance(prev[1], prev[0], c[1], c[0]);
          currentDistance += dist;
        }
        return {
          distance: currentDistance,
          elevation: c[2] || 0,
          gradient: 0,
        };
      });

      return {
        id: `route-${index}`,
        distance: properties.summary.distance,
        duration: properties.summary.duration,
        ascent: properties.ascent || 0,
        descent: properties.descent || 0,
        points: routePoints,
        elevationProfile,
        instructions,
      };
    };

    const mainRoute = processFeature(data.features[0], 0);
    if (data.features.length > 1) {
      mainRoute.alternatives = data.features.slice(1).map((f: any, i: number) => processFeature(f, i + 1));
    }

    return mainRoute;
  } catch (error) {
    console.error('Routing failed:', error);
    return getMockRoute(points);
  }
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getMockRoute(points: RoutePoint[]): RouteInfo {
  // Simple straight line with some fake elevation
  const routePoints: [number, number][] = points.map(p => [p.lat, p.lng]);
  const elevationProfile = points.map((p, i) => ({
    distance: i * 1000,
    elevation: 100 + Math.sin(i) * 50,
    gradient: 0,
  }));

  const mainRoute: RouteInfo = {
    id: 'route-0',
    distance: points.length * 1000,
    duration: points.length * 300,
    ascent: 50,
    descent: 50,
    points: routePoints,
    elevationProfile,
    instructions: [],
  };

  if (points.length === 2) {
    mainRoute.alternatives = [
      {
        id: 'route-1',
        distance: points.length * 1200,
        duration: points.length * 350,
        ascent: 70,
        descent: 70,
        points: routePoints.map(p => [p[0] + 0.005, p[1] + 0.005]),
        elevationProfile: elevationProfile.map(e => ({ ...e, elevation: e.elevation + 20 })),
        instructions: [],
      }
    ];
  }

  return mainRoute;
}
