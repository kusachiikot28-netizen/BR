import { RoutePoint } from '../types';

export async function searchLocation(query: string): Promise<RoutePoint[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'ru,en',
      },
    });
    
    if (!response.ok) throw new Error('Geocoding error');
    
    const data = await response.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      label: item.display_name,
    }));
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}
