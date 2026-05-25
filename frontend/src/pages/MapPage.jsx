import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const equipmentLocations = [
  { id: 1, name: "Tractor A", lat: 23.2599, lng: 77.4126 },
  { id: 2, name: "Harvester B", lat: 23.2500, lng: 77.4000 },
];

const MapPage = () => {
  return (
    <div className="h-[80vh] w-full rounded-2xl overflow-hidden shadow-xl">
      <MapContainer
        center={[23.2599, 77.4126]}
        zoom={12}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {equipmentLocations.map((eq) => (
          <Marker key={eq.id} position={[eq.lat, eq.lng]}>
            <Popup>
              🚜 {eq.name}
              <br />
              Available for booking
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;