import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* 1. Sloupec - Logo a info */}
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold text-white tracking-tighter">
            Trip<span className="text-blue-500">Hack</span>
          </h2>
          <p>
            Cestuj chytře, levně a bez starostí. 
            Hlídáme ty nejlepší nabídky za tebe.
          </p>
          <div className="flex gap-4 pt-2">
            {/* TIKTOK IKONA */}
            <a 
              href="https://www.tiktok.com/@triphack.cz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-full hover:bg-[#00f2ea] hover:text-black transition duration-300 group"
              title="Sleduj nás na TikToku"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-black">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>

            {/* INSTAGRAM IKONA */}
            <a 
              href="https://www.instagram.com/triphack.cz/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-full hover:bg-gradient-to-tr hover:from-[#fd5949] hover:to-[#d6249f] hover:text-white transition duration-300"
              title="Sleduj nás na Instagramu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>

        {/* 2. Sloupec - Rychlé odkazy */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider">O nás</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-blue-400 transition">Jak to funguje?</Link></li>
            <li><Link href="#" className="hover:text-blue-400 transition">Náš příběh</Link></li>
            <li><Link href="#" className="hover:text-blue-400 transition">Kariéra</Link></li>
          </ul>
        </div>

        {/* 3. Sloupec - Podpora */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Podpora</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-blue-400 transition">Časté dotazy (FAQ)</Link></li>
            <li><Link href="#" className="hover:text-blue-400 transition">Kontakt</Link></li>
            <li><Link href="#" className="hover:text-blue-400 transition">Ochrana údajů</Link></li>
          </ul>
        </div>

        {/* 4. Sloupec - Kontakt */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Kontakt</h3>
          <ul className="space-y-2">
            <li>info@triphack.cz</li>
            <li>+420 123 456 789</li>
            <li className="pt-2 text-xs opacity-50">
              © {new Date().getFullYear()} TripHack. Všechna práva vyhrazena.
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}