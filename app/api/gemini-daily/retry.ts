export async function callWithRetry(fn: () => Promise<any>, retries = 3) {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔁 Attempt ${i + 1}/${retries}`);

      const result = await fn();

      console.log(`✅ Success on attempt ${i + 1}`);
      return result;

    } catch (e: any) {
      lastError = e;

      console.error(`❌ Attempt ${i + 1} failed:`, {
        message: e?.message,
        status: e?.status,
        stack: e?.stack,
        raw: e,
      });

      // retry only for Gemini overload / service unavailable
      const isRetryable =
        e?.status === 503 ||
        e?.status === 429 ||
        e?.message?.toLowerCase?.().includes("overload");

      const isLast = i === retries - 1;

      if (isRetryable && !isLast) {
        const delay = 1500 * (i + 1);

        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));

        continue;
      }

      break;
    }
  }

  console.error("💥 FINAL FAILURE AFTER RETRIES:", lastError);
  throw lastError;
}