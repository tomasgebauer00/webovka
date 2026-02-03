import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openAiKey = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  try {
    const { origin, destination } = await req.json();

    if (!openAiKey) return NextResponse.json({ error: "Chybí OpenAI klíč" }, { status: 500 });

    const openai = new OpenAI({ apiKey: openAiKey });

    const prompt = `
      Jsem cestovatel z: ${origin}
      Cestuji do: ${destination}
      
      Vrať mi JSON objekt (ne text, pouze JSON) s těmito klíči:
      {
        "visaStatus": "Visa Free" nebo "Visa Required" nebo "E-Visa" nebo "Visa on Arrival",
        "visaDetails": "Stručný popis (max 2 věty) o vízové povinnosti, ceně nebo kde žádat.",
        "health": "Seznam povinných a doporučených očkování. Zmiň rizika jako malárie nebo dengue.",
        "safety": "Bezpečnostní situace (1-10, kde 10 je bezpečné) a na co si dát pozor.",
        "currency": "Místní měna a kurz k CZK nebo USD."
      }
      Odpovídej česky.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // nebo gpt-3.5-turbo
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" } // Důležité: Vynutí JSON
    });

    const data = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(data);

  } catch (error) {
    console.error("Visa API Error:", error);
    return NextResponse.json({ error: "Nepodařilo se zjistit informace." }, { status: 500 });
  }
}