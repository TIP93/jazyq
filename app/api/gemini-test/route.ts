export async function GET() {
  console.log("HIT ROUTE");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
  });

  const result = await model.generateContent("Hello");

  return Response.json({
    text: result.response.text(),
  });
}