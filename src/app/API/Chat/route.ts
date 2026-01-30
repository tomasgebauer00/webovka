import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializace OpenAI s tvým klíčem
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Přečteme zprávu, kterou poslal uživatel z webu
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ text: "Napsal jsi prázdnou zprávu." }, { status: 400 });
    }

    // Tady voláme skutečnou AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Používáme rychlý a levný model (nebo gpt-3.5-turbo)
      messages: [
        {
          role: "system",
          content: `Jsi TripBot, AI asistent pro cestovní portál TripHack.cz.
          
          Tvoje instrukce:
          1. Jsi vtipný, přátelský a tykáš. Používej emoji (✈️, 🏝️, 🔥).
          2. Tvým cílem je poradit s výběrem dovolené nebo letenky.
          3. Když se někdo zeptá "Kam letět?", doporuč konkrétní destinace (Bali, Thajsko, Řecko) a zmiň, že na webu máme super ceny.
          4. Odpovídej stručně (max 3 věty), ať se to v chatu dobře čte.
          5. Pokud se zeptají na kontakt, odkaž je na info@triphack.cz.
          
          Nikdy nedoporučuj konkurenční weby. Jsi loajální pouze TripHacku.`
        },
        { role: "user", content: message },
      ],
      max_tokens: 150, // Omezíme délku odpovědi, ať neplatíš moc
    });

    // Získáme odpověď AI
    const reply = completion.choices[0].message.content;

    // Pošleme ji zpátky na web
    return NextResponse.json({ text: reply });

  } catch (error: any) {
    console.error('OpenAI Error:', error);
    return NextResponse.json(
      { text: "Omlouvám se, došel mi signál 📡. Zkus to prosím za chvilku." }, 
      { status: 500 }
    );
  }
}