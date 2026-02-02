import React from 'react';
import { User, MapPin, Calendar } from 'lucide-react'; // Ujisti se, že máš lucide-react, jinak použij jiné ikony

const buddies = [
  { id: 1, name: "Petr", age: 26, dest: "Thajsko", date: "Listopad 2026", tag: "Low-cost", img: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Jana", age: 24, dest: "Bali", date: "Září 2026", tag: "Digital Nomad", img: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "David", age: 30, dest: "Japonsko", date: "Jaro 2027", tag: "Hiking", img: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Eva", age: 22, dest: "Vietnam", date: "Prosinec 2026", tag: "Foodie", img: "https://i.pravatar.cc/150?u=4" },
];

export default function BuddySection() {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Najdi parťáka na cesty
            </h2>
            <p className="text-gray-400 mt-2">Nechceš cestovat sám? Připoj se k někomu.</p>
          </div>
          <button className="text-sm font-semibold text-purple-400 hover:text-purple-300">Zobrazit všechny &rarr;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {buddies.map((buddy) => (
            <div key={buddy.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition-all cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <img src={buddy.img} alt={buddy.name} className="w-12 h-12 rounded-full border-2 border-purple-500" />
                <div>
                  <h3 className="font-bold text-lg">{buddy.name}, {buddy.age}</h3>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{buddy.tag}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-purple-500" />
                  <span>{buddy.dest}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-purple-500" />
                  <span>{buddy.date}</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 rounded-lg bg-gray-700 group-hover:bg-purple-600 transition-colors text-white font-medium">
                Napsat zprávu
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}