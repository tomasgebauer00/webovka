'use client';
import { useState, useEffect } from 'react';

const NAMES = ['Petr', 'Jana', 'Tomáš', 'Lucie', 'Jakub', 'Eva', 'Martin', 'Adéla'];
const CITIES = ['Prahy', 'Brna', 'Ostravy', 'Plzně', 'Liberce'];
const ACTIONS = ['právě rezervoval letenku do', 'si prohlíží', 'koupil zájezd do', 'ulovil slevu na'];
const DESTINATIONS = ['Bali 🏝️', 'New Yorku 🗽', 'Dubaje 🏙️', 'Thajska 🐘', 'Londýna 🇬🇧', 'Paříže 🗼'];

export default function SocialProof() {
  const [notification, setNotification] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // První notifikace po 5 sekundách
    const initialTimer = setTimeout(triggerNotification, 5000);
    
    // Další každých 15-30 sekund
    const interval = setInterval(triggerNotification, 20000);

    return () => { clearTimeout(initialTimer); clearInterval(interval); };
  }, []);

  const triggerNotification = () => {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const dest = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];

    setNotification(`${name} z ${city} ${action} ${dest}`);
    setVisible(true);

    // Schovat po 6 sekundách
    setTimeout(() => setVisible(false), 6000);
  };

  if (!visible || !notification) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-left duration-500">
        <div className="bg-slate-900/90 backdrop-blur border border-blue-500/30 p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm">
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {notification.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
                <p className="text-white text-sm font-medium">{notification}</p>
                <p className="text-slate-400 text-xs mt-0.5">před chvílí</p>
            </div>
            <button onClick={() => setVisible(false)} className="text-slate-500 hover:text-white ml-auto">✕</button>
        </div>
    </div>
  );
}