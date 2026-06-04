"use client";

import { useState, useEffect } from "react";

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
  Crown, Headphones, PlayCircle, User, Calendar
} from "lucide-react";

type Language = "en" | "cs" | "it" | "es" | "de" | "fr" | "pt" | "ru" | "jp" | "cn";

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

const greetings: Record<Language, string[]> = {
  en: ["Hello", "Good day", "Hi there", "Welcome", "Hey", "Nice to see you"],
  cs: ["Ahoj", "Dobrý den", "Vítej", "Zdravím", "Hezký den", "Nazdar"],
  it: ["Ciao", "Buongiorno", "Benvenuto", "Salve", "Ehi", "Piacere di vederti"],
  es: ["Hola", "Buenos días", "Bienvenido", "Ey", "Saludos", "Qué tal"],
  de: ["Hallo", "Guten Tag", "Willkommen", "Servus", "Moin", "Schön dich zu sehen"],
  fr: ["Bonjour", "Salut", "Bienvenue", "Coucou", "Bonne journée", "Enchanté"],
  pt: ["Olá", "Bom dia", "Bem-vindo", "E aí", "Saudações", "Prazer em te ver"],
  ru: ["Привет", "Добрый день", "Добро пожаловать", "Здравствуйте", "Хай", "Рад тебя видеть"],
  jp: ["こんにちは", "やあ", "ようこそ", "おはよう", "こんばんは", "はじめまして"],
  cn: ["你好", "早上好", "欢迎", "嗨", "见到你很高兴", "您好"],
};

const languages = [
  { code: "en", flag: "gb" },
  { code: "cs", flag: "cz" },
  { code: "it", flag: "it" },
  { code: "es", flag: "es" },
  { code: "de", flag: "de" },
  { code: "fr", flag: "fr" },
  { code: "pt", flag: "pt" },
  { code: "ru", flag: "ru" },
  { code: "jp", flag: "jp" },
  { code: "cn", flag: "cn" },
];

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");

  const [showAnswer, setShowAnswer] = useState(false);
const [readingFlipped, setReadingFlipped] = useState(false);
const [showExampleTranslation, setShowExampleTranslation] = useState(false);
const [showTranslations, setShowTranslations] = useState(false);

const isGrammarVisible = showTranslations || showAnswer;

const [allLevels, setAllLevels] = useState<any>(null);
 const [greeting, setGreeting] = useState("");
 
const [levelIndex, setLevelIndex] = useState(2);
const level = levels[levelIndex] ?? "A1";
const content = allLevels?.levels?.[level];
const isReady = !!allLevels?.levels;
const [generating, setGenerating] = useState(false);

  async function generateDaily() {
  try {
    setGenerating(true);

    const res = await fetch("/api/gemini-daily", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        force: true, // důležité pro testování
      }),
    });

    const data = await res.json();

    // reload dat po vygenerování
    const reload = await fetch(`/api/daily?lang=${language}`);
    const fresh = await reload.json();

    setAllLevels(fresh);

  } catch (e) {
    console.error("Generation failed", e);
  } finally {
    setGenerating(false);
  }
}

 useEffect(() => {
  async function load() {
    const res = await fetch(`/api/daily?lang=${language}`);
    const data = await res.json();
    setAllLevels(data);

    const list = greetings[language] ?? greetings.en;
    const random = list[Math.floor(Math.random() * list.length)];
    setGreeting(random);
  }

  load();
}, [language]);

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex text-black font-[Poppins]">

      {/* SIDEBAR */}
      <div className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">

        {/* TOP */}
        <div className="space-y-10">

          {/* LOGO */}
          <div>
            <h1 className="text-3xl font-light tracking-[0.25em]">
              JAZYQ
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              tvoje denní pětiminutovka
            </p>
          </div>

{/* LANGUAGE */}
<div className="space-y-4">

  <p className="text-xs uppercase text-gray-400 flex items-center gap-2">
    <Globe size={16} />
    Jazyk
  </p>

  <div className="flex flex-wrap gap-2">

    {[
      { code: "en", flag: "gb" },
      { code: "cs", flag: "cz" },
      { code: "it", flag: "it" },
      { code: "es", flag: "es" },
      { code: "de", flag: "de" },
      { code: "fr", flag: "fr" },
      { code: "pt", flag: "pt" },
      { code: "ru", flag: "ru" },
      { code: "jp", flag: "jp" },
      { code: "cn", flag: "cn" },
    ].map((l) => (
      <button
        key={l.code}
        onClick={() => setLanguage(l.code as Language)}
        className="w-10 h-10 flex items-center justify-center"
      >
        <span
          className={`
            fi fi-${l.flag} text-2xl rounded-md shadow-sm
            transition-all duration-150
            ${
              language === l.code
                ? "ring-2 ring-black ring-offset-2 scale-110"
                : ""
            }
          `}
        />
      </button>
    ))}

  </div>

</div>

          {/* LEVEL */}
          <div className="space-y-4">

            <p className="text-xs uppercase text-gray-400 flex items-center gap-2">
              <BookOpen size={16} />
              Úroveň
            </p>

            <input
              type="range"
              min={0}
              max={levels.length - 1}
              value={levelIndex}
              onChange={(e) => {
                setLevelIndex(Number(e.target.value));
                setShowAnswer(false);
              }}
              className="w-full accent-black"
            />

            <div className="flex justify-between text-xs text-gray-500">
              {levels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>

          </div>

        </div>

 {/* BOTTOM */}
<div className="space-y-3">

  {/* HISTORY */}
  <div className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">

    <div className="flex items-center gap-3">

      <Calendar size={20} className="text-gray-500" />

      <div>
        <p className="text-xs text-gray-500">
          Historie
        </p>
        <p className="text-sm">
          Předchozí dny
        </p>
      </div>

    </div>

    {/* right orange premium-style icon */}
    <div className="flex items-center justify-center w-9 h-9 rounded-full border border-orange-200 bg-orange-50 text-orange-500">
      <Crown size={16} className="text-orange-400" />
    </div>

  </div>

  {/* ACCOUNT (BOTTOM) */}
  {/* ACCOUNT */}
<div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-gray-50 transition cursor-pointer">

  <User size={20} className="text-gray-500" />

  <div>
    <p className="text-xs text-gray-500">
      Účet
    </p>

    <p className="text-sm">
      Přihlásit se
    </p>
  </div>


</div>

<button
  onClick={generateDaily}
  disabled={generating}
  className="px-4 py-2 rounded-xl bg-black text-white text-sm disabled:opacity-50"
>
  {generating ? "Generating..." : "Generate today content"}
</button>

</div>

      </div>

      {/* MAIN */}
      

      {/* MAIN */}
<div className="flex-1 flex flex-col items-center justify-start p-8 gap-4">

  {/* TOP STATUS BAR */}
<div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-4 px-1 text-sm text-gray-600">
  
  {/* LEFT: flag + level + greeting */}
  <div className="flex items-center gap-3">

    <span className={`fi fi-${languages.find(l => l.code === language)?.flag}`} />

    <span className="font-medium text-black">
      {level}
    </span>

    <span className="text-gray-500">
      {greeting}
    </span>

  </div>

  {/* RIGHT: date */}
  <div className="text-gray-400">
    {new Date().toLocaleDateString("cs-CZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}

    <button
    onClick={() => setShowTranslations(prev => !prev)}
    className="text-gray-500 hover:text-black transition"
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

  {/* HEADER */}
  <div className="flex items-center justify-between">

    <div className="flex items-center gap-3 text-gray-400">
      <Languages size={24} />
      <p className="uppercase text-sm">Příkladová věta</p>
    </div>

    <button
      onClick={() => setShowExampleTranslation(!showExampleTranslation)}
      className="text-gray-400 hover:text-black transition"
    >
      <Eye size={20} />
    </button>

  </div>

  {/* CONTENT AREA - STACKED, NOT OVERLAYED TEXT */}
  <div className="mt-5 flex-1">

    {/* English always visible */}
    <p className="text-lg leading-relaxed text-gray-800">
       {content?.wordExampleForeign ?? ""}
    </p>

    {/* Czech appears BELOW, but without shifting layout */}
    <p
      className={`text-sm leading-relaxed text-gray-500 mt-3 transition-opacity duration-200 ${
        (showTranslations || showExampleTranslation) ? "opacity-100" : "opacity-0 pointer-events-none"
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

  {/* HEADER */}
  <div className="flex items-center justify-between">

    <div className="flex items-center gap-3 text-gray-400">
      <BookOpen size={24} />

      <p className="uppercase text-sm">
        Překlad
      </p>
    </div>

    <button
      onClick={() => setShowAnswer(!showAnswer)}
      className="text-gray-400 hover:text-black transition"
    >
      <Eye size={20} />
    </button>

  </div>

  {/* CONTENT */}
  <div className="md:col-span-6 bg-white rounded-3xl border border-gray-200 p-6 min-h-[180px] flex flex-col">

  {/* HEADER */}
  <div className="flex items-center justify-between">

    <div className="flex items-center gap-3 text-gray-400">
      <Languages size={24} />
      <p className="uppercase text-sm">Příkladová věta</p>
    </div>

    <button
      onClick={() => setShowExampleTranslation(!showExampleTranslation)}
      className="text-gray-400 hover:text-black transition"
    >
      <Eye size={20} />
    </button>

  </div>

  {/* CONTENT AREA - STACKED, NOT OVERLAYED TEXT */}
  <div className="mt-5 flex-1">

    {/* English always visible */}
    <p className="text-lg leading-relaxed text-gray-800">
       {content?.wordExampleForeign ?? ""}
    </p>

    {/* Czech appears BELOW, but without shifting layout */}
    <p
      className={`text-sm leading-relaxed text-gray-500 mt-3 transition-opacity duration-200 ${
        (showTranslations || showExampleTranslation) ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {content?.wordExampleNative ?? ""}
    </p>

  </div>

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
      <Eye size={18} />
    </button>
  </div>

  {/* CONTENT */}
  <div className="mt-5 flex-1 flex flex-col justify-between">

    {/* TEXT BLOCK (NO ABSOLUTE) */}
    <div className="transition-opacity duration-200">
      {/* FOREIGN TEXT */}
<p className={`text-base leading-8 text-gray-700 ${
  readingFlipped ? "hidden" : "block"
}`}>
  {content?.readingForeign ?? ""}
</p>

{/* NATIVE TEXT */}
<p className={`text-base leading-8 text-gray-500 mt-2 ${
  (readingFlipped || showTranslations) ? "block" : "hidden"
}`}>
  {content?.readingNative ?? ""}
</p>
    </div>

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
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-500">

      <Crown size={14} className="text-orange-400" />

      <span className="text-[10px] uppercase tracking-wider font-medium">
        Premium
      </span>

    </div>
  </div>

</div>

  </div>

</div>

    </div>
  );
}