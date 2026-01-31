import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// POZOR: OpenAI inicializujeme až uvnitř funkce, ne tady venku!

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. Tady si bezpečně načteme klíč
    // Pokud na serveru chybí, použijeme prázdný řetězec, aby to hned nespadlo
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("❌ CHYBA: Na Vercelu není nastaven OPENAI_API_KEY!");
      return NextResponse.json({ text: "Chyba serveru: Nemám klíč k AI." }, { status: 500 });
    }

    // 2. Inicializace OpenAI AŽ TADY UVNITŘ
    // Díky tomu to neshodí 'npm run build'
    const openai = new OpenAI({
      apiKey: apiKey,
    });

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
    console.error("Chyba OpenAI:", error);
    return NextResponse.json({ text: "Omlouvám se, něco se pokazilo. 🤖" }, { status: 500 });
  }
}