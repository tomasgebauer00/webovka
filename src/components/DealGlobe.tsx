'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamický import glóbusu (protože 3D nefunguje na serveru)
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface Deal {
  id: number;
  destination: string;
  country: string;
  total_price: number;
  latitude: number;
  longitude: number;
  image: string;
}

export default function DealGlobe({ deals }: { deals: Deal[] }) {
  const router = useRouter();
  const globeEl = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Responsivita glóbusu
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth > 1000 ? 1000 : window.innerWidth - 32, // Omezení šířky
        height: window.innerWidth > 600 ? 600 : 400 // Výška podle mobilu/pc
      });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatická rotace
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      globeEl.current.controls().enableZoom = false; // 🛑 DŮLEŽITÉ: Vypne zoom kolečkem (aby šlo scrollovat web)
    }
  }, []);

  // Příprava dat pro glóbus (převedeme deals na formát pro Globe)
  const gData = useMemo(() => deals.map(deal => ({
    id: deal.id,
    lat: deal.latitude,
    lng: deal.longitude,
    name: deal.destination,
    price: `${deal.total_price.toLocaleString()} Kč`,
    img: deal.image,
    size: 15,
    color: '#3b82f6' // Blue-500
  })), [deals]);

  return (
    <div className="flex justify-center items-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950 relative shadow-2xl">
      
      {/* Informace pro uživatele */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-4 py-2 rounded-lg pointer-events-none">
        <p className="text-xs text-slate-300">🌍 Táhni pro otočení • Klikni pro detail</p>
      </div>

      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg" // Noční textura
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png" // Vesmír
        
        // Značky měst (tečky)
        pointsData={gData}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => '#3b82f6'}
        pointAltitude={0.02}
        pointRadius={0.5}
        
        // Štítky (Názvy + Ceny)
        labelsData={gData}
        labelLat="lat"
        labelLng="lng"
        labelText={(d: any) => `${d.name} (${d.price})`}
        labelSize={1.5}
        labelDotRadius={0.5}
        labelColor={() => '#fbbf24'} // Žlutá
        labelResolution={2}
        labelAltitude={0.03}
        
        // Interakce
        onLabelClick={(d: any) => router.push(`/deal/${d.id}`)}
        onPointClick={(d: any) => router.push(`/deal/${d.id}`)}
        
        // Efekt atmosféry
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.15}
      />
    </div>
  );
}