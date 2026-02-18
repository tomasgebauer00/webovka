'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star, User } from 'lucide-react';

export default function Reviews({ dealId }: { dealId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
    checkUser();
  }, [dealId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Pro napsání recenze se musíš přihlásit!");
    
    setLoading(true);
    const { error } = await supabase.from('reviews').insert([{
        deal_id: dealId,
        user_id: user.id,
        rating: newRating,
        comment: newComment,
        user_name: user.email?.split('@')[0] || 'Anonym' // Zjednodušené jméno z emailu
    }]);

    if (error) {
        alert("Chyba: " + error.message);
    } else {
        setNewComment('');
        setNewRating(5);
        fetchReviews(); // Obnovit seznam
    }
    setLoading(false);
  };

  return (
    <div className="mt-12 border-t border-white/10 pt-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        ⭐ Hodnocení cestovatelů ({reviews.length})
      </h2>

      {/* FORMULÁŘ PRO PŘIDÁNÍ (Jen pro přihlášené) */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl border border-white/10 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Napsat recenzi</h3>
            
            <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setNewRating(star)} className="transition transform hover:scale-110">
                        <Star size={24} className={star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"} />
                    </button>
                ))}
            </div>

            <textarea 
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Jak se ti tam líbilo? Co doporučuješ?"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none mb-4 h-24"
            />
            
            <button disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition">
                {loading ? 'Odesílám...' : 'Přidat hodnocení'}
            </button>
        </form>
      ) : (
        <div className="bg-slate-900/50 p-4 rounded-xl text-center mb-8 border border-white/5 border-dashed">
            <p className="text-slate-400">Pro napsání recenze se musíš <a href="/login" className="text-blue-400 font-bold hover:underline">přihlásit</a>.</p>
        </div>
      )}

      {/* VÝPIS RECENZÍ */}
      <div className="space-y-6">
        {reviews.length === 0 && <p className="text-slate-500 italic">Zatím nikdo nehodnotil. Buď první! 🚀</p>}
        
        {reviews.map((review) => (
            <div key={review.id} className="bg-slate-900 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-800 p-2 rounded-full"><User size={20} className="text-slate-400"/></div>
                        <div>
                            <p className="font-bold text-white">{review.user_name}</p>
                            <p className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString('cs-CZ')}</p>
                        </div>
                    </div>
                    <div className="flex text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                </div>
                <p className="text-slate-300 leading-relaxed pl-12">{review.comment}</p>
            </div>
        ))}
      </div>
    </div>
  );
}