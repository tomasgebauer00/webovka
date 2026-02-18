'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plane, X, Send } from 'lucide-react'; // IKONA LETADLA

export default function CustomHolidayModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: '', date_range: '', budget: '', guests: '', contact: '', note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Zkusíme získat user_id, pokud je přihlášený
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('custom_requests').insert([{
        user_id: user?.id || null, // Může být i null pro nepřihlášené
        destination: formData.destination,
        date_range: formData.date_range,
        budget: formData.budget,
        guests: parseInt(formData.guests) || 1,
        contact: formData.contact,
        note: formData.note,
        status: 'new'
    }]);

    setLoading(false);
    
    if (error) {
        alert('Chyba při odesílání: ' + error.message);
    } else {
        alert('Poptávka odeslána! Ozveme se ti co nejdříve. ✈️');
        setIsOpen(false);
        setFormData({ destination: '', date_range: '', budget: '', guests: '', contact: '', note: '' });
    }
  };

  return (
    <>
      {/* TLAČÍTKO - NOVÝ VZHLED (Kulatá ikonka) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-5 z-40 bg-gradient-to-r from-blue-600 to-cyan-600 text-white w-12 h-12 rounded-full shadow-xl hover:scale-110 transition flex items-center justify-center border border-white/20 animate-bounce-slow delay-100"
        title="Dovolená na míru"
      >
        <Plane size={22} className="fill-white/20" />
      </button>

      {/* MODAL (Zůstává stejný) */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition"><X size={24} /></button>
                
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">✨ Dovolená na míru</h2>
                <p className="text-slate-400 mb-6 text-sm">Nevybral sis? Napiš nám své sny a my ti sestavíme cestu přesně pro tebe.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Vysněná destinace</label>
                        <input required type="text" placeholder="Např. Japonsko, Island, Maledivy..." className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kdy?</label>
                            <input required type="text" placeholder="Září 2024" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" value={formData.date_range} onChange={e => setFormData({...formData, date_range: e.target.value})} />
                        </div>
                        <div>
                             <label className="text-xs font-bold text-slate-500 uppercase ml-1">Rozpočet</label>
                            <input required type="text" placeholder="do 30 000 Kč" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Počet osob</label>
                            <input required type="number" placeholder="2" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Kontakt (Email/Tel)</label>
                            <input required type="text" placeholder="Tvůj email..." className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Poznámka / Speciální přání</label>
                        <textarea placeholder="Chci hotel u pláže, půjčit auto a vidět sopky..." className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition h-24 resize-none" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                        {loading ? 'Odesílám...' : <><Send size={18} /> Odeslat poptávku</>}
                    </button>
                </form>
            </div>
        </div>
      )}
    </>
  );
}