'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function SwipePage() {
  const router = useRouter();
  const [deals, setDeals] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      // Načteme náhodné zájezdy
      const { data } = await supabase.from('deals').select('*').limit(20);
      if (data) setDeals(data.sort(() => Math.random() - 0.5)); // Zamíchat
    };
    fetchDeals();
  }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (animating || currentIndex >= deals.length) return;
    
    setAnimating(direction);
    
    // Pokud doprava (LIKE) -> uložit do oblíbených
    if (direction === 'right') {
        const dealId = deals[currentIndex].id;
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('favorites').insert([{ user_id: user.id, deal_id: dealId }]);
        }
    }

    // Počkat na animaci a posunout index
    setTimeout(() => {
        setAnimating(null);
        setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const currentDeal = deals[currentIndex];

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex flex-col items-center justify-center p-4 pt-24 relative">
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-300 uppercase tracking-widest">🔥 Najdi svůj match 🔥</h1>

        {/* KONTEJNER KARET */}
        <div className="relative w-full max-w-md h-[60vh]">
            {currentIndex >= deals.length ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 rounded-3xl border border-white/10 text-center p-8">
                    <h2 className="text-3xl font-bold mb-4">To je vše! 🤷‍♂️</h2>
                    <p className="text-slate-400 mb-8">Prošel jsi všechny nabídky.</p>
                    <button onClick={() => router.push('/profile')} className="bg-blue-600 px-8 py-4 rounded-xl font-bold">Jít na Mé oblíbené</button>
                </div>
            ) : (
                currentDeal && (
                    <div 
                        className={`absolute inset-0 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-transform duration-300 ${
                            animating === 'left' ? '-translate-x-full rotate-[-20deg] opacity-0' : 
                            animating === 'right' ? 'translate-x-full rotate-[20deg] opacity-0' : ''
                        }`}
                    >
                        <img src={currentDeal.image} className="w-full h-3/5 object-cover pointer-events-none" />
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 w-full p-8">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h2 className="text-4xl font-extrabold text-white mb-1 shadow-black drop-shadow-lg">{currentDeal.destination}</h2>
                                    <p className="text-xl text-slate-300 font-bold">{currentDeal.country}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-green-400 drop-shadow-md">{currentDeal.total_price.toLocaleString()} Kč</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 mb-6">
                                <span className="bg-blue-600/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase">{currentDeal.category}</span>
                                <span className="bg-slate-700/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">★ {currentDeal.rating}</span>
                            </div>

                            {/* TLAČÍTKA */}
                            <div className="flex justify-center gap-8">
                                <button 
                                    onClick={() => handleSwipe('left')}
                                    className="w-16 h-16 rounded-full bg-slate-800 border-2 border-red-500 text-red-500 text-3xl flex items-center justify-center hover:bg-red-500 hover:text-white transition hover:scale-110 shadow-lg shadow-red-900/30"
                                >
                                    ✕
                                </button>
                                <button 
                                    onClick={() => router.push(`/deal/${currentDeal.id}`)}
                                    className="w-12 h-12 rounded-full bg-slate-800 border border-white/20 text-slate-400 text-lg flex items-center justify-center hover:bg-white hover:text-black transition"
                                >
                                    ℹ️
                                </button>
                                <button 
                                    onClick={() => handleSwipe('right')}
                                    className="w-16 h-16 rounded-full bg-slate-800 border-2 border-green-500 text-green-500 text-3xl flex items-center justify-center hover:bg-green-500 hover:text-white transition hover:scale-110 shadow-lg shadow-green-900/30"
                                >
                                    ♥
                                </button>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
      </div>
    </main>
  );
}