import { NextResponse } from "next/server";

const buildLevel = (level: string) => ({
  word: {
    foreign: level === "A0" ? "Apple" : "Journey",
    czech: level === "A0" ? "jablko" : "cesta",
  },
  wordExample: "The journey across the mountains took three days.",
  wordExampleTranslation: "Cesta přes hory trvala tři dny.",
  translation: {
    cz: "Moje sestra má malého bílého psa.",
    answer: "My sister has a small white dog.",
  },
  grammar: {
    explanation: "Placeholder grammar explanation",
    example: "Example sentence",
    exampleCz: "Příklad",
  },
  reading: "Example reading text in English...",
  readingCz: "Ukázkový text v češtině..."
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "en";

  const levels = ["A0","A1","A2","B1","B2","C1","C2"];

  const data = Object.fromEntries(
    levels.map((lvl) => [lvl, buildLevel(lvl)])
  );

  return NextResponse.json({
    lang,
    date: new Date().toISOString().split("T")[0],
    levels: data
  });
}