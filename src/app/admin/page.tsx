'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import RequestChat from '../../components/RequestChat';
import { CheckCircle2, XCircle, Info, Trash2, AlertTriangle } from 'lucide-react'; 

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
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // === 🚀 PROFESIONÁLNÍ UI STAVY ===
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string, text: string, onConfirm: () => void } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000); 
  };

  useEffect(() => { checkAdminAccess(); }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/'); return; }
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        
    if (profile?.role === 'super_admin' || profile?.role === 'admin') {
      setIsAuthorized(true);
      setUserRole(profile.role);
      fetchDeals(); fetchUsers(); fetchBookings(); fetchRequests();
    } else { 
      if (profile?.role === 'provider') router.push('/host');
      else router.push('/'); 
    }
  };

  const fetchDeals = async () => {
    const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
    if (data) setDeals(data);
  };
  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
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

  const changeUserRole = (userId: string, newRole: string) => {
      setConfirmDialog({
          title: "Změna role",
          text: `Opravdu chceš změnit roli tohoto uživatele na "${newRole.toUpperCase()}"?`,
          onConfirm: async () => {
              const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
              setConfirmDialog(null);
              if (error) showToast(error.message, 'error');
              else { showToast("Role úspěšně změněna!", 'success'); fetchUsers(); }
          }
      });
  };

  const handleBookingStatus = async (id: number, status: string) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) showToast(error.message, 'error');
      else { showToast(`Rezervace byla označena jako: ${status}`, 'success'); fetchBookings(); }
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
        showToast("Fotka nahrána!", 'success');
    } catch (error: any) { showToast(error.message, 'error'); } finally { setUploading(false); }
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
    showToast("Režim úprav aktivován", 'info');
  };

  const handleDelete = (id: number) => {
      setConfirmDialog({
          title: "Smazat zájezd",
          text: "Opravdu chceš tento zájezd trvale smazat? Tuto akci nelze vrátit.",
          onConfirm: async () => {
              await supabase.from('deals').delete().eq('id', id);
              setConfirmDialog(null);
              fetchDeals();
              showToast("Zájezd byl smazán.", 'info');
          }
      });
  };

  // === OPRAVENÉ UKLÁDÁNÍ (KONTROLA FOTKY) ===
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // 1. Zkontrolujeme, jestli vůbec nahrál fotku!
    if (!formData.image) {
        showToast("❌ Chybí fotka! Nezapomeň nahrát obrázek před uložením.", "error");
        return;
    }

    setLoading(true);
    
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // Čištění dat pro databázi
        const payload = { 
            destination: formData.destination || "Neznámo",
            country: formData.country || "Neznámo",
            image: formData.image, // Tady už víme, že tam fotka 100% je
            from_city: formData.from_city || "Praha",
            flight_price: Number(formData.flight_price) || 0,
            hotel_price: Number(formData.hotel_price) || 0,
            total_price: Number(formData.flight_price || 0) + Number(formData.hotel_price || 0),
            original_price: Number(formData.original_price) || 0,
            is_special_offer: Boolean(formData.is_special_offer),
            rating: Number(formData.rating) || 5,
            description: formData.description || "",
            category: formData.category || "Evropa",
            seats_left: Number(formData.seats_left) || 4,
            latitude: Number(formData.latitude) || 0,
            longitude: Number(formData.longitude) || 0,
            tags: formData.tags ? formData.tags.toString().split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
            departure_date: formData.departure_date || null,
            return_date: formData.return_date || null,
            owner_id: user?.id 
        };

        // Odeslání do DB
        if (editingId) {
            const { error } = await supabase.from('deals').update(payload).eq('id', editingId);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('deals').insert([payload]);
            if (error) throw error;
        }

        // POKUD TO PROŠLO
        showToast("✅ Skvěle! Databáze zájezd úspěšně uložila.", "success");
        setFormData({ 
            destination: '', country: '', image: '', from_city: 'Praha', 
            flight_price: 0, hotel_price: 0, tags: '', category: 'Evropa', 
            description: '', rating: 5, seats_left: 4, latitude: 0, longitude: 0, original_price: 0, is_special_offer: false
        });
        setEditingId(null); 
        fetchDeals(); 
        
    } catch (err: any) {
        // Pokud nastane jiná chyba, ukážeme ji hezky ve fialovém okně místo ošklivého alertu
        showToast("❌ CHYBA DB: " + err.message, "error");
    } finally {
        setLoading(false);
    }
  };

  const handleAiFill = async () => {
    if (!rawText || rawText.length < 30) {
        showToast("Zkopíruj víc textu ze stránky (označ vše Ctrl+A)!", 'error');
        return;
    }
    setIsParsing(true);
    showToast("AI analyzuje text, vydrž...", 'info');
    
    try {
        const res = await fetch('/api/parse-deal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: rawText })
        });
        
        const aiData = await res.json();
        if (!res.ok) throw new Error(aiData.error || "Chyba API");
        
        setFormData((prev: any) => ({
            ...prev,
            destination: aiData.destination || prev.destination,
            country: aiData.country || prev.country,
            hotel_price: aiData.hotel_price || prev.hotel_price,
            description: aiData.description || prev.description,
            category: aiData.category || prev.category
        }));
        
        setRawText('');
        showToast("✨ Magie dokončena! Zkontroluj to a NAHRAJ FOTKU.", 'success');
    } catch (err: any) {
        showToast(err.message, 'error');
    } finally {
        setIsParsing(false);
    }
  };

  if (!isAuthorized) return <div className="text-center p-20 text-slate-400 font-bold animate-pulse">Ověřuji tvoje oprávnění...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 relative">
      
      {/* === 🚀 PLOVOUCÍ TOAST NOTIFIKACE === */}
      {toast && (
          <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
              <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
                  toast.type === 'success' ? 'bg-green-900/40 border-green-500/50 text-green-100' :
                  toast.type === 'error' ? 'bg-red-900/40 border-red-500/50 text-red-100' :
                  'bg-blue-900/40 border-blue-500/50 text-blue-100'
              }`}>
                  {toast.type === 'success' && <CheckCircle2 className="text-green-400" />}
                  {toast.type === 'error' && <XCircle className="text-red-400" />}
                  {toast.type === 'info' && <Info className="text-blue-400" />}
                  <p className="font-bold text-sm">{toast.message}</p>
              </div>
          </div>
      )}

      {/* === 🚀 KRÁSNÝ CONFIRM MODAL === */}
      {confirmDialog && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
                      <AlertTriangle size={32} className="text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{confirmDialog.title}</h2>
                  <p className="text-slate-400 mb-8">{confirmDialog.text}</p>
                  <div className="flex gap-4">
                      <button onClick={() => setConfirmDialog(null)} className="flex-1 px-6 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white transition">Zrušit</button>
                      <button onClick={confirmDialog.onConfirm} className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition shadow-lg shadow-red-900/20">Ano, provést</button>
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Admin Centrum 🛠️</h1>
        <p className="text-slate-400 mb-8">Přihlášen jako: <span className="text-blue-400 font-bold uppercase">{userRole.replace('_', ' ')}</span></p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-2xl"><p className="text-green-400 text-sm font-bold uppercase">Tržby</p><p className="text-4xl font-extrabold">{stats.revenue.toLocaleString()} Kč</p></div>
            <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl"><p className="text-blue-400 text-sm font-bold uppercase">Rezervace</p><p className="text-4xl font-extrabold">{stats.totalBookings}</p></div>
            <div className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-2xl"><p className="text-purple-400 text-sm font-bold uppercase">Uživatelé</p><p className="text-4xl font-extrabold">{stats.totalUsers}</p></div>
        </div>

        <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          <button onClick={() => setActiveTab('deals')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'deals' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}>✈️ Zájezdy</button>
          <button onClick={() => setActiveTab('bookings')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'bookings' ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-700'}`}>📅 Objednávky</button>
          {userRole === 'super_admin' && (
             <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'users' ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'}`}>👥 Správa Rolí</button>
          )}
          <button onClick={() => setActiveTab('requests')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'requests' ? 'bg-orange-600' : 'bg-slate-800 hover:bg-slate-700'}`}>📩 Poptávky</button>
        </div>

        {activeTab === 'deals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 h-fit shadow-xl">
              <h2 className="text-xl font-bold mb-6">{editingId ? '✏️ Upravit nabídku' : '➕ Přidat novou nabídku'}</h2>
              
              {/* --- KOUZELNÉ AI VYPLŇOVÁNÍ --- */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 p-5 rounded-2xl mb-8 relative overflow-hidden group">
                  <div className="absolute -top-4 -right-4 text-7xl opacity-5 group-hover:scale-110 transition duration-500">🤖</div>
                  <h3 className="text-purple-300 font-bold mb-3 text-sm flex items-center gap-2">
                      ✨ AI Asistent (Ctrl+V z Airbnb)
                  </h3>
                  <textarea 
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="Sem vlož celý zkopírovaný text z Bookingu/Airbnb..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-300 h-24 mb-3 focus:border-purple-500 outline-none resize-none"
                  />
                  <button 
                      type="button" 
                      onClick={handleAiFill} 
                      disabled={isParsing}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40"
                  >
                      {isParsing ? '🧠 Zpracovávám data...' : '✨ Extrahovat a Vyplnit'}
                  </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-center gap-3">
                    <input type="checkbox" name="is_special_offer" id="is_special_offer" checked={formData.is_special_offer} onChange={handleChange} className="w-5 h-5 accent-blue-500 cursor-pointer rounded" />
                    <label htmlFor="is_special_offer" className="font-bold text-white cursor-pointer select-none">⚡ Akční nabídka (Zvýraznit)</label>
                </div>
                
                <div>
                    <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Kategorie</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none"><option value="Evropa">🇪🇺 Evropa</option><option value="Exotika">🏝️ Exotika</option><option value="Česko">🇨🇿 Česko</option><option value="Letenky">✈️ Jen letenky</option><option value="Last Minute">🔥 Last Minute</option></select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Název</label><input name="destination" value={formData.destination} onChange={handleChange} placeholder="Název" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500" required /></div>
                    <div><label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Země</label><input name="country" value={formData.country} onChange={handleChange} placeholder="Země" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 outline-none focus:border-blue-500" required /></div>
                </div>

                <div className="border border-dashed border-white/20 p-6 rounded-2xl text-center bg-slate-950 hover:bg-slate-900 transition cursor-pointer">
                    <p className="text-sm font-bold text-slate-400 mb-2">Nahrát fotku</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800 cursor-pointer"/>
                    {formData.image && <img src={formData.image} className="mt-4 h-32 w-full object-cover rounded-xl shadow-lg" />}
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-4">
                    <p className="text-xs text-slate-400 font-bold uppercase">Cenotvorba (Kč)</p>
                    <div><label className="text-[10px] text-slate-500">Původní cena (pro zobrazení slevy)</label><input type="number" name="original_price" value={formData.original_price} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-red-300 outline-none focus:border-red-500" /></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] text-slate-500">Letenka</label><input type="number" name="flight_price" value={formData.flight_price} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 outline-none focus:border-green-500" /></div><div><label className="text-[10px] text-slate-500">Hotel / Ubytování</label><input type="number" name="hotel_price" value={formData.hotel_price} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 outline-none focus:border-green-500" /></div></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Od</label><input type="datetime-local" name="departure_date" value={formData.departure_date} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 outline-none" /></div>
                    <div><label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Do</label><input type="datetime-local" name="return_date" value={formData.return_date} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 outline-none" /></div>
                </div>

                <div><label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Prodejní popis</label><textarea name="description" value={formData.description} onChange={handleChange} placeholder="Proč tam vyrazit?" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 h-28 resize-none outline-none focus:border-blue-500"></textarea></div>

                <div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Kapacita</label><input type="number" name="seats_left" value={formData.seats_left} onChange={handleChange} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 outline-none" /></div><div><label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Souřadnice (Město)</label><input type="text" name="from_city" value={formData.from_city} onChange={handleChange} placeholder="Odkud?" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 outline-none" /></div></div>

                <button type="submit" disabled={loading || uploading} className="w-full bg-blue-600 py-4 rounded-xl font-bold hover:bg-blue-500 transition shadow-lg transform active:scale-95 text-lg">Uložit Zájezd</button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
                {deals.map(deal => (
                    <div key={deal.id} className={`bg-slate-900 border p-5 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 transition hover:bg-slate-800 ${deal.is_special_offer ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-white/5'}`}>
                        <div className="flex gap-4 items-center">
                            <img src={deal.image} className="w-16 h-16 rounded-xl object-cover" />
                            <div>
                                <h3 className="font-bold flex items-center gap-2 text-lg">
                                    {deal.destination}
                                    {deal.is_special_offer && <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded text-white shadow uppercase">Akce</span>}
                                </h3>
                                <p className="text-sm text-slate-400">{deal.country}</p>
                                <p className="text-green-400 font-bold">{deal.total_price} Kč</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(deal)} className="text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-xl hover:bg-yellow-500/20 font-bold text-sm transition">✏️ Upravit</button>
                            <button onClick={() => handleDelete(deal.id)} className="text-red-500 bg-red-500/10 px-4 py-2 rounded-xl hover:bg-red-500/20 font-bold text-sm transition flex items-center gap-1"><Trash2 size={16}/> Smazat</button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* ... Zbytek (Bookings, Users, Requests) */}
        {activeTab === 'bookings' && (
            <div className="space-y-4">
                {bookings.map(b => (
                    <div key={b.id} className="bg-slate-900 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-white/20 transition">
                        <div>
                            <h3 className="font-bold text-green-400 text-lg">{b.deals?.destination}</h3>
                            <p className="text-slate-300 font-medium">{b.name} ({b.email})</p>
                            <p className="text-sm text-slate-500 mt-1">Počet osob: <span className="text-white font-bold">{b.people_count}</span> | Celková cena: <span className="text-white font-bold">{b.total_price} Kč</span></p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-white/5">
                            <button onClick={() => handleBookingStatus(b.id, 'confirmed')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${b.status === 'confirmed' ? 'bg-green-600 text-white' : 'text-green-500 hover:bg-green-600/20'}`}>Potvrdit</button>
                            <button onClick={() => handleBookingStatus(b.id, 'cancelled')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${b.status === 'cancelled' ? 'bg-red-600 text-white' : 'text-red-500 hover:bg-red-600/20'}`}>Zamítnout</button>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        {activeTab === 'users' && userRole === 'super_admin' && (
          <div className="grid gap-4">
            {users.map(u => (
                <div key={u.id} className="border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center bg-slate-900 hover:border-white/20 transition gap-4">
                    <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xl border border-white/10">{u.email?.charAt(0).toUpperCase()}</div>
                        <div><h3 className="font-bold text-white text-lg">{u.email}</h3><p className="text-sm text-slate-400">Aktuální role: <span className={`font-bold uppercase ${u.role==='super_admin'?'text-purple-400':u.role==='provider'?'text-green-400':'text-blue-400'}`}>{u.role || 'user'}</span></p></div>
                    </div>
                    {u.email !== 'triphack@outlook.cz' && (
                        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                            {u.role !== 'admin' && <button onClick={() => changeUserRole(u.id, 'admin')} className="bg-blue-900/30 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition border border-blue-500/20">Udělat Adminem</button>}
                            {u.role !== 'provider' && <button onClick={() => changeUserRole(u.id, 'provider')} className="bg-green-900/30 text-green-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-600 hover:text-white transition border border-green-500/20">🏠 Hostitel</button>}
                            {u.role !== 'user' && <button onClick={() => changeUserRole(u.id, 'user')} className="bg-red-900/30 text-red-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition border border-red-500/20">Odebrat práva</button>}
                        </div>
                    )}
                </div>
            ))}
          </div>
        )}

        {activeTab === 'requests' && (
            <div className="grid gap-4">
                {requests.map(req => (
                    <div key={req.id} className="bg-slate-900 p-6 rounded-3xl border border-orange-500/30 flex flex-col gap-4 shadow-xl">
                        <div className="flex justify-between items-start">
                            <div><h3 className="font-black text-orange-400 text-2xl">{req.destination}</h3><p className="text-slate-300 font-medium mt-1">Kdy: {req.date_range} &bull; Budget: {req.budget}</p></div>
                        </div>
                        <div className="mt-2 border-t border-white/5 pt-4">
                             <button onClick={() => setChatRequestId(chatRequestId === req.id ? null : req.id)} className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${chatRequestId === req.id ? 'bg-slate-800 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg'}`}>{chatRequestId === req.id ? 'Zavřít chat' : '💬 Otevřít konverzaci s klientem'}</button>
                             {chatRequestId === req.id && (<div className="mt-4"><RequestChat requestId={req.id} currentUserRole="admin" /></div>)}
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
}