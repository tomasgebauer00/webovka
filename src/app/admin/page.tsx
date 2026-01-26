'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'deals' | 'users'>('deals');
  const [loading, setLoading] = useState(false);
  const [deals, setDeals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false); // Zda je uživatel oprávněn

  const [formData, setFormData] = useState<any>({
    destination: '', country: '', image: '', from_city: 'Praha',
    departure_date: '', return_date: '', flight_price: 0, hotel_price: 0,
    rating: 5, description: '', category: 'Evropa', tags: '', seats_left: 4
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  // === 1. OCHRANA STRÁNKY ===
  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/'); // Není přihlášen -> Pryč
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profile?.is_admin) {
      setIsAuthorized(true); // Je admin -> Pustíme ho
      fetchDeals();
      fetchUsers();
    } else {
      router.push('/'); // Není admin -> Pryč
    }
  };

  const fetchDeals = async () => {
    const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (data) setDeals(data);
  };

  const fetchUsers = async () => {
    // Stáhneme i sloupec is_admin
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: favorites } = await supabase.from('favorites').select('user_id, deal_id, deals(destination)');

    if (profiles && favorites) {
      const usersWithStats = profiles.map(user => {
        const userFavs = favorites.filter((f: any) => f.user_id === user.id);
        return {
          ...user,
          favoritesCount: userFavs.length,
          favoriteDestinations: userFavs.map((f: any) => f.deals?.destination).join(', ')
        };
      });
      setUsers(usersWithStats);
    }
  };

  // === 2. FUNKCE NA ZMĚNU ADMINA ===
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    const confirmMessage = currentStatus 
        ? "Opravdu chceš tomuto uživateli ODEBRAT práva admina?" 
        : "Opravdu chceš z tohoto uživatele UDĚLAT admina? Bude mít plný přístup.";
    
    if (!confirm(confirmMessage)) return;

    const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

    if (error) {
        alert("Chyba při změně práv: " + error.message);
    } else {
        fetchUsers(); // Obnovit seznam
    }
  };

  // ... (Zbytek funkcí pro editaci zájezdů zůstává stejný) ...
  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleEdit = (deal: any) => {
    setEditingId(deal.id);
    setFormData({
      ...deal,
      departure_date: deal.departure_date?.slice(0, 16),
      return_date: deal.return_date?.slice(0, 16),
      tags: deal.tags ? deal.tags.join(', ') : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Smazat?')) {
      await supabase.from('deals').delete().eq('id', id);
      fetchDeals();
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const total = Number(formData.flight_price) + Number(formData.hotel_price);
    const tagsArray = formData.tags.toString().split(',').map((t: string) => t.trim()).filter((t: string) => t);
    
    const payload = { ...formData, total_price: total, tags: tagsArray };
    
    if (editingId) await supabase.from('deals').update(payload).eq('id', editingId);
    else await supabase.from('deals').insert([payload]);

    setFormData({ 
      destination: '', country: '', image: '', from_city: 'Praha', 
      flight_price: 0, hotel_price: 0, tags: '', category: 'Evropa', 
      description: '', rating: 5, seats_left: 4 
    });
    setEditingId(null);
    fetchDeals();
    setLoading(false);
    alert('Uloženo! ✅');
  };

  // Pokud není autorizován, nic nevykreslujeme (čekáme na redirect)
  if (!isAuthorized) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Ověřuji oprávnění...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          Admin Centrum 🛠️
        </h1>

        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
          <button onClick={() => setActiveTab('deals')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'deals' ? 'bg-blue-600' : 'bg-slate-800 text-slate-400'}`}>✈️ Správa zájezdů</button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'users' ? 'bg-purple-600' : 'bg-slate-800 text-slate-400'}`}>👥 Uživatelé</button>
        </div>

        {activeTab === 'deals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-6 rounded-2xl border border-white/10 h-fit lg:col-span-1">
              <h2 className="text-xl font-bold mb-4">{editingId ? '✏️ Upravit' : '➕ Přidat'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold ml-1">Kategorie</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded p-2 text-white mt-1">
                    <option value="Evropa">🇪🇺 Evropa</option>
                    <option value="Exotika">🏝️ Exotika</option>
                    <option value="Česko">🇨🇿 Česko</option>
                    <option value="Letenky">✈️ Jen letenky</option>
                    <option value="Last Minute">🔥 Last Minute</option>
                    <option value="Rodina">👨‍👩‍👧‍👦 Rodina</option>
                    <option value="Historie">🗿 Historie</option>
                  </select>
                </div>

                <input name="destination" value={formData.destination} onChange={handleChange} placeholder="Destinace" className="w-full bg-slate-950 border border-white/10 rounded p-2" required />
                <input name="country" value={formData.country} onChange={handleChange} placeholder="Země" className="w-full bg-slate-950 border border-white/10 rounded p-2" required />
                <input name="image" value={formData.image} onChange={handleChange} placeholder="Odkaz na fotku" className="w-full bg-slate-950 border border-white/10 rounded p-2" required />
                <div className="grid grid-cols-2 gap-2">
                   <input type="number" name="flight_price" value={formData.flight_price} onChange={handleChange} placeholder="Letenka" className="bg-slate-950 border border-white/10 rounded p-2" />
                   <input type="number" name="hotel_price" value={formData.hotel_price} onChange={handleChange} placeholder="Hotel" className="bg-slate-950 border border-white/10 rounded p-2" />
                </div>
                <input type="datetime-local" name="departure_date" value={formData.departure_date} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded p-2" />
                <input type="datetime-local" name="return_date" value={formData.return_date} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded p-2" />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Popis..." className="w-full bg-slate-950 border border-white/10 rounded p-2"></textarea>
                <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tagy (All inclusive...)" className="w-full bg-slate-950 border border-white/10 rounded p-2" />
                
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold">Uložit</button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {deals.map(deal => (
                <div key={deal.id} className="bg-slate-900 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <img src={deal.image} className="w-12 h-12 rounded object-cover" />
                    <div>
                      <h3 className="font-bold">{deal.destination}</h3>
                      <p className="text-xs text-slate-400">
                        <span className="text-blue-400 font-bold uppercase">{deal.category}</span> • {deal.total_price?.toLocaleString()} Kč
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(deal)} className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded">✏️</button>
                    <button onClick={() => handleDelete(deal.id)} className="bg-red-500/10 text-red-500 px-3 py-1 rounded">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid gap-4">
            {users.length === 0 ? (
                <div className="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-xl">
                    Zatím tu nejsou žádní uživatelé.
                </div>
            ) : (
                users.map(user => (
                  <div key={user.id} className={`border p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 transition ${user.is_admin ? 'bg-slate-900/80 border-purple-500/50 shadow-lg shadow-purple-900/10' : 'bg-slate-900 border-white/5'}`}>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${user.is_admin ? 'bg-purple-600' : 'bg-slate-700'}`}>
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-white flex items-center gap-2">
                                {user.email}
                                {user.is_admin && <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>}
                            </h3>
                            <p className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-center min-w-[60px]">
                            <span className="text-xl font-bold text-red-400">❤️ {user.favoritesCount || 0}</span>
                        </div>
                        
                        {/* Tlačítko pro změnu Admina */}
                        <button 
                            onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                                user.is_admin 
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20' 
                                : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20'
                            }`}
                        >
                            {user.is_admin ? 'Odebrat Admina' : 'Udělat Adminem'}
                        </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}