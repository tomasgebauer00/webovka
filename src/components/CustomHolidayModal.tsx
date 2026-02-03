'use client';
import { useState } from 'react';
import { X, Plane, Calendar, Users, Wallet, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CustomHolidayModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: '', date_range: '', duration: '', guests: '', budget: '', contact: '', note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('custom_requests').insert([formData]);

    if (!error) {
      alert("Poptávka odeslána! Brzy se ti ozvu.");
      setIsOpen(false);
      setFormData({ destination: '', date_range: '', duration: '', guests: '', budget: '', contact: '', note: '' });
    } else {
      alert("Něco se pokazilo. Zkus to prosím znovu.");
    }
    setLoading(false);
  };

  return (
    <>
      {/* TLAČÍTKO - umístíme ho pevně vpravo dole nebo do menu, teď je floating */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-full shadow-2xl hover:scale-105 transition flex items-center gap-2 border border-white/20 animate-bounce-slow"
      >
        <Plane size={20} /> Dovolená na míru
      </button>

      {/* MODÁLNÍ OKNO */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-blue-500/30 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Hlavička */}
            <div className="bg-blue-900/30 p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">✨ Vysněná dovolená</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>

            {/* Formulář */}
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-gray-400 mb-6">Nechceš nic hledat? Napiš mi, co chceš, a já ti to najdu a zařídím.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Kam to bude?</label>
                    <input required type="text" placeholder="Např. Maledivy" className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                      value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Kdy?</label>
                    <input type="text" placeholder="Léto 2026" className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                      value={formData.date_range} onChange={e => setFormData({...formData, date_range: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Počet osob</label>
                    <input type="text" placeholder="2 dospělí" className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                      value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Budget (cca)</label>
                    <input type="text" placeholder="50 000 Kč" className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                      value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Tvůj kontakt (Email/Tel)</label>
                  <input required type="text" placeholder="abych se mohl ozvat..." className="w-full bg-slate-950 border border-blue-500/50 rounded-lg p-3 text-white focus:border-blue-400 outline-none" 
                    value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Poznámka</label>
                  <textarea placeholder="Chceme hotel u pláže, snídaně..." className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" 
                    value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
                </div>

                <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center gap-2 transition">
                  {loading ? 'Odesílám...' : <><Send size={20} /> Odeslat poptávku</>}
                </button>

              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}