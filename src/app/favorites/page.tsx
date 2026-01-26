'use client';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    // 1. Zjistíme, kdo je přihlášený
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login'); // Nepřihlášený? Šup na login
      return;
    }

    // 2. Magický dotaz: "Najdi v tabulce favorites moje řádky a přibal k tomu data o dovolené (deals)"
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        deals (*)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Chyba:', error);
    } else if (data) {
      // Data přijdou zabalená jako [{ deals: {...} }, { deals: {...} }], musíme to rozbalit
      const formattedDeals = data.map((item: any) => item.deals);
      setDeals(formattedDeals);
    }
    setLoading(false);
  };

  const removeFavorite = async (dealId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Smažeme z databáze
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('deal_id', dealId);

    // 2. Smažeme okamžitě z obrazovky (bez načítání)
    setDeals(prev => prev.filter(deal => deal.id !== dealId));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          ❤️ Tvé vysněné cesty
          <span className="text-sm bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-normal">
            {deals.length} položek
          </span>
        </h1>

        {loading ? (
          <div className="text-slate-500">Hledám tvé oblíbené...</div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-white/5 border-dashed">
            <p className="text-xl text-slate-400 mb-4">Zatím sis nic neuložil 😢</p>
            <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-500 transition">
              Prozkoumat nabídky
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {deals.map((deal) => (
              <div key={deal.id} className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden flex flex-col relative group">
                
                {/* Tlačítko pro odstranění */}
                <button 
                  onClick={() => removeFavorite(deal.id)}
                  className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur transition"
                  title="Odebrat z oblíbených"
                >
                  ✕
                </button>

                <div className="h-48 overflow-hidden">
                  <img src={deal.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>

                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-1">{deal.destination}</h3>
                  <p className="text-sm text-slate-400 mb-4">{deal.country}</p>
                  
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-green-400 font-bold text-xl">{(deal.total_price).toLocaleString()} Kč</span>
                    <button className="text-xs font-bold text-blue-400 hover:text-white transition uppercase tracking-wider">
                      Zobrazit detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}