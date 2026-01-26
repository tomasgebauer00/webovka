'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false); // Stav pro admina

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      // Zkontrolujeme v databázi, jestli je admin
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      setIsAdmin(data?.is_admin || false);
    } else {
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    window.location.reload(); // Pro jistotu refresh stránky
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="text-2xl font-bold text-white tracking-tighter cursor-pointer" onClick={() => router.push('/')}>
          Lovci<span className="text-blue-500">Dovolené</span>
        </div>
        
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400 items-center">
          <span className="hover:text-white cursor-pointer transition">Akční letenky</span>
          <span className="hover:text-white cursor-pointer transition">Ubytování</span>
          <span onClick={() => router.push('/favorites')} className="hover:text-red-400 cursor-pointer transition font-bold">
            Oblíbené ❤️
          </span>
          
          {/* TLAČÍTKO ADMIN - VIDÍ JEN ADMIN */}
          {isAdmin && (
            <button 
              onClick={() => router.push('/admin')}
              className="bg-red-600/20 text-red-400 border border-red-500/50 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-600 hover:text-white transition uppercase tracking-wider ml-4"
            >
              🛠️ Admin
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden md:block text-xs text-slate-500 mr-2">{user.email}</span>
              <button onClick={handleLogout} className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition">
                Odhlásit
              </button>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/login')} className="text-slate-300 hover:text-white font-medium text-sm transition px-2">
                Přihlásit se
              </button>
              <button onClick={() => router.push('/login')} className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-500 transition shadow-lg shadow-blue-600/20">
                Vytvořit účet
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}