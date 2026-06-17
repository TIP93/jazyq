"use client";

import Image from "next/image"; 
import { useState, useEffect, useRef } from "react";
import StreakPage from "./streak";
import SettingsPage from "./settings";
import Sidebar from "./sidebar";
import { Roboto } from "next/font/google"; // Tady je velké R, protože importuješ funkci/typ
import { PrintLayout } from "./print"; 
// Tady vytváříš instanci s malým r
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["500"],
});

import {
  Globe,
  BookOpen,
  Sparkles,
  FileText,
  Languages,
  Lightbulb,
  Eye,
  EyeOff,
  Lock,
  Crown, Headphones, PlayCircle, User, Calendar, Settings, LogOut, CheckIcon, XIcon, Printer
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";

type Language = "en" | "de" | "es" | "fr" | "it";

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

import { Theme, themeClasses } from "./settings";


const greetings: Record<Language, string[]> = {
  en: ["Hello", "Good day", "Hi there", "Welcome", "Hey", "Nice to see you"],
 // cs: ["Ahoj", "Dobrý den", "Vítej", "Zdravím", "Hezký den", "Nazdar"],
  it: ["Ciao", "Buongiorno", "Benvenuto", "Salve", "Ehi", "Piacere di vederti"],
  es: ["Hola", "Buenos días", "Bienvenido", "Ey", "Saludos", "Qué tal"],
  de: ["Hallo", "Guten Tag", "Willkommen", "Servus", "Moin", "Schön dich zu sehen"],
  fr: ["Bonjour", "Salut", "Bienvenue", "Coucou", "Bonne journée", "Enchanté"],
};

const languages = [
  { code: "en", flag: "gb" },
  { code: "cs", flag: "cz" },
  { code: "it", flag: "it" },
  { code: "es", flag: "es" },
  { code: "de", flag: "de" },
  { code: "fr", flag: "fr" },
];

export default function Home() {
  const [showAnswer, setShowAnswer] = useState(false);
const [readingFlipped, setReadingFlipped] = useState(false);
const [showExampleTranslation, setShowExampleTranslation] = useState(false);
const [showTranslations, setShowTranslations] = useState(false);
const [dbShowTranslations, setDbShowTranslations] = useState<boolean | null>(null);
const [pdfWithTranslations, setPdfWithTranslations] = useState<boolean>(true);

const hasLoggedToday = useRef<string | null>(null);

const isGrammarVisible = showTranslations || showAnswer;

const [currentTheme, setCurrentTheme] = useState<Theme>("light");
const theme = themeClasses[currentTheme];

const [allLevels, setAllLevels] = useState<any>(null);
 const [greeting, setGreeting] = useState("");
 
const [language, setLanguage] = useState<Language>("en");
const [levelIndex, setLevelIndex] = useState(2); // Index 2 odpovídá B1
const [authLoading, setAuthLoading] = useState(true);

// Nová opravená funkce se správnými názvy sloupců
async function loadUserSettings(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*") // <--- Změna: Načte úplně všechny sloupce (včetně motivu, pdf i show_translations)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }
   
    return data; 
  } catch (err) {
    console.error("Chyba při načítání uživatelského nastavení:", err);
    return null;
  }
}

const level = levels[levelIndex] ?? "A1";
const content = allLevels?.levels?.[level];
const isReady = !!allLevels?.levels;
const [generating, setGenerating] = useState(false);
const [showLoginOptions, setShowLoginOptions] = useState(false);
const [user, setUser] = useState<any>(null);
const [view, setView] = useState<"learn" | "streak" | "settings">("learn");

const provider = user?.user_metadata?.provider || user?.app_metadata?.provider;

const iconCircle =
  "w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center";

 const mockStreakDays = [
  { day: "Po", status: "done" },
  { day: "Út", status: "done" },
  { day: "St", status: "missed" },
  { day: "Čt", status: "today" },
  { day: "Pá", status: "today" },
  { day: "So", status: "future" },
  { day: "Ne", status: "future" },
];

// KROK 2: Přidej tuto funkci nad Supabase useEffect
async function loadDailyContent(targetLang: Language, showTranslationsFromDb: boolean | null) {
  try {
    const res = await fetch(`/api/daily?lang=${targetLang}`);
    if (!res.ok) throw new Error("Nepodařilo se stáhnout denní obsah");
    const data = await res.json();
    setAllLevels(data);

    // Synchronizace zobrazení překladů na základě parametrů
    const shouldShow = showTranslationsFromDb === true;
    setShowTranslations(shouldShow);
    setShowExampleTranslation(shouldShow);
    setShowAnswer(shouldShow);
    setReadingFlipped(false);
  } catch (err) {
    console.error("Chyba při stahování obsahu:", err);
  } finally {
    // Teprve až máme data (nebo chybu), vypínáme globální loading aplikace
    setAuthLoading(false);
  }
}

useEffect(() => {
  // Spustí se pouze tehdy, pokud už aplikace inicializovala auth a není v prvotním loadingu
  if (!authLoading) {
    loadDailyContent(language, dbShowTranslations);
  }
}, [language]);

useEffect(() => {
  const list = greetings[language] ?? greetings.en;
  const random = list[Math.floor(Math.random() * list.length)];
  setGreeting(random);
}, [language]); // <--- Reaguje POUZE na změnu jazyka

async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://jazyq.vercel.app",
    },
  });
}

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth event:", event, "Session:", session);
    
    if (session?.user) {
      const currentUser = session.user;
      
      // 1. Načteme nastavení z DB
      const settings = await loadUserSettings(currentUser.id);
      
      // 2. Aktualizujeme stav uživatele
      setUser({
        ...currentUser,
        user_settings: settings
      });

      // Výchozí hodnoty z DB, pokud existují
      let activeLang: Language = language;
      let activeShowTranslations: boolean | null = null;

      if (settings) {
        if (settings.target_language) {
          activeLang = settings.target_language as Language;
          setLanguage(activeLang);
        }
        if (settings.target_level) {
          const idx = levels.indexOf(settings.target_level);
          if (idx !== -1) setLevelIndex(idx);
        }

        if (settings.show_translations === true || settings.show_translations === "true") {
          activeShowTranslations = true;
          setDbShowTranslations(true);
        } else {
          activeShowTranslations = false;
          setDbShowTranslations(false);
        }

        if (settings.pdf_with_translations === false || settings.pdf_with_translations === "false") {
          setPdfWithTranslations(false);
        } else {
          setPdfWithTranslations(true);
        }

      if (settings.app_theme) {
   setCurrentTheme(settings.app_theme as Theme);
}
      }
      
      // Zápis do logu a streaku
      try {
        const todayDate = new Date().toISOString().split("T")[0];
        const logKey = `${currentUser.id}-${todayDate}`;

        if (hasLoggedToday.current === logKey) {
          await fetchStreakData(currentUser.id);
        } else {
          const { error: upsertError } = await supabase
            .from("user_logs")
            .upsert(
              { user_id: currentUser.id, log_date: todayDate },
              { onConflict: "user_id,log_date" }
            );

          if (upsertError) throw upsertError;

          hasLoggedToday.current = logKey;
          await fetchStreakData(currentUser.id);
        }
      } catch (error) {
        console.error("Chyba při zápisu přístupu nebo streaku:", error);
      }

      // POZOR: Stáhneme obsah pro zjištěný jazyk a teprve tato funkce vypne setAuthLoading(false)
      await loadDailyContent(activeLang, activeShowTranslations);

    } else {
      // Pokud uživatel není přihlášený (Anonymní režim)
      setUser(null);
      setDbShowTranslations(false);
      setLevelIndex(2); // Fallback na B1
      
      // Stáhneme obsah pro výchozí jazyk (state: language) a vypneme loading
      await loadDailyContent(language, false);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

// 1. Vytvoříme stav (state) pro uložení reálných čísel z databáze
const [streakStats, setStreakStats] = useState<{
  current_streak: number;
  max_streak: number;
  logged_days: string[];
}>({ current_streak: 0, max_streak: 0, logged_days: [] });

// 2. Definujeme chybějící funkci fetchStreakData
async function fetchStreakData(userId: string) {
  try {
    // 1. Získáme spočítané streaky z RPC kalkulačky
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_user_streaks", {
      target_user_id: userId,
    });

    if (rpcError) throw rpcError;

    // 2. Vytáhneme reálné dny, kdy se uživatel logoval
    const { data: logsData, error: logsError } = await supabase
      .from("user_logs")
      .select("log_date")
      .eq("user_id", userId)
      .order("log_date", { ascending: false });

    if (logsError) throw logsError;

    // Převedeme objekty z DB na jednoduché pole stringů ['2026-06-10', '2026-06-09', ...]
    const extractedDays = logsData ? logsData.map(log => log.log_date) : [];

    if (rpcData) {
      setStreakStats({
        current_streak: rpcData.current_streak,
        max_streak: rpcData.max_streak,
        logged_days: extractedDays, // pošleme do stavu
      });
    }
  } catch (error) {
    console.error("Chyba při načítání streak dat:", error);
  }
}

const signInWithSeznam = () => {
  const clientId = process.env.NEXT_PUBLIC_SEZNAM_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SEZNAM_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    console.error("Missing Seznam client ID or redirect URI");
    return;
  }

  // Generování náhodného stavu (CSRF ochrana)
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("oauth_state", state);

  // Sestavení URL přesně podle specifikace ze Seznam administrace
  const authUrl = `https://login.szn.cz/api/v1/oauth/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identity,avatar&state=${state}`;
  window.location.href = authUrl;
};

useEffect(() => {
  setView("learn");
}, [language, levelIndex]);

// Pokud uživatel překlikne z nastavení jinam, vrátíme motiv podle toho, co je uloženo v user_settings
useEffect(() => {
  if (view !== "settings" && user?.user_settings?.app_theme) {
    setCurrentTheme(user.user_settings.app_theme as Theme);
  }
}, [view, user]);

if (authLoading) {
  return (
    <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center text-black font-[Poppins]">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-light tracking-[0.25em] animate-pulse">
          JAZYQ
        </h1>
        <p className="text-xs text-gray-400 tracking-wider">
          Načítám tvou denní pětiminutovku...
        </p>
      </div>
    </div>
  );
}

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex font-[Poppins]`}>

   {/* SIDEBAR COMPONENT */}
<Sidebar 
  theme={theme}
  currentTheme={currentTheme}
  language={language}
  setLanguage={setLanguage}
  levels={levels}
  levelIndex={levelIndex}
  setLevelIndex={setLevelIndex}
  user={user}
  streakStats={streakStats}
  setView={setView}
  showLoginOptions={showLoginOptions}
  setShowLoginOptions={setShowLoginOptions}
  signInWithGoogle={signInWithGoogle}
  signInWithSeznam={signInWithSeznam}
  handleSignOut={async () => {
    await supabase.auth.signOut();
    window.location.reload();
  }}
  provider={provider}
/>

      {/* MAIN */}


     <div className={`flex-1 flex flex-col items-center justify-center p-8 gap-4 min-h-screen overflow-y-auto ${theme.bg}`}>

 {view === "learn" && (

<div className="w-full max-w-5xl flex flex-col gap-4 my-auto">
  
  
 {/* TOP STATUS BAR */}
<div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-4 px-1 text-sm text-gray-600">
  
  {/* LEFT: flag + level + greeting + separator + date */}
  <div className="flex items-center gap-4">

    <div className="flex items-center gap-3">
      <span className={`fi fi-${languages.find(l => l.code === language)?.flag || "gb"} text-xl rounded-sm shadow-sm`} />

      <span className="font-semibold text-black">
        {level}
      </span>

      <span className="text-gray-500 font-medium">
        {greeting}
      </span>
    </div>

    {/* Moderní jemný oddělovač */}
    <div className="h-4 w-[1px] bg-gray-300" />

    {/* Datum přesunuté doleva s tmavší šedou barvou */}
    <span className="text-gray-700 font-medium">
  {(() => {
    const dateStr = new Date().toLocaleDateString("cs-CZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  })()}
</span>

  </div>


    {/* RIGHT */}
  <div className="flex items-center gap-2">

    <button
      onClick={() => window.print()}
      className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
    >
      <Printer size={18} />
    </button>

   <button
  onClick={() => {
    const nextState = !showTranslations;
    setDbShowTranslations(nextState);
    setShowTranslations(nextState);
    setShowAnswer(nextState);
    setShowExampleTranslation(nextState);
    setReadingFlipped(nextState);
  }}
  className={`
    p-2.5 rounded-xl border transition-all duration-200
    ${
      showTranslations
        ? "bg-black border-black text-white hover:bg-gray-800"
        : "bg-white border-gray-200 text-gray-500 hover:text-black hover:border-gray-300 hover:bg-gray-50 shadow-sm"
    }
  `}
>
  {showTranslations ? <EyeOff size={18} /> : <Eye size={18} />}
</button>

  </div>

</div>

  <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-10 gap-4 auto-rows-[minmax(160px,auto)]">



    {/* WORD */}
    <div className="md:col-span-4 bg-white rounded-3xl border border-gray-200 p-6">

      <div className="flex items-center gap-3 text-gray-400">
        <Sparkles size={24} />

        <p className="uppercase text-sm tracking-wide">
          Slovíčko dne
        </p>
      </div>

      <div className="mt-5">

        <p className="text-3xl font-medium tracking-tight">
           {content?.wordForeign ?? "Loading..."}
        </p>

        <p className="text-base text-gray-400 mt-1">
          {content?.wordNative ?? ""}
        </p>

      </div>

    </div>


{/* PRIKLADOVA VETA */}
<div className="md:col-span-6 bg-white rounded-3xl border border-gray-200 p-6 min-h-[180px] flex flex-col">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 text-gray-400">
      <Languages size={24} />
      <p className="uppercase text-sm">Příkladová věta</p>
    </div>
    <button
      onClick={() => setShowExampleTranslation(!showExampleTranslation)}
      className="text-gray-400 hover:text-black transition"
    >
      {/* Reaguje čistě na svůj synchronizovaný stav */}
      {showExampleTranslation ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>

  <div className="mt-5 flex-1">
    <p className="text-base leading-relaxed text-gray-800">
       {content?.wordExampleForeign ?? ""}
    </p>
    <p
      className={`text-sm leading-relaxed text-gray-500 mt-3 transition-opacity duration-200 ${
        showExampleTranslation ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {content?.wordExampleNative ?? ""}
    </p>
  </div>
</div>

{/* GRAMMAR */}
<div className="md:col-span-5 bg-white rounded-3xl border border-gray-200 p-6 relative">

  {/* HEADER */}
  <div className="flex items-center gap-3 text-gray-400">
    <Lightbulb size={24} />

    <p className="uppercase text-sm">
      Gramatika
    </p>
  </div>

  {/* RULE */}
  <p className="text-sm text-gray-600 leading-relaxed mt-5">
    {content?.grammarExplanation ?? ""}
  </p>

  {/* ENGLISH EXAMPLE (ALWAYS VISIBLE) */}
  <p className="text-sm text-gray-800 mt-4 font-medium">
    {content?.grammarExample ?? ""}
  </p>

</div>

  {/* TRANSLATION */}
<div className="md:col-span-5 bg-white rounded-3xl border border-gray-200 p-6 min-h-[180px] flex flex-col">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 text-gray-400">
      <BookOpen size={24} />
      <p className="uppercase text-sm">Překlad</p>
    </div>
    <button
      onClick={() => setShowAnswer(!showAnswer)}
      className="text-gray-400 hover:text-black transition"
    >
      {/* Reaguje čistě na svůj synchronizovaný stav */}
      {showAnswer ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>

  <div className="mt-5 flex-1">
    <p className="text-base leading-relaxed text-gray-800">
      {content?.grammarTranslationCz ?? ""}
    </p>
    <p
      className={`text-sm leading-relaxed text-gray-500 mt-3 transition-opacity duration-200 ${
        showAnswer ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {content?.grammarTranslationOrig ?? ""}
    </p>
  </div>
</div>

{/* READING */}
<div className="md:col-span-7 bg-white rounded-3xl border border-gray-200 p-7 relative min-h-[240px] flex flex-col">

  {/* HEADER */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 text-gray-400">
      <FileText size={24} />
      <p className="uppercase text-sm">Čtení</p>
    </div>

    <button
      onClick={() => setReadingFlipped(!readingFlipped)}
      className="text-gray-400 hover:text-black transition"
    >
      {readingFlipped ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>

  {/* CONTENT AREA */}
  {/* pb-4 dává jistotu, že i kdyby byl český text o chlup delší, neuteče k okraji karty */}
  <div className="mt-5 flex-1 relative pb-4">

    {/* NATIVNÍ (ČESKÝ) TEXT - Absolutní, překrývá anglický */}
    <p className={`text-base leading-8 text-gray-500 absolute inset-x-0 top-0 transition-opacity duration-300 ${
      readingFlipped ? "opacity-100 pointer-events-auto z-10" : "opacity-0 pointer-events-none z-0"
    }`}>
      {content?.readingNative ?? ""}
    </p>

    {/* CIZÍ (ANGLICKÝ) TEXT - Relativní, určuje a drží výšku celé karty */}
    <p className={`text-base leading-8 text-gray-700 relative transition-opacity duration-300 ${
      readingFlipped ? "opacity-0 pointer-events-none z-0" : "opacity-100 pointer-events-auto z-10"
    }`}>
      {content?.readingForeign ?? ""}
    </p>

  </div>

</div>


 {/* LISTENING (LOCKED PREVIEW) */}
<div className="md:col-span-3 relative bg-white border border-gray-200 rounded-3xl p-6 opacity-70">

  {/* HEADER */}
  <div className="flex items-center gap-3 text-gray-400">
    <Headphones size={24} />

    <p className="uppercase text-sm tracking-wide">
      Poslech
    </p>
  </div>

  {/* FAKE PLAYER */}
  <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-4">

    <PlayCircle size={24} className="text-gray-400" />

    <div className="flex-1">

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-gray-400 opacity-40"></div>
      </div>

      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>0:12</span>
        <span>1:04</span>
      </div>

    </div>

  </div>

  {/* PREMIUM BADGE (subtle orange restored) */}
  <div className="absolute bottom-4 left-4">
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-purple-500">

      <Crown size={14} className="text-purple-400" />

      <span className="text-[10px] uppercase tracking-wider font-medium">
        Premium
      </span>

    </div>
  </div>

</div>

</div>

  </div>

  

   )}

        {view === "streak" && (
  <StreakPage stats={streakStats} setView={setView} />
)}

{/* VYKRESLENÍ STRÁNKY NASTAVENÍ */}
{view === "settings" && (
  <SettingsPage 
    setView={setView} 
    user={user}
    onThemeChange={(newTheme) => setCurrentTheme(newTheme)} // <-- TENTO ŘÁDEK ZAJISTÍ ŽIVÉ PŘEBARVENÍ
  />
)}

<PrintLayout 
  language={language}
  level={level}
  content={content}
  pdfWithTranslations={pdfWithTranslations}
  languages={languages}
/>

</div>



    </div>

    
  );

}

