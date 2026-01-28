'use client';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Sloupec 1: O nás */}
        <div>
          {/* === ZMĚNA LOGA ZDE === */}
          <div className="text-2xl font-bold text-white tracking-tighter mb-4 cursor-pointer" onClick={() => router.push('/')}>
            Trip<span className="text-blue-500">Hack</span>
          </div>
          <p className="leading-relaxed mb-4">
            Jsme komunita cestovatelů, kteří loví ty největší chyby v letenkách a last-minute nabídky. Cestuj chytře, žij naplno.
          </p>
          <div className="flex gap-4">
             <span className="cursor-pointer hover:text-white transition">📸 Instagram</span>
             <span className="cursor-pointer hover:text-white transition">📘 Facebook</span>
             <span className="cursor-pointer hover:text-white transition">🐦 Twitter</span>
          </div>
        </div>

        {/* Sloupec 2: Rychlé odkazy */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-wider mb-4">Prozkoumat</h3>
          <ul className="space-y-2">
            <li onClick={() => router.push('/')} className="cursor-pointer hover:text-blue-400 transition">Všechny zájezdy</li>
            <li className="cursor-pointer hover:text-blue-400 transition">Akční letenky</li>
            <li className="cursor-pointer hover:text-blue-400 transition">Exotika</li>
            <li className="cursor-pointer hover:text-blue-400 transition">Eurovíkendy</li>
          </ul>
        </div>

        {/* Sloupec 3: Podpora */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-wider mb-4">Podpora</h3>
          <ul className="space-y-2">
            <li className="cursor-pointer hover:text-blue-400 transition">Časté dotazy (FAQ)</li>
            <li className="cursor-pointer hover:text-blue-400 transition">Jak to funguje</li>
            <li className="cursor-pointer hover:text-blue-400 transition">Obchodní podmínky</li>
            <li className="cursor-pointer hover:text-blue-400 transition">Ochrana údajů</li>
          </ul>
        </div>

        {/* Sloupec 4: Kontakt */}
        <div>
          <h3 className="text-white font-bold uppercase tracking-wider mb-4">Kontakt</h3>
          <ul className="space-y-2">
            <li>📍 Praha, Česká republika</li>
            <li>📧 info@triphack.cz</li> {/* Změnil jsem i email */}
            <li>📞 +420 123 456 789</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* === ZMĚNA COPYRIGHTU ZDE === */}
        <p>&copy; 2026 TripHack. Všechna práva vyhrazena.</p>
        <div className="flex gap-4 grayscale opacity-50">
            <span>💳 Visa</span>
            <span>💳 Mastercard</span>
            <span>💳 PayPal</span>
        </div>
      </div>
    </footer>
  );
}