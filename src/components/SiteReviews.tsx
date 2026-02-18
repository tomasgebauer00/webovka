'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star, User, Quote } from 'lucide-react';

export default function SiteReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Formulář
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchReviews();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchReviews = async () => {
    const { data } = await supabase.from('site_reviews').select('*').order('created_at', { ascending: false }).limit(6);
    setReviews(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Musíš být přihlášen!");

    const { error } = await supabase.from('site_reviews').insert([{
        user_id: user.id,
        rating,
        comment,
        user_name: user.email?.split('@')[0], // Zjednodušené jméno
        user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` // Generovaný avatar
    }]);

    if (error) alert(error.message);
    else {
        setComment('');
        setShowForm(false);
        fetchReviews();
        alert("Díky za recenzi! 💙");
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Pozadí */}
      <div className="absolute inset-0 bg-blue-900/5 -skew-y-3 z-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Co o nás říkají <span className="text-blue-500">cestovatelé?</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Přidej se k tisícům lidí, kteří s námi objevují svět levněji a chytřeji.</p>
            
            {user && !showForm && (
                <button onClick={() => setShowForm(true)} className="mt-6 text-blue-400 font-bold hover:text-white transition border-b border-blue-400 hover:border-white">
                    Napsat vlastní zkušenost ✍️
                </button>
            )}
        </div>

        {/* FORMULÁŘ */}
        {showForm && (
            <div className="max-w-md mx-auto bg-slate-900 p-6 rounded-2xl border border-blue-500/30 shadow-2xl mb-12 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex gap-2 justify-center mb-4">
                    {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setRating(s)}>
                            <Star size={32} className={s <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"} />
                        </button>
                    ))}
                </div>
                <textarea 
                    value={comment} onChange={e => setComment(e.target.value)} 
                    placeholder="Jak se ti s námi cestovalo?" 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white mb-4 h-24 outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                    <button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl font-bold">Odeslat</button>
                    <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white">Zrušit</button>
                </div>
            </div>
        )}

        {/* MŘÍŽKA RECENZÍ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-900/80 backdrop-blur border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition group">
                    <div className="flex items-center gap-3 mb-4">
                        <img src={rev.user_avatar} className="w-10 h-10 rounded-full bg-slate-800" />
                        <div>
                            <p className="font-bold text-white text-sm">{rev.user_name}</p>
                            <div className="flex text-yellow-400 text-xs">{'★'.repeat(rev.rating)}</div>
                        </div>
                        <Quote size={24} className="ml-auto text-blue-500/20 group-hover:text-blue-500/50 transition" />
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed italic">"{rev.comment}"</p>
                </div>
            ))}
            
            {/* Fake recenze pro začátek, pokud je databáze prázdná */}
            {reviews.length === 0 && (
                <>
                    <div className="bg-slate-900/80 border border-white/5 p-6 rounded-2xl opacity-50"><p className="text-slate-500 italic">Zatím žádné recenze. Buď první! 🚀</p></div>
                </>
            )}
        </div>
      </div>
    </section>
  );
}