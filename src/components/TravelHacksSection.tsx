'use client';
import React, { useState } from 'react';
import { TrendingUp, Plane, Wifi, CreditCard, X, Map } from 'lucide-react';

// === SKUTEČNÁ DATA ===
const HACKS = [
  {
    icon: <Wifi size={32} />,
    title: "Data & eSIM zdarma",
    short: "Přestaň platit roaming. Jak získat data za pár korun?",
    full: `
      1. Zapomeň na roaming od českého operátora, je to krádež.
      2. Stáhni si aplikaci **Airalo** nebo **MobiMatter**.
      3. Kup si eSIM pro danou zemi (např. 10GB ve Vietnamu stojí cca 200 Kč).
      4. TIP: Pokud máš Revolut Premium, máš eSIM zdarma!
      5. TIP 2: V aplikaci 'Airalo' použij kód 'TRIPHACK3' pro slevu 3 $.
    `
  },
  {
    icon: <Plane size={32} />,
    title: "Skiplagging (Hidden City)",
    short: "Jak ušetřit 50 % na letence tím, že nedoletíš do cíle.",
    full: `
      Tohle je kontroverzní, ale funguje to.
      
      **Příklad:** Chceš letět z Prahy do New Yorku. Přímá letenka stojí 15 000 Kč.
      Ale letenka Praha -> New York -> Toronto stojí jen 8 000 Kč.
      
      **Co uděláš?** Koupíš let do Toronta, v New Yorku vystoupíš a na poslední úsek nenastoupíš.
      
      ⚠️ **Pravidla:**
      1. Musíš mít JEN příruční zavazadlo (velký kufr by letěl až do Toronta).
      2. Nesmíš uvést své věrnostní číslo aerolinky (mohli by ti smazat míle).
      3. Hledej na webu **Skiplagged.com**.
    `
  },
  {
    icon: <CreditCard size={32} />,
    title: "Revolut vs. Banky",
    short: "Proč ti tvá banka krade peníze na kurzu a jak to obejít.",
    full: `
      Když platíš českou kartou (ČS, KB, AirBank...) v zahraničí, banka ti dá kurz "Deviza prodej". 
      Ten je často o 2-4 % horší než reálný středový kurz.
      
      **Řešení:**
      1. Založ si **Revolut** nebo **Wise**.
      2. Nabij si tam české koruny.
      3. V aplikaci si směň peníze na dolary/eura/bahty ve všední dny (o víkendu je přirážka 1 %).
      4. Plať kartou Revolut. Ušetříš cca 500 Kč na každých 10 000 Kč útraty.
    `
  },
  {
    icon: <Map size={32} />,
    title: "Offline Mapy & VPN",
    short: "Jak se neztratit a jak se dostat na Netflix v Číně.",
    full: `
      **Mapy.cz** jsou nejlepší na turistiku, **Google Maps** na město.
      Ale co když nemáš data?
      👉 Stáhni si "Offline Areas" v Google Maps ještě doma na Wi-Fi.
      
      **VPN (Virtuální privátní síť):**
      Pokud jedeš do Číny, Íránu nebo Ruska, nepůjde ti Instagram, WhatsApp ani Google.
      Musíš si stáhnout VPN **před odletem**.
      Doporučujeme: **NordVPN** nebo **Surfshark**.
      Zároveň VPN využiješ pro levnější nákup letenek (změň si polohu na chudší zemi, např. Indii, a ceny letenek často klesnou).
    `
  },
];

export default function TravelHacksSection() {
  const [activeHack, setActiveHack] = useState<number | null>(null);

  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Travel Hacks & Tipy 🧠</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HACKS.map((hack, index) => (
            <div 
              key={index} 
              onClick={() => setActiveHack(index)}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:bg-gray-750 hover:border-blue-500 transition-all cursor-pointer group h-full flex flex-col"
            >
              <div className="w-14 h-14 bg-blue-600/20 text-blue-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                {hack.icon}
              </div>
              <h3 className="font-bold text-xl mb-2">{hack.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow">{hack.short}</p>
              <span className="text-blue-400 text-sm font-bold mt-auto group-hover:underline">Číst celé &rarr;</span>
            </div>
          ))}
        </div>
      </div>

      {/* === MODAL (VYSKAKOVACÍ OKNO) === */}
      {activeHack !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setActiveHack(null)}>
          <div 
            className="bg-gray-900 border border-blue-500/30 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Aby se to nezavřelo při kliknutí dovnitř
          >
            <button 
              onClick={() => setActiveHack(null)}
              className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 p-2 rounded-full text-white transition"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
                  {HACKS[activeHack].icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">{HACKS[activeHack].title}</h3>
              </div>
              
              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-line">
                {HACKS[activeHack].full}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
                <button 
                  onClick={() => setActiveHack(null)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition"
                >
                  Rozumím 👍
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}