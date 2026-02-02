import React from 'react';
import { TrendingUp, Plane, Wifi, CreditCard } from 'lucide-react';

const hacks = [
  { icon: <Wifi />, title: "Data & eSIM", desc: "Proč už nekupovat fyzické SIMkarty a jak ušetřit s Airalo." },
  { icon: <CreditCard />, title: "Revolut vs Banky", desc: "Jak neplatit šílené poplatky za směnu měn v zahraničí." },
  { icon: <Plane />, title: "Levné letenky", desc: "Triky s VPN a anonymním oknem, které aerolinky tají." },
  { icon: <TrendingUp />, title: "Travel Hacking", desc: "Jak sbírat míle a létat business class za cenu economy." },
];

export default function TravelHacksSection() {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Travel Hacks & Tipy</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hacks.map((hack, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:bg-gray-750 transition-colors">
              <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center mb-4">
                {hack.icon}
              </div>
              <h3 className="font-bold text-xl mb-2">{hack.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{hack.desc}</p>
              <a href="#" className="inline-block mt-4 text-blue-400 text-sm font-medium hover:underline">Číst více &rarr;</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}