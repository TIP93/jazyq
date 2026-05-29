export async function GET() {
  console.log("HIT ROUTE");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
  });

  const SYSTEM_PROMPT = `
You are a professional language learning content generator.

Your task is to generate ONE vocabulary item for a language learning app.

It must be a single word only (no phrases).

Allowed word types:
- nouns
- verbs
- adjectives

Rules:
- Do NOT repeat any word from the provided "used words" list.
- Prefer common, high-frequency vocabulary.
- Match CEFR level strictly.
- Avoid proper nouns, names, places.
- Do NOT generate multi-word expressions.
- Balance word types naturally (not only nouns).

Output must be strictly JSON.
No explanations, no extra text.
`;

  return Response.json({
    text: result.response.text(),
  });
}