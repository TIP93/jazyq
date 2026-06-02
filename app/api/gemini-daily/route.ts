import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    const today = new Date().toISOString().split("T")[0];

   const languages = ["en"];
   // const languages = ["en", "cs", "it", "es", "de", "fr", "pt", "ru", "jp", "cn"];
    const levels = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1) CHECK if already generated today
    const { data: existing, error: checkError } = await supabase
      .from("dailycontent")
      .select("id")
      .eq("contentDate", today)
      .limit(1);

    if (checkError) {
      return Response.json(
        { error: "DB check failed", details: checkError },
        { status: 500 }
      );
    }

    if (existing && existing.length > 0 && !force) {
      return Response.json({
        success: true,
        cached: true,
        message: "Already generated for today",
      });
    }

    // 2) MODEL
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    // 2) POSLEDNÍ SLOVA (ANTI-REPEAT)

const { data: usedWordsRows, error: usedWordsError } = await supabase
  .from("dailycontent")
  .select("language, level, wordForeign")
  .in("language", languages)
  .order("contentDate", { ascending: false })
  .limit(420);

if (usedWordsError) {
  return Response.json(
    {
      error: "Failed loading previous words",
      details: usedWordsError,
    },
    { status: 500 }
  );
}

const usedWords =
  usedWordsRows?.map(
    (row) => `${row.level}: ${row.wordForeign}`
  ) ?? [];

    // 3) SINGLE BATCH PROMPT (70 items)
   const prompt = `
You are a structured language learning generator.

Generate vocabulary for ALL combinations of:

Languages:
${languages.join(", ")}

Levels:
${levels.join(", ")}

Generate EXACTLY one item for each level:
A0, A1, A2, B1, B2, C1, C2.

Return exactly 7 objects.

Rules:
- each item must contain:
  - language
  - level
  - wordForeign
  - wordNative (Czech translation)

- word must be noun, verb, or adjective
- CEFR appropriate difficulty
- no proper nouns
- no duplicates across dataset
- keep outputs short and clean

IMPORTANT:
Do NOT generate any word that appears in the previously used words list.

Previously used words:
${usedWords.join("\n")}

Return ONLY valid JSON array (no markdown, no explanation):

[
  {
    "language": "en",
    "level": "A1",
    "wordForeign": "run",
    "wordNative": "běžet"
  }
]
`;

    // 4) GEMINI CALL
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 5) SAFE JSON PARSE
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");

    if (jsonStart === -1 || jsonEnd === -1) {
      return Response.json(
        {
          error: "No JSON array found",
          raw: text,
        },
        { status: 500 }
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    } catch (err) {
      return Response.json(
        {
          error: "Invalid JSON from model",
          raw: text,
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed)) {
      return Response.json(
        {
          error: "Expected array from model",
        },
        { status: 500 }
      );
    }

    if (parsed.length !== 7) {
  return Response.json(
    {
      error: "Expected exactly 7 items",
      count: parsed.length,
    },
    { status: 500 }
  );
}

const generatedLevels = parsed.map((i) => i.level);

const missingLevels = levels.filter(
  (level) => !generatedLevels.includes(level)
);

if (missingLevels.length > 0) {
  return Response.json(
    {
      error: "Missing levels",
      missingLevels,
    },
    { status: 500 }
  );
}

const words = parsed.map((i) =>
  i.wordForeign.toLowerCase().trim()
);

const uniqueWords = new Set(words);

if (uniqueWords.size !== words.length) {
  return Response.json(
    {
      error: "Duplicate words generated",
    },
    { status: 500 }
  );
}

    // 6) INSERT BULK
    const rows = parsed.map((item) => ({
      language: item.language,
      level: item.level,
      wordForeign: item.wordForeign,
      wordNative: item.wordNative,
      contentDate: today,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("dailycontent")
      .insert(rows)
      .select();

    if (insertError) {
      return Response.json(
        {
          error: "DB bulk insert failed",
          details: insertError,
        },
        { status: 500 }
      );
    }

    // 7) RESPONSE
    return Response.json({
      success: true,
      cached: false,
      inserted: inserted?.length ?? 0,
    });

  } catch (err: any) {
    return Response.json(
      {
        error: "Server error",
        details: err?.message ?? err,
      },
      { status: 500 }
    );
  }
}