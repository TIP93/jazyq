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

    const test = await supabase
  .from("dailycontent")
  .select("*")
  .limit(1);

console.log("TEST:", test);

console.log("KEY START:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10));

    // 1) CHECK: existuje dnešní content?
    const { data: existing, error: selectError } = await supabase
      .from("dailycontent")
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

    // 2) poslední slova (anti-repeat)
    const { data: used } = await supabase
      .from("dailycontent")
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

    // 4) PROMPT (jen word + translation zatím)
    const prompt = `
You are a language learning generator.

Return ONLY valid JSON.

Task:
Generate ONE vocabulary item.

Language: ${language}
Level: ${level}

Rules:
- single word only
- noun, verb, or adjective
- CEFR appropriate
- no proper nouns
- must not repeat previous words

Previously used words:
${usedWords.length ? usedWords.join(", ") : "none"}

Return format:
{
  "wordForeign": "string",
  "wordNative": "string (Czech translation)"
}
`;

    // 5) GEMINI CALL
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 6) SAFE JSON PARSE
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      return Response.json(
        { error: "No JSON found", raw: text },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    if (!parsed.wordForeign || !parsed.wordNative) {
      return Response.json(
        {
          error: "Invalid AI output",
          raw: parsed,
        },
        { status: 500 }
      );
    }

    // 7) INSERT DO dailycontent
    const { data: inserted, error: insertError } = await supabase
      .from("dailycontent")
      .insert({
        language,
        level,
        contentDate: today,
        wordForeign: parsed.wordForeign,
        wordNative: parsed.wordNative,
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