'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';

// Funkce pro vytvoření vlastního HTML markeru (Cenovka + Pulzování)
const createCustomIcon = (price: number) => {
  return L.divIcon({
    className: 'custom-icon-class', // Leaflet vyžaduje class, ale styly máme uvnitř HTML
    html: `
      <div class="custom-marker-container">
        <div class="pulse-ring"></div>
        <div class="price-tag">${price.toLocaleString()} Kč</div>
      </div>
    `,
    iconSize: [80, 30], // Velikost oblasti markeru
    iconAnchor: [40, 15], // Vycentrování
  });
};

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
    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative z-10 bg-slate-900">
      <MapContainer 
        center={[25, 10]} 
        zoom={2} 
        scrollWheelZoom={true} 
        className="h-full w-full"
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]} // Omezí mapu, aby se neopakovala donekonečna
        maxBoundsViscosity={1.0}
      >
        {/* LUXUSNÍ TMAVÁ MAPA (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {deals.map((deal) => (
          <Marker 
            key={deal.id} 
            position={[deal.latitude, deal.longitude]} 
            icon={createCustomIcon(deal.total_price)} // ZDE POUŽIJEME NOVOU IKONU
            eventHandlers={{
                click: () => router.push(`/deal/${deal.id}`),
            }}
          >
            <Popup className="custom-popup" closeButton={false}>
              <div 
                className="text-center cursor-pointer overflow-hidden rounded-xl border border-blue-500/30 bg-slate-900 shadow-xl" 
                onClick={() => router.push(`/deal/${deal.id}`)}
                style={{ width: '160px', padding: '0' }}
              >
                <div className="relative h-24 w-full">
                    <img src={deal.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    <span className="absolute bottom-1 left-2 text-white font-bold text-xs shadow-black drop-shadow-md">
                        {deal.destination}
                    </span>
                </div>
                <div className="p-2 bg-slate-900 text-center">
                    <button className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1 rounded-full w-full hover:bg-blue-500 transition">
                        Detail zájezdu ➜
                    </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}