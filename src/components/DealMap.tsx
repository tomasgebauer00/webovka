'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';

// Definice rozhraní Deal (aby TypeScript věděl, co očekávat)
interface Deal {
  id: number;
  destination: string;
  country: string;
  total_price: number;
  latitude: number;
  longitude: number;
  image: string;
}

// Funkce pro vytvoření vlastního HTML markeru (Fotka na hover + Info + Cena)
// Nyní přijímá celý objekt 'deal', ne jen cenu.
const createCustomIcon = (deal: Deal) => {
  return L.divIcon({
    className: 'custom-icon-class', // Třída pro Leaflet kontejner
    html: `
      <div class="custom-marker-container">
        <div class="marker-hover-image-container">
            <img src="${deal.image}" alt="${deal.destination}" class="marker-hover-image" />
        </div>

        <div class="pulse-ring"></div>

        <div class="price-tag">
            <span class="tag-location">${deal.destination}, ${deal.country}</span>
            <span class="tag-price">${deal.total_price.toLocaleString()} Kč</span>
        </div>
      </div>
    `,
    // Důležité: Nastavíme velikost na null a kotvu na [0,0], 
    // protože centrování řešíme pomocí CSS transform: translate(-50%, -50%)
    iconSize: null as any, 
    iconAnchor: [0, 0], 
  });
};

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
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
      >
        {/* LUXUSNÍ TMAVÁ MAPA */}
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {deals.map((deal) => (
          <Marker 
            key={deal.id} 
            position={[deal.latitude, deal.longitude]} 
            // ZDE VOLÁME NOVOU FUNKCI A PŘEDÁVÁME CELÝ DEAL
            icon={createCustomIcon(deal)} 
            eventHandlers={{
                click: () => router.push(`/deal/${deal.id}`),
                // Můžeme přidat i reakci na mouseover, ale CSS hover je plynulejší
            }}
          >
            {/* Popup po kliknutí (necháváme jako zálohu) */}
            <Popup className="custom-popup" closeButton={false} offset={[0, -60]}>
              <div 
                className="text-center cursor-pointer overflow-hidden rounded-xl border border-blue-500/30 bg-slate-900 shadow-xl" 
                onClick={() => router.push(`/deal/${deal.id}`)}
                style={{ width: '160px', padding: '0' }}
              >
                <div className="p-3 bg-slate-950">
                    <h3 className="text-white font-bold">{deal.destination}</h3>
                    <button className="mt-2 text-[10px] font-bold bg-blue-600 text-white px-3 py-1 rounded-full w-full hover:bg-blue-500 transition">
                        Otevřít detail ➜
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