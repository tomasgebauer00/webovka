'use client';
import { useEffect, useState, use } from 'react';
import { supabase } from '../../../lib/supabase';
import Navbar from '../../../components/Navbar';
import { useRouter } from 'next/navigation';
// 1. IMPORT KOMPONENTY RECENZÍ
import Reviews from '../../../components/Reviews';

export default function DealDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [deal, setDeal] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  // Původní načítání recenzí uvnitř useEffectu můžeme nechat pro ten malý náhled nahoře, 
  // nebo ho smazat, protože 'Reviews' komponenta si je načte sama. 
  // Nechám to tu, aby ti fungoval ten horní výpis "Recenze ({reviews.length})".
  const [reviews, setReviews] = useState<any[]>([]);
  
  // Modaly
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPackingList, setShowPackingList] = useState(false);

  const [bookingData, setBookingData] = useState({ name: '', email: '', phone: '', people: 1 });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [itinerary, setItinerary] = useState<string[] | null>(null);
  
  // FOMO Časovač
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 23, seconds: 12 });

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: dealData } = await supabase.from('deals').select('*').eq('id', id).single();
      if (dealData) {
        setDeal(dealData);
        if (dealData.latitude && dealData.longitude) {
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${dealData.latitude}&longitude=${dealData.longitude}&current_weather=true`)
                .then(res => res.json())
                .then(wData => setWeather(wData.current_weather));
        }
      }
      const { data: reviewsData } = await supabase.from('reviews').select('*').eq('deal_id', id).order('created_at', { ascending: false });
      setReviews(reviewsData || []);
    };
    fetchData();

    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
            if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
            if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
            return prev;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, [id]);

  // === Logika pro generování seznamu věcí ===
  const getPackingItems = () => {
      if (!deal) return [];
      const items = [
          { name: "Cestovní pas & Doklady", checked: false },
          { name: "Mobil & Nabíječka", checked: false },
          { name: "Peníze & Platební karta", checked: false },
      ];

      if (weather && weather.temperature > 20) {
          items.push(
              { name: "Sluneční brýle", checked: false },
              { name: "Opalovací krém", checked: false },
              { name: "Pokrývka hlavy", checked: false }
          );
      }
      if (weather && weather.temperature < 15) {
          items.push(
              { name: "Teplá bunda", checked: false },
              { name: "Šála nebo šátek", checked: false }
          );
      }

      if (deal.category === 'Exotika' || deal.description.toLowerCase().includes('moře')) {
          items.push(
              { name: "Plavky (alespoň dvoje)", checked: false },
              { name: "Žabky / Sandály", checked: false },
              { name: "Repelent proti hmyzu", checked: false },
              { name: "Adaptér do zásuvky", checked: false }
          );
      } else if (deal.category === 'Evropa' || deal.category === 'Česko') {
           items.push(
              { name: "Pohodlné boty na chození", checked: false },
              { name: "Powerbanka na focení", checked: false }
          );
      }

      return items;
  };
  
  const [packingItems, setPackingItems] = useState<any[]>([]);
  
  const openPackingList = () => {
      setPackingItems(getPackingItems());
      setShowPackingList(true);
  };

  const toggleItem = (index: number) => {
      const newItems = [...packingItems];
      newItems[index].checked = !newItems[index].checked;
      setPackingItems(newItems);
  };

  const generateItinerary = () => {
    setAiLoading(true);
    setTimeout(() => {
        const isBeach = deal.category === 'Exotika' || deal.description.toLowerCase().includes('pláž');
        const activities = isBeach 
            ? ["Ranní jóga na pláži při východu slunce", "Šnorchlování u korálových útesů", "Oběd v místním plážovém baru", "Výlet lodí na opuštěný ostrov", "Večerní koktejly a pozorování hvězd"]
            : ["Prohlídka historického centra s průvodcem", "Návštěva národního muzea a trhů", "Ochutnávka místní street food gastronomie", "Výšlap na vyhlídku nad městem", "Večeře v luxusní restauraci s živou hudbou"];
        setItinerary(activities);
        setAiLoading(false);
    }, 2000);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('bookings').insert([{
        deal_id: id, user_id: user?.id || null, name: bookingData.name, email: bookingData.email, phone: bookingData.phone, people_count: bookingData.people, total_price: (deal.total_price * bookingData.people), status: 'pending'
    }]);
    setBookingLoading(false);
    if (error) { alert('Chyba při rezervaci: ' + error.message); } 
    else { alert("Rezervace odeslána! ✈️"); setDeal({...deal, seats_left: deal.seats_left - bookingData.people}); setShowBookingForm(false); }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const handleShare = (platform: string) => {
      if (platform === 'copy') { navigator.clipboard.writeText(shareUrl); alert('Odkaz zkopírován! 📋'); }
      else if (platform === 'facebook') { window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank'); }
      else if (platform === 'whatsapp') { window.open(`https://wa.me/?text=${encodeURIComponent(`Koukej: ${deal?.destination} ${shareUrl}`)}`, '_blank'); }
  };

  if (!deal) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Načítám...</div>;
  const isSoldOut = deal.seats_left <= 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />
      <div className="h-[50vh] relative">
        <img src={deal.image} className={`w-full h-full object-cover ${isSoldOut ? 'grayscale' : ''}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 max-w-7xl mx-auto">
            <button onClick={() => router.back()} className="mb-4 text-slate-400 hover:text-white transition">← Zpět na výpis</button>
            <h1 className="text-5xl font-extrabold text-white mb-2">{deal.destination}</h1>
            <div className="flex flex-wrap items-center gap-4">
                <p className="text-xl text-slate-300">{deal.country}</p>
                {weather && <span className="bg-blue-600/30 text-blue-200 text-sm px-3 py-1 rounded-full border border-blue-500/50">☀️ {weather.temperature}°C</span>}
                <div className="flex gap-2 ml-auto">
                    <button onClick={() => handleShare('facebook')} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full text-xs font-bold transition">FB</button>
                    <button onClick={() => handleShare('whatsapp')} className="bg-green-500 hover:bg-green-400 text-white p-2 rounded-full text-xs font-bold transition">WhatsApp</button>
                    <button onClick={() => handleShare('copy')} className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-full text-xs font-bold transition">🔗</button>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
            <section className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                <h3 className="text-2xl font-bold text-white mb-4">O destinaci</h3>
                <p className="text-slate-400 leading-relaxed text-lg">{deal.description}</p>
            </section>
            
            <section className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 rounded-2xl border border-purple-500/30">
                <h3 className="text-2xl font-bold text-white mb-2">✨ AI Průvodce</h3>
                <p className="text-slate-400 mb-4">Nevíš, co tam dělat? Nech umělou inteligenci navrhnout program.</p>
                
                <div className="flex flex-wrap gap-4">
                    {!itinerary && <button onClick={generateItinerary} disabled={aiLoading} className="bg-white text-purple-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition shadow-lg">{aiLoading ? 'Generuji...' : '🤖 Vygenerovat program'}</button>}
                    
                    <button onClick={openPackingList} className="bg-slate-800 text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition shadow-lg flex items-center gap-2">
                        🎒 Co sbalit?
                    </button>
                </div>

                {itinerary && <div className="mt-4 space-y-3">{itinerary.map((item, i) => (<div key={i} className="flex gap-3 items-start bg-slate-900/50 p-3 rounded-lg border border-white/5"><span className="bg-purple-500/20 text-purple-300 font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">{i+1}</span><span className="text-slate-200">{item}</span></div>))}</div>}
            </section>
        </div>

        <div className="space-y-6">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl sticky top-24 shadow-2xl">
                {!isSoldOut && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex justify-between items-center animate-pulse">
                        <span className="text-red-400 text-xs font-bold uppercase">Akce končí za:</span>
                        <span className="text-white font-mono font-bold">{String(timeLeft.hours).padStart(2,'0')}:{String(timeLeft.minutes).padStart(2,'0')}:{String(timeLeft.seconds).padStart(2,'0')}</span>
                    </div>
                )}
                <p className="text-sm text-slate-500 mb-1">Cena za osobu</p>
                <div className="text-4xl font-extrabold text-green-400 mb-6">{deal.total_price.toLocaleString()} Kč</div>
                <button onClick={() => setShowBookingForm(true)} disabled={isSoldOut} className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg mb-3 ${isSoldOut ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'}`}>{isSoldOut ? '🚫 VYPRODÁNO' : 'Rezervovat hned'}</button>
                <p className="text-center text-xs text-slate-500">{isSoldOut ? 'Kapacita naplněna.' : `Zbývá jen ${deal.seats_left} míst!`}</p>
            </div>
        </div>
      </div>
      
      {/* 2. ZDE VKLÁDÁME NOVOU SEKCÍ RECENZÍ */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
          <Reviews dealId={deal.id} />
      </div>

      {/* MODAL: REZERVACE */}
      {showBookingForm && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setShowBookingForm(false)}>
             <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 relative" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setShowBookingForm(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl">✕</button>
                 <h2 className="text-2xl font-bold text-white mb-6">Nezávazná rezervace</h2>
                 <form onSubmit={handleBooking} className="space-y-4">
                     <input type="text" placeholder="Jméno" required className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white outline-none" value={bookingData.name} onChange={e => setBookingData({...bookingData, name: e.target.value})} />
                     <input type="email" placeholder="E-mail" required className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white outline-none" value={bookingData.email} onChange={e => setBookingData({...bookingData, email: e.target.value})} />
                     <input type="tel" placeholder="Telefon" required className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white outline-none" value={bookingData.phone} onChange={e => setBookingData({...bookingData, phone: e.target.value})} />
                     <div className="flex gap-4"><input type="number" min="1" max={deal.seats_left} className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white outline-none" value={bookingData.people} onChange={e => setBookingData({...bookingData, people: parseInt(e.target.value)})} /><div className="p-3 text-green-400 font-bold">{(deal.total_price * bookingData.people).toLocaleString()} Kč</div></div>
                     <button type="submit" disabled={bookingLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold mt-4 transition">{bookingLoading ? 'Odesílám...' : 'Odeslat rezervaci'}</button>
                 </form>
             </div>
         </div>
      )}

      {/* MODAL PACKING LIST */}
      {showPackingList && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setShowPackingList(false)}>
             <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 relative" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setShowPackingList(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl">✕</button>
                 <h2 className="text-2xl font-bold text-white mb-2">🎒 Co si sbalit?</h2>
                 <p className="text-slate-400 text-sm mb-6">Chytrý seznam podle počasí a destinace.</p>

                 <div className="space-y-3">
                    {packingItems.map((item, index) => (
                        <div key={index} onClick={() => toggleItem(index)} className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition ${item.checked ? 'bg-green-900/20 border-green-500/30' : 'bg-slate-950 border-white/10 hover:bg-slate-800'}`}>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.checked ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                                {item.checked && <span className="text-white font-bold text-xs">✓</span>}
                            </div>
                            <span className={item.checked ? 'text-green-400 line-through' : 'text-white'}>{item.name}</span>
                        </div>
                    ))}
                 </div>
                 
                 <button onClick={() => setShowPackingList(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold mt-6 transition">Zavřít</button>
             </div>
         </div>
      )}
    </main>
  );
}