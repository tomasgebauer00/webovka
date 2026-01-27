'use client';
import { useEffect, useState, use } from 'react';
import { supabase } from '../../../lib/supabase';
import Navbar from '../../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function DealDetail({ params }: { params: Promise<{ id: string }> }) {
  // Rozbalení Promise params (novinka v Next.js 15)
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [deal, setDeal] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDeal = async () => {
      const { data } = await supabase.from('deals').select('*').eq('id', id).single();
      if (data) {
        setDeal(data);
        // Načtení počasí pokud máme souřadnice
        if (data.latitude && data.longitude) {
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${data.latitude}&longitude=${data.longitude}&current_weather=true`)
                .then(res => res.json())
                .then(wData => setWeather(wData.current_weather));
        }
      }
    };
    fetchDeal();
  }, [id]);

  if (!deal) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Načítám...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />
      
      {/* Hlavní fotka */}
      <div className="h-[50vh] relative">
        <img src={deal.image} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 max-w-7xl mx-auto">
            <button onClick={() => router.back()} className="mb-4 text-slate-400 hover:text-white transition">← Zpět na výpis</button>
            <h1 className="text-5xl font-extrabold text-white mb-2">{deal.destination}</h1>
            <p className="text-xl text-slate-300 flex items-center gap-2">
                {deal.country} 
                {weather && (
                    <span className="bg-blue-600/30 text-blue-200 text-sm px-3 py-1 rounded-full border border-blue-500/50 backdrop-blur-sm">
                        ☀️ Aktuálně: {weather.temperature}°C
                    </span>
                )}
            </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Levý sloupec - Info */}
        <div className="md:col-span-2 space-y-8">
            <section className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                <h3 className="text-2xl font-bold text-white mb-4">O destinaci</h3>
                <p className="text-slate-400 leading-relaxed text-lg">{deal.description}</p>
            </section>

            <section className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-500 text-sm block">Odlet</span>
                    <span className="text-white font-bold">{new Date(deal.departure_date).toLocaleDateString('cs-CZ')}</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-500 text-sm block">Návrat</span>
                    <span className="text-white font-bold">{new Date(deal.return_date).toLocaleDateString('cs-CZ')}</span>
                </div>
            </section>
        </div>

        {/* Pravý sloupec - Cena a akce */}
        <div className="space-y-6">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl sticky top-24 shadow-2xl">
                <p className="text-sm text-slate-500 mb-1">Cena za osobu</p>
                <div className="text-4xl font-extrabold text-green-400 mb-6">
                    {deal.total_price.toLocaleString()} Kč
                </div>
                
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-900/20 mb-3">
                    Rezervovat hned
                </button>
                <p className="text-center text-xs text-slate-500">
                    Zbývá jen {deal.seats_left} míst!
                </p>
            </div>
        </div>
      </div>
    </main>
  );
}