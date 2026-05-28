import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "en";

  // 1. načti data z DB pro konkrétní jazyk
  const rows = await prisma.dailyContent.findMany({
    where: { language: lang },
  });

  // 2. převedeme na mapu podle levelu
  const levels = Object.fromEntries(
    LEVELS.map((level) => {
      const row = rows.find((r) => r.level === level);
      return [level, row ?? null];
    })
  );

  return NextResponse.json({
    lang,
    date: new Date().toISOString().split("T")[0],
    levels,
  });
}