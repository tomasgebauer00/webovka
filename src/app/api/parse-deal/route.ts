import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Chybí OPENAI API klíč." }, { status: 500 });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: `Jsi expertní asistent pro cestovní kancelář. Tvojí úlohou je extrahovat data z textu (např. z Airbnb nebo Bookingu) a vrátit POUZE čistý JSON bez markdownu.

Klíče musí být přesně tyto:
"destination" (název ubytování nebo destinace),
"country" (země, pokud chybí, odhadni ji podle destinace, pokud nevíš, dej "Neznámá"),
"hotel_price" (pouze číslo, odhad ceny celkem za ubytování pro zadané osoby/noci, pokud chybí, dej 0),
"description" (chytlavý prodejní popis pro web TripHack.cz, max 3 věty, česky),
"category" (pouze jedno z: "Evropa", "Exotika", "Česko", "Letenky", "Last Minute", vyber nejvhodnější podle lokace),
"activity_tags" (seznam 3-4 krátkých, chytlavých aktivit s emoji, které se k této lokaci a ubytování hodí, např. "🏝️ Potápění", "🏔️ Trekování", "🏛️ Historické památky", "🏄 Surfing", "🍸 Noční život", "🌿 Relax v přírodě").`
          },
          { role: 'user', content: text }
        ]
      })
    });

    const data = await response.json();
    let contentString = data.choices[0].message.content;
    
    // Odstranění markdownu, pokud ho AI náhodou přidala (např. ```json ... ```)
    contentString = contentString.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(contentString);
    
    // Kontrola, jestli AI vůbec něco našla
    if (!parsedData.destination || parsedData.destination === "Neznámá") {
        throw new Error("AI nenašla název ubytování v textu.");
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("AI Parse Error:", error);
    return NextResponse.json({ error: "Nepodařilo se najít data. Zkopíruj víc textu (hlavně název a cenu)." }, { status: 400 });
  }
}