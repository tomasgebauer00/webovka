// Soubor: src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Načtení klíčů
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openAiKey = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. Kontrola klíčů
    if (!openAiKey) return NextResponse.json({ text: "Chyba: Chybí API klíč k OpenAI." }, { status: 500 });
    if (!supabaseUrl || !supabaseKey) return NextResponse.json({ text: "Chyba: Chybí Supabase klíče." }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Stáhneme aktuální zájezdy z databáze (aby bot věděl, co prodává)
    const { data: deals, error } = await supabase
      .from('deals')
      .select('id, destination, country, total_price, description')
      .order('created_at', { ascending: false })
      .limit(5);

    // 3. Vytvoříme kontext pro AI
    let contextData = "Momentálně nemáme v databázi žádné konkrétní zájezdy, ale zkus poradit obecně.";
    if (deals && deals.length > 0) {
      contextData = deals.map((d: any) => 
        `- Destinace: ${d.destination} (${d.country}), Cena: ${d.total_price} Kč. Popis: ${d.description}. Odkaz: https://triphack.cz/deal/${d.id}`
      ).join('\n');
    }

    // 4. Nastavíme osobnost bota
    const openai = new OpenAI({ apiKey: openAiKey });
    
    const systemPrompt = `
      Jsi TripBot, AI asistent na webu TripHack.cz.
      Tvým cílem je pomoci lidem najít dovolenou a prodat jim naše zájezdy.
      
      TADY JSOU AKTUÁLNÍ NABÍDKY, KTERÉ MÁME SKLADEM:
      ${contextData}

      PRAVIDLA:
      1. Když se někdo zeptá na něco, co máme, pošli mu detaily a HLAVNĚ ODKAZ.
      2. Odpovídej stručně, přátelsky a používej emoji ✈️🌴.
      3. Pokud nabídku nemáme, omluv se a navrhni alternativu ze seznamu.
    `;

    // 5. Zavoláme OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // nebo "gpt-3.5-turbo"
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    return NextResponse.json({ text: completion.choices[0].message.content });

  } catch (error: any) {
    console.error("Chyba v API:", error);
    return NextResponse.json({ text: "Promiň, vypadl mi signál. Zkus to za chvilku! 🤖" }, { status: 500 });
  }
}