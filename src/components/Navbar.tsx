'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plane, Users, ShieldCheck, Lightbulb, Flame } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();

  const scrollToSection = (id: string) => {
    // Pokud jsme na hlavní stránce, scrollujeme. Jinak jdeme na hlavní a pak scrollujeme.
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

        {/* PRAVÁ ČÁST - TINDER A LOGIN */}
        <div className="flex items-center gap-3">
          
          {/* TINDER TLAČÍTKO - SPECIÁLNÍ DESIGN */}
          <Link 
            href="/swipe" 
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-pink-900/20 transition border border-white/10 hover:scale-105 active:scale-95 group"
          >
            <Flame size={18} className="fill-white group-hover:animate-pulse" /> 
            <span>Seznamka</span>
          </Link>

          {/* PŘIHLÁSIT */}
          <Link 
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full font-bold transition shadow-lg shadow-blue-900/20"
          >
            Přihlásit
          </Link>
        </div>
      </div>
    </nav>
  );
}