"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function saveUserSettings(payload: { targetLanguage: string; targetLevel: string }) {
  const cookieStore = await cookies(); // Pro Next.js 15+ (pokud Next 14, odeber await)

  // Vytvoření ad-hoc serverové instance se správným přístupem ke cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Bezpečné zachycení, pokud se akce volá z komponenty
          }
        },
      },
    }
  );

  // Teď už server bezpečně získá přihlášeného uživatele z cookies
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      target_language: payload.targetLanguage,
      target_level: payload.targetLevel,
    }, { onConflict: "user_id" });

  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  return { success: true };
}