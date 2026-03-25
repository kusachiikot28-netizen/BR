import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, CircleMarker, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useCallback } from 'react';
import { RoutePoint, RouteInfo, POI } from '../types';
import { fetchBikePOIs } from '../services/poi';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LocateFixed } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fix for default marker icons
const icon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const UserIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  points: RoutePoint[];
  route?: RouteInfo;
  selectedRouteIndex: number;
  showPOIs: boolean;
  isNavigating?: boolean;
  onAddPoint: (point: RoutePoint) => void;
  onUpdatePoint: (index: number, point: RoutePoint) => void;
  onRemovePoint: (index: number) => void;
  onSelectRoute: (index: number) => void;
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

function ZoomToRoute({ route, selectedRouteIndex, isNavigating }: { route?: RouteInfo, selectedRouteIndex: number, isNavigating?: boolean }) {
  const map = useMap();
  useEffect(() => {
    // Only auto-zoom if NOT navigating, to avoid jarring view changes while the user is interacting
    if (!isNavigating && route && route.points.length > 0) {
      const currentRoute = (route.alternatives && selectedRouteIndex > 0) 
        ? route.alternatives[selectedRouteIndex - 1] 
        : route;
      const bounds = L.latLngBounds(currentRoute.points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, selectedRouteIndex, map, isNavigating]);
  return null;
}

export default function Map({ points, route, selectedRouteIndex, showPOIs, isNavigating, onAddPoint, onUpdatePoint, onRemovePoint, onSelectRoute }: MapProps) {
  const [center] = useState<[number, number]>([55.7558, 37.6173]); // Moscow default
  const [pois, setPois] = useState<POI[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const handleBoundsChange = async (bounds: any) => {
    if (showPOIs) {
      const newPois = await fetchBikePOIs(bounds);
      setPois(newPois);
    }
  };

  useEffect(() => {
    if (!showPOIs) setPois([]);
  }, [showPOIs]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Геолокация не поддерживается вашим браузером");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        if (mapInstance) {
          mapInstance.flyTo([latitude, longitude], 15);
        }
      },
      (error) => {
        console.error("Ошибка геолокации:", error);
        alert("Не удалось определить ваше местоположение");
      }
    );
  }, [mapInstance]);

  return (
    <div className={cn("w-full h-full relative", isNavigating && "cursor-crosshair")}>
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
        ref={setMapInstance}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Стандартная">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Велосипедная (CyclOSM)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.cyclosm.org">CyclOSM</a>'
              url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Спутник">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Рельеф (OpenTopoMap)">
            <TileLayer
              attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        <MapEvents onAddPoint={onAddPoint} onBoundsChange={handleBoundsChange} />
        <ZoomToRoute route={route} selectedRouteIndex={selectedRouteIndex} isNavigating={isNavigating} />

        {userLocation && (
          <Marker position={userLocation} icon={UserIcon}>
            <Popup>Ваше местоположение</Popup>
          </Marker>
        )}

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
          <>
            {/* Render alternative routes first (lower z-index) */}
            {route.alternatives?.map((alt, idx) => {
              const alternativeIndex = idx + 1;
              const isSelected = selectedRouteIndex === alternativeIndex;
              return (
                <Polyline
                  key={`alt-${idx}`}
                  positions={alt.points}
                  color={isSelected ? "#3b82f6" : "#6b7280"}
                  weight={isSelected ? 6 : 4}
                  opacity={isSelected ? 0.9 : 0.4}
                  eventHandlers={{
                    click: () => onSelectRoute(alternativeIndex)
                  }}
                >
                  <Popup>Вариант {alternativeIndex + 1}</Popup>
                </Polyline>
              );
            })}

            {/* Render main route */}
            <Polyline
              positions={route.points}
              color={selectedRouteIndex === 0 ? "#3b82f6" : "#6b7280"}
              weight={selectedRouteIndex === 0 ? 6 : 4}
              opacity={selectedRouteIndex === 0 ? 0.9 : 0.4}
              eventHandlers={{
                click: () => onSelectRoute(0)
              }}
            >
              <Popup>Основной маршрут</Popup>
            </Polyline>
          </>
        )}
      </MapContainer>

      {/* Location Button */}
      <button
        onClick={handleLocate}
        className="absolute bottom-6 right-6 w-12 h-12 bg-[#151619]/90 backdrop-blur-md border border-[#2a2b2e] rounded-full flex items-center justify-center text-blue-500 shadow-2xl hover:bg-[#1c1d21] transition-all z-50 group"
        title="Мое местоположение"
      >
        <LocateFixed className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
