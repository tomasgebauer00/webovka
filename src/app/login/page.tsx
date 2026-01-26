'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // false = Login, true = Register
  
  // Diagnostické zprávy na obrazovku
  const [statusMsg, setStatusMsg] = useState('');
  const [statusColor, setStatusColor] = useState('text-slate-400');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('Komunikuji se Supabase...');
    setStatusColor('text-blue-400');

    try {
      if (isSignUp) {
        // === REGISTRACE ===
        console.log("Pokus o registraci:", email);
        
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
        });

        console.log("Odpověď Supabase:", data, error);

        if (error) {
          throw error;
        }

        // KONTROLA: Vytvořil se uživatel, ale chybí session? -> Email confirmation je zapnutý!
        if (data.user && !data.session) {
          setStatusColor('text-yellow-400');
          setStatusMsg('Účet vytvořen! ALE: Supabase čeká na potvrzení emailu. Jdi do Supabase -> Auth -> Providers -> Email a vypni "Confirm Email".');
          return; 
        }

        setStatusColor('text-green-400');
        setStatusMsg('Registrace úspěšná! Přihlašuji...');
        
        // Pokud prošlo vše hladce
        setIsSignUp(false); 
        
      } else {
        // === PŘIHLÁŠENÍ ===
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        setStatusColor('text-green-400');
        setStatusMsg('Přihlášeno! Přesměrovávám...');
        router.push('/'); 
        router.refresh();
      }
    } catch (error: any) {
      console.error("Chyba:", error);
      setStatusColor('text-red-500 font-bold');
      setStatusMsg('CHYBA: ' + (error.message || error.error_description || 'Neznámá chyba'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 pt-32">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative z-10">
        
        {/* Záložky */}
        <div className="flex border-b border-white/10">
          <button 
            type="button"
            onClick={() => { setIsSignUp(false); setStatusMsg(''); }}
            className={`flex-1 py-4 text-sm font-bold uppercase transition ${!isSignUp ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'}`}
          >
            Přihlášení
          </button>
          <button 
            type="button"
            onClick={() => { setIsSignUp(true); setStatusMsg(''); }}
            className={`flex-1 py-4 text-sm font-bold uppercase transition ${isSignUp ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'}`}
          >
            Registrace
          </button>
        </div>

        {/* Formulář */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isSignUp ? 'Registrace' : 'Přihlášení'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none"
                placeholder="email@adresa.cz"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Heslo (min 6 znaků)</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none"
                placeholder="••••••••"
                required 
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-slate-900 hover:bg-blue-50 font-bold py-4 rounded-xl transition shadow-lg mt-4"
            >
              {loading ? 'Pracuji...' : (isSignUp ? 'Zaregistrovat se' : 'Přihlásit se')}
            </button>
          </form>

          {/* === ZDE SE ZOBRAZÍ VÝSLEDEK === */}
          {statusMsg && (
            <div className={`mt-6 p-4 rounded-xl bg-black/20 text-center text-sm ${statusColor}`}>
              {statusMsg}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}