// Soubor: src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// 1. PŘIPOJENÍ K SUPABASE
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

    // 2. STÁHNUTÍ DAT Z DATABÁZE
    const { data: deals, error } = await supabase
      .from('deals')
      .select('id, destination, country, total_price, currency, description, category')
      .order('id', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Supabase Error:", error);
    }

    // 3. VYTVOŘENÍ TAHÁKU PRO AI
    let dealsContext = "Aktuálně nemáme žádné konkrétní nabídky v databázi. Odkazuj obecně na web.";

    if (deals && deals.length > 0) {
      dealsContext = deals.map((d: any) => {
        const city = d.destination || "Neznámá destinace";
        const country = d.country || "";
        const price = d.total_price ? `${d.total_price} ${d.currency || 'Kč'}` : "Cena na vyžádání";
        const desc = d.description || "Skvělý zájezd.";
        const link = `https://triphack.cz/deal/${d.id}`; 
        
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

    // 4. INSTRUKCE PRO MOZEK BOTA
    const openai = new OpenAI({ apiKey: apiKey });

    const systemPrompt = `
      Jsi TripBot, AI prodejce na webu TripHack.cz.
      Tvým úkolem je prodávat naše zájezdy.

      TADY JSOU NAŠE AKTUÁLNÍ NABÍDKY Z DATABÁZE (ŽIVÁ DATA):
      ${dealsContext}

      PRAVIDLA:
      1. Pokud se uživatel zeptá na destinaci, kterou máme v seznamu, MUSÍŠ mu poslat Cenu, Popis a HLAVNĚ ODKAZ.
      2. Pokud nabídku nemáme, omluv se a nabídni jinou podobnou ze seznamu.
      3. Buď stručný, používej emoji ✈️ a buď nadšený.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // nebo gpt-3.5-turbo, pokud nemáš přístup k 4o
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