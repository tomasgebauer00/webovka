'use client';
import { useState, useEffect } from 'react';
import { X, Plane, Send, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import RequestChat from './RequestChat'; // <--- Import chatu

export default function CustomHolidayModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Stavy pro formulář
  const [formData, setFormData] = useState({
    destination: '', date_range: '', duration: '', guests: '', budget: '', contact: '', note: ''
  });

  // Stavy pro Chat mód
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  // Při otevření zkusíme zjistit, jestli má uživatel aktivní poptávku (podle přihlášení)
  useEffect(() => {
    if (isOpen) checkExistingRequest();
  }, [isOpen]);

  const checkExistingRequest = async () => {
    setChecking(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // Pokud je přihlášený, zkusíme najít jeho poptávku podle kontaktu (emailu)
    if (user && user.email) {
      const { data } = await supabase.from('custom_requests')
        .select('*')
        .eq('contact', user.email) 
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) setActiveRequest(data);
    }
    setChecking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Získáme usera pro jistotu
    const { data: { user } } = await supabase.auth.getUser();
    const contactEmail = user?.email || formData.contact;

    const { error } = await supabase.from('custom_requests').insert([{
        ...formData, 
        contact: contactEmail // Vynutíme email
    }]);

    if (!error) {
      alert("Poptávka odeslána! Teď můžeš chatovat s adminem.");
      checkExistingRequest(); // Přepne na chat
    } else {
      alert("Chyba: " + error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-full shadow-2xl hover:scale-105 transition flex items-center gap-2 border border-white/20 animate-bounce-slow"
      >
        <Plane size={20} /> Dovolená na míru
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-blue-500/30 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-blue-900/30 p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {activeRequest ? '💬 Chat s delegátem' : '✨ Vysněná dovolená'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              
              {/* POKUD MÁ AKTIVNÍ POPTÁVKU -> ZOBRAZ CHAT */}
              {activeRequest ? (
                <div className="flex flex-col h-full">
                   <div className="bg-slate-800 p-3 rounded-lg mb-4 text-sm text-slate-300">
                      <p><strong>Destinace:</strong> {activeRequest.destination}</p>
                      <p><strong>Stav:</strong> {activeRequest.status || 'Nová'}</p>
                   </div>
                   
                   {/* VLOŽENÍ CHATU PRO KLIENTA */}
                   <RequestChat requestId={activeRequest.id} currentUserRole="client" />

                   <button onClick={() => setActiveRequest(null)} className="text-xs text-slate-500 mt-4 underline text-center hover:text-white">
                      Zadat novou poptávku
                   </button>
                </div>
              ) : (
                /* POKUD NEMÁ -> ZOBRAZ FORMULÁŘ */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-gray-400 mb-6">Nechceš nic hledat? Napiš mi, co chceš, a já ti to najdu. Pak si tu spolu napíšeme detaily.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Kam?</label><input required type="text" placeholder="Maledivy" className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Kdy?</label><input type="text" placeholder="Léto 2026" className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white" value={formData.date_range} onChange={e => setFormData({...formData, date_range: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Osob</label><input type="text" placeholder="2" className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white" value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Budget</label><input type="text" placeholder="50k" className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-gray-500 uppercase">Email</label><input required type="text" placeholder="@" className="w-full bg-slate-950 border border-blue-500/50 rounded-lg p-3 text-white" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-gray-500 uppercase">Poznámka</label><textarea placeholder="..." className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white h-24" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}></textarea></div>

                  <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center gap-2 transition">
                    {loading ? 'Odesílám...' : <><Send size={20} /> Odeslat a Chatovat</>}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}