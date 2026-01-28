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
      {/* === ZMĚNA LOGA ZDE === */}
      <Link href="/" className="text-2xl font-bold text-white tracking-tighter hover:text-blue-400 transition">
        Trip<span className="text-blue-500">Hack</span>
      </Link>
      
      <div className="flex items-center gap-4 md:gap-6">
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