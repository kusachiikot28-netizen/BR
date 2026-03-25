import { POI } from '../types';

export async function fetchBikePOIs(bounds: { south: number; west: number; north: number; east: number }): Promise<POI[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="bicycle_repair_station"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      node["amenity"="bicycle_parking"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      node["shop"="bicycle"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
      node["amenity"="drinking_water"](${bounds.south},${bounds.west},${bounds.north},${bounds.east});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    if (!response.ok) throw new Error('Overpass API error');

    const data = await response.json();
    return data.elements.map((el: any) => ({
      id: el.id,
      lat: el.lat,
      lng: el.lon,
      type: el.tags.amenity || el.tags.shop || 'poi',
      name: el.tags.name,
    }));
  } catch (error) {
    console.error('Failed to fetch POIs:', error);
    return [];
  }
}
