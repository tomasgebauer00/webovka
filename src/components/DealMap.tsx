'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';

// Oprava ikon v Leafletu (klasický bug v Next.js)
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Deal {
  id: number;
  destination: string;
  total_price: number;
  latitude: number;
  longitude: number;
  image: string;
}

export default function DealMap({ deals }: { deals: Deal[] }) {
  const router = useRouter();

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative z-10">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        scrollWheelZoom={true} 
        className="h-full w-full bg-slate-900"
        minZoom={2}
      >
        {/* TADY JE TA ZMĚNA - TMAVÁ MAPA */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {deals.map((deal) => (
          <Marker 
            key={deal.id} 
            position={[deal.latitude, deal.longitude]} 
            icon={icon}
            eventHandlers={{
                click: () => router.push(`/deal/${deal.id}`),
            }}
          >
            <Popup className="custom-popup">
              <div className="text-center cursor-pointer" onClick={() => router.push(`/deal/${deal.id}`)}>
                <img src={deal.image} className="w-full h-20 object-cover rounded mb-2" />
                <strong className="block text-sm">{deal.destination}</strong>
                <span className="text-green-600 font-bold">{deal.total_price.toLocaleString()} Kč</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}