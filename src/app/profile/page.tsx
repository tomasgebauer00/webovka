'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      const { data: bookingsData } = await supabase.from('bookings').select('*, deals(*)').eq('user_id', user.id).order('created_at', { ascending: false });
      setBookings(bookingsData || []);
      const { data: favData } = await supabase.from('favorites').select('*, deals(*)').eq('user_id', user.id);
      setFavorites(favData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Načítám profil...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center gap-6 mb-12 border-b border-white/10 pb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl">{user.email.charAt(0).toUpperCase()}</div>
            <div><h1 className="text-3xl font-bold text-white">Můj cestovatelský profil</h1><p className="text-slate-400">{user.email}</p></div>
        </div>

        <div className="grid gap-12">
            <section>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">🎫 Moje rezervace <span className="text-sm bg-blue-900 text-blue-300 px-2 py-1 rounded-full">{bookings.length}</span></h2>
                {bookings.length === 0 ? (
                    <div className="bg-slate-900/50 p-8 rounded-2xl border border-white/5 text-center"><p className="text-slate-400 mb-4">Zatím nemáš žádné naplánované cesty.</p><button onClick={() => router.push('/')} className="text-blue-400 hover:text-white font-bold underline">Vybrat dovolenou →</button></div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-slate-900 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-blue-500/30 transition">
                                <div className="flex gap-4 items-center w-full"><img src={booking.deals?.image} className="w-16 h-16 rounded-lg object-cover bg-slate-800" /><div><h3 className="font-bold text-xl text-white">{booking.deals?.destination}</h3><p className="text-sm text-slate-400">{booking.people_count} os. • {new Date(booking.created_at).toLocaleDateString('cs-CZ')}</p></div></div>
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between">
                                    <div className="text-right"><p className="text-xs text-slate-500 uppercase font-bold">Cena celkem</p><p className="text-lg font-bold text-green-400">{booking.total_price?.toLocaleString()} Kč</p></div>
                                    
                                    {/* NOVÉ: Zobrazení stavu (Barvičky) */}
                                    <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 
                                        (booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/10 text-yellow-500')
                                    }`}>
                                        {booking.status === 'confirmed' ? 'Potvrzeno' : (booking.status === 'cancelled' ? 'Zrušeno' : 'Čeká se')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            
            <section><h2 className="text-2xl font-bold text-white mb-6">❤️ Uložené sny</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{favorites.map((fav) => (<div key={fav.id} onClick={() => router.push(`/deal/${fav.deal_id}`)} className="bg-slate-900 p-4 rounded-xl border border-white/5 flex gap-4 cursor-pointer hover:bg-slate-800 transition group"><img src={fav.deals?.image} className="w-20 h-20 rounded-lg object-cover" /><div><h3 className="font-bold text-white group-hover:text-blue-400 transition">{fav.deals?.destination}</h3><p className="text-sm text-slate-400">{fav.deals?.country}</p><p className="text-green-400 font-bold mt-1">{fav.deals?.total_price.toLocaleString()} Kč</p></div></div>))}</div></section>
        </div>
      </div>
    </main>
  );
}