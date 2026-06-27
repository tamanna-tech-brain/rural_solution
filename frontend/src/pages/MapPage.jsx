import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Navigation, Tractor, Truck, MapPin } from 'lucide-react';
import { getEquipment, getMandi } from '../api/api';
import useToast from '../hooks/useToast';

// Fix leaflet icon
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const equipIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const mandiIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const MapPage = () => {
  const toast = useToast();
  const [equipment, setEquipment] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState(null);
  const [showEquipment, setShowEquipment] = useState(true);
  const [showMandi, setShowMandi] = useState(true);

  useEffect(() => {
    Promise.all([getEquipment(), getMandi()])
      .then(([eRes, mRes]) => {
        setEquipment(eRes.data || []);
        setMandis(mRes.data || []);
      })
      .catch(() => toast.error('Failed to load map data.'))
      .finally(() => setLoading(false));

    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  const DEFAULT_CENTER = [20.5937, 78.9629]; // India center
  const mapCenter = userPos || DEFAULT_CENTER;

  const withLoc = (items) => items.filter(i => i.driverLocation?.lat && i.driverLocation?.lng);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1>🗺️ Live Map</h1>
          <p>Track equipment locations and mandi truck routes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEquipment(p=>!p)} className={`btn text-xs py-2 ${showEquipment?'btn-secondary':'btn-ghost'}`}>
            <Tractor size={14}/> Equipment
          </button>
          <button onClick={() => setShowMandi(p=>!p)} className={`btn text-xs py-2 ${showMandi?'btn-secondary':'btn-ghost'}`}>
            <Truck size={14}/> Mandi Trucks
          </button>
        </div>
      </div>

      <div className="card overflow-hidden" style={{ height: '60vh', minHeight: 400 }}>
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="mx-auto mb-2 text-slate-300 animate-bounce" />
              <p className="text-sm text-slate-500">Loading map…</p>
            </div>
          </div>
        ) : (
          <MapContainer center={mapCenter} zoom={userPos ? 12 : 5} className="h-full w-full z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location */}
            {userPos && (
              <Marker position={userPos}>
                <Popup><strong>📍 Your Location</strong></Popup>
              </Marker>
            )}

            {/* Mandi trucks with GPS */}
            {showMandi && withLoc(mandis).map(m => (
              <Marker key={m._id} position={[m.driverLocation.lat, m.driverLocation.lng]} icon={mandiIcon}>
                <Popup>
                  <strong>🚛 {m.driverName || 'Driver'}</strong><br/>
                  {m.mandiLocation}<br/>
                  Status: {m.status}<br/>
                  Farmers: {m.farmersJoined?.length || 0}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500"/><span className="text-slate-600 dark:text-slate-400">Your location</span></div>
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-orange-500"/><span className="text-slate-600 dark:text-slate-400">Equipment (GPS)</span></div>
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-sky-500"/><span className="text-slate-600 dark:text-slate-400">Mandi trucks (live)</span></div>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {withLoc(mandis).length} mandi truck{withLoc(mandis).length !== 1 ? 's' : ''} broadcasting live location.
          {!userPos && ' Allow location access to center the map on you.'}
        </p>
      </div>
    </div>
  );
};

export default MapPage;