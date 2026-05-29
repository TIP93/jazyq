import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LEVELS = ["A0","A1","A2","B1","B2","C1","C2"] as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "en";

  // dnes od 00:00
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // zítra 00:00
  const endOfDay = new Date();
  endOfDay.setHours(24, 0, 0, 0);

  const rows = await prisma.dailycontent.findMany({
    where: {
      language: lang,
      contentDate: {
        gte: startOfDay,
        lt: endOfDay,
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
    date: new Date().toISOString().split("T")[0],
    levels,
  });
}