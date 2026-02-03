'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Ahoj! 👋 Jsem TripBot. Hledáš levnou letenku nebo celou dovolenou? Napiš mi!' }
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
      // Voláme náš endpoint z Kroku 1
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.text || 'Chyba serveru');
      
      setMessages(prev => [...prev, { role: 'bot', text: data.text }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Omlouvám se, mám problém se spojením. Zkus to později. 😔' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[90vw] md:w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[500px] animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Hlavička */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">TripBot AI</h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
              <X size={20} />
            </button>
          </div>

          {/* Zprávy */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-950/95 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-gray-100 rounded-bl-none border border-white/10'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-white/10 flex items-center gap-2 text-gray-400 text-xs">
                  <Loader2 size={14} className="animate-spin" /> Přemýšlím...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Vstup */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-white/10 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Zeptej se na cestování..." 
              className="flex-1 bg-slate-950 text-white text-sm rounded-xl px-4 py-3 border border-white/10 outline-none focus:border-blue-500 transition placeholder:text-gray-600"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()} 
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-3 rounded-xl flex items-center justify-center transition"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Tlačítko pro otevření */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg shadow-blue-900/40 flex items-center justify-center text-white hover:scale-110 transition duration-300 group border-2 border-white/20 animate-bounce-slow"
        >
          <MessageCircle size={32} />
        </button>
      )}
    </div>
  );
}