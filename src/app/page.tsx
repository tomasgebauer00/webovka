'use client';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Flame } from 'lucide-react'; // Import ikony pro Tinder tlačítko

// === IMPORTY KOMPONENT ===
import BuddySection from '../components/BuddySection';
import VisaHealthSection from '../components/VisaHealthSection';
import TravelHacksSection from '../components/TravelHacksSection';
import AiChat from '../components/AiChat';
import LuckyWheel from '../components/LuckyWheel';
import BeerIndex from '../components/BeerIndex';
import CustomHolidayModal from '../components/CustomHolidayModal';
import MobileBottomNav from '../components/MobileBottomNav';

// Dynamický import mapy
const DealMap = dynamic(() => import('../components/DealMap'), { ssr: false });

import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; 
import { cs } from 'date-fns/locale'; 
registerLocale('cs', cs as any);

// Definice typů
interface Deal {
  id: number; destination: string; country: string; image: string; departure_date: string; return_date: string;
  from_city: string; flight_price: number; hotel_price: number; total_price: number; rating: number;
  description: string; latitude: number; longitude: number; tags: string[]; seats_left: number; category: string;
  original_price?: number; 
  is_special_offer?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'Všechno 🌍' }, 
  { id: 'special', label: 'Akční nabídky ⚡' },
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
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [compareList, setCompareList] = useState<Deal[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [dateFrom, setDateFrom] = useState<Date | null>(null);      
  const [dateTo, setDateTo] = useState<Date | null>(null);          
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
        const uniqueDests = Array.from(new Set(deals.map(d => d.destination)));
        const filtered = uniqueDests.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(true);
    } else { setShowSuggestions(false); }
  }, [searchTerm, deals]);

  const fetchData = async () => {
    try {
        setLoading(true);
        setErrorMsg(null);
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) throw new Error("Chybí Supabase URL! Zkontroluj Environment Variables na Vercelu.");

        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        const { data: dealsData, error: dbError } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
        
        if (dbError) throw new Error(dbError.message);
        
        setDeals(dealsData || []);
        if (user) {
          const { data: favData } = await supabase.from('favorites').select('deal_id').eq('user_id', user.id);
          if (favData) setFavoriteIds(favData.map((f: any) => f.deal_id));
        }
    } catch (err: any) {
        console.error("CHYBA:", err);
        setErrorMsg(err.message || "Neznámá chyba při načítání.");
    } finally {
        setLoading(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, dealId: number) => {
    e.stopPropagation();
    if (!currentUser) { alert("Pro ukládání do oblíbených se musíš přihlásit!"); router.push('/login'); return; }
    const isFav = favoriteIds.includes(dealId);
    if (isFav) {
      setFavoriteIds(prev => prev.filter(id => id !== dealId));
      await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('deal_id', dealId);
    } else {
      setFavoriteIds(prev => [...prev, dealId]);
      await supabase.from('favorites').insert([{ user_id: currentUser.id, deal_id: dealId }]);
    }
  };

  const toggleCompare = (e: React.MouseEvent, deal: Deal) => {
    e.stopPropagation();
    const isInList = compareList.find(d => d.id === deal.id);
    
    if (isInList) {
        setCompareList(prev => prev.filter(d => d.id !== deal.id));
    } else {
        if (compareList.length >= 2) {
            alert("Můžeš porovnávat maximálně 2 dovolené najednou! Jednu odeber.");
            return;
        }
        setCompareList(prev => [...prev, deal]);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setTimeout(() => { setEmail(''); setSubscribed(false); }, 3000); }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Neuvedeno';
    return new Date(dateString).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
  };

  const handleGuestsChange = (operation: 'increment' | 'decrement') => {
    if (operation === 'increment' && searchSeats < 20) setSearchSeats(prev => prev + 1);
    else if (operation === 'decrement' && searchSeats > 1) setSearchSeats(prev => prev - 1);
  };

  const filteredDeals = deals.filter(deal => {
    if (activeCategory === 'special' && !deal.is_special_offer) return false;
    if (activeCategory !== 'all' && activeCategory !== 'special' && deal.category !== activeCategory) return false;
    if (deal.seats_left < searchSeats && deal.seats_left > 0) return false;
    if (searchTerm && !deal.destination.toLowerCase().includes(searchTerm.toLowerCase()) && !deal.country.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (dateFrom && new Date(deal.departure_date) < dateFrom) return false;
    if (dateTo && new Date(deal.return_date) > dateTo) return false;
    return true;
  });

  return (
    <main className="min-h-screen pb-20">
      <Navbar />
      
      {/* PLOVOUCÍ TLAČÍTKO TINDER (MÍSTO BANNERU) */}
      <button 
        onClick={() => router.push('/swipe')}
        className="fixed bottom-40 right-6 z-40 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold w-12 h-12 md:w-auto md:h-auto md:py-3 md:px-6 rounded-full shadow-2xl hover:scale-105 transition flex items-center justify-center gap-2 border border-white/20"
        title="Tinder pro cestovatele"
      >
        <Flame size={24} className="fill-white" /> 
        <span className="hidden md:inline">Seznamka</span>
      </button>

      <div className="relative pt-24 pb-8 text-center px-4">
        <h1 className="text-3xl md:text-6xl font-extrabold text-white mb-6 md:mb-8">Pojďme cestovat <span className="text-blue-500">levně!</span></h1>
        
        {/* Vyhledávací panel */}
        <div className="max-w-6xl mx-auto bg-slate-900/80 backdrop-blur border border-white/10 rounded-full shadow-2xl p-2 hidden md:flex items-center relative z-40">
          <div className="flex-[1.5] px-6 py-2 border-r border-white/10 relative hover:bg-white/5 rounded-full transition group">
             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pointer-events-none">Kam?</label>
             <input type="text" placeholder="Všechny destinace" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="bg-transparent text-sm font-bold text-white w-full outline-none placeholder-slate-500"/>
             {showSuggestions && suggestions.length > 0 && (<div className="absolute top-full left-0 w-full bg-slate-900 border border-white/10 rounded-xl mt-2 shadow-2xl overflow-hidden z-50">{suggestions.map((sug, index) => (<div key={index} onClick={() => { setSearchTerm(sug); setShowSuggestions(false); }} className="px-4 py-3 hover:bg-blue-600/20 cursor-pointer text-left text-sm font-bold text-slate-200 border-b border-white/5 last:border-0">✈️ {sug}</div>))}</div>)}
          </div>
          <div className="flex-1 px-6 py-2 border-r border-white/10 relative hover:bg-white/5 rounded-full transition group cursor-pointer"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pointer-events-none">Odlet</label><div className="w-full"><DatePicker selected={dateFrom} onChange={(date) => setDateFrom(date)} dateFormat="dd. MM. yyyy" locale="cs" placeholderText="Přidat datum" className="bg-transparent text-sm font-bold text-white w-full outline-none cursor-pointer placeholder-slate-500" minDate={new Date()} /></div></div>
          <div className="flex-1 px-6 py-2 border-r border-white/10 relative hover:bg-white/5 rounded-full transition group cursor-pointer"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 pointer-events-none">Návrat</label><div className="w-full"><DatePicker selected={dateTo} onChange={(date) => setDateTo(date)} dateFormat="dd. MM. yyyy" locale="cs" placeholderText="Přidat datum" className="bg-transparent text-sm font-bold text-white w-full outline-none cursor-pointer placeholder-slate-500" minDate={dateFrom || new Date()} /></div></div>
          <div className="flex-1 px-6 py-2 relative hover:bg-white/5 rounded-full transition flex flex-col justify-center"><label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cestující</label><div className="flex items-center justify-between"><span className="text-sm font-bold text-white">{searchSeats} {searchSeats === 1 ? 'osoba' : (searchSeats < 5 ? 'osoby' : 'osob')}</span><div className="flex gap-2 relative z-20"><button onClick={() => handleGuestsChange('decrement')} disabled={searchSeats <= 1} className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-500 text-slate-400 hover:border-white hover:text-white disabled:opacity-30">-</button><button onClick={() => handleGuestsChange('increment')} className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-500 text-slate-400 hover:border-white hover:text-white">+</button></div></div></div>
          <div className="pl-2"><button className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform active:scale-95">🔍</button></div>
        </div>
        <div className="md:hidden max-w-sm mx-auto"><input type="text" placeholder="🔍 Kam to bude?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white mb-4 shadow-lg" /></div>
        {(dateFrom || dateTo || searchSeats > 1 || searchTerm) && (<button onClick={() => { setDateFrom(null); setDateTo(null); setSearchSeats(1); setActiveCategory('all'); setSearchTerm(''); }} className="mt-6 text-sm text-red-400 hover:text-red-300 font-bold underline decoration-red-400/30">Vymazat filtry ✕</button>)}
        
        {/* SCROLLOVACÍ KATEGORIE PRO MOBIL */}
        <div className="w-full overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide -mx-4 md:mx-auto md:overflow-visible flex justify-start md:justify-center gap-3 snap-x">
            {CATEGORIES.map(cat => (
                <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)} 
                    className={`
                        whitespace-nowrap flex-shrink-0 snap-center px-5 py-2.5 rounded-full font-bold text-sm transition-all transform active:scale-95
                        ${activeCategory === cat.id 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20' 
                            : 'bg-slate-900/80 backdrop-blur text-slate-400 border border-white/10'
                        }
                    `}
                >
                    {cat.label}
                </button>
            ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 mb-16 hidden md:block px-4"><DealMap deals={filteredDeals} /></div>

      <div className="max-w-7xl mx-auto px-6 mt-4 md:mt-8">
        {errorMsg ? (
            <div className="text-center py-20 bg-red-900/20 rounded-2xl border border-red-500/50">
                <h2 className="text-3xl text-red-500 font-bold mb-2">⚠️ CHYBA PŘIPOJENÍ</h2>
                <p className="text-red-200 text-lg mb-4">{errorMsg}</p>
                <p className="text-slate-400 text-sm">Zkontroluj Vercel Environment Variables a udělej Redeploy.</p>
            </div>
        ) : loading ? (
            <div className="text-center py-20 text-slate-500 animate-pulse">
                <p className="text-2xl font-bold">Načítám destinace...</p>
                <p className="text-sm mt-2">Pokud to trvá dlouho, asi chybí klíče k databázi.</p>
            </div>
        ) : filteredDeals.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-white/5 border-dashed"><p className="text-xl text-slate-500">Nic jsme nenašli 🕵️‍♂️</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDeals.map((deal) => (
              <div key={deal.id} onClick={() => router.push(`/deal/${deal.id}`)} className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-900/20 transition duration-300 cursor-pointer group relative flex flex-col h-full">
                
                <button onClick={(e) => toggleFavorite(e, deal.id)} className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 transition group-active:scale-95"><span className={favoriteIds.includes(deal.id) ? "text-red-500 scale-110 inline-block" : "text-white opacity-70"}>{favoriteIds.includes(deal.id) ? '❤️' : '🤍'}</span></button>
                
                <button onClick={(e) => toggleCompare(e, deal)} className={`absolute top-3 left-3 z-20 p-2 rounded-full backdrop-blur transition group-active:scale-95 border ${compareList.find(d => d.id === deal.id) ? 'bg-blue-600 text-white border-blue-500' : 'bg-black/40 text-white border-transparent hover:bg-black/60'}`} title="Porovnat">⚖️</button>

                <div className="h-56 overflow-hidden relative">
                  <img src={deal.image} className={`w-full h-full object-cover group-hover:scale-105 transition duration-500 ${deal.seats_left === 0 ? 'grayscale opacity-50' : 'opacity-90 group-hover:opacity-100'}`} />
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <div className="flex flex-col gap-1 items-start">
                        {/* ŠTÍTKY KATEGORIE A AKCE */}
                        <div className="flex gap-1">
                            <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow uppercase tracking-wider">{deal.category || 'Ostatní'}</span>
                            {deal.is_special_offer && <span className="bg-yellow-500 text-black text-[10px] font-extrabold px-2 py-1 rounded shadow uppercase tracking-wider animate-pulse">⚡ AKCE</span>}
                        </div>
                        
                        {deal.seats_left === 0 ? (<span className="bg-slate-700 text-white text-[10px] font-bold px-2 py-1 rounded shadow uppercase tracking-wider">🚫 VYPRODÁNO</span>) : (deal.total_price < 15000 && !deal.is_special_offer && <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow uppercase tracking-wider">🔥 Super Cena</span>)}
                      </div>
                   </div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div><div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">✈️ {deal.from_city}</div><h3 className="text-xl font-bold text-white leading-tight">{deal.destination}</h3><p className="text-sm text-slate-400 mt-1">{deal.country}</p></div>
                    {deal.rating > 0 && <div className="bg-slate-800 text-xs font-bold px-2 py-1 rounded text-yellow-400">★ {deal.rating}</div>}
                  </div>
                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-end">
                    
                    {/* === CENA A SLEVY === */}
                    <div>
                        <p className="text-xs text-slate-500 mb-1">{formatDate(deal.departure_date)}</p>
                        {deal.original_price && deal.original_price > deal.total_price ? (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500 line-through decoration-red-500 decoration-2">{deal.original_price.toLocaleString()} Kč</span>
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                        -{Math.round(((deal.original_price - deal.total_price) / deal.original_price) * 100)}%
                                    </span>
                                </div>
                                <span className="text-2xl font-bold text-green-400">{(deal.total_price || 0).toLocaleString()} Kč</span>
                            </div>
                        ) : (
                            <span className="text-2xl font-bold text-green-400">{(deal.total_price || 0).toLocaleString()} Kč</span>
                        )}
                    </div>

                    {deal.seats_left > 0 && deal.seats_left <= 3 && <div className="text-[10px] font-bold text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-500/20 animate-pulse">Poslední {deal.seats_left} místa!</div>}
                    {deal.seats_left === 0 && <div className="text-[10px] font-bold text-slate-500">Kapacita naplněna</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {compareList.length > 0 && (
          <div className="fixed bottom-20 md:bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-blue-500/30 p-4 z-50 flex justify-between items-center shadow-2xl animate-in slide-in-from-bottom-full duration-300">
              <div className="max-w-7xl mx-auto w-full flex justify-between items-center px-4">
                  <div className="flex items-center gap-4">
                      <span className="text-white font-bold hidden md:inline">Porovnání:</span>
                      <div className="flex gap-2">
                          {compareList.map(item => (<div key={item.id} className="relative group"><img src={item.image} className="w-10 h-10 rounded-full object-cover border-2 border-blue-500" /><button onClick={(e) => toggleCompare(e, item)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] hover:scale-110">✕</button></div>))}
                          {compareList.length < 2 && <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 text-xs">+</div>}
                      </div>
                  </div>
                  <button onClick={() => setShowCompareModal(true)} disabled={compareList.length < 2} className={`px-6 py-2 rounded-full font-bold transition ${compareList.length === 2 ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>{compareList.length === 2 ? '⚖️ Porovnat' : 'Vyber ještě jednu'}</button>
              </div>
          </div>
      )}

      {showCompareModal && compareList.length === 2 && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                  <button onClick={() => setShowCompareModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl z-10">✕</button>
                  <h2 className="text-2xl font-bold text-center text-white py-6 border-b border-white/10">Porovnání dovolených</h2>
                  <div className="grid grid-cols-2 divide-x divide-white/10">
                      {compareList.map(deal => (
                          <div key={deal.id} className="p-6 text-center space-y-4">
                              <img src={deal.image} className="w-full h-48 object-cover rounded-xl mb-4" />
                              <h3 className="text-2xl font-bold text-white">{deal.destination}</h3>
                              <p className="text-slate-400">{deal.country}</p>
                              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4">
                                  <div><p className="text-xs text-slate-500 uppercase font-bold">Cena</p><p className={`text-2xl font-bold ${deal.total_price <= compareList.find(d => d.id !== deal.id)!.total_price ? 'text-green-400' : 'text-white'}`}>{deal.total_price.toLocaleString()} Kč</p></div>
                                  <div><p className="text-xs text-slate-500 uppercase font-bold">Hodnocení</p><p className="text-yellow-400 font-bold text-lg">{'★'.repeat(deal.rating)}</p></div>
                                  <div><p className="text-xs text-slate-500 uppercase font-bold">Kategorie</p><p className="text-white">{deal.category}</p></div>
                                  <div><p className="text-xs text-slate-500 uppercase font-bold">Volná místa</p><p className={deal.seats_left < 3 ? 'text-red-400 font-bold' : 'text-white'}>{deal.seats_left}</p></div>
                              </div>
                              <button onClick={() => router.push(`/deal/${deal.id}`)} className="bg-blue-600 hover:bg-blue-500 text-white w-full py-3 rounded-xl font-bold mt-4">Detail</button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* === ZDE ZAČÍNAJÍ NOVÉ SEKCE S KOTVAMI (ID) PRO NAVBAR === */}
      
      <div id="buddy-section" className="scroll-mt-24">
        <BuddySection />
      </div>
      
      <div id="visa-section" className="scroll-mt-24">
        <VisaHealthSection />
      </div>
      
      <div id="hacks-section" className="scroll-mt-24">
        <TravelHacksSection />
      </div>
      
      {/* NOVÁ SEKCE: PIVNÍ INDEX */}
      <BeerIndex />

      {/* === VLOŽENÝ AI CHATBOT, KOLO ŠTĚSTÍ A POPTÁVKA === */}
      <AiChat />
      <LuckyWheel />
      <CustomHolidayModal />

      <section className="mt-20 py-20 bg-blue-900/10 backdrop-blur-sm border-y border-white/5 relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div><div className="max-w-4xl mx-auto px-6 text-center relative z-10"><h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nechceš propásnout chyby v letenkách? 💸</h2><p className="text-slate-400 mb-8 text-lg">Přihlas se k odběru a my ti pošleme ty nejšílenější slevy hned, jak se objeví.</p>{subscribed ? (<div className="bg-green-500/20 text-green-400 p-4 rounded-xl font-bold border border-green-500/30">Díky! Jsi na seznamu. 📩</div>) : (<form onSubmit={handleNewsletterSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto"><input type="email" placeholder="Tvůj e-mail..." required value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-blue-500 outline-none transition" /><button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-blue-900/20">Odebírat</button></form>)}</div></section>

      {/* SPODNÍ NAVIGACE (Jen pro mobil) */}
      <MobileBottomNav />

      {/* Odsazení na mobilu, aby spodní lišta nezakrývala obsah */}
      <div className="h-20 md:hidden"></div>
    </main>
  );
}