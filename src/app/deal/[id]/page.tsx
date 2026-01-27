'use client';
import { useEffect, useState, use } from 'react';
import { supabase } from '../../../lib/supabase';
import Navbar from '../../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function DealDetail({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15: Rozbalení parametrů
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [deal, setDeal] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]); // Seznam recenzí

  // Stavy pro rezervaci
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({ name: '', email: '', phone: '', people: 1 });
  const [bookingLoading, setBookingLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Načíst detail dovolené
      const { data: dealData } = await supabase.from('deals').select('*').eq('id', id).single();
      if (dealData) {
        setDeal(dealData);
        // 2. Počasí (pokud má souřadnice)
        if (dealData.latitude && dealData.longitude) {
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${dealData.latitude}&longitude=${dealData.longitude}&current_weather=true`)
                .then(res => res.json())
                .then(wData => setWeather(wData.current_weather));
        }
      }

      // 3. Načíst recenze
      const { data: reviewsData } = await supabase.from('reviews').select('*').eq('deal_id', id).order('created_at', { ascending: false });
      setReviews(reviewsData || []);
    };
    fetchData();
  }, [id]);

  // Funkce pro odeslání rezervace
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    // Vložení do databáze
    const { error } = await supabase.from('bookings').insert([{
        deal_id: id,
        user_id: user?.id || null, // Uloží ID uživatele, pokud je přihlášen
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        people_count: bookingData.people,
        total_price: (deal.total_price * bookingData.people)
    }]);

    setBookingLoading(false);

    if (error) {
        alert('Chyba při rezervaci: ' + error.message);
    } else {
        alert("Rezervace úspěšně odeslána! ✈️ Brzy se ti ozveme.");
        setShowBookingForm(false);
    }
  };

  if (!deal) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Načítám...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />

      {/* --- HERO SECTION (FOTKA) --- */}
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
        {/* --- LEVÝ SLOUPEC (INFO + RECENZE) --- */}
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

            {/* --- NOVÉ: SEKCE RECENZÍ --- */}
            <section className="pt-8 border-t border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6">Recenze cestovatelů ({reviews.length})</h3>
                {reviews.length === 0 ? (
                    <p className="text-slate-500 italic">Zatím žádné recenze. Buď první, kdo sem pojede!</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map(rev => (
                            <div key={rev.id} className="bg-slate-900 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-white">{rev.user_name || 'Cestovatel'}</span>
                                    <span className="text-yellow-400 text-sm">{'★'.repeat(rev.rating)}</span>
                                </div>
                                <p className="text-slate-400">{rev.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>

        {/* --- PRAVÝ SLOUPEC (CENA + REZERVACE) --- */}
        <div className="space-y-6">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl sticky top-24 shadow-2xl">
                <p className="text-sm text-slate-500 mb-1">Cena za osobu</p>
                <div className="text-4xl font-extrabold text-green-400 mb-6">
                    {deal.total_price.toLocaleString()} Kč
                </div>
                
                <button 
                    onClick={() => setShowBookingForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-900/20 mb-3"
                >
                    Rezervovat hned
                </button>
                <p className="text-center text-xs text-slate-500">
                    Zbývá jen {deal.seats_left} míst!
                </p>
            </div>
        </div>
      </div>

      {/* --- MODAL OKNO (REZERVACE) --- */}
      {showBookingForm && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setShowBookingForm(false)}>
             <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 relative" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setShowBookingForm(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl">✕</button>
                 
                 <h2 className="text-2xl font-bold text-white mb-2">Nezávazná rezervace</h2>
                 <p className="text-slate-400 mb-6 text-sm">Vyplň údaje a my se ti ozveme pro potvrzení.</p>

                 <form onSubmit={handleBooking} className="space-y-4">
                     <div>
                         <label className="text-xs text-slate-500 uppercase font-bold">Jméno</label>
                         <input 
                             type="text" 
                             required
                             className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                             value={bookingData.name}
                             onChange={e => setBookingData({...bookingData, name: e.target.value})}
                         />
                     </div>
                     <div>
                         <label className="text-xs text-slate-500 uppercase font-bold">E-mail</label>
                         <input 
                             type="email" 
                             required
                             className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                             value={bookingData.email}
                             onChange={e => setBookingData({...bookingData, email: e.target.value})}
                         />
                     </div>
                     <div>
                         <label className="text-xs text-slate-500 uppercase font-bold">Telefon</label>
                         <input 
                             type="tel" 
                             required
                             className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                             value={bookingData.phone}
                             onChange={e => setBookingData({...bookingData, phone: e.target.value})}
                         />
                     </div>
                     <div className="flex gap-4">
                          <div className="flex-1">
                             <label className="text-xs text-slate-500 uppercase font-bold">Počet osob</label>
                             <input 
                                 type="number" 
                                 min="1" 
                                 max={deal.seats_left}
                                 className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                 value={bookingData.people}
                                 onChange={e => setBookingData({...bookingData, people: parseInt(e.target.value)})}
                             />
                          </div>
                          <div className="flex-1">
                             <label className="text-xs text-slate-500 uppercase font-bold">Celkem</label>
                             <div className="p-3 text-green-400 font-bold">
                                 {(deal.total_price * bookingData.people).toLocaleString()} Kč
                             </div>
                          </div>
                     </div>

                     <button 
                         type="submit" 
                         disabled={bookingLoading}
                         className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold mt-4 transition"
                     >
                         {bookingLoading ? 'Odesílám...' : 'Odeslat rezervaci'}
                     </button>
                 </form>
             </div>
         </div>
      )}
    </main>
  );
}