import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. BEZPEČNOSTNÍ POJISTKA:
// Tímto říkáme serveru: "Klíč tam je, a kdyby nebyl, použij prázdný řetězec, hlavně nepaddej."
const apiKey = process.env.OPENAI_API_KEY || '';

const openai = new OpenAI({
  apiKey: apiKey,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 2. KONTROLA UVNITŘ FUNKCE:
    if (!apiKey) {
      return NextResponse.json({ text: "Chyba serveru: Chybí API klíč." }, { status: 500 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Jsi TripBot, AI asistent webu TripHack.cz. Tykáš, jsi stručný a vtipný.",
        },
        { role: "user", content: message },
      ],
    });

    return NextResponse.json({ text: completion.choices[0].message.content });

  } catch (error: any) {
    return NextResponse.json({ text: "Omlouvám se, výpadek spojení. 🤖" }, { status: 500 });
  }
}