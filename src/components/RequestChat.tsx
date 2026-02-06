'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, User, ShieldAlert } from 'lucide-react';

interface Message {
  id: number;
  sender_role: 'admin' | 'client';
  content: string;
  created_at: string;
}

interface ChatProps {
  requestId: number;
  currentUserRole: 'admin' | 'client'; // Kdo se dívá na chat?
}

export default function RequestChat({ requestId, currentUserRole }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Načtení historie a Realtime odběr
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('request_messages')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data as Message[]);
    };

    fetchMessages();

    // Realtime poslouchání nových zpráv
    const channel = supabase
      .channel(`chat_${requestId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'request_messages', filter: `request_id=eq.${requestId}` }, 
      (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [requestId]);

  // Automatické scrollování dolů
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. Odeslání zprávy
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('request_messages').insert([{
      request_id: requestId,
      sender_role: currentUserRole,
      content: newMessage
    }]);

    if (!error) setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[400px] bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
      
      {/* Zprávy */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
        {messages.length === 0 && <p className="text-center text-slate-500 text-sm mt-10">Zatím žádné zprávy. Napiš první! 👋</p>}
        
        {messages.map((msg) => {
          const isMe = msg.sender_role === currentUserRole;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-md ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 opacity-50 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Vstup */}
      <form onSubmit={sendMessage} className="p-3 bg-slate-900 border-t border-white/10 flex gap-2">
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Napiš zprávu..." 
          className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none text-sm"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}