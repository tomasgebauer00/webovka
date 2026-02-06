'use client';
import { useRouter } from 'next/navigation';
import { Home, Users, ShieldCheck, Lightbulb, User } from 'lucide-react';

export default function MobileBottomNav() {
  const router = useRouter();

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
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-white/10 z-[60] pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-blue-500 transition">
          <Home size={20} />
          <span className="text-[10px] font-bold">Domů</span>
        </button>

        <button onClick={() => scrollToSection('buddy-section')} className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-purple-400 transition">
          <Users size={20} />
          <span className="text-[10px] font-bold">Parťáci</span>
        </button>

        <button onClick={() => scrollToSection('visa-section')} className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-green-400 transition">
          <ShieldCheck size={20} />
          <span className="text-[10px] font-bold">Víza</span>
        </button>

        <button onClick={() => scrollToSection('hacks-section')} className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-yellow-400 transition">
          <Lightbulb size={20} />
          <span className="text-[10px] font-bold">Hacky</span>
        </button>

        <button onClick={() => router.push('/profile')} className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white transition">
          <User size={20} />
          <span className="text-[10px] font-bold">Profil</span>
        </button>

      </div>
    </div>
  );
}