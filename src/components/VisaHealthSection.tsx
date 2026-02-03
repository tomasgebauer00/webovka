import React from 'react';
import { ShieldCheck, Syringe, FileText } from 'lucide-react';

export default function VisaHealthSection() {
  return (
    <section className="py-16 bg-black text-white border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-white/10 rounded-2xl p-8 md:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-bold mb-4">Visa & Health Checker</h2>
            <p className="text-gray-400">Zkontroluj si byrokracii dřív, než koupíš letenku. Vyber zemi a zjisti povinnosti.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto bg-gray-900/80 p-4 rounded-xl backdrop-blur-sm border border-gray-700">
            {/* OPRAVA: Místo 'selected' u option používáme 'defaultValue' u select */}
            <select className="flex-1 bg-transparent border-none text-white focus:ring-0 text-lg outline-none" defaultValue="">
              <option value="" disabled>Odkud jsi? (Česko)</option>
              <option value="cz">Česká republika</option>
            </select>
            
            <div className="w-px bg-gray-700 hidden md:block"></div>
            
            {/* OPRAVA: To samé tady */}
            <select className="flex-1 bg-transparent border-none text-white focus:ring-0 text-lg outline-none" defaultValue="">
              <option value="" disabled>Kam letíš?</option>
              <option value="th">Thajsko</option>
              <option value="vn">Vietnam</option>
              <option value="us">USA</option>
            </select>
            
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold transition-all">
              Zkontrolovat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center">
            <div className="p-4">
              <FileText className="w-10 h-10 mx-auto text-blue-400 mb-3" />
              <h3 className="font-semibold text-lg">Vízová povinnost</h3>
              <p className="text-sm text-gray-500 mt-1">Automaticky zjistíme, zda potřebuješ víza nebo stačí pas.</p>
            </div>
            <div className="p-4">
              <Syringe className="w-10 h-10 mx-auto text-green-400 mb-3" />
              <h3 className="font-semibold text-lg">Očkování</h3>
              <p className="text-sm text-gray-500 mt-1">Doporučená a povinná očkování pro danou destinaci.</p>
            </div>
            <div className="p-4">
              <ShieldCheck className="w-10 h-10 mx-auto text-yellow-400 mb-3" />
              <h3 className="font-semibold text-lg">Bezpečnost</h3>
              <p className="text-sm text-gray-500 mt-1">Aktuální varování a bezpečnostní situace.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}