'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  // Přidána záložka 'bookings'
  const [activeTab, setActiveTab] = useState<'deals' | 'users' | 'bookings'>('deals');
  const [loading, setLoading] = useState(false);
  
  const [deals, setDeals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]); // Stav pro objednávky
  
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Formulář
  const [formData, setFormData] = useState<any>({
    destination: '', country: '', image: '', from_city: 'Praha',
    departure_date: '', return_date: '', flight_price: 0, hotel_price: 0,
    rating: 5, description: '', category: 'Evropa', tags: '', seats_left: 4, latitude: 0, longitude: 0
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false); // Stav nahrávání fotky

  useEffect(() => { checkAdminAccess(); }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/'); return; }
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (profile?.is_admin) {
      setIsAuthorized(true);
      fetchDeals();
      fetchUsers();
      fetchBookings(); // Načíst objednávky
    } else { router.push('/'); }
  };

  const fetchDeals = async () => {
    const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (data) setDeals(data);
  };
  const fetchUsers = async () => { /* Stejné jako minule, zkráceno pro přehlednost */ 
    const { data: profiles } = await supabase.from('profiles').select('*');
    if(profiles) setUsers(profiles);
  };
  
  // NOVÉ: Načtení objednávek
  const fetchBookings = async () => {
    const { data } = await supabase.from('bookings').select('*, deals(destination)').order('created_at', { ascending: false });
    if (data) setBookings(data);
  };

  // NOVÉ: Funkce pro nahrání fotky
  const handleImageUpload = async (e: any) => {
    try {
        setUploading(true);
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Nahrání do bucketu 'deals_images'
        const { error: uploadError } = await supabase.storage.from('deals_images').upload(filePath, file);

        if (uploadError) throw uploadError;

        // Získání veřejné URL
        const { data: { publicUrl } } = supabase.storage.from('deals_images').getPublicUrl(filePath);
        
        // Uložení URL do formuláře
        setFormData({ ...formData, image: publicUrl });
        alert("Fotka nahrána! 📸");
    } catch (error: any) {
        alert('Chyba nahrávání: ' + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleEdit = (deal: any) => {
    setEditingId(deal.id);
    setFormData({ ...deal, departure_date: deal.departure_date?.slice(0, 16), return_date: deal.return_date?.slice(0, 16), tags: deal.tags ? deal.tags.join(', ') : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const total = Number(formData.flight_price) + Number(formData.hotel_price);
    const tagsArray = formData.tags.toString().split(',').map((t: string) => t.trim()).filter((t: string) => t);
    const payload = { ...formData, total_price: total, tags: tagsArray };
    
    if (editingId) await supabase.from('deals').update(payload).eq('id', editingId);
    else await supabase.from('deals').insert([payload]);

    setFormData({ destination: '', country: '', image: '', from_city: 'Praha', flight_price: 0, hotel_price: 0, tags: '', category: 'Evropa', description: '', rating: 5, seats_left: 4, latitude: 0, longitude: 0 });
    setEditingId(null);
    fetchDeals();
    setLoading(false);
    alert('Uloženo! ✅');
  };

  if (!isAuthorized) return <div className="text-center p-10 text-white">Ověřuji...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Centrum 🛠️</h1>

        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          <button onClick={() => setActiveTab('deals')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'deals' ? 'bg-blue-600' : 'bg-slate-800'}`}>✈️ Zájezdy</button>
          <button onClick={() => setActiveTab('bookings')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'bookings' ? 'bg-green-600' : 'bg-slate-800'}`}>📅 Objednávky ({bookings.length})</button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'users' ? 'bg-purple-600' : 'bg-slate-800'}`}>👥 Uživatelé</button>
        </div>

        {/* === ZÁJEZDY === */}
        {activeTab === 'deals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 h-fit">
              <h2 className="text-xl font-bold mb-4">{editingId ? '✏️ Upravit' : '➕ Přidat'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ... (select a texty zůstávají stejné) ... */}
                <input name="destination" value={formData.destination} onChange={handleChange} placeholder="Destinace" className="w-full bg-slate-950 border border-white/10 rounded p-2" required />
                
                {/* NOVÉ: Nahrávání fotky */}
                <div className="border border-dashed border-white/20 p-4 rounded text-center">
                    <p className="text-xs text-slate-400 mb-2">Nahrát obrázek</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"/>
                    {uploading && <p className="text-xs text-blue-400 mt-1">Nahrávám...</p>}
                    {formData.image && <img src={formData.image} className="mt-2 h-20 w-full object-cover rounded" />}
                </div>

                {/* Zbytek inputů (Ceny, data...) - zkráceno pro přehlednost, vlož sem ty inputy co tam byly */}
                <div className="grid grid-cols-2 gap-2">
                   <input type="number" name="flight_price" value={formData.flight_price} onChange={handleChange} placeholder="Letenka" className="bg-slate-950 border border-white/10 rounded p-2" />
                   <input type="number" name="hotel_price" value={formData.hotel_price} onChange={handleChange} placeholder="Hotel" className="bg-slate-950 border border-white/10 rounded p-2" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Lat (mapa)" className="bg-slate-950 border border-white/10 rounded p-2" />
                   <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Lon (mapa)" className="bg-slate-950 border border-white/10 rounded p-2" />
                </div>
                {/* ... a tlačítko submit ... */}
                <button type="submit" disabled={loading || uploading} className="w-full bg-blue-600 py-3 rounded-xl font-bold">Uložit</button>
              </form>
            </div>
            
            {/* Seznam zájezdů (pravý sloupec) */}
            <div className="lg:col-span-2 space-y-4">
                {deals.map(deal => (
                    <div key={deal.id} className="bg-slate-900 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <img src={deal.image} className="w-12 h-12 rounded object-cover" />
                            <h3 className="font-bold">{deal.destination}</h3>
                        </div>
                        <button onClick={() => handleEdit(deal)} className="text-yellow-500">✏️</button>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* === NOVÉ: OBJEDNÁVKY === */}
        {activeTab === 'bookings' && (
            <div className="space-y-4">
                {bookings.length === 0 ? <p className="text-slate-500">Žádné objednávky.</p> : bookings.map(b => (
                    <div key={b.id} className="bg-slate-900 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg text-green-400">{b.deals?.destination}</h3>
                            <p className="text-sm text-slate-300">{b.name} ({b.email}, {b.phone})</p>
                            <p className="text-xs text-slate-500">Osob: {b.people_count} | Cena: {b.total_price} Kč</p>
                        </div>
                        <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded text-xs uppercase">{b.status}</span>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'users' && <div className="text-slate-500">Seznam uživatelů...</div>}
      </div>
    </div>
  );
}