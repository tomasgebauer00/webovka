'use client';
import { useState } from 'react';

export default function LuckyWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning || result) return;
    setSpinning(true);
    
    // Náhodná rotace (minimálně 5 otoček + náhoda)
    const randomDeg = Math.floor(Math.random() * 360);
    const totalRotation = 1800 + randomDeg; // 5 plných otoček (1800) + dopad
    
    setRotation(totalRotation);

    setTimeout(() => {
        setSpinning(false);
        // Jednoduchá logika výhry podle úhlu (jen pro efekt dáváme vždy slevu)
        setResult("SLEVA 500 Kč! 🎉 Kód: TRIPHACK500");
    }, 4000); // Musí odpovídat době animace
  };

  return (
    <>
        {/* Plovoucí tlačítko */}
        {!isOpen && (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold p-4 rounded-full shadow-lg hover:scale-110 transition animate-bounce"
            >
                🎡 Zkus štěstí
            </button>
        )}

        {/* Modal Kola */}
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
                    <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">Roztoč to a vyhraj! 🎁</h2>
                    <p className="text-slate-400 mb-6">Každý vyhrává. Zkus svou šanci.</p>

                    <div className="relative w-64 h-64 mx-auto mb-8">
                        {/* Šipka */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-3xl text-red-500">▼</div>
                        
                        {/* Kolo */}
                        <div 
                            className="w-full h-full rounded-full border-4 border-yellow-500 bg-[conic-gradient(from_0deg,#facc15_0deg_60deg,#eab308_60deg_120deg,#ca8a04_120deg_180deg,#facc15_180deg_240deg,#eab308_240deg_300deg,#ca8a04_300deg_360deg)] shadow-[0_0_50px_rgba(234,179,8,0.2)]"
                            style={{ 
                                transform: `rotate(${rotation}deg)`,
                                transition: 'transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                            }}
                        >
                            {/* Texty v kole (zjednodušené) */}
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-900 text-xs">ŠTĚSTÍ</div>
                        </div>
                    </div>

                    {result ? (
                        <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-xl animate-in zoom-in">
                            <p className="text-green-400 font-bold text-xl mb-1">{result}</p>
                            <p className="text-xs text-green-300">Platí 24 hodin!</p>
                        </div>
                    ) : (
                        <button 
                            onClick={spin}
                            disabled={spinning}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold py-3 px-8 rounded-xl text-lg hover:scale-105 transition shadow-lg shadow-orange-500/20"
                        >
                            {spinning ? 'Točím...' : 'ROZTOČIT!'}
                        </button>
                    )}
                </div>
            </div>
        )}
    </>
  );
}