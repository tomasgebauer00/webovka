'use client';
import { useState, useRef, useEffect } from 'react';

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Ahoj! 👋 Jsem TripBot s umělou inteligencí. Zeptej se mě na cokoliv o cestování!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    
    // 1. Zobrazit zprávu uživatele
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
        // 🚨 ZMĚNA ZDE: Adresa musí odpovídat názvu tvé složky (api_fix)
        const response = await fetch('/api_fix/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMsg })
        });

        if (!response.ok) {
            // Pokud server vrátí chybu (např. 404 nebo 500)
            throw new Error(`Chyba serveru: ${response.status}`);
        }

        const data = await response.json();

        // 3. Zobrazit odpověď od AI
        setMessages(prev => [...prev, { role: 'bot', text: data.text }]);
    } catch (error) {
        console.error("Chyba v komunikaci:", error);
        setMessages(prev => [...prev, { role: 'bot', text: "Omlouvám se, spojení s AI selhalo. 🔌 Zkus to za chvilku." }]);
    } finally {
        setIsTyping(false);
    }
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
            <span className="absolute top-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-slate-900 animate-pulse"></span>
        </button>
      )}

      {/* Chatovací Okno */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[90vw] md:w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 h-[500px]">
            
            {/* Hlavička */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl bg-white/20 p-1 rounded-full">🧠</span>
                    <div>
                        <h3 className="font-bold text-white text-sm">TripBot AI</h3>
                        <p className="text-[10px] text-blue-100 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online • GPT-4o</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white text-xl font-bold">✕</button>
            </div>

            {/* Zprávy */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none text-slate-400 text-xs flex gap-1 items-center">
                            <span>AI píše</span>
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
                    placeholder="Zeptej se na cokoliv..." 
                    className="flex-1 bg-slate-950 text-white text-sm rounded-full px-4 py-2 border border-white/10 focus:border-blue-500 outline-none"
                    disabled={isTyping}
                />
                <button type="submit" disabled={isTyping} className="bg-blue-600 hover:bg-blue-500 text-white w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-50">➤</button>
            </form>
        </div>
      )}
    </>
  );
}