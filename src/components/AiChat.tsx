'use client';
import { useState, useRef, useEffect } from 'react';

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Ahoj! 👋 Já jsem TripBot. Nevíš kam vyrazit? Napiš mi, co máš rád (např. pláže, hory, levně) a já ti poradím!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, isOpen]);

  // === TADY JE MOZEK BOTA (Jednoduchá pravidla pro začátek) ===
  const getBotResponse = (text: string) => {
    const t = text.toLowerCase();
    
    if (t.includes('ahoj') || t.includes('čau')) return 'Zdravím cestovatele! ✈️ Kam by to mělo být?';
    if (t.includes('levn') || t.includes('cena')) return 'Máme super Last Minute nabídky! Mrkni do sekce "Akční nabídky", tam jsou slevy až 50%. 🔥';
    if (t.includes('moře') || t.includes('pláž') || t.includes('teplo')) return 'Miluješ slunce? Doporučuji Bali, Maledivy nebo Řecko. Máme tam teď volná místa! 🏖️';
    if (t.includes('hory') || t.includes('lyže') || t.includes('sníh')) return 'Hory jsou super! Koukni na naše zájezdy do Rakouska nebo Itálie. 🏔️';
    if (t.includes('exotika')) return 'Exotika je naše specialita! Zanzibar nebo Thajsko tě určitě nezklamou. 🌴';
    if (t.includes('kontakt') || t.includes('telefon')) return 'Můžeš nám zavolat na +420 123 456 789 nebo napsat na info@triphack.cz.';
    
    return 'Hmm, to zní zajímavě! 🤔 Nejsem sice člověk, ale zkus se podívat do vyhledávání nahoře, tam určitě najdeš, co hledáš. Nebo zkus napsat "levně" nebo "moře".';
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Přidat zprávu uživatele
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    // 2. Simulovat přemýšlení a odpověď bota
    setTimeout(() => {
        const botReply = getBotResponse(userMsg);
        setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
        setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Tlačítko (Bublina) */}
      {!isOpen && (
        <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-6 z-50 bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition hover:scale-110 animate-bounce-slow"
        >
            <span className="text-2xl">🤖</span>
            {/* Červená tečka (notifikace) */}
            <span className="absolute top-0 right-0 bg-red-500 w-4 h-4 rounded-full border-2 border-slate-900"></span>
        </button>
      )}

      {/* Chatovací Okno */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-80 md:w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
            
            {/* Hlavička */}
            <div className="bg-blue-600 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl bg-white/20 p-1 rounded-full">🤖</span>
                    <div>
                        <h3 className="font-bold text-white text-sm">TripBot AI</h3>
                        <p className="text-[10px] text-blue-100 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white text-xl font-bold">✕</button>
            </div>

            {/* Zprávy */}
            <div className="flex-1 p-4 h-80 overflow-y-auto bg-slate-950 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none text-slate-400 text-xs flex gap-1">
                            <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-white/10 flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Napiš zprávu..." 
                    className="flex-1 bg-slate-950 text-white text-sm rounded-full px-4 py-2 border border-white/10 focus:border-blue-500 outline-none"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white w-9 h-9 rounded-full flex items-center justify-center transition">➤</button>
            </form>
        </div>
      )}
    </>
  );
}