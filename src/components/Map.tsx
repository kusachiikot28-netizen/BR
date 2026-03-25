import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { RoutePoint, RouteInfo, POI } from '../types';
import { fetchBikePOIs } from '../services/poi';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
const icon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  points: RoutePoint[];
  route?: RouteInfo;
  showPOIs: boolean;
  onAddPoint: (point: RoutePoint) => void;
  onUpdatePoint: (index: number, point: RoutePoint) => void;
  onRemovePoint: (index: number) => void;
}

function MapEvents({ onAddPoint, onBoundsChange }: { onAddPoint: (point: RoutePoint) => void, onBoundsChange: (bounds: any) => void }) {
  const map = useMapEvents({
    click(e) {
      onAddPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    moveend() {
      const b = map.getBounds();
      onBoundsChange({
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast(),
      });
    },
  });
  return null;
}

function ZoomToRoute({ route }: { route?: RouteInfo }) {
  const map = useMap();
  useEffect(() => {
    if (route && route.points.length > 0) {
      const bounds = L.latLngBounds(route.points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);
  return null;
}

export default function Map({ points, route, showPOIs, onAddPoint, onUpdatePoint, onRemovePoint }: MapProps) {
  const [center] = useState<[number, number]>([55.7558, 37.6173]); // Moscow default
  const [pois, setPois] = useState<POI[]>([]);

  const handleBoundsChange = async (bounds: any) => {
    if (showPOIs) {
      const newPois = await fetchBikePOIs(bounds);
      setPois(newPois);
    }
  };

  useEffect(() => {
    if (!showPOIs) setPois([]);
  }, [showPOIs]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents onAddPoint={onAddPoint} onBoundsChange={handleBoundsChange} />
        <ZoomToRoute route={route} />

        {showPOIs && pois.map((poi) => (
          <CircleMarker
            key={poi.id}
            center={[poi.lat, poi.lng]}
            radius={6}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.6 }}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-xs">{poi.name || 'Вело-точка'}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{poi.type}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {points.map((p, i) => (
          <Marker
            key={i}
            position={[p.lat, p.lng]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                onUpdatePoint(i, { lat: position.lat, lng: position.lng });
              },
            }}
          >
            <Popup>
              <div className="p-2 min-w-[120px]">
                <p className="font-bold text-sm">{i === 0 ? 'Старт' : i === points.length - 1 ? 'Финиш' : `Точка ${i}`}</p>
                {p.notes && (
                  <p className="text-[10px] text-gray-500 italic mt-1 border-t border-gray-100 pt-1">
                    {p.notes}
                  </p>
                )}
                <button
                  onClick={() => onRemovePoint(i)}
                  className="text-red-500 text-[10px] mt-2 hover:underline uppercase tracking-widest font-mono"
                >
                  Удалить
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {route && (
          <Polyline
            positions={route.points}
            color="#3b82f6"
            weight={5}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
}
