export async function GET() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
  );

  const data = await res.json();

  return Response.json(data);
}