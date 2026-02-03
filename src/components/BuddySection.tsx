'use client';
import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Plus, X, User, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Definice typu pro Parťáka
interface Buddy {
  id: number;
  name: string;
  age: number;
  destination: string;
  travel_date: string;
  tag: string;
  contact?: string;
  avatar_url?: string;
}

export default function BuddySection() {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data pro formulář
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    destination: '',
    travel_date: '',
    tag: 'Batůžkář',
    contact: ''
  });

  // 1. Načtení lidí z databáze
  useEffect(() => {
    fetchBuddies();
  }, []);

  const fetchBuddies = async () => {
    const { data, error } = await supabase
      .from('buddies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBuddies(data);
    setLoading(false);
  };

  // 2. Odeslání formuláře (Registrace)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Náhodný avatar, pokud uživatel nenahrál vlastní
    const randomAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.name}`;

    const { error } = await supabase.from('buddies').insert([
      {
        name: formData.name,
        age: parseInt(formData.age),
        destination: formData.destination,
        travel_date: formData.travel_date,
        tag: formData.tag,
        contact: formData.contact,
        avatar_url: randomAvatar
      }
    ]);

    if (!error) {
      await fetchBuddies(); // Znovu načíst seznam
      setIsModalOpen(false); // Zavřít okno
      // Vyčistit formulář
      setFormData({ name: '', age: '', destination: '', travel_date: '', tag: 'Batůžkář', contact: '' });
    } else {
      alert("Chyba při ukládání! Zkus to znovu.");
    }
    setSubmitting(false);
  };

  return (
    <section className="py-16 bg-gray-900 text-white relative">
      <div className="container mx-auto px-4">
        
        {/* Hlavička sekce */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Najdi parťáka na cesty
            </h2>
            <p className="text-gray-400 mt-2">Nechceš cestovat sám? Připoj se k někomu nebo vytvoř výzvu.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-full font-bold transition shadow-lg shadow-purple-900/40 hover:scale-105"
          >
            <Plus size={20} /> Přidat se do party
          </button>
        </div>

        {/* Grid profilů */}
        {loading ? (
          <div className="text-center py-10 text-gray-500 animate-pulse">Načítám parťáky...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {buddies.map((buddy) => (
              <div key={buddy.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-purple-500 transition-all group relative overflow-hidden">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={buddy.avatar_url || `https://i.pravatar.cc/150?u=${buddy.id}`} 
                    alt={buddy.name} 
                    className="w-14 h-14 rounded-full border-2 border-purple-500 object-cover bg-gray-700" 
                  />
                  <div>
                    <h3 className="font-bold text-lg">{buddy.name}, {buddy.age}</h3>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded text-purple-300 font-medium border border-gray-600">{buddy.tag}</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-300 mb-4">
                  <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-lg">
                    <MapPin size={16} className="text-purple-500 shrink-0" />
                    <span className="truncate font-medium">{buddy.destination}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-lg">
                    <Calendar size={16} className="text-purple-500 shrink-0" />
                    <span className="truncate">{buddy.travel_date}</span>
                  </div>
                </div>

                <button 
                  onClick={() => alert(`Kontakt na uživatele ${buddy.name}: ${buddy.contact || 'Není uveden'}`)}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-gray-700 to-gray-600 group-hover:from-purple-600 group-hover:to-pink-600 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Napsat zprávu
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === MODÁLNÍ OKNO PRO REGISTRACI === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-purple-500/30 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Vytvořit profil cestovatele</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Jméno</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="Honza" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Věk</label>
                  <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="25" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kam chceš jet?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <input required type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-purple-500 outline-none" placeholder="Vietnam, Bali, USA..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kdy?</label>
                  <input required type="text" value={formData.travel_date} onChange={e => setFormData({...formData, travel_date: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="Léto 2026" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Styl cesty</label>
                  <select value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none">
                    <option>Batůžkář</option>
                    <option>Digital Nomad</option>
                    <option>Low-cost</option>
                    <option>Luxury</option>
                    <option>Hiking</option>
                    <option>Party</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Kontakt (IG/Email)</label>
                <input required type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="@tuj_instagram" />
              </div>

              <button disabled={submitting} type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl mt-4 transition shadow-lg">
                {submitting ? 'Ukládám...' : '🚀 Zveřejnit profil'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}