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
            content: `Jsi expertní asistent. Extrahuješ data z textu (Airbnb/Booking) a vracíš POUZE čistý JSON bez markdownu (\`\`\`).
            Klíče musí být přesně tyto:
            "destination" (název ubytování),
            "country" (země, pokud chybí dej "Neznámá"),
            "hotel_price" (pouze číslo, odhad ceny celkem, pokud chybí dej 0),
            "description" (chytlavý prodejní text, max 3 věty),
            "category" (pouze jedno z: "Evropa", "Exotika", "Česko", "Last Minute").`
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