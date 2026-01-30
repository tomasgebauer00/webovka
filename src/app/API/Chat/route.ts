import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📨 Zpráva od uživatele:", body.message);

    // Kontrola, jestli server vidí klíč
    if (!process.env.OPENAI_API_KEY) {
        console.error("❌ KRITICKÁ CHYBA: Server nevidí API klíč!");
        return NextResponse.json({ text: "Chyba: Chybí API klíč na serveru." }, { status: 500 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Jsi TripBot." }, // Jednoduchý systém pro test
        { role: "user", content: body.message },
      ],
    });

    console.log("✅ ÚSPĚCH! Odpověď:", completion.choices[0].message.content);
    return NextResponse.json({ text: completion.choices[0].message.content });

  } catch (error: any) {
    // TADY SE UKÁŽE SKUTEČNÝ DŮVOD
    console.error("❌❌❌ CHYBA OPENAI:", error);
    
    let msg = "Neznámá chyba.";
    if (error.status === 401) msg = "Špatný API klíč (zkontroluj .env.local).";
    if (error.status === 429) msg = "Došel kredit nebo OpenAI ještě nezpracovalo platbu (počkej 5 min).";
    if (error.status === 404) msg = "Model gpt-4o-mini neexistuje nebo k němu nemáš přístup.";

    return NextResponse.json({ text: `Chyba: ${msg}` }, { status: 500 });
  }
}