'use client';
import { useState } from 'react';
import { X, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRIZES = [
  { label: 'Sleva 5%', color: '#3b82f6', value: 'SLEVA5' },
  { label: 'Zkus znova', color: '#64748b', value: null },
  { label: 'Sleva 10%', color: '#8b5cf6', value: 'SLEVA10' },
  { label: 'Nic :(', color: '#ef4444', value: null },
  { label: 'Drink zdarma', color: '#10b981', value: 'FREE_DRINK' },
  { label: 'Sleva 7%', color: '#f59e0b', value: 'SLEVA7' },
];

export default function LuckyWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [hasSpun, setHasSpun] = useState(false);

  const spinWheel = () => {
    if (spinning || hasSpun) return;

    setSpinning(true);
    const newRotation = rotation + 1800 + Math.random() * 360; // 5+ otoček
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setHasSpun(true);
      
      // Výpočet výhry (zjednodušený)
      const winningIndex = Math.floor(Math.random() * PRIZES.length);
      const prize = PRIZES[winningIndex];
      
      if (prize.value) {
        setResult(prize.label);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        setResult("Zkus to příště!");
      }
    }, 4000); // Délka animace
  };

  if (!isOpen && hasSpun) return null; // Pokud už vyhrál a zavřel to, nezobrazovat

  return (
    <>
      {/* Plovoucí tlačítko (pokud je zavřeno) */}
      {!isOpen && !hasSpun && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/20 animate-bounce cursor-pointer hover:scale-110 transition"
        >
          <Gift size={32} className="text-white" />
        </button>
      )}

      {/* Modální okno s kolem */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold text-white mb-2">Kolo štěstí 🍀</h2>
            <p className="text-slate-400 mb-8">Zatoč si a získej slevu na letenku!</p>

            <div className="relative w-64 h-64 mx-auto mb-8">
              {/* Šipka */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-8 h-8 bg-white rotate-45 border-r-4 border-b-4 border-slate-900"></div>

              {/* Kolo */}
              <div 
                className="w-full h-full rounded-full border-4 border-white overflow-hidden shadow-2xl transition-transform duration-[4000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(
                    ${PRIZES.map((p, i) => `${p.color} ${i * (360 / PRIZES.length)}deg ${(i + 1) * (360 / PRIZES.length)}deg`).join(', ')}
                  )`
                }}
              ></div>
            </div>

            {result ? (
              <div className="animate-in zoom-in">
                <p className="text-lg text-slate-300">Vyhráváš:</p>
                <h3 className="text-4xl font-extrabold text-yellow-400 my-2">{result}</h3>
                <p className="text-sm text-slate-500">Kód ti pošleme na e-mail!</p>
                <button onClick={() => setIsOpen(false)} className="mt-6 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-full font-bold">Zavřít</button>
              </div>
            ) : (
              <button 
                onClick={spinWheel}
                disabled={spinning}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xl font-bold px-12 py-4 rounded-full shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {spinning ? 'Točíme...' : 'ZATOČIT!'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}