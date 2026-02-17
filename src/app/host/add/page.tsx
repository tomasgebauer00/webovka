'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { Upload, ArrowLeft } from 'lucide-react';

export default function AddProperty() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    destination: '', country: '', description: '',
    price: '', category: 'Apartmán', image: '',
    guests: '2'
  });

  const handleImageUpload = async (e: any) => {
    try {
        setUploading(true);
        const file = e.target.files[0];
        if (!file) return;
        const fileName = `${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('deals_images').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('deals_images').getPublicUrl(fileName);
        setFormData({ ...formData, image: publicUrl });
    } catch (error: any) {
        alert('Chyba nahrávání: ' + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Musíš být přihlášen!");

    // Vložení do databáze
    const { error } = await supabase.from('deals').insert([{
        destination: formData.destination, 
        country: formData.country,
        description: formData.description,
        total_price: parseInt(formData.price), // Cena celkem
        hotel_price: parseInt(formData.price), // Pro jistotu
        flight_price: 0, // Je to jen ubytko
        image: formData.image,
        category: formData.category,
        seats_left: parseInt(formData.guests), 
        owner_id: user.id, // DŮLEŽITÉ: Vazba na tebe
        
        // Defaultní hodnoty
        latitude: 0, longitude: 0,
        departure_date: new Date().toISOString(),
        return_date: new Date().toISOString(),
        from_city: 'Vlastní doprava',
        rating: 5
    }]);

    if (error) alert("Chyba: " + error.message);
    else {
        alert("Úspěch! Tvoje ubytování je online. 🚀");
        router.push('/host');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 max-w-2xl">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
            <ArrowLeft size={20} /> Zpět na dashboard
        </button>

        <h1 className="text-3xl font-bold mb-8">Nová nabídka ubytování</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 p-8 rounded-2xl border border-white/10 shadow-2xl">
            
            <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Název ubytování</label>
                <input required type="text" placeholder="Např. Luxusní Vila s bazénem" className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none transition"
                    value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Země / Lokalita</label>
                    <input required type="text" placeholder="Bali, Canggu" className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none"
                        value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Typ</label>
                    <select className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none"
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option>Apartmán</option>
                        <option>Vila</option>
                        <option>Chatka</option>
                        <option>Glamping</option>
                        <option>Auto / Karavan</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Cena (Kč)</label>
                    <input required type="number" placeholder="2500" className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none"
                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Kapacita osob</label>
                    <input required type="number" placeholder="4" className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none"
                        value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Popis pro hosty</label>
                <textarea className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none h-32 resize-none"
                    placeholder="Napiš, proč je to u tebe nejlepší..."
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>

            {/* Nahrávání fotky */}
            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-green-500/50 transition cursor-pointer relative bg-slate-950/50 group">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {formData.image ? (
                    <img src={formData.image} className="h-48 w-full object-cover rounded-lg mx-auto shadow-lg" />
                ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-green-400 transition">
                        <Upload size={32} className="mb-2" />
                        <span className="text-sm font-bold">{uploading ? 'Nahrávám...' : 'Klikni a nahraj hlavní fotku'}</span>
                    </div>
                )}
            </div>

            <button disabled={uploading} type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95">
                {uploading ? 'Chvilku strpení...' : '🚀 Zveřejnit nabídku'}
            </button>

        </form>
      </div>
    </div>
  );
}