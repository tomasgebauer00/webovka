'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ countries: 0, moneySaved: 0, level: 'Gaučák 🛋️' });
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Načíst historii cest
      const { data: myBookings } = await supabase
        .from('bookings')
        .select('*, deals(destination, country, original_price, total_price)')
        .eq('email', user.email); // Propojujeme přes email, ideálně přes user_id pokud ho ukládáš

      if (myBookings) {
        setBookings(myBookings);
        
        // Vypočítat statistiky
        const countriesSet = new Set(myBookings.map((b: any) => b.deals?.country).filter(Boolean));
        const uniqueCountries = Array.from(countriesSet) as string[];
        setVisitedCountries(uniqueCountries);
        
        const saved = myBookings.reduce((acc, b: any) => {
            const orig = b.deals?.original_price || b.deals?.total_price * 1.2; // Odhad slevy pokud není original
            return acc + (orig - b.deals?.total_price);
        }, 0);

        // Určení Levelu
        let lvl = 'Začátečník 🎒';
        if (uniqueCountries.length > 2) lvl = 'Průzkumník 🧭';
        if (uniqueCountries.length > 5) lvl = 'Světoběžník 🌍';
        if (uniqueCountries.length > 10) lvl = 'Legenda 👑';

        setStats({
            countries: uniqueCountries.length,
            moneySaved: Math.round(saved),
            level: lvl
        });
      }
      setLoading(false);
    };
    getData();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Načítám profil...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-28 px-6 pb-20">
        
        {/* HLAVIČKA PROFILU */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                {user.email[0].toUpperCase()}
            </div>
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-white">{user.email}</h1>
                <p className="text-blue-400 font-bold mt-1">{stats.level}</p>
                <p className="text-slate-500 text-sm">Členem TripHack rodiny</p>
            </div>
        </div>

        {/* STATISTIKY (Stírací mapa v číslech) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="text-4xl mb-2">🌍</div>
                <h3 className="text-slate-400 text-sm uppercase font-bold">Navštívené země</h3>
                <p className="text-3xl font-extrabold text-white mt-2">{stats.countries}</p>
            </div>
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <div className="text-4xl mb-2">💸</div>
                <h3 className="text-slate-400 text-sm uppercase font-bold">Ušetřeno s námi</h3>
                <p className="text-3xl font-extrabold text-green-400 mt-2">{stats.moneySaved.toLocaleString()} Kč</p>
            </div>
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                <div className="text-4xl mb-2">✈️</div>
                <h3 className="text-slate-400 text-sm uppercase font-bold">Počet cest</h3>
                <p className="text-3xl font-extrabold text-white mt-2">{bookings.length}</p>
            </div>
        </div>

        {/* MOJE CESTOVATELSKÁ MAPA (Seznam zemí) */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">📍 Moje Cestovatelská Mapa</h2>
            
            {visitedCountries.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {visitedCountries.map((country, index) => (
                        <span key={index} className="bg-blue-900/30 border border-blue-500/30 text-blue-200 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                            ✅ {country}
                        </span>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-xl">
                    <p className="text-slate-500 mb-4">Zatím jsi nikde nebyl... To musíme napravit! ✈️</p>
                    <button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition">
                        Vybrat první dobrodružství
                    </button>
                </div>
            )}
            
            {/* Progress Bar do dalšího levelu */}
            <div className="mt-8">
                <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase font-bold">
                    <span>Tvůj progress</span>
                    <span>Další level: {stats.countries < 3 ? 'Průzkumník (3 země)' : (stats.countries < 6 ? 'Světoběžník (6 zemí)' : 'Legenda')}</span>
                </div>
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                        style={{ width: `${Math.min(stats.countries * 10, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* HISTORIE REZERVACÍ */}
        <h2 className="text-2xl font-bold text-white mb-6">📜 Historie rezervací</h2>
        <div className="space-y-4">
            {bookings.length === 0 ? (
                 <p className="text-slate-500">Zatím žádné rezervace.</p>
            ) : bookings.map((booking) => (
                <div key={booking.id} className="bg-slate-900 border border-white/10 p-4 rounded-xl flex justify-between items-center hover:border-white/20 transition">
                    <div>
                        <h3 className="font-bold text-white text-lg">{booking.deals?.destination}</h3>
                        <p className="text-sm text-slate-400">{booking.deals?.country} • {new Date(booking.created_at).toLocaleDateString('cs-CZ')}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 rounded text-xs uppercase font-bold ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            {booking.status === 'confirmed' ? 'Potvrzeno' : 'Čeká se'}
                        </span>
                        <p className="font-bold text-white mt-1">{booking.total_price} Kč</p>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}