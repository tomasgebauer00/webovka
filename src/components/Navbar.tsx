'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plane, Users, ShieldCheck, Lightbulb, User, LogOut, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        // 🛑 OPRAVA ZDE: Povolíme tlačítko pro 'admin' I 'super_admin'
        if (profile && (profile.role === 'admin' || profile.role === 'super_admin')) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    };

    checkUserAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
      } else if (session?.user) {
        checkUserAndRole(); 
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
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
    <nav className="fixed top-0 left-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between relative">
        
        {/* LEVÁ STRANA: LOGO */}
        <Link href="/" className="flex items-center gap-2 group shrink-0 z-10">
          <Plane className="text-blue-500 group-hover:-rotate-45 transition duration-500 w-6 h-6 md:w-7 md:h-7" />
          <span className="hidden md:inline text-xl md:text-2xl font-black text-white tracking-tighter">
            Trip<span className="text-blue-500">Hack</span>
          </span>
        </Link>

        {/* STŘED: NAVIGACE (VIDITELNÁ VŽDY) */}
        {/* Na mobilu se to posune doprostřed, na desktopu je to absolutně vycentrované */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 shadow-inner overflow-x-auto scrollbar-hide max-w-[60%] md:max-w-none">
          <button onClick={() => scrollToSection('buddy-section')} className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition group whitespace-nowrap">
            <Users size={14} className="text-purple-400 group-hover:scale-110 transition md:w-4 md:h-4" /> 
            <span>Parťáci</span>
          </button>
          <button onClick={() => scrollToSection('visa-section')} className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition group whitespace-nowrap">
            <ShieldCheck size={14} className="text-green-400 group-hover:scale-110 transition md:w-4 md:h-4" /> 
            <span>Víza</span>
          </button>
          <button onClick={() => scrollToSection('hacks-section')} className="flex items-center gap-1 md:gap-2 px-2 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition group whitespace-nowrap">
            <Lightbulb size={14} className="text-yellow-400 group-hover:scale-110 transition md:w-4 md:h-4" /> 
            <span>Hacky</span>
          </button>
        </div>

        {/* PRAVÁ STRANA: UŽIVATEL */}
        <div className="flex items-center gap-2 shrink-0 z-10">
          
          {user ? (
            <div className="flex items-center gap-1 md:gap-2">
              {/* Tlačítko Admin - zobrazí se adminovi i super adminovi */}
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-1 text-red-400 hover:text-red-300 bg-red-900/20 px-2 py-1.5 md:px-3 md:py-2 border border-red-500/30 rounded-lg transition text-xs md:text-sm font-bold">
                  <Settings size={14} className="md:w-4 md:h-4" /> 
                  <span className="hidden md:inline">Admin</span>
                </Link>
              )}

              <Link href="/profile" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold transition shadow-lg shadow-blue-900/20 text-xs md:text-sm">
                <User size={14} className="md:w-4 md:h-4" /> 
                <span className="hidden md:inline">Můj účet</span>
              </Link>

              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition" title="Odhlásit se">
                <LogOut size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-full font-bold transition shadow-lg shadow-blue-900/20 text-xs md:text-sm whitespace-nowrap">
              Přihlásit
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}