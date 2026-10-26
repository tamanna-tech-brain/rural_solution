import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Tractor, Truck, MapPin, Activity, Fuel, Zap, Clock, ShieldCheck, Thermometer, Radio, Wrench, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getEquipment, getMandi } from '../api/api';
import useToast from '../hooks/useToast';
import { useLanguage } from '../context/LanguageContext';

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

const IOT_VEHICLES = [
  {
    id: 'V-01',
    name: 'Mahindra 575 DI (45 HP)',
    type: 'Tractor',
    owner: 'Ramesh Patel',
    village: 'Bhopal, MP',
    baseRpm: 1850,
    baseFuel: 76,
    hourlyRate: 600,
    acres: 14.2,
    baseHours: 248.6,
  },
  {
    id: 'V-02',
    name: 'John Deere 5310 4WD (55 HP)',
    type: 'Heavy Tractor',
    owner: 'Gurpreet Singh',
    village: 'Khanna, Punjab',
    baseRpm: 1980,
    baseFuel: 82,
    hourlyRate: 850,
    acres: 28.5,
    baseHours: 412.3,
  },
  {
    id: 'V-03',
    name: 'DJI Agras T40 Sprayer Drone',
    type: 'Agri Drone',
    owner: 'Devendra Choudhary',
    village: 'Sehore, MP',
    baseRpm: 5400,
    baseFuel: 91,
    hourlyRate: 1200,
    acres: 42.0,
    baseHours: 86.4,
  },
];

const MapPage = () => {
  const toast = useToast();
  const { t } = useLanguage();
  const [equipment, setEquipment] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState(null);
  const [showEquipment, setShowEquipment] = useState(true);
  const [showMandi, setShowMandi] = useState(true);

  // IoT Telematics state
  const [selectedVehicle, setSelectedVehicle] = useState(IOT_VEHICLES[0]);
  const [telemetry, setTelemetry] = useState({
    rpm: IOT_VEHICLES[0].baseRpm,
    fuel: IOT_VEHICLES[0].baseFuel,
    hours: IOT_VEHICLES[0].baseHours,
    temp: 86,
    voltage: 12.6,
    isIgnitionOn: true,
  });

  const CITY_COORDS = {
    bhopal: [23.2599, 77.4126],
    ratibad: [23.1815, 77.3486],
    sehore: [23.2031, 77.0844],
    indore: [22.7196, 75.8577],
    khanna: [30.7024, 76.2195],
    karnal: [29.6857, 76.9905],
    rajkot: [22.3039, 70.8022],
    alwar: [27.5530, 76.6346],
    lasalgaon: [20.1477, 74.2259],
    agra: [27.1767, 78.0081],
    akola: [20.7002, 77.0082],
    punjab: [30.7024, 76.2195],
  };

  const getDeterministicJitter = (id = '') => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    const offsetLat = ((Math.abs(hash) % 100) / 100 - 0.5) * 0.02;
    const offsetLng = (((Math.abs(hash >> 8)) % 100) / 100 - 0.5) * 0.02;
    return [offsetLat, offsetLng];
  };

  const getEquipmentPos = (e) => {
    if (e.driverLocation?.lat && e.driverLocation?.lng) {
      return [e.driverLocation.lat, e.driverLocation.lng];
    }
    const locKey = (e.location || '').toLowerCase().trim();
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
      if (locKey.includes(key)) {
        const [offsetLat, offsetLng] = getDeterministicJitter(e._id || e.name || key);
        return [coords[0] + offsetLat, coords[1] + offsetLng];
      }
    }
    return null;
  };

  useEffect(() => {
    Promise.all([
      getEquipment().catch(() => ({ data: [] })),
      getMandi().catch(() => ({ data: [] })),
    ])
      .then(([eRes, mRes]) => {
        const eData = eRes.data?.data || (Array.isArray(eRes.data) ? eRes.data : []);
        const mData = mRes.data?.data || (Array.isArray(mRes.data) ? mRes.data : []);
        setEquipment(eData);
        setMandis(mData);
      })
      .catch(() => toast.error('Failed to load map data.'))
      .finally(() => setLoading(false));

    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  const DEFAULT_CENTER = [23.2599, 77.4126]; // Central India (Bhopal region)
  const mapCenter = userPos || DEFAULT_CENTER;

  const withLoc = (items) => (Array.isArray(items) ? items : []).filter(i => i.driverLocation?.lat && i.driverLocation?.lng);

  // Live IoT CAN-bus OBD-II simulation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const jitterRpm = Math.floor((Math.random() - 0.5) * 40);
        return {
          ...prev,
          rpm: Math.max(800, selectedVehicle.baseRpm + jitterRpm),
          hours: +(prev.hours + 0.001).toFixed(3),
          voltage: +(12.5 + Math.random() * 0.2).toFixed(1),
          temp: Math.min(95, Math.max(82, +(prev.temp + (Math.random() > 0.5 ? 0.2 : -0.2)).toFixed(1))),
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedVehicle]);

  const handleSelectVehicle = (v) => {
    setSelectedVehicle(v);
    setTelemetry({
      rpm: v.baseRpm,
      fuel: v.baseFuel,
      hours: v.baseHours,
      temp: 86,
      voltage: 12.6,
      isIgnitionOn: true,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1>🗺️ {t('map', 'Live Map & Telematics Radar')}</h1>
          <p>Real-time machinery GPS, OBD-II engine hours, and mandi truck fleets</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEquipment(p=>!p)} className={`btn text-xs py-2 ${showEquipment?'btn-secondary':'btn-ghost'}`}>
            <Tractor size={14}/> {t('equipment', 'Equipment')}
          </button>
          <button onClick={() => setShowMandi(p=>!p)} className={`btn text-xs py-2 ${showMandi?'btn-secondary':'btn-ghost'}`}>
            <Truck size={14}/> {t('mandi_pool', 'Mandi Trucks')}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden" style={{ height: '55vh', minHeight: 380 }}>
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="mx-auto mb-2 text-slate-300 animate-bounce" />
              <p className="text-sm text-slate-500">Loading map…</p>
            </div>
          </div>
        ) : (
          <MapContainer center={mapCenter} zoom={userPos ? 12 : 6} className="h-full w-full z-0">
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

            {/* Equipment with GPS or Village coordinates */}
            {showEquipment && (Array.isArray(equipment) ? equipment : []).map(e => {
              const pos = getEquipmentPos(e);
              if (!pos) return null;
              return (
                <Marker key={e._id} position={pos} icon={equipIcon}>
                  <Popup>
                    <strong>🚜 {e.name || 'Equipment'}</strong><br/>
                    Type: {e.type}<br/>
                    Rate: ₹{e.rentalRatePerDay}/day<br/>
                    Location: {e.location}<br/>
                    Owner: {e.ownerId?.name || 'Local Farmer'}
                  </Popup>
                </Marker>
              );
            })}

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
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Map Legend</h3>
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

      {/* 🚜 IoT Telematics & Live Machinery Radar Dashboard */}
      <div className="card p-6 border-emerald-500/20 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg">
              <Activity size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">🚜 IoT Engine Telematics & Hour-Tracker</h2>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> CAN-Bus Active
                </span>
              </div>
              <p className="text-xs text-slate-500">Live OBD-II engine hours, fuel telemetry, and automated tamper-proof billing</p>
            </div>
          </div>

          {/* Vehicle Switcher Tabs */}
          <div className="flex flex-wrap gap-2">
            {IOT_VEHICLES.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelectVehicle(v)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                  selectedVehicle.id === v.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                }`}
              >
                {v.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Vehicle Info Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-slate-700 dark:text-slate-300">
          <div>
            <span className="font-bold text-emerald-800 dark:text-emerald-300">{selectedVehicle.name}</span>
            <span className="mx-2">•</span>
            <span>Owner: <strong className="text-slate-900 dark:text-white">{selectedVehicle.owner}</strong> ({selectedVehicle.village})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Radio size={12} className="text-emerald-500" /> 4G LTE Telematics Link
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-lg">
              ₹{selectedVehicle.hourlyRate}/Hour
            </span>
          </div>
        </div>

        {/* 4 Live Telemetry Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tachometer RPM */}
          <motion.div className="card p-4 bg-slate-50 dark:bg-slate-800/50" whileHover={{ y: -2 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Engine Tachometer</span>
              <Activity size={16} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{telemetry.rpm.toLocaleString()} <span className="text-xs font-normal text-slate-400">RPM</span></p>
            <p className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck size={12} /> Optimal Torque Load
            </p>
          </motion.div>

          {/* Cumulative Engine Hours */}
          <motion.div className="card p-4 bg-slate-50 dark:bg-slate-800/50" whileHover={{ y: -2 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Total Run Hours</span>
              <Clock size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{telemetry.hours.toFixed(2)} <span className="text-xs font-normal text-slate-400">Hrs</span></p>
            <p className="mt-1 text-[11px] text-blue-600 font-semibold flex items-center gap-1">
              <Zap size={12} /> Digital OBD Odometer
            </p>
          </motion.div>

          {/* Fuel Level & Burn Rate */}
          <motion.div className="card p-4 bg-slate-50 dark:bg-slate-800/50" whileHover={{ y: -2 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Fuel Tank / Battery</span>
              <Fuel size={16} className="text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{telemetry.fuel}% <span className="text-xs font-normal text-slate-400">Level</span></p>
            <p className="mt-1 text-[11px] text-amber-600 font-semibold">
              Burn: 4.1 L/hr • {telemetry.voltage}V Batt
            </p>
          </motion.div>

          {/* Engine Temperature */}
          <motion.div className="card p-4 bg-slate-50 dark:bg-slate-800/50" whileHover={{ y: -2 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Coolant Temperature</span>
              <Thermometer size={16} className="text-rose-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{telemetry.temp}°C</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck size={12} /> Normal Range (80–92°C)
            </p>
          </motion.div>
        </div>

        {/* Automated Hourly Cost Split & Disputeless Billing */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h3 className="font-bold text-sm">Disputeless Automated Hourly Billing</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Billed strictly on CAN-bus ignition run-time (Current session: <strong>3.2 Hours</strong> × <strong>₹{selectedVehicle.hourlyRate}/hr</strong>)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400">Total Session Fee:</span>
              <p className="text-2xl font-black text-emerald-300">₹{(3.2 * selectedVehicle.hourlyRate).toLocaleString('en-IN')}</p>
            </div>
            <a
              href="/payment"
              className="btn bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-4 shadow-lg flex items-center gap-1.5 rounded-xl shrink-0"
            >
              Deposit to Escrow <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;