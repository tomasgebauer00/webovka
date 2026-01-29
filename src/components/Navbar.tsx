'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        setIsAdmin(profile?.is_admin || false);
      }
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user;
      setUser(currentUser);
      if (currentUser) {
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', currentUser.id).single();
        setIsAdmin(profile?.is_admin || false);
      } else {
        setIsAdmin(false);
      }
      router.refresh();
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="flex justify-between items-center py-4 px-6 bg-slate-950/80 backdrop-blur-md fixed w-full z-50 border-b border-white/10 shadow-xl">
      {/* === LOGO === */}
      <Link href="/" className="text-2xl font-bold text-white tracking-tighter hover:text-blue-400 transition flex items-center gap-2">
         {/* Volitelně můžeš přidat emoji letadla k logu */}
         <span>✈️</span>
         <span>Trip<span className="text-blue-500">Hack</span></span>
      </Link>
      
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* === SOCIÁLNÍ SÍTĚ (Vloženo sem) === */}
        <div className="hidden md:flex items-center gap-3 mr-2">
            {/* TIKTOK */}
            <a 
                href="https://www.tiktok.com/@triphack.cz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-900 border border-white/10 flex items-center justify-center rounded-full hover:bg-[#00f2ea] hover:text-black hover:border-[#00f2ea] transition text-slate-400"
                title="TikTok"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
            </a>

            {/* INSTAGRAM */}
            <a 
                href="https://www.instagram.com/triphack.cz/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-slate-900 border border-white/10 flex items-center justify-center rounded-full hover:bg-[#d6249f] hover:text-white hover:border-[#d6249f] transition text-slate-400"
                title="Instagram"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
            </a>

            {/* Oddělovač */}
            <div className="w-px h-6 bg-white/10 mx-1"></div>
        </div>
        {/* === KONEC SOCIÁLNÍCH SÍTÍ === */}

        {user ? (
          <>
            {isAdmin && (<Link href="/admin" className="text-slate-300 font-bold hover:text-white transition hidden md:block">Admin</Link>)}
            <Link href="/profile" className="text-slate-300 font-bold hover:text-white transition">Můj profil</Link>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold transition shadow-lg shadow-red-900/20">Odhlásit</button>
          </>
        ) : (
          <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition shadow-lg shadow-blue-900/20">Přihlásit</Link>
        )}
      </div>
    </nav>
  );
}