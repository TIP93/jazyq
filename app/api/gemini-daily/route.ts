import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { language, level } = await req.json();

    if (!language || !level) {
      return Response.json(
        { error: "Missing language or level" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const today = new Date().toISOString().split("T")[0];

    // 1) CHECK: už existuje dnešní záznam?
    const { data: existing, error: selectError } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("language", language)
      .eq("level", level)
      .eq("contentDate", today)
      .maybeSingle();

    if (selectError) {
      return Response.json(
        { error: "DB select failed", details: selectError },
        { status: 500 }
      );
    }

    if (existing) {
      return Response.json({
        success: true,
        cached: true,
        data: existing,
      });
    }

    // 2) Načti poslední slova (anti-duplicate memory)
    const { data: used } = await supabase
      .from("vocabulary")
      .select("wordForeign")
      .eq("language", language)
      .eq("level", level)
      .order("contentDate", { ascending: false })
      .limit(200);

    const usedWords = used?.map((w) => w.wordForeign) ?? [];

    // 3) MODEL
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    // 4) SYSTEM PROMPT (STRICT JSON)
    const prompt = `
You are a strict JSON generator for a language learning app.

Return ONLY valid JSON. No markdown. No explanation. No extra text.

Task:
Generate ONE vocabulary word.

Language: ${language}
CEFR level: ${level}

Rules:
- Must be a SINGLE word only
- Allowed types: noun, verb, adjective
- Must match CEFR level
- No proper nouns
- Must NOT repeat any word in the list below

Previously used words:
${usedWords.length ? usedWords.join(", ") : "none"}

Return format exactly:
{
  "wordForeign": "string",
  "wordType": "noun | verb | adjective"
}
`;

    // 5) CALL GEMINI
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 6) SAFE JSON PARSING
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      return Response.json(
        { error: "No JSON found", raw: text },
        { status: 500 }
      );
    }

    const cleaned = text.slice(jsonStart, jsonEnd + 1);

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      return Response.json(
        {
          error: "Invalid JSON from model",
          raw: text,
        },
        { status: 500 }
      );
    }

    if (!parsed.wordForeign) {
      return Response.json(
        {
          error: "Missing wordForeign",
          raw: parsed,
        },
        { status: 500 }
      );
    }

    // 7) INSERT DO SUPABASE
    const { data: inserted, error: insertError } = await supabase
      .from("vocabulary")
      .insert({
        language,
        level,
        wordForeign: parsed.wordForeign,
        wordType: parsed.wordType,
        contentDate: today,
      })
      .select()
      .single();

    if (insertError) {
      return Response.json(
        {
          error: "DB insert failed",
          details: insertError,
        },
        { status: 500 }
      );
    }

    // 8) RESPONSE
    return Response.json({
      success: true,
      cached: false,
      data: inserted,
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