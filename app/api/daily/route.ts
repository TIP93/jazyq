import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LEVELS = ["A0","A1","A2","B1","B2","C1","C2"] as const;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "en";

    // 🔥 KLÍČ: normalizace na DATE bez času
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 🔥 RANGE QUERY (správný způsob pro DateTime/Date v DB)
    const rows = await prisma.dailycontent.findMany({
      where: {
        language: lang,
        contentDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const levels = Object.fromEntries(
      LEVELS.map((level) => {
        const row = rows.find(r => r.level === level);
        return [level, row ?? null];
      })
    );

    return NextResponse.json({
      lang,
      date: today.toISOString().split("T")[0],
      levels,
    });

  } catch (err) {
    console.error("DAILY API ERROR:", err);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}