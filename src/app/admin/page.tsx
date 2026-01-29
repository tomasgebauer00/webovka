'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'deals' | 'users' | 'bookings'>('deals');
  const [loading, setLoading] = useState(false);
  
  const [deals, setDeals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, totalBookings: 0, totalUsers: 0 });

  // PŘIDÁNO: original_price a is_special_offer
  const [formData, setFormData] = useState<any>({
    destination: '', country: '', image: '', from_city: 'Praha',
    departure_date: '', return_date: '', flight_price: 0, hotel_price: 0,
    original_price: 0, is_special_offer: false, // <--- NOVÉ
    rating: 5, description: '', category: 'Evropa', tags: '', seats_left: 4, latitude: 0, longitude: 0
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { checkAdminAccess(); }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/'); return; }
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (profile?.is_admin) {
      setIsAuthorized(true);
      fetchDeals(); fetchUsers(); fetchBookings();
    } else { router.push('/'); }
  };

  const fetchDeals = async () => {
    const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (data) setDeals(data);
  };
  
  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*');
    if(profiles) { setUsers(profiles); setStats(prev => ({ ...prev, totalUsers: profiles.length })); }
  };
  
  const fetchBookings = async () => {
    const { data } = await supabase.from('bookings').select('*, deals(destination)').order('created_at', { ascending: false });
    if (data) {
        setBookings(data);
        const totalRevenue = data.reduce((sum, b) => sum + (b.total_price || 0), 0);
        setStats(prev => ({ ...prev, revenue: totalRevenue, totalBookings: data.length }));
    }
  };

  const handleBookingStatus = async (id: number, status: string) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) alert("Chyba: " + error.message);
      else fetchBookings();
  };

  const handleImageUpload = async (e: any) => {
    try {
        setUploading(true);
        const file = e.target.files[0];
        if (!file) return;
        const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('deals_images').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('deals_images').getPublicUrl(fileName);
        setFormData({ ...formData, image: publicUrl });
        alert("Fotka nahrána! 📸");
    } catch (error: any) { alert('Chyba: ' + error.message); } finally { setUploading(false); }
  };

  // Upravený handler pro checkbox
  const handleChange = (e: any) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setFormData({ ...formData, [e.target.name]: value });
  };

  const handleEdit = (deal: any) => {
    setEditingId(deal.id);
    setFormData({ 
        ...deal, 
        departure_date: deal.departure_date?.slice(0, 16), 
        return_date: deal.return_date?.slice(0, 16), 
        tags: deal.tags ? deal.tags.join(', ') : '',
        // Ujistíme se, že hodnoty nejsou null
        original_price: deal.original_price || 0,
        is_special_offer: deal.is_special_offer || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Smazat?')) { await supabase.from('deals').delete().eq('id', id); fetchDeals(); }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(currentStatus ? "Odebrat admina?" : "Udělat adminem?")) return;
    await supabase.from('profiles').update({ is_admin: !currentStatus }).eq('id', userId);
    fetchUsers();
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const total = Number(formData.flight_price) + Number(formData.hotel_price);
    const tagsArray = formData.tags.toString().split(',').map((t: string) => t.trim()).filter((t: string) => t);
    
    // Payload včetně nových polí
    const payload = { ...formData, total_price: total, tags: tagsArray };
    
    if (editingId) await supabase.from('deals').update(payload).eq('id', editingId);
    else await supabase.from('deals').insert([payload]);
    
    // Reset formuláře
    setFormData({ 
        destination: '', country: '', image: '', from_city: 'Praha', 
        flight_price: 0, hotel_price: 0, tags: '', category: 'Evropa', 
        description: '', rating: 5, seats_left: 4, latitude: 0, longitude: 0,
        original_price: 0, is_special_offer: false // Reset nových polí
    });
    setEditingId(null); fetchDeals(); setLoading(false); alert('Uloženo! ✅');
  };

  if (!isAuthorized) return <div className="text-center p-10 text-white">Ověřuji...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Centrum 🛠️</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-2xl"><p className="text-green-400 text-sm font-bold uppercase">Tržby</p><p className="text-4xl font-extrabold">{stats.revenue.toLocaleString()} Kč</p></div>
            <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl"><p className="text-blue-400 text-sm font-bold uppercase">Rezervace</p><p className="text-4xl font-extrabold">{stats.totalBookings}</p></div>
            <div className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-2xl"><p className="text-purple-400 text-sm font-bold uppercase">Uživatelé</p><p className="text-4xl font-extrabold">{stats.totalUsers}</p></div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          <button onClick={() => setActiveTab('deals')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'deals' ? 'bg-blue-600' : 'bg-slate-800'}`}>✈️ Zájezdy</button>
          <button onClick={() => setActiveTab('bookings')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'bookings' ? 'bg-green-600' : 'bg-slate-800'}`}>📅 Objednávky</button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'users' ? 'bg-purple-600' : 'bg-slate-800'}`}>👥 Uživatelé</button>
        </div>

        {activeTab === 'deals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 h-fit">
              <h2 className="text-xl font-bold mb-4">{editingId ? '✏️ Upravit' : '➕ Přidat'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. SEKCE: AKČNÍ NABÍDKA */}
                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-xl flex items-center gap-3">
                    <input 
                        type="checkbox" 
                        name="is_special_offer" 
                        id="is_special_offer"
                        checked={formData.is_special_offer} 
                        onChange={handleChange} 
                        className="w-5 h-5 accent-blue-500 cursor-pointer" 
                    />
                    <label htmlFor="is_special_offer" className="font-bold text-white cursor-pointer select-none">
                        ⚡ Akční nabídka (zobrazit nahoře)
                    </label>
                </div>

                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white"><option value="Evropa">🇪🇺 Evropa</option><option value="Exotika">🏝️ Exotika</option><option value="Česko">🇨🇿 Česko</option><option value="Letenky">✈️ Jen letenky</option><option value="Last Minute">🔥 Last Minute</option></select>
                <input name="destination" value={formData.destination} onChange={handleChange} placeholder="Destinace" className="w-full bg-slate-950 border border-white/10 rounded p-2" required />
                <input name="country" value={formData.country} onChange={handleChange} placeholder="Země" className="w-full bg-slate-950 border border-white/10 rounded p-2" required />
                <div className="border border-dashed border-white/20 p-4 rounded text-center"><p className="text-xs text-slate-400 mb-2">Nahrát obrázek</p><input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-xs text-slate-500"/>{formData.image && <img src={formData.image} className="mt-2 h-20 w-full object-cover rounded" />}</div>
                
                {/* 2. SEKCE: CENY A SLEVY */}
                <div className="bg-slate-950 p-3 rounded border border-white/5 space-y-2">
                    <p className="text-xs text-slate-400 font-bold uppercase">Nastavení ceny</p>
                    <div className="flex flex-col">
                        <label className="text-[10px] text-slate-500">Původní cena (pro výpočet slevy)</label>
                        <input type="number" name="original_price" value={formData.original_price} onChange={handleChange} placeholder="Např. 30000" className="bg-slate-800 border border-white/10 rounded p-2 text-red-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] text-slate-500">Letenka</label>
                            <input type="number" name="flight_price" value={formData.flight_price} onChange={handleChange} placeholder="Letenka" className="w-full bg-slate-800 border border-white/10 rounded p-2" />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500">Hotel</label>
                            <input type="number" name="hotel_price" value={formData.hotel_price} onChange={handleChange} placeholder="Hotel" className="w-full bg-slate-800 border border-white/10 rounded p-2" />
                        </div>
                    </div>
                    <div className="text-right text-xs text-green-400 font-bold">
                        Celkem: {(Number(formData.flight_price) + Number(formData.hotel_price)).toLocaleString()} Kč
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2"><input type="datetime-local" name="departure_date" value={formData.departure_date} onChange={handleChange} className="bg-slate-950 border border-white/10 rounded p-2" /><input type="datetime-local" name="return_date" value={formData.return_date} onChange={handleChange} className="bg-slate-950 border border-white/10 rounded p-2" /></div>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Popis..." className="w-full bg-slate-950 border border-white/10 rounded p-2"></textarea>
                <div className="grid grid-cols-2 gap-2"><input type="number" name="seats_left" value={formData.seats_left} onChange={handleChange} placeholder="Počet míst" className="bg-slate-950 border border-white/10 rounded p-2" /><input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tagy" className="bg-slate-950 border border-white/10 rounded p-2" /></div>
                <div className="grid grid-cols-2 gap-2"><input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Lat" className="bg-slate-950 border border-white/10 rounded p-2" /><input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Lon" className="bg-slate-950 border border-white/10 rounded p-2" /></div>
                <button type="submit" disabled={loading || uploading} className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition">Uložit Zájezd</button>
              </form>
            </div>
            <div className="lg:col-span-2 space-y-4">
                {deals.map(deal => (
                    <div key={deal.id} className={`bg-slate-900 border p-4 rounded-xl flex justify-between items-center transition ${deal.is_special_offer ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-white/5'}`}>
                        <div className="flex gap-4 items-center">
                            <img src={deal.image} className="w-12 h-12 rounded object-cover" />
                            <div>
                                <h3 className="font-bold flex items-center gap-2">
                                    {deal.destination}
                                    {deal.is_special_offer && <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded text-white">AKČNÍ</span>}
                                </h3>
                                {deal.original_price > 0 && deal.original_price > deal.total_price && (
                                    <p className="text-xs text-red-400 line-through">{deal.original_price} Kč</p>
                                )}
                                <p className="text-sm text-green-400 font-bold">{deal.total_price} Kč</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(deal)} className="text-yellow-500 bg-yellow-500/10 p-2 rounded hover:bg-yellow-500/20">✏️</button>
                            <button onClick={() => handleDelete(deal.id)} className="text-red-500 bg-red-500/10 p-2 rounded hover:bg-red-500/20">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
            <div className="space-y-4">
                {bookings.length === 0 ? <p className="text-slate-500 italic">Zatím žádné objednávky.</p> : bookings.map(b => (
                    <div key={b.id} className="bg-slate-900 p-4 rounded-xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="font-bold text-green-400">{b.deals?.destination}</h3>
                            <p className="text-sm text-slate-300">{b.name} ({b.email})</p>
                            <p className="text-xs text-slate-500">Osob: {b.people_count} | Cena: {b.total_price} Kč</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded text-xs uppercase font-bold ${b.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : (b.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/10 text-yellow-500')}`}>{b.status}</span>
                            <button onClick={() => handleBookingStatus(b.id, 'confirmed')} className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg text-xs font-bold">✅ Potvrdit</button>
                            <button onClick={() => handleBookingStatus(b.id, 'cancelled')} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg text-xs font-bold">❌ Zamítnout</button>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        {activeTab === 'users' && (
          <div className="grid gap-4">{users.map(user => (<div key={user.id} className="border border-white/5 p-4 rounded-xl flex justify-between items-center bg-slate-900"><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${user.is_admin ? 'bg-purple-600' : 'bg-slate-700'}`}>{user.email?.charAt(0).toUpperCase()}</div><div><h3 className="font-bold text-white">{user.email} {user.is_admin && <span className="bg-purple-600 text-[10px] px-2 py-0.5 rounded-full uppercase ml-2">Admin</span>}</h3></div></div><button onClick={() => toggleAdminStatus(user.id, user.is_admin)} className="bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition">{user.is_admin ? 'Odebrat Admina' : 'Udělat Adminem'}</button></div>))}</div>
        )}
      </div>
    </div>
  );
}