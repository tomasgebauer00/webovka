'use client';
import React, { useState } from 'react';
import { ShieldCheck, Syringe, FileText, Loader2, Banknote, AlertTriangle } from 'lucide-react';

export default function VisaHealthSection() {
  const [origin, setOrigin] = useState('Česká republika');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const checkVisa = async () => {
    if (!destination) return alert("Vyber prosím cílovou destinaci!");
    
    setLoading(true);
    setData(null);

    try {
      const res = await fetch('/api/visa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination })
      });
      const result = await res.json();
      setData(result);
    } catch (error) {
      alert("Chyba při komunikaci s AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-black text-white border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-white/10 rounded-2xl p-8 md:p-12">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold mb-4">AI Visa & Health Checker 🛂</h2>
            <p className="text-gray-400">Umělá inteligence ti okamžitě zjistí vízové povinnosti a zdravotní rizika.</p>
          </div>

          {/* Vstupy */}
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto bg-gray-900/80 p-4 rounded-xl backdrop-blur-sm border border-gray-700 shadow-2xl">
            <input 
              type="text" 
              value={origin} 
              onChange={(e) => setOrigin(e.target.value)}
              className="flex-1 bg-transparent border-none text-white focus:ring-0 text-lg outline-none placeholder-gray-500 font-bold"
              placeholder="Odkud? (např. Česko)"
            />
            <div className="w-px bg-gray-700 hidden md:block"></div>
            <input 
              type="text" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 bg-transparent border-none text-white focus:ring-0 text-lg outline-none placeholder-gray-500 font-bold"
              placeholder="Kam letíš? (např. Vietnam)"
            />
            <button 
              onClick={checkVisa}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center justify-center min-w-[150px]"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Zkontrolovat'}
            </button>
          </div>

          {/* Výsledky */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 animate-in slide-in-from-bottom-4 fade-in duration-500">
              
              {/* Karta Víza */}
              <div className="bg-gray-900/60 p-6 rounded-xl border border-blue-500/30 hover:border-blue-500 transition">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-blue-400" size={28} />
                  <h3 className="text-xl font-bold">{data.visaStatus}</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{data.visaDetails}</p>
              </div>

              {/* Karta Zdraví */}
              <div className="bg-gray-900/60 p-6 rounded-xl border border-green-500/30 hover:border-green-500 transition">
                <div className="flex items-center gap-3 mb-4">
                  <Syringe className="text-green-400" size={28} />
                  <h3 className="text-xl font-bold">Zdraví & Očkování</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{data.health}</p>
              </div>

              {/* Karta Bezpečnost */}
              <div className="bg-gray-900/60 p-6 rounded-xl border border-yellow-500/30 hover:border-yellow-500 transition">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-yellow-400" size={28} />
                  <h3 className="text-xl font-bold">Bezpečnost: {data.safety}</h3>
                </div>
                <div className="text-gray-300 flex items-start gap-2">
                   <AlertTriangle size={20} className="text-yellow-500 shrink-0 mt-1" />
                   <span>Dávej si pozor na místní podvody a kapsáře.</span>
                </div>
              </div>

              {/* Karta Měna */}
              <div className="bg-gray-900/60 p-6 rounded-xl border border-purple-500/30 hover:border-purple-500 transition">
                <div className="flex items-center gap-3 mb-4">
                  <Banknote className="text-purple-400" size={28} />
                  <h3 className="text-xl font-bold">Měna</h3>
                </div>
                <p className="text-gray-300 text-lg font-mono">{data.currency}</p>
              </div>

            </div>
          )}
        </div>
      </div>
    </section>
  );
}