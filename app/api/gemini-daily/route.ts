import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { callWithRetry } from "@/app/api/gemini-daily/retry";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    const today = new Date().toISOString().split("T")[0];

   const languages = ["en", "it"];
   // const languages = ["en", "cs", "it", "es", "de", "fr", "pt", "ru", "jp", "cn"];
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

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

  const { data: usedGrammarRows, error: usedGrammarError } = await supabase
  .from("dailycontent")
  .select(`
    level,
    grammarFamily,
    grammarPattern,
    grammarContext,
    contentDate
  `)
  .order("contentDate", { ascending: false })
  .limit(360);

if (usedGrammarError) {
  return Response.json(
    {
      error: "Failed loading previous grammar",
      details: usedGrammarError,
    },
    { status: 500 }
  );
}

const recentFamilies =
  usedGrammarRows
    ?.map(r => r.grammarFamily)
    .filter((v): v is string => Boolean(v))
    .map(v => v.trim())
    .slice(0, 20)
  ?? [];
const recentPatterns =
  usedGrammarRows
    ?.map(r => r.grammarPattern)
    .filter(Boolean)
    .slice(0, 20)
  ?? [];
const recentContexts =
  usedGrammarRows
    ?.map(r => r.grammarContext)
    .filter(Boolean)
    .slice(0, 20)
  ?? [];
 
    // 3) SINGLE BATCH PROMPT (70 items)
   const prompt = `
You are a structured language learning generator.

Generate exactly 6 learning units, one per CEFR level:
A1, A2, B1, B2, C1, C2.

Languages:
${languages.join(", ")}

Previously used words (must not repeat):
${usedWords.join("\n")}

Recently used grammar families:
${recentFamilies.join("\n")}

Recently used grammar patterns:
${recentPatterns.join("\n")}

Recently used grammar contexts:
${recentContexts.join("\n")}

Each item must contain:

language, level,
wordForeign, wordNative,
wordExampleForeign, wordExampleNative,
grammarFamily, grammarPattern, grammarContext,
grammarExplanation,
grammarExample,
grammarTranslationOrig,
grammarTranslationCz

Vocabulary rules:
noun, verb, or adjective only
CEFR appropriate:
A1: basic concrete words
A2–B1: daily life vocabulary
B2–C1: more abstract/less frequent
no proper nouns
no duplicates across dataset
avoid overused beginner words unless necessary for A1
max one semantic category per batch
Sentence rules:
wordExampleForeign must naturally include wordForeign
must match CEFR level difficulty
A1–A2: 8–12 words
B1–C1: 10–15 words
Grammar system:
grammarFamily = broad category
grammarPattern = MUST be exactly ONE atomic rule (e.g. Present Perfect with already)
grammarPattern must NOT resemble a textbook section title.
grammarContext = situation (travel, work, etc.)


Atomic rule = single grammatical decision:
- one form choice OR
- one usage condition OR
- one transformation rule

Forbidden in grammarPattern:
- lists of rules (e.g. un, una, uno, un')
- category names
- combined rules
- explanations or summaries

If grammarPattern contains more than one rule → regenerate.

Do not repeat grammarFamily (3–5 days) or grammarPattern (10–14 days).
Prefer least recently used grammar options.

grammarExample must clearly demonstrate grammarPattern (5–12 words).

grammarExplanation:
short grammar reminder in Czech
max 20 words
simple, practical usage hint

Translation rules:

grammarTranslationOrig:

English sentence preserving grammarPattern
may change vocabulary/context but NOT structure type

grammarTranslationCz:

direct natural Czech translation of grammarTranslationOrig
must preserve meaning exactly

grammarTranslationCz must NOT be generated independently.

Hard constraint:

wordExampleForeign and grammarExample are independent systems:

vocabulary sentence ≠ grammar sentence

Reading section:

Each item must also contain:

readingForeign
readingNative

Reading rules:

- readingForeign must be written in the target language
- readingForeign must naturally include wordForeign
- readingForeign must clearly contain and demonstrate grammarPattern
- grammarPattern should appear naturally multiple times when appropriate
- readingForeign must be 45–55 words
- readingForeign must match the CEFR level difficulty
- readingForeign must be a coherent mini-text, not isolated sentences
- readingForeign must be independent from grammarExample and wordExampleForeign
- do not copy sentences from other fields

readingNative:

- natural Czech translation of readingForeign
- must preserve meaning accurately
- may adapt wording for natural Czech
- must not omit information from readingForeign

The grammarPattern used in grammarExample and readingForeign must be the same.

Output rules:

Return ONLY valid JSON array.
No markdown. No explanation. No extra keys.

[
  {
    "language": "en",
    "level": "A1",
    "wordForeign": "run",
    "wordNative": "běžet",
    "wordExampleForeign": "I run every morning in the park.",
    "wordExampleNative": "Každé ráno běhám v parku.",
    "grammarFamily": "Modal Verbs",
    "grammarPattern": "Can for ability",
    "grammarContext": "skills and abilities",
    "grammarExplanation": "Používej sloveso can pro věci, které umíš dělat.",
    "grammarExample": "She can swim very well.",
    "grammarTranslationCz": "Moje máma umí velmi dobře vařit.",
    "grammarTranslationOrig": "My mum can cook very well."
    "readingForeign": "Tom likes sports and spends time outside every day. He can run very fast and can play football with his friends. His sister can swim well, but she cannot run as quickly as Tom. They enjoy being active and can learn new sports together.",
    "readingNative": "Tom má rád sport a každý den tráví čas venku. Umí běhat velmi rychle a umí hrát fotbal se svými kamarády. Jeho sestra umí dobře plavat, ale neumí běhat tak rychle jako Tom. Rádi jsou aktivní a dokážou se společně učit nové sporty."

  }
]
`;

    let result;
let text;

try {
  console.log("🚀 STEP 2: calling Gemini");

  result = await callWithRetry(() =>
  model.generateContent(prompt)
);

  // někdy může failnout i .text()
  text = result.response?.text?.();

  if (!text) {
    throw new Error("Empty Gemini response text");
  }

} catch (err) {
  console.log("🔥 GEMINI ERROR:", err);

  return Response.json(
    {
      error: "Gemini call failed",
      details: err instanceof Error ? err.message : err,
    },
    { status: 500 }
  );
}

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
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  parsed = JSON.parse(cleaned.slice(
    cleaned.indexOf("["),
    cleaned.lastIndexOf("]") + 1
  ));
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

    if (parsed.length !== 6) {
  return Response.json(
    {
      error: "Expected exactly 6 items",
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
grammarExample: item.grammarExample ?? "",
grammarExplanation: item.grammarExplanation ?? "",
grammarFamily: item.grammarFamily ?? "",
grammarPattern: item.grammarPattern ?? "",
grammarContext: item.grammarContext ?? "",

  wordExampleForeign: item.wordExampleForeign ?? "",
  wordExampleNative: item.wordExampleNative ?? "",
  grammarTranslationCz: item.grammarTranslationCz ?? "",
  grammarTranslationOrig: item.grammarTranslationOrig ?? "",
  
  readingForeign: item.readingForeign ?? "",
  readingNative: item.readingNative ?? "",
  contentDate: today,
}));

if (parsed.length !== rows.length) {
  throw new Error("CRITICAL: parsed vs rows mismatch");
}

console.log("FINAL DATA READY:", {
  count: rows.length,
  levels: rows.map(r => r.level),
  languages: rows.map(r => r.language),
});

  const { data: inserted, error: insertError } =
  await supabase
    .from("dailycontent")
    .upsert(rows, {
      onConflict: "contentDate,language,level",
    })
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

    if (!inserted || inserted.length !== 6) {

      if (!inserted || inserted.length !== rows.length) {
  throw new Error(
    `CRITICAL: partial insert detected. expected=${rows.length}, got=${inserted?.length ?? 0}`
  );
}

  return Response.json({
    error: "Incomplete insert - missing rows",
    expected: 6,
    got: inserted?.length ?? 0,
  }, { status: 500 });
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