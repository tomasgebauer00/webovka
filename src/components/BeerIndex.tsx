'use client';
import { useState } from 'react';
import { Beer, Utensils, ArrowRight } from 'lucide-react';

// Data (orientační ceny v Kč)
const DATA: Record<string, { beer: number; meal: number; currency: string; rate: number }> = {
  'Thajsko': { beer: 45, meal: 80, currency: 'THB', rate: 0.65 },
  'Vietnam': { beer: 25, meal: 60, currency: 'VND', rate: 0.0009 },
  'Japonsko': { beer: 120, meal: 250, currency: 'JPY', rate: 0.15 },
  'USA': { beer: 180, meal: 400, currency: 'USD', rate: 23 },
  'Bali': { beer: 50, meal: 90, currency: 'IDR', rate: 0.0015 },
  'Španělsko': { beer: 90, meal: 350, currency: 'EUR', rate: 25 },
  'Egypt': { beer: 60, meal: 150, currency: 'EGP', rate: 0.5 },
  'Norsko': { beer: 250, meal: 500, currency: 'NOK', rate: 2.1 },
};

export default function BeerIndex() {
  const [selectedCountry, setSelectedCountry] = useState('Thajsko');
  const info = DATA[selectedCountry];
  
  // Průměrné ceny v ČR
  const czBeer = 55; 
  const czMeal = 220;

  return (
    <section className="py-16 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 text-white border-y border-white/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-2 text-yellow-500 flex items-center justify-center gap-2">
          <Beer /> Pivní & Gastro Index
        </h2>
        <p className="text-gray-400 mb-8">Zjisti, jestli tě dovolená "sežere", nebo jestli budeš žít jako král.</p>

        <div className="max-w-4xl mx-auto bg-slate-900 border border-yellow-500/30 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          
          {/* Výběr země */}
          <div className="flex justify-center mb-8">
            <select 
              value={selectedCountry} 
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-800 text-white text-xl font-bold py-3 px-6 rounded-xl border border-white/10 outline-none focus:border-yellow-500 transition cursor-pointer"
            >
              {Object.keys(DATA).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* PIVO */}
            <div className="flex flex-col items-center p-4 bg-white/5 rounded-xl">
              <span className="text-gray-400 text-sm uppercase font-bold mb-2">Cena Piva (0.5l)</span>
              <div className="flex items-end gap-4">
                <div className="text-center">
                  <p className="text-gray-500 text-xs">Česko</p>
                  <p className="text-xl font-bold text-gray-300">{czBeer} Kč</p>
                </div>
                <ArrowRight className="mb-1 text-gray-600" />
                <div className="text-center">
                  <p className="text-yellow-500 text-xs">{selectedCountry}</p>
                  <p className={`text-4xl font-black ${info.beer < czBeer ? 'text-green-400' : 'text-red-400'}`}>
                    {info.beer} Kč
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {info.beer < czBeer ? '🎉 Tady ušetříš na žízni!' : '💸 Au, tady se pije draze.'}
              </p>
            </div>

            {/* JÍDLO */}
            <div className="flex flex-col items-center p-4 bg-white/5 rounded-xl">
              <span className="text-gray-400 text-sm uppercase font-bold mb-2">Cena Oběda</span>
              <div className="flex items-end gap-4">
                <div className="text-center">
                  <p className="text-gray-500 text-xs">Česko</p>
                  <p className="text-xl font-bold text-gray-300">{czMeal} Kč</p>
                </div>
                <ArrowRight className="mb-1 text-gray-600" />
                <div className="text-center">
                  <p className="text-yellow-500 text-xs">{selectedCountry}</p>
                  <p className={`text-4xl font-black ${info.meal < czMeal ? 'text-green-400' : 'text-red-400'}`}>
                    {info.meal} Kč
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {info.meal < czMeal ? '🍜 Najíš se levněji než doma.' : '🍽️ Připrav si peněženku.'}
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}