'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState } from 'react';

// Stylové ikony (použijeme emoji jako marker pro moderní look)
const createIcon = (price: number) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #2563eb; color: white; padding: 4px 8px; border-radius: 8px; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); white-space: nowrap;">${price.toLocaleString()} Kč</div>`,
  iconSize: [80, 30],
  iconAnchor: [40, 30]
});

export default function DealMap({ deals }: { deals: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const center = [30, 15] as [number, number]; // Střed světa

  // Komponenta pro mapu (uvnitř)
  const MapContent = () => (
    <MapContainer center={center} zoom={2} scrollWheelZoom={true} style={{ height: "100%", width: "100%", background: '#020617' }}>
        {/* Temné mapové podklady (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {deals.map((deal) => (
           deal.latitude && deal.longitude && (
            <Marker key={deal.id} position={[deal.latitude, deal.longitude]} icon={createIcon(deal.total_price)}>
              <Popup className="custom-popup">
                <div className="text-slate-900 font-bold text-center">
                  <h3 className="text-sm mb-1">{deal.destination}</h3>
                  <a href={`/deal/${deal.id}`} className="text-blue-600 underline text-xs">Zobrazit detail</a>
                </div>
              </Popup>
            </Marker>
          )
        ))}
    </MapContainer>
  );

  return (
    <>
      {/* 1. Malá mapa (Embed) */}
      <div className="relative group w-full h-[300px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-0">
        <MapContent />
        
        {/* Překryv s tlačítkem pro zvětšení */}
        <div className="absolute top-4 right-4 z-[999]">
            <button 
                onClick={() => setIsExpanded(true)}
                className="bg-slate-900/80 backdrop-blur text-white p-2 rounded-lg border border-white/20 hover:bg-blue-600 transition shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
                ⤢ Zvětšit mapu
            </button>
        </div>
      </div>

      {/* 2. Velká mapa (Modal přes celou obrazovku) */}
      {isExpanded && (
        <div className="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-sm p-4 md:p-10 flex flex-col">
            <div className="flex justify-between items-center mb-4 text-white">
                <h2 className="text-2xl font-bold">Mapa destinací 🌍</h2>
                <button onClick={() => setIsExpanded(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full px-4 font-bold transition">Zavřít ✕</button>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                <MapContent />
            </div>
        </div>
      )}
    </>
  );
}