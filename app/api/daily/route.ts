import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "en";
  const level = searchParams.get("level") || "B1";

  return NextResponse.json({
    lang,
    level,
    date: new Date().toISOString().split("T")[0],
    word: {
      foreign: "Journey",
      czech: "cesta",
    },
    wordExample: "The journey across the mountains took three days.",
    wordExampleTranslation: "Cesta přes hory trvala tři dny.",
    translation: {
      cz: "Moje sestra má malého bílého psa.",
      answer: "My sister has a small white dog."
    },
    grammar: {
      explanation: "Používáme present perfect pro minulost s dopadem do přítomnosti.",
      example: "I have seen this movie before.",
      exampleCz: "Už jsem ten film viděl."
    },
    reading: "Example reading text in English...",
    readingCz: "Ukázkový text v češtině..."
  });
}