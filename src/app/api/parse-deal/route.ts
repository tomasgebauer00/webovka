import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    // Použijeme stejný klíč, který už používá tvůj AI Chatbot
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Chybí OPENAI_API_KEY." }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Můžeš změnit na gpt-4o, pokud máš přístup
        response_format: { type: "json_object" }, // TÍMTO HO NUTÍME VRÁTIT JEN DATA, NE OMÁČKU
        messages: [
          { 
            role: 'system', 
            content: `Jsi expertní asistent pro cestovní kancelář. Uživatel ti pošle neuspořádaný text zkopírovaný z Airbnb nebo Bookingu (Ctrl+A, Ctrl+C). 
            Tvým úkolem je extrahovat informace a vrátit POUZE JSON objekt s těmito přesnými klíči:
            - "destination": Název ubytování nebo hlavní lokalita (např. "Villa Bali", "Apartmán v Římě").
            - "country": Země nebo region (např. "Indonésie", "Itálie").
            - "hotel_price": Odhadovaná celková cena ubytování (pouze číslo).
            - "description": Napiš velmi chytlavý, prodejní popisek (cca 3 věty), proč je toto místo super.
            - "category": Zařaď to do jedné z těchto kategorií (přesně tyto názvy): "Evropa", "Exotika", "Česko", nebo "Last Minute".
            Nevracej žádný jiný text kromě JSONu.` 
          },
          { role: 'user', content: text }
        ]
      })
    });

    const data = await response.json();
    
    // AI nám vrátí JSON string uvnitř zprávy, musíme ho rozbalit
    const parsedData = JSON.parse(data.choices[0].message.content);
    
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Chyba parsování AI:", error);
    return NextResponse.json({ error: "Nepodařilo se zpracovat text." }, { status: 500 });
  }
}