import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    const today = new Date().toISOString().split("T")[0];

   const languages = ["en"];
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
  .select("level, grammarPoint")
  .order("contentDate", { ascending: false })
  .limit(360); // cca 60 dní × 6 úrovní

if (usedGrammarError) {
  return Response.json(
    {
      error: "Failed loading previous grammar",
      details: usedGrammarError,
    },
    { status: 500 }
  );
}

const usedGrammar =
  usedGrammarRows?.map(
    (row) => `${row.level}: ${row.grammarPoint}`
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
A1, A2, B1, B2, C1, C2.

Return exactly 7 objects.

Each object represents a complete learning unit consisting of:
- vocabulary word
- example sentence using that word

Rules:
- each item must contain:
  - language
  - level
  - wordForeign
  - wordNative (Czech translation of the word)
  - wordExampleForeign (example sentence in target language)
  - wordExampleNative (Czech translation of the sentence)
  - grammarPoint
  - grammarExplanation
  - grammarExample
  - grammarExampleTranslation

Word rules:
- word must be a noun, verb, or adjective
- CEFR appropriate difficulty:
  - A1: basic concrete vocabulary
  - A2–B1: daily life vocabulary + simple actions and descriptions
  - B2–C1: more abstract, nuanced or less frequent vocabulary
- no proper nouns
- no duplicates across dataset
- keep words short and natural (prefer single-word form when possible)

Sentence rules:
- sentence must naturally include the target word
- sentence must reflect CEFR level appropriately

Length rules:
- A1–A2: 8–12 words
- B1–C1: 10–15 words

Grammar rules:
- verbs may be naturally conjugated
- adjectives must appear in natural agreement with nouns
- avoid artificial textbook sentences
- avoid explanations inside sentences

Czech translation rules:
- must be natural, fluent Czech
- must preserve meaning of sentence
- do not translate word-by-word if unnatural

IMPORTANT:
Do NOT generate any word that appears in the previously used words list.

Previously used words:
${usedWords.join("\n")}

Avoid semantic repetition across days.

Each generated dataset must distribute words across different semantic categories.

Allowed categories include (but are not limited to):
- people & roles (teacher, doctor)
- actions & verbs (run, eat)
- objects (table, book)
- nature (tree, river)
- animals (cat, dog, bird)
- abstract concepts (time, idea, love)
- places (school, city, home)

STRICT RULE:
Do NOT generate more than ONE word from the same semantic category per batch.

Avoid overused beginner vocabulary unless necessary for A1 (e.g. cat, dog, book, run, eat).

Prefer slightly less common but still high-frequency vocabulary when possible.

Also avoid synonyms of previously used words when feasible.

Grammar section:

Each item must also contain a grammar focus.

grammarPoint:
- short identifier of the grammar topic
- maximum 5 words
- must describe a specific grammar micro-topic
- avoid broad topics

Good examples:
- Present Perfect with already
- Present Perfect with yet
- Articles with rivers
- Can for permission
- Gerund after enjoy
- First Conditional
- Relative clauses with who

Bad examples:
- Present Perfect
- Articles
- Prepositions
- Grammar practice

grammarExplanation:
- explain exactly one grammar rule
- maximum 25 words
- practical and learner-friendly
- avoid linguistic jargon

Good example:
Use "the" before names of rivers, seas and oceans.

grammarExample:
- must clearly demonstrate the grammar point
- should be easier than the level's vocabulary word
- do not intentionally include difficult vocabulary
- 5–12 words

grammarExampleTranslation:
- natural Czech translation of grammarExample

Grammar difficulty by level:

A1:
- there is / there are
- possessive adjectives
- can for ability
- basic prepositions
- plural nouns

A2:
- past simple
- comparative adjectives
- going to
- countable vs uncountable nouns

B1:
- present perfect
- first conditional
- passive basics
- gerunds and infinitives

B2:
- reported speech
- relative clauses
- modal verbs of deduction
- second conditional

C1:
- inversion
- mixed conditionals
- advanced discourse markers
- emphasis structures

IMPORTANT:

Do NOT generate any grammar point that appears in the previously used grammar list.

Previously used grammar points:

${usedGrammar.join("\n")}

Also avoid closely related variations of recently used grammar points when possible.

Try to balance word types (nouns, verbs, adjectives), but prioritize natural CEFR appropriateness.

Each dataset should feel like a curated learning set: diverse, balanced, and pedagogically meaningful.

Ensure strict JSON compliance:
- return ONLY valid JSON array
- no markdown
- no comments
- no trailing commas
- no extra keys
- no explanation

Return ONLY valid JSON array:

[
  {
    "language": "en",
    "level": "A1",
    "wordForeign": "run",
    "wordNative": "běžet",
    "wordExampleForeign": "I run every morning in the park.",
    "wordExampleNative": "Každé ráno běhám v parku.",
    "grammarPoint": "Can for ability",
    "grammarExplanation": "Use can to talk about abilities.",
    "grammarExample": "She can swim very well.",
    "grammarExampleTranslation": "Umí velmi dobře plavat."
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
   grammarPoint: item.grammarPoint,
  grammarExplanation: item.grammarExplanation,
  grammarExample: item.grammarExample,
  grammarExampleTranslation: item.grammarExampleTranslation,

  wordExampleForeign: item.wordExampleForeign ?? "",
  wordExampleNative: item.wordExampleNative ?? "",

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