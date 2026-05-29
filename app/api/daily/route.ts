import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LEVELS = ["A0","A1","A2","B1","B2","C1","C2"] as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "en";

  const rows = await prisma.dailycontent.findMany({
    where: { language: lang },
  });

  const levels = Object.fromEntries(
    LEVELS.map((level) => {
      const row = rows.find(r => r.level === level);

      if (!row) return [level, null];

      return [level, row];
    })
  );

  return NextResponse.json({
    lang,
    date: new Date().toISOString().split("T")[0],
    levels,
  });
}