import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// 1. PŘIPOJENÍ K SUPABASE ⚡
// (Používáme tvé existující proměnné z .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    // Kontrola klíčů
    if (!apiKey) return NextResponse.json({ text: "Chyba: Chybí OpenAI klíč." }, { status: 500 });
    if (!supabaseUrl || !supabaseKey) return NextResponse.json({ text: "Chyba: Chybí Supabase klíče." }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. STÁHNUTÍ DAT Z DATABÁZE 🗄️
    // Stahujeme přesně ty sloupce, které máš na screenshotu
    const { data: deals, error } = await supabase
      .from('deals')
      .select('id, destination, country, total_price, currency, description, category')
      .order('id', { ascending: false }) // Nejdřív nejnovější
      .limit(10); // Vezmeme 10 nejnovějších

    if (error) {
      console.error("Supabase Error:", error);
    }

    // 3. VYTVOŘENÍ TAHÁKU PRO AI 📝
    let dealsContext = "Aktuálně nemáme žádné konkrétní nabídky v databázi. Odkazuj obecně na web.";

    if (deals && deals.length > 0) {
      dealsContext = deals.map((d: any) => {
        // Tady mapujeme TVOJE sloupce na text pro AI
        const city = d.destination || "Neznámá destinace";
        const country = d.country || "";
        const price = d.total_price ? `${d.total_price} ${d.currency || 'Kč'}` : "Cena na vyžádání";
        const desc = d.description || "Skvělý zájezd.";
        const link = `https://triphack.cz/deal/${d.id}`; // Tady se tvoří ten odkaz!
        
        return `
        --- NABÍDKA ---
        Destinace: ${city} (${country})
        Cena: ${price}
        Info: ${desc}
        Kategorie: ${d.category || 'Obecné'}
        ODKAZ PRO REZERVACI: ${link}
        ---------------
        `;
      }).join('\n');
    }

    // 4. INSTRUKCE PRO MOZEK BOTA 🧠
    const openai = new OpenAI({ apiKey: apiKey });

    const systemPrompt = `
      Jsi TripBot, AI prodejce na webu TripHack.cz.
      Tvým úkolem je prodávat naše zájezdy.

      TADY JSOU NAŠE AKTUÁLNÍ NABÍDKY Z DATABÁZE (ŽIVÁ DATA):
      ${dealsContext}

      PRAVIDLA:
      1. Pokud se uživatel zeptá na destinaci, kterou máme v seznamu (např. Tokio), MUSÍŠ mu poslat:
         - Cenu (např. 40 000 Kč)
         - Stručný popis
         - A HLAVNĚ ODKAZ (např. https://triphack.cz/deal/8).
      
      2. Příklad odpovědi:
         "Do Tokia máme zrovna akci Neon Nights! 🇯🇵 Cena je 40 000 Kč a je to včetně hotelu. Mrkni a rezervuj tady: https://triphack.cz/deal/8"

      3. Pokud nabídku nemáme (uživatel chce třeba Austrálii a my ji nemáme), omluv se a nabídni jinou destinaci ze seznamu, která je podobná (např. "Austrálii nemáme, ale co takhle Bali za 15 000 Kč?").
      
      4. Buď stručný, používej emoji ✈️ a buď nadšený.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    return NextResponse.json({ text: completion.choices[0].message.content });

  } catch (error: any) {
    console.error("Chyba:", error);
    return NextResponse.json({ text: "Promiň, něco se pokazilo v komunikaci. Zkus to za chvilku. 🤖" }, { status: 500 });
  }
}