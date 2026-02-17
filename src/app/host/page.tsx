'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Calendar, MapPin, DollarSign, CheckCircle, XCircle } from 'lucide-react';

export default function HostDashboard() {
  const router = useRouter();
  const [myDeals, setMyDeals] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // 1. Načíst MOJE nabídky
      const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .eq('owner_id', user.id);
      
      setMyDeals(deals || []);

      // 2. Načíst rezervace k mým nabídkám
      // (Používáme trik s !inner joinem, abychom filtrovali bookings podle owner_id v deals)
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*, deals!inner(owner_id, destination, image)')
        .eq('deals.owner_id', user.id)
        .order('created_at', { ascending: false });

      if (bookings) {
        setMyBookings(bookings);
        // Spočítat tržby z potvrzených rezervací
        const total = bookings
            .filter((b: any) => b.status === 'confirmed')
            .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0);
        setEarnings(total);
      }
      setLoading(false);
    };
    loadData();
  }, [router]);

  const handleDelete = async (id: number) => {
    if(!confirm("Opravdu smazat toto ubytování?")) return;
    await supabase.from('deals').delete().eq('id', id);
    setMyDeals(prev => prev.filter(d => d.id !== id));
  };

  const handleBookingStatus = async (id: number, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    setMyBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    // Přepočítat tržby (zjednodušeně refresh stránky nebo local update)
    if(status === 'confirmed') alert("Rezervace potvrzena! 💰");
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Načítám tvůj byznys...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 max-w-7xl">
        
        {/* HEADER & STATS */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Můj Hostitelský Panel 🏠</h1>
            <p className="text-slate-400 mt-1">Vítej zpět! Tady máš přehled svého podnikání.</p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 px-6 py-3 rounded-2xl flex items-center gap-4">
            <div className="bg-green-500/20 p-2 rounded-full"><DollarSign className="text-green-400" /></div>
            <div>
                <p className="text-xs text-green-400 font-bold uppercase">Celkové tržby</p>
                <p className="text-2xl font-black">{earnings.toLocaleString()} Kč</p>
            </div>
          </div>
        </div>

        {/* TLAČÍTKO PŘIDAT */}
        <div className="mb-10 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-3xl flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold mb-2">Chceš vydělat víc?</h2>
            <p className="text-slate-400 mb-6">Přidej další nemovitost nebo auto do nabídky.</p>
            <button onClick={() => router.push('/host/add')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-900/40 flex items-center gap-2 transition hover:scale-105">
                <Plus size={20} /> Přidat novou nabídku
            </button>
        </div>

        {/* MOJE REZERVACE */}
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Calendar className="text-blue-500" /> Příchozí rezervace</h2>
        <div className="grid gap-4 mb-12">
            {myBookings.length === 0 ? (
                <p className="text-slate-500 italic">Zatím žádné rezervace. Musíš to víc propagovat!</p>
            ) : (
                myBookings.map(booking => (
                    <div key={booking.id} className="bg-slate-900 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <img src={booking.deals?.image} className="w-16 h-16 rounded-lg object-cover" />
                            <div>
                                <h3 className="font-bold">{booking.deals?.destination}</h3>
                                <p className="text-sm text-slate-300">Host: <span className="text-white font-bold">{booking.name}</span> ({booking.email})</p>
                                <p className="text-xs text-slate-500">Osob: {booking.people_count} | Cena: {booking.total_price} Kč</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            {booking.status === 'pending' && (
                                <>
                                    <button onClick={() => handleBookingStatus(booking.id, 'confirmed')} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1"><CheckCircle size={16}/> Potvrdit</button>
                                    <button onClick={() => handleBookingStatus(booking.id, 'cancelled')} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1"><XCircle size={16}/> Zamítnout</button>
                                </>
                            )}
                            {booking.status === 'confirmed' && <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded text-sm font-bold">✅ Potvrzeno</span>}
                            {booking.status === 'cancelled' && <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-sm font-bold">❌ Zrušeno</span>}
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* MOJE UBYTOVÁNÍ */}
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><MapPin className="text-purple-500" /> Moje nemovitosti</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myDeals.map(deal => (
            <div key={deal.id} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden group hover:border-blue-500/30 transition">
              <div className="h-48 relative">
                <img src={deal.image} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white">
                  {deal.total_price} Kč / noc
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">{deal.destination}</h3>
                <p className="text-sm text-slate-400 mb-4">{deal.country}</p>
                
                <div className="flex gap-2 border-t border-white/5 pt-4">
                  <button onClick={() => alert("Editace bude brzy!")} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-bold transition">
                    ✏️ Upravit
                  </button>
                  <button onClick={() => handleDelete(deal.id)} className="bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-lg transition">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}