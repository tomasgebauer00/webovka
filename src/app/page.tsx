'use client';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

// === OPRAVENÉ IMPORTY PRO KALENDÁŘ ===
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; 
import { cs } from 'date-fns/locale'; 

// TADY BYLA CHYBA: Přidali jsme "as any", aby TypeScript nekřičel
registerLocale('cs', cs as any);

interface Deal {
  id: number;
  destination: string;
  country: string;
  image: string;
  departure_date: string;
  return_date: string;
  from_city: string;
  flight_price: number;
  hotel_price: number;
  total_price: number;
  rating: number;
  description: string;
  latitude: number;
  longitude: number;
  tags: string[];
  seats_left: number;
  category: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Všechno 🌍' },
  { id: 'Exotika', label: 'Exotika 🏝️' },
  { id: 'Evropa', label: 'Evropa 🇪🇺' },
  { id: 'Česko', label: 'Česko 🇨🇿' },
  { id: 'Letenky', label: 'Jen letenky ✈️' },
  { id: 'Last Minute', label: 'Last Minute 🔥' },
];

export default function Home() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  
  // === STAVY PRO FILTRY ===
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchSeats, setSearchSeats] = useState(1); 
  
  const [dateFrom, setDateFrom] = useState<Date | null>(null);      
  const [dateTo, setDateTo] = useState<Date | null>(null);          

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    const { data: dealsData } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    setDeals(dealsData || []);

    if (user) {
      const { data: favData } = await supabase.from('favorites').select('deal_id').eq('user_id', user.id);
      if (favData) setFavoriteIds(favData.map((f: any) => f.deal_id));
    }
    setLoading(false);
  };

  const toggleFavorite = async (e: React.MouseEvent, dealId: number) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("Pro ukládání do oblíbených se musíš přihlásit!");
      router.push('/login');
      return;
    }
    const isFav = favoriteIds.includes(dealId);
    if (isFav) {
      setFavoriteIds(prev => prev.filter(id => id !== dealId));
      await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('deal_id', dealId);
    } else {
      setFavoriteIds(prev => [...prev, dealId]);
      await supabase.from('favorites').insert([{ user_id: currentUser.id, deal_id: dealId }]);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Neuvedeno';
    return new Date(dateString).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
  };

  const handleGuestsChange = (operation: 'increment' | 'decrement') => {
    if (operation === 'increment' && searchSeats < 20) {
      setSearchSeats(prev => prev + 1);
    } else if (operation === 'decrement' && searchSeats > 1) {
      setSearchSeats(prev => prev - 1);
    }
  };

  // === MAGICKÁ FILTROVACÍ LOGIKA ===
  const filteredDeals = deals.filter(deal => {
    if (activeCategory !== 'all' && deal.category !== activeCategory) return false;
    if (deal.seats_left < searchSeats) return false;

    // Převod Date na string pro porovnání (YYYY-MM-DD)
    if (dateFrom) {
       const dealDate = new Date(deal.departure_date).toISOString().split('T')[0];
       const filterDate = dateFrom.toISOString().split('T')[0];
       if (dealDate < filterDate) return false;
    }
    if (dateTo) {
       const dealReturn = new Date(deal.return_date).toISOString().split('T')[0];
       const filterReturn = dateTo.toISOString().split('T')[0];
       if (dealReturn > filterReturn) return false;
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      <Navbar />

      <div className="relative pt-28 pb-8 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8">
          Kam to bude <span className="text-blue-500">dnes?</span>
        </h1>
        
        {/* === LUXUSNÍ VYHLEDÁVACÍ PANEL === */}
        <div className="max-w-5xl mx-auto bg-slate-900 border border-white/10 rounded-full shadow-2xl p-2 hidden md:flex items-center relative z-40">
          
          {/* 1. SEKCE: ODLET (S novým kalendářem) */}
          <div className="flex-1 px-6 py-2 border-r border-white/10 relative hover:bg-white/5 rounded-full transition group cursor-pointer">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pointer-events-none">Odlet</label>
            <div className="w-full">
              <DatePicker 
                selected={dateFrom} 
                onChange={(date) => setDateFrom(date)} 
                dateFormat="dd. MM. yyyy"
                locale="cs"
                placeholderText="Přidat datum"
                className="bg-transparent text-sm font-bold text-white w-full outline-none cursor-pointer placeholder-slate-500"
                calendarClassName="shadow-2xl" 
                minDate={new Date()} 
              />
            </div>
          </div>

          {/* 2. SEKCE: NÁVRAT (S novým kalendářem) */}
          <div className="flex-1 px-6 py-2 border-r border-white/10 relative hover:bg-white/5 rounded-full transition group cursor-pointer">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pointer-events-none">Návrat</label>
            <div className="w-full">
               <DatePicker 
                selected={dateTo} 
                onChange={(date) => setDateTo(date)} 
                dateFormat="dd. MM. yyyy"
                locale="cs"
                placeholderText="Přidat datum"
                className="bg-transparent text-sm font-bold text-white w-full outline-none cursor-pointer placeholder-slate-500"
                minDate={dateFrom || new Date()} 
              />
            </div>
          </div>

          {/* 3. SEKCE: POČET OSOB */}
          <div className="flex-1 px-6 py-2 relative hover:bg-white/5 rounded-full transition flex flex-col justify-center">
             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cestující</label>
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {searchSeats} {searchSeats === 1 ? 'osoba' : (searchSeats < 5 ? 'osoby' : 'osob')}
                </span>
                <div className="flex gap-2 relative z-20">
                  <button 
                    onClick={() => handleGuestsChange('decrement')}
                    disabled={searchSeats <= 1}
                    className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-500 text-slate-400 hover:border-white hover:text-white disabled:opacity-30"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => handleGuestsChange('increment')}
                    className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-500 text-slate-400 hover:border-white hover:text-white"
                  >
                    +
                  </button>
                </div>
             </div>
          </div>

          <div className="pl-2">
            <button className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform active:scale-95">
              🔍
            </button>
          </div>
        </div>

        {/* Mobilní verze */}
        <div className="md:hidden max-w-sm mx-auto bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-4">
           <p className="text-xs text-center text-slate-500">Použij desktop pro plný zážitek z vyhledávání.</p>
        </div>

        {/* Reset filtru */}
        {(dateFrom || dateTo || searchSeats > 1) && (
             <button 
               onClick={() => { setDateFrom(null); setDateTo(null); setSearchSeats(1); setActiveCategory('all'); }}
               className="mt-6 text-sm text-red-400 hover:text-red-300 font-bold underline decoration-red-400/30"
             >
               Vymazat filtry ✕
             </button>
        )}

        {/* Kategorie */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-8 max-w-4xl mx-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-sm md:text-base transition-all transform hover:scale-105 ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-900 text-slate-400 border border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Načítám destinace...</div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-white/5 border-dashed">
            <p className="text-xl text-slate-500">Nic jsme nenašli 🕵️‍♂️</p>
            <p className="text-sm text-slate-600 mt-2">Zkus změnit datum.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeals.map((deal) => (
              <div 
                key={deal.id} 
                onClick={() => setSelectedDeal(deal)}
                className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-900/20 transition duration-300 cursor-pointer group relative flex flex-col h-full"
              >
                <button 
                  onClick={(e) => toggleFavorite(e, deal.id)}
                  className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition group-active:scale-95"
                >
                  <span className={favoriteIds.includes(deal.id) ? "text-red-500 scale-110 inline-block" : "text-white opacity-70"}>
                     {favoriteIds.includes(deal.id) ? '❤️' : '🤍'}
                  </span>
                </button>

                <div className="h-56 overflow-hidden relative">
                  <img src={deal.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow uppercase tracking-wider">
                      {deal.category || 'Ostatní'}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                        ✈️ {deal.from_city}
                      </div>
                      <h3 className="text-xl font-bold text-white leading-tight">{deal.destination}</h3>
                      <p className="text-sm text-slate-400 mt-1">{deal.country}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{formatDate(deal.departure_date)}</p>
                      <span className="text-2xl font-bold text-green-400">{(deal.total_price || 0).toLocaleString()} Kč</span>
                    </div>
                    {deal.seats_left <= 3 && (
                        <div className="text-[10px] font-bold text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-500/20">
                            Poslední {deal.seats_left} místa!
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setSelectedDeal(null)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => setSelectedDeal(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl">✕</button>
             <h2 className="text-3xl font-bold mb-2">{selectedDeal.destination}</h2>
             <div className="flex gap-2 text-sm text-slate-400 mb-4">
                <span>📅 {formatDate(selectedDeal.departure_date)}</span>
                <span>—</span>
                <span>{formatDate(selectedDeal.return_date)}</span>
             </div>
             <p className="text-slate-300 mb-6 leading-relaxed">{selectedDeal.description}</p>
             <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
                <div>
                    <span className="block text-xs text-slate-500">Cena za osobu</span>
                    <span className="text-2xl font-bold text-green-400">{(selectedDeal.total_price).toLocaleString()} Kč</span>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition shadow-lg">
                    Rezervovat ({selectedDeal.seats_left} míst)
                </button>
             </div>
          </div>
        </div>
      )}
    </main>
  );
}