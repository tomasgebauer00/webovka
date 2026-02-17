'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import RequestChat from '../../components/RequestChat';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'deals' | 'users' | 'bookings' | 'requests'>('deals');
  const [loading, setLoading] = useState(false);
  
  const [deals, setDeals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  
  const [chatRequestId, setChatRequestId] = useState<number | null>(null);

  const [isAuthorized, setIsAuthorized] = useState(false);
  // NOVÉ: Ukládáme si roli uživatele
  const [userRole, setUserRole] = useState<'super_admin' | 'admin' | 'provider' | 'user'>('user');
  
  const [stats, setStats] = useState({ revenue: 0, totalBookings: 0, totalUsers: 0 });

  const [formData, setFormData] = useState<any>({
    destination: '', country: '', image: '', from_city: 'Praha',
    departure_date: '', return_date: '', flight_price: 0, hotel_price: 0,
    original_price: 0, is_special_offer: false,
    rating: 5, description: '', category: 'Evropa', tags: '', seats_left: 4, latitude: 0, longitude: 0
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { checkAdminAccess(); }, []);

  // NOVÉ: Upravená kontrola přístupu podle rolí
  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/'); return; }
    
    // Zjistíme roli z tabulky profiles
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
    // Pustíme dál jen Super Admina nebo Admina
    if (profile?.role === 'super_admin' || profile?.role === 'admin') {
      setIsAuthorized(true);
      setUserRole(profile.role); // Uložíme si roli
      fetchDeals(); fetchUsers(); fetchBookings(); fetchRequests();
    } else { 
      // Pokud je to Provider, pošleme ho na jeho Dashboard
      if (profile?.role === 'provider') {
          router.push('/host');
      } else {
          router.push('/'); 
      }
    }
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

  const fetchRequests = async () => {
    const { data } = await supabase.from('custom_requests').select('*').order('created_at', { ascending: false });
    if (data) setRequests(data);
  };

  // NOVÉ: Funkce pro změnu role uživatele (jen pro Super Admina)
  const changeUserRole = async (userId: string, newRole: string) => {
      if (!confirm(`Opravdu změnit roli uživatele na ${newRole}?`)) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) alert("Chyba: " + error.message);
      else {
          alert("Role změněna! ✅");
          fetchUsers();
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
        original_price: deal.original_price || 0,
        is_special_offer: deal.is_special_offer || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Smazat?')) { await supabase.from('deals').delete().eq('id', id); fetchDeals(); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const total = Number(formData.flight_price) + Number(formData.hotel_price);
    const tagsArray = formData.tags.toString().split(',').map((t: string) => t.trim()).filter((t: string) => t);
    
    // Získání aktuálního uživatele pro owner_id
    const { data: { user } } = await supabase.auth.getUser();

    const payload = { 
        ...formData, 
        total_price: total, 
        tags: tagsArray,
        owner_id: user?.id // Uložíme admina jako vlastníka
    };
    
    if (editingId) await supabase.from('deals').update(payload).eq('id', editingId);
    else await supabase.from('deals').insert([payload]);
    
    setFormData({ 
        destination: '', country: '', image: '', from_city: 'Praha', 
        flight_price: 0, hotel_price: 0, tags: '', category: 'Evropa', 
        description: '', rating: 5, seats_left: 4, latitude: 0, longitude: 0,
        original_price: 0, is_special_offer: false
    });
    setEditingId(null); fetchDeals(); setLoading(false); alert('Uloženo! ✅');
  };

  if (!isAuthorized) return <div className="text-center p-10 text-white">Ověřuji oprávnění...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Admin Centrum 🛠️</h1>
        <p className="text-slate-400 mb-8">Přihlášen jako: <span className="text-blue-400 font-bold uppercase">{userRole.replace('_', ' ')}</span></p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-2xl"><p className="text-green-400 text-sm font-bold uppercase">Tržby</p><p className="text-4xl font-extrabold">{stats.revenue.toLocaleString()} Kč</p></div>
            <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl"><p className="text-blue-400 text-sm font-bold uppercase">Rezervace</p><p className="text-4xl font-extrabold">{stats.totalBookings}</p></div>
            <div className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-2xl"><p className="text-purple-400 text-sm font-bold uppercase">Uživatelé</p><p className="text-4xl font-extrabold">{stats.totalUsers}</p></div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          <button onClick={() => setActiveTab('deals')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'deals' ? 'bg-blue-600' : 'bg-slate-800'}`}>✈️ Zájezdy</button>
          <button onClick={() => setActiveTab('bookings')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'bookings' ? 'bg-green-600' : 'bg-slate-800'}`}>📅 Objednávky</button>
          
          {/* TLAČÍTKO PRO SPRÁVU UŽIVATELŮ - VIDÍ JEN SUPER ADMIN */}
          {userRole === 'super_admin' && (
             <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'users' ? 'bg-purple-600' : 'bg-slate-800'}`}>👥 Správa Adminů</button>
          )}
          
          <button onClick={() => setActiveTab('requests')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'requests' ? 'bg-orange-600' : 'bg-slate-800'}`}>📩 Poptávky</button>
        </div>

        {activeTab === 'deals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 h-fit">
              <h2 className="text-xl font-bold mb-4">{editingId ? '✏️ Upravit' : '➕ Přidat'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-xl flex items-center gap-3">
                    <input type="checkbox" name="is_special_offer" id="is_special_offer" checked={formData.is_special_offer} onChange={handleChange} className="w-5 h-5 accent-blue-500 cursor-pointer" />
                    <label htmlFor="is_special_offer" className="font-bold text-white cursor-pointer select-none">⚡ Akční nabídka</label>
                </div>

                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white"><option value="Evropa">🇪🇺 Evropa</option><option value="Exotika">🏝️ Exotika</option><option value="Česko">🇨🇿 Česko</option><option value="Letenky">✈️ Jen letenky</option><option value="Last Minute">🔥 Last Minute</option></select>
                <input name="destination" value={formData.destination} onChange={handleChange} placeholder="Destinace" className="w-full bg-slate-950 border border-white/10 rounded p-2" required />
                <input name="country" value={formData.country} onChange={handleChange} placeholder="Země" className="w-full bg-slate-950 border border-white/10 rounded p-2" required />
                <div className="border border-dashed border-white/20 p-4 rounded text-center"><p className="text-xs text-slate-400 mb-2">Nahrát obrázek</p><input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-xs text-slate-500"/>{formData.image && <img src={formData.image} className="mt-2 h-20 w-full object-cover rounded" />}</div>
                
                <div className="bg-slate-950 p-3 rounded border border-white/5 space-y-2">
                    <p className="text-xs text-slate-400 font-bold uppercase">Nastavení ceny</p>
                    <div className="flex flex-col">
                        <label className="text-[10px] text-slate-500">Původní cena (pro výpočet slevy)</label>
                        <input type="number" name="original_price" value={formData.original_price} onChange={handleChange} placeholder="Např. 30000" className="bg-slate-800 border border-white/10 rounded p-2 text-red-300" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] text-slate-500">Letenka</label><input type="number" name="flight_price" value={formData.flight_price} onChange={handleChange} placeholder="Letenka" className="w-full bg-slate-800 border border-white/10 rounded p-2" /></div>
                        <div><label className="text-[10px] text-slate-500">Hotel</label><input type="number" name="hotel_price" value={formData.hotel_price} onChange={handleChange} placeholder="Hotel" className="w-full bg-slate-800 border border-white/10 rounded p-2" /></div>
                    </div>
                    <div className="text-right text-xs text-green-400 font-bold">Celkem: {(Number(formData.flight_price) + Number(formData.hotel_price)).toLocaleString()} Kč</div>
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
        
        {/* OBSAH SEKCE UŽIVATELÉ - JEN PRO SUPER ADMINA */}
        {activeTab === 'users' && userRole === 'super_admin' && (
          <div className="grid gap-4">
            {users.map(u => (
                <div key={u.id} className="border border-white/5 p-4 rounded-xl flex justify-between items-center bg-slate-900">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                            {u.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{u.email}</h3>
                            <p className="text-xs text-slate-400">Aktuální role: <span className="font-bold text-blue-400 uppercase">{u.role || 'user'}</span></p>
                        </div>
                    </div>
                    
                    {/* OCHRANA: Sebe (Super Admina) si nemůžeš smazat */}
                    {u.email !== 'triphack@outlook.cz' && (
                        <div className="flex gap-2">
                            {/* Tlačítka podle toho, co uživatel ještě není */}
                            {u.role !== 'admin' && (
                                <button onClick={() => changeUserRole(u.id, 'admin')} className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded text-xs font-bold hover:bg-blue-600 hover:text-white">Udělat Adminem</button>
                            )}
                            {u.role !== 'provider' && (
                                <button onClick={() => changeUserRole(u.id, 'provider')} className="bg-green-600/20 text-green-400 px-3 py-1 rounded text-xs font-bold hover:bg-green-600 hover:text-white">Udělat Providerem</button>
                            )}
                            {u.role !== 'user' && (
                                <button onClick={() => changeUserRole(u.id, 'user')} className="bg-red-600/20 text-red-400 px-3 py-1 rounded text-xs font-bold hover:bg-red-600 hover:text-white">Odebrat práva</button>
                            )}
                        </div>
                    )}
                </div>
            ))}
          </div>
        )}

        {/* --- DYNAMICKÝ CHAT V POPTÁVKÁCH --- */}
        {activeTab === 'requests' && (
            <div className="grid gap-4">
                {requests.length === 0 ? <p className="text-slate-500 italic">Zatím žádné poptávky na míru.</p> : requests.map(req => (
                    <div key={req.id} className="bg-slate-900 p-6 rounded-xl border border-orange-500/20 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-orange-400 text-xl">{req.destination}</h3>
                                <p className="text-sm text-slate-300 mt-1">
                                    📅 {req.date_range} &bull; 👥 {req.guests} &bull; 💰 {req.budget}
                                </p>
                            </div>
                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                {new Date(req.created_at).toLocaleDateString('cs-CZ')}
                            </span>
                        </div>
                        
                        <div className="bg-slate-950 p-4 rounded-lg border border-white/5 text-sm text-gray-300 italic">
                            "{req.note}"
                        </div>
                        <p className="text-white font-mono text-sm mt-1">Kontakt: {req.contact}</p>

                        <div className="mt-2 border-t border-white/5 pt-3">
                             <button 
                                onClick={() => setChatRequestId(chatRequestId === req.id ? null : req.id)}
                                className={`w-full py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 ${chatRequestId === req.id ? 'bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                             >
                                {chatRequestId === req.id ? 'Zavřít chat' : '💬 Otevřít chat'}
                             </button>

                             {chatRequestId === req.id && (
                                <div className="mt-4">
                                    <RequestChat requestId={req.id} currentUserRole="admin" />
                                </div>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
}