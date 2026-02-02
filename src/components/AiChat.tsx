'use client';
import { useState, useRef, useEffect } from 'react';

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Ahoj! 👋 Jsem TripBot. Ptej se, jsem připraven!' }
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
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
        // ✅ OPRAVENO: Voláme standardní cestu /api/chat
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMsg })
        });

        if (!response.ok) {
            throw new Error(`Chyba serveru: ${response.status}`);
        }

        const data = await response.json();
        setMessages(prev => [...prev, { role: 'bot', text: data.text }]);

    } catch (error: any) {
        console.error("Chyba:", error);
        setMessages(prev => [...prev, { role: 'bot', text: `❌ ${error.message || "Chyba spojení"}` }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-110 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition animate-bounce-slow border-2 border-white/20"
        >
            <span className="text-3xl">🤖</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[500px] animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    <div>
                        <h3 className="font-bold text-white text-sm">TripBot AI</h3>
                        <p className="text-[10px] text-blue-100 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white text-xl font-bold">✕</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-950 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                     <div className="flex justify-start"><div className="bg-slate-800 p-3 rounded-2xl text-slate-400 text-xs animate-pulse">AI píše...</div></div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-white/10 flex gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Zeptej se..." 
                    className="flex-1 bg-slate-950 text-white text-sm rounded-full px-4 py-2 border border-white/10 outline-none focus:border-blue-500 transition"
                    disabled={isTyping}
                />
                <button type="submit" disabled={isTyping} className="bg-blue-600 hover:bg-blue-500 text-white w-9 h-9 rounded-full flex items-center justify-center transition">➤</button>
            </form>
        </div>
      )}
    </>
  );
}