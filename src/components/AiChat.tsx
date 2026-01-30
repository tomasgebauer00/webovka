'use client';
import { useState, useRef, useEffect } from 'react';

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Čau! 👋 Jsem TripBot s umělou inteligencí. Napiš mi, kam chceš letět nebo kolik máš peněz, a já ti poradím!' }
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
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMsg })
        });
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'bot', text: data.text }]);
    } catch (error) {
        setMessages(prev => [...prev, { role: 'bot', text: "Něco se pokazilo. 🤖 Zkus to znovu." }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 left-6 z-50 bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition hover:scale-110 animate-bounce-slow border-2 border-white/20">
            <span className="text-2xl">🤖</span>
            <span className="absolute top-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-slate-900 animate-pulse"></span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[90vw] md:w-96 h-[500px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl backdrop-blur-sm">🤖</div>
                    <div>
                        <h3 className="font-bold text-white text-sm">TripBot AI</h3>
                        <p className="text-[10px] text-blue-100 flex items-center gap-1 opacity-80"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online • GPT-4</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition bg-black/20 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-950/50 space-y-4 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-900">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] p-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-br-none' : 'bg-slate-800 text-slate-200 border border-white/5 rounded-2xl rounded-bl-none'}`}>{msg.text}</div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start"><div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none text-slate-400 text-xs flex gap-1 items-center border border-white/5"><span className="mr-2 font-bold">TripBot píše</span><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span></div></div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-white/10 flex gap-2 items-center">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Zeptej se na cokoliv..." disabled={isTyping} className="flex-1 bg-slate-950 text-white text-sm rounded-full px-4 py-3 border border-white/10 focus:border-blue-500 outline-none disabled:opacity-50 transition placeholder-slate-500" />
                <button type="submit" disabled={isTyping || !input.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white w-11 h-11 rounded-full flex items-center justify-center transition shadow-lg shadow-blue-900/20 transform active:scale-95">➤</button>
            </form>
        </div>
      )}
    </>
  );
}