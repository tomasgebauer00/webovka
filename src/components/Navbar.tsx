'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plane, Users, ShieldCheck, Lightbulb, Flame, User, LogOut, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

// === 🛑 TADY SI NASTAV EMAILY ADMINŮ 🛑 ===
const ADMIN_EMAILS = ['tomasgebauer00@gmail.com']; 
// Pokud máš víc adminů, odděl je čárkou: ['tvuj@email.cz', 'kolega@email.cz']

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 1. ZJISTÍME, JESTLI JE UŽIVATEL PŘIHLÁŠENÝ
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. FUNKCE PRO ODHLÁŠENÍ
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const scrollToSection = (id: string) => {
    if (window.location.pathname !== '/') {
      router.push(`/#${id}`);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <Plane className="text-blue-500 group-hover:-rotate-45 transition duration-500" size={28} />
          <span className="text-2xl font-black text-white tracking-tighter">
            Trip<span className="text-blue-500">Hack</span>
          </span>
        </Link>

        {/* STŘEDOVÁ NAVIGACE - NÁSTROJE */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 shadow-inner">
          <button 
            onClick={() => scrollToSection('buddy-section')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition group"
          >
            <Users size={16} className="text-purple-400 group-hover:scale-110 transition" /> Parťáci
          </button>

          <button 
            onClick={() => scrollToSection('visa-section')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition group"
          >
            <ShieldCheck size={16} className="text-green-400 group-hover:scale-110 transition" /> Víza
          </button>

          <button 
            onClick={() => scrollToSection('hacks-section')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition group"
          >
            <Lightbulb size={16} className="text-yellow-400 group-hover:scale-110 transition" /> Hacky
          </button>
        </div>

        {/* PRAVÁ ČÁST */}
        <div className="flex items-center gap-3">
          
          {/* TINDER TLAČÍTKO */}
          <Link 
            href="/swipe" 
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-pink-900/20 transition border border-white/10 hover:scale-105 active:scale-95 group text-sm"
          >
            <Flame size={16} className="fill-white group-hover:animate-pulse" /> 
            <span>Seznamka</span>
          </Link>

          {/* === LOGIKA PŘIHLÁŠENÍ === */}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              
              {/* 🛑 ADMIN TLAČÍTKO - ZOBRAZÍ SE JEN POKUD JE EMAIL V SEZNAMU 🛑 */}
              {user.email && ADMIN_EMAILS.includes(user.email) && (
                <Link 
                  href="/admin" 
                  className="hidden md:flex items-center gap-1 text-red-400 hover:text-red-300 bg-red-900/20 px-3 py-2 border border-red-500/30 rounded-lg transition text-sm font-bold"
                >
                  <Settings size={16} /> Admin
                </Link>
              )}

              {/* Můj Účet */}
              <Link 
                href="/profile" 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-bold transition shadow-lg shadow-blue-900/20 text-sm"
              >
                <User size={16} /> Můj účet
              </Link>

              {/* Odhlásit */}
              <button 
                onClick={handleLogout}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition"
                title="Odhlásit se"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            // POKUD NENÍ PŘIHLÁŠENÝ
            <Link 
              href="/login"
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full font-bold transition shadow-lg shadow-blue-900/20 text-sm"
            >
              Přihlásit
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}