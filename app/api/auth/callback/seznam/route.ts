import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializace Supabase klienta s SERVICE_ROLE_KEY.
// POZOR: service_role nesmí nikdy uniknout do prohlížeče, ale na serveru (zde) ho potřebujeme,
// abychom mohli uživatele zapsat do auth systému ručně bez hesla.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Ujisti se, že máš tento klíč v .env.local
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // 1. Ošetření případné chyby ze strany Seznamu
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    // 2. Výměna jednorázového kódu za Access Token (POST podle dokumentace)
    const tokenResponse = await fetch("https://login.szn.cz/api/v1/oauth/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded", // Seznam očekává urlencoded formu nebo JSON dle specifikace
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_SEZNAM_REDIRECT_URI!,
        client_id: process.env.SEZNAM_CLIENT_ID!,
        client_secret: process.env.SEZNAM_CLIENT_SECRET!,
      }),
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.text();
      console.error("Chyba při výměně tokenu u Seznamu:", errData);
      return NextResponse.redirect(new URL("/login?error=token_exchange_failed", request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 3. Získání dat o uživateli (GET podle dokumentace)
    const userResponse = await fetch("https://login.szn.cz/api/v1/user", {
      method: "GET",
      headers: {
        "Authorization": `bearer ${accessToken}`,
        "Accept": "application/json",
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL("/login?error=user_data_failed", request.url));
    }

    const seznamUser = await userResponse.json();
    
    // Seznam v 'identity' scope vrací většinnou e-mail pod account_name nebo přímo objekt s emailem.
    // Pro Supabase potřebujeme unikátní e-mail a ID
    //  OPRAVENÝ KÓD:
// Seznam vrací e-mail přímo v poli 'email'. 
// Pro jistotu přidáváme zálohu, kdyby se v budoucnu struktura změnila.
const email = seznamUser.email || seznamUser.account_name;
const seznamId = tokenData.oauth_user_id || seznamUser.id;

// Pro plné jméno Seznam používá pole 'firstname' a 'lastname'
const fullName = [seznamUser.firstname, seznamUser.lastname].filter(Boolean).join(" ");

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=email_not_provided", request.url));
    }

    // 4. Integrace do Supabase přes Admin API
    // Vytvoříme nebo aktualizujeme uživatele v auth.users
    const { data: supabaseUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: { 
  full_name: fullName || email,
  provider: "seznam",
  seznam_id: seznamId 
},
    });

    // Pokud uživatel existuje, createUser selže na duplicitu e-mailu. V tom případě ho jen najdeme/aktualizujeme.
    if (authError && authError.message.includes("already exists")) {
      // Uživatel už u nás účet má (třeba se registroval dříve přes heslo nebo Google)
      // Můžeš mu účet propojit nebo jej rovnou přihlásit.
    }

    // 5. Vygenerování Supabase session pro frontend
    // Aby byl uživatel reálně přihlášený v prohlížeči, vygenerujeme mu přihlašovací link/token
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
  type: "magiclink",
  email: email,
  options: {
    // Přesměrujeme uživatele na hlavní stránku aplikace
    redirectTo: new URL("/", request.url).toString() 
  }
});

    if (linkError || !linkData.properties?.action_link) {
      console.error("Chyba generování linku:", linkError);
      return NextResponse.redirect(new URL("/login?error=session_failed", request.url));
    }

    // Přesměrujeme uživatele na action_link, který ho automaticky přihlásí do Supabase a hodí na /dashboard
    return NextResponse.redirect(linkData.properties.action_link);

  } catch (e) {
    console.error("Neočekávaná chyba OAuth:", e);
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}