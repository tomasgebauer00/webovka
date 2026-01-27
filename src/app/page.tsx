'use client';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic'; // Důležité pro mapu!

// Dynamický import mapy (aby nepadala na serveru)
const DealMap = dynamic(() => import('../components/DealMap'), { ssr: false });

import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; 
import { cs } from 'date-fns/locale'; 

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
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchSeats, setSearchSeats] = useState(1); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [dateFrom, setDateFrom] = useState<Date | null>(null);      
  const [dateTo, setDateTo] = useState<Date | null>(null);          

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
          setEmail('');
          setSubscribed(false);
      }, 3000);
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

  const filteredDeals = deals.filter(deal => {
    if (activeCategory !== 'all' && deal.category !== activeCategory) return false;
    if (deal.seats_left < searchSeats) return false;
    if (searchTerm && !deal.destination.toLowerCase().includes(searchTerm.toLowerCase()) && !deal.country.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
    }
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
          Pojďme cestovat <span className="text-blue-500">levně!</span>
        </h1>
        
        {/* === MAPA (NOVÉ) === */}
        <div className="max-w-6xl mx-auto mb-12 hidden md:block">
            <DealMap deals={filteredDeals} />
        </div>

        {/* Vyhledávací panel */}
        <div className="max-w-6xl mx-auto bg-slate-900 border border-white/10 rounded-full shadow-2xl p-2 hidden md:flex items-center relative z-40">
          <div className="flex-[1.5] px-6 py-2 border-r border-white/10 relative hover:bg-white/5 rounded-full transition group">
             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pointer-events-none">Kam?</label>
             <input 
                type="text" 
                placeholder="Všechny destinace" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm font-bold text-white w-full outline-none placeholder-slate-500"
             />
          </div>
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
                minDate={new Date()} 
              />
            </div>
          </div>
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
          <div className="flex-1 px-6 py-2 relative hover:bg-white/5 rounded-full transition flex flex-col justify-center">
             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cestující</label>
             <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {searchSeats} {searchSeats === 1 ? 'osoba' : (searchSeats < 5 ? 'osoby' : 'osob')}
                </span>
                <div className="flex gap-2 relative z-20">
                  <button onClick={() => handleGuestsChange('decrement')} disabled={searchSeats <= 1} className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-500 text-slate-400 hover:border-white hover:text-white disabled:opacity-30">-</button>
                  <button onClick={() => handleGuestsChange('increment')} className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-500 text-slate-400 hover:border-white hover:text-white">+</button>
                </div>
             </div>
          </div>
          <div className="pl-2">
            <button className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform active:scale-95">🔍</button>
          </div>
        </div>

        <div className="md:hidden max-w-sm mx-auto">
            <input type="text" placeholder="🔍 Kam to bude?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white mb-4" />
        </div>

        {(dateFrom || dateTo || searchSeats > 1 || searchTerm) && (
              <button onClick={() => { setDateFrom(null); setDateTo(null); setSearchSeats(1); setActiveCategory('all'); setSearchTerm(''); }} className="mt-6 text-sm text-red-400 hover:text-red-300 font-bold underline decoration-red-400/30">Vymazat filtry ✕</button>
        )}

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-8 max-w-4xl mx-auto">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-sm md:text-base transition-all transform hover:scale-105 ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 text-slate-400 border border-white/10 hover:border-white/30 hover:text-white'}`}>{cat.label}</button>
          ))}
        </div>
      </div>
      <DealMap deals={filteredDeals} />
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Načítám destinace...</div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-white/5 border-dashed">
            <p className="text-xl text-slate-500">Nic jsme nenašli 🕵️‍♂️</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeals.map((deal) => (
              <div 
                key={deal.id} 
                onClick={() => router.push(`/deal/${deal.id}`)} // TADY JE ZMĚNA - ODKAZ NA DETAIL
                className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-900/20 transition duration-300 cursor-pointer group relative flex flex-col h-full"
              >
                <button onClick={(e) => toggleFavorite(e, deal.id)} className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition group-active:scale-95">
                  <span className={favoriteIds.includes(deal.id) ? "text-red-500 scale-110 inline-block" : "text-white opacity-70"}>{favoriteIds.includes(deal.id) ? '❤️' : '🤍'}</span>
                </button>

                <div className="h-56 overflow-hidden relative">
                  <img src={deal.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100" />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow uppercase tracking-wider">{deal.category || 'Ostatní'}</span>
                    {deal.total_price < 15000 && <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow uppercase tracking-wider">🔥 Super Cena</span>}
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">✈️ {deal.from_city}</div>
                      <h3 className="text-xl font-bold text-white leading-tight">{deal.destination}</h3>
                      <p className="text-sm text-slate-400 mt-1">{deal.country}</p>
                    </div>
                    {deal.rating > 0 && <div className="bg-slate-800 text-xs font-bold px-2 py-1 rounded text-yellow-400">★ {deal.rating}</div>}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">{formatDate(deal.departure_date)}</p>
                      <span className="text-2xl font-bold text-green-400">{(deal.total_price || 0).toLocaleString()} Kč</span>
                    </div>
                    {deal.seats_left <= 3 && <div className="text-[10px] font-bold text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-500/20 animate-pulse">Poslední {deal.seats_left} místa!</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <section className="mt-20 py-20 bg-blue-900/20 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nechceš propásnout chyby v letenkách? 💸</h2>
            <p className="text-slate-400 mb-8 text-lg">Přihlas se k odběru a my ti pošleme ty nejšílenější slevy hned, jak se objeví.</p>
            {subscribed ? (
                <div className="bg-green-500/20 text-green-400 p-4 rounded-xl font-bold border border-green-500/30">Díky! Jsi na seznamu. 📩</div>
            ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                    <input type="email" placeholder="Tvůj e-mail..." required value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-blue-500 outline-none transition" />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-blue-900/20">Odebírat</button>
                </form>
            )}
        </div>
      </section>
    </main>
  );
}
// Rebuild fix