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
  Lock,
  Crown, Headphones, PlayCircle, User, Calendar
} from "lucide-react";

type Language = "en" | "cs" | "it" | "es" | "de";

const levels = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

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

const mockContent = {
  A0: {
    word: {
      foreign: "Apple",
      czech: "jablko",
    },

    readingCz:
  "Tom žije v malém městě u řeky. Každé ráno chodí do školy se svým nejlepším kamarádem. Mají rádi fotbal, hudbu a videohry. Po škole někdy jdou do kavárny nebo si hrají v parku.",


    wordExample:
  "The journey across the mountains took three days.",
  wordExampleTranslation: "Cesta přes hory trvala tři dny.",

    translation: {
      cz: "Moje sestra má malého bílého psa.",
      answer: "My sister has a small white dog.",
    },

    grammar: {
      title: "Člen A / AN",
      explanation:
        "Používej A před souhláskou a AN před samohláskou.",
      example: "She has an orange bag.",
      exampleCz: "Má oranžovou tašku.",
    },

    reading:
      "Tom lives in a small town near a river. Every morning he walks to school with his best friend. They like football, music and video games. After school they sometimes go to a café or play outside in the park together.",

  },

  A1: {
    word: {
      foreign: "Holiday",
      czech: "dovolená",
    },

    readingCz:
  "Tom žije v malém městě u řeky. Každé ráno chodí do školy se svým nejlepším kamarádem. Mají rádi fotbal, hudbu a videohry. Po škole někdy jdou do kavárny nebo si hrají v parku.",

    wordExample:
  "The journey across the mountains took three days.",
  wordExampleTranslation: "Cesta přes hory trvala tři dny.",

    translation: {
      cz: "Příští víkend pojedeme vlakem do Prahy.",
      answer: "Next weekend we are going to Prague by train.",
    },

    grammar: {
      title: "Budoucí plán s GOING TO",
      explanation:
        "Používej GOING TO pro plány a úmysly do budoucna.",
      example: "We are going to visit Italy next summer.",
      exampleCz: "Má oranžovou tašku.",
    },

    reading:
      "Many people enjoy travelling during the summer holidays. Some prefer relaxing near the sea, while others like visiting mountains or historical cities. Travelling can help people discover different cultures, food and traditions from around the world.",

  },

  A2: {
    word: {
      foreign: "Neighbour",
      czech: "soused",
    },

    readingCz:
  "Tom žije v malém městě u řeky. Každé ráno chodí do školy se svým nejlepším kamarádem. Mají rádi fotbal, hudbu a videohry. Po škole někdy jdou do kavárny nebo si hrají v parku.",


    wordExample:
  "The journey across the mountains took three days.",
  wordExampleTranslation: "Cesta přes hory trvala tři dny.",

    translation: {
      cz: "Když jsem byl dítě, často jsme chodili do lesa.",
      answer: "When I was a child, we often went to the forest.",
    },

    grammar: {
      title: "Minulý čas prostý",
      explanation:
        "Používej minulý čas pro ukončené děje v minulosti.",
      example: "They visited London two years ago.",
      exampleCz: "Má oranžovou tašku.",
    },

    reading:
      "Learning a language requires patience and regular practice. Some students improve quickly because they study every day and actively use the language in conversations. Others prefer reading books, watching films or listening to podcasts in a foreign language.",

  },

  B1: {
    word: {
      foreign: "Journey",
      czech: "cesta",
    },

    readingCz:
  "Tom žije v malém městě u řeky. Každé ráno chodí do školy se svým nejlepším kamarádem. Mají rádi fotbal, hudbu a videohry. Po škole někdy jdou do kavárny nebo si hrají v parku.",


    wordExample:
  "The journey across the mountains took three days.",
  wordExampleTranslation: "Cesta přes hory trvala tři dny.",

    translation: {
      cz: "Kdybych měl více času, naučil bych se další cizí jazyk.",
      answer: "If I had more time, I would learn another foreign language.",
    },

    grammar: {
      title: "Druhý kondicionál",
      explanation:
        "Používej WOULD + infinitiv pro hypotetické situace.",
      example: "If I lived abroad, I would speak English every day.",
      exampleCz: "Má oranžovou tašku.",
    },

    reading:
      "People learn languages for many different reasons. Some want to travel more comfortably, while others need languages for work or studies. Learning regularly, even for only ten minutes a day, can lead to significant long-term progress. Modern applications and online tools make studying easier than ever before.",

  },

  B2: {
    word: {
      foreign: "Awareness",
      czech: "uvědomění",
    },

    readingCz:
  "Tom žije v malém městě u řeky. Každé ráno chodí do školy se svým nejlepším kamarádem. Mají rádi fotbal, hudbu a videohry. Po škole někdy jdou do kavárny nebo si hrají v parku.",


    wordExample:
  "The journey across the mountains took three days.",
  wordExampleTranslation: "Cesta přes hory trvala tři dny.",

    translation: {
      cz: "Navzdory nepříznivému počasí jsme se rozhodli pokračovat v cestě.",
      answer:
        "Despite the bad weather, we decided to continue our journey.",
    },

    grammar: {
      title: "Použití THE u řek",
      explanation:
        "Používej člen THE před názvy řek, oceánů a moří.",
      example: "The Danube flows through several European countries.",
      exampleCz: "Má oranžovou tašku.",
    },

    reading:
      "Technology has dramatically changed the way people communicate and learn. Nowadays students can practise foreign languages with teachers, applications or artificial intelligence tools from almost anywhere in the world. This accessibility creates opportunities that previous generations never experienced.",

  },

  C1: {
    word: {
      foreign: "Perception",
      czech: "vnímání",
    },

    readingCz:
  "Tom žije v malém městě u řeky. Každé ráno chodí do školy se svým nejlepším kamarádem. Mají rádi fotbal, hudbu a videohry. Po škole někdy jdou do kavárny nebo si hrají v parku.",


    wordExample:
  "The journey across the mountains took three days.",
  wordExampleTranslation: "Cesta přes hory trvala tři dny.",

    translation: {
      cz: "Mnoho odborníků tvrdí, že moderní společnost ztrácí schopnost hlubokého soustředění.",
      answer:
        "Many experts argue that modern society is losing the ability to concentrate deeply.",
    },

    grammar: {
      title: "Inverze po negativních výrazech",
      explanation:
        "Po některých negativních výrazech používáme obrácený slovosled.",
      example: "Rarely have I seen such an impressive performance.",
      exampleCz: "Má oranžovou tašku.",
    },

    reading:
      "Language influences not only communication but also perception and cultural identity. Advanced learners often realise that certain ideas or emotions are easier to express in one language than another. Understanding these nuances requires long-term exposure, curiosity and active reflection on meaning and context.",

  },

  C2: {
    word: {
      foreign: "Ambiguity",
      czech: "nejednoznačnost",
    },

    readingCz:
  "Tom žije v malém městě u řeky. Každé ráno chodí do školy se svým nejlepším kamarádem. Mají rádi fotbal, hudbu a videohry. Po škole někdy jdou do kavárny nebo si hrají v parku.",


    wordExample:
  "The journey across the mountains took three days.",
  wordExampleTranslation: "Cesta přes hory trvala tři dny.",

    translation: {
      cz: "Filozofické debaty často zpochybňují tradiční interpretace reality a pravdy.",
      answer:
        "Philosophical debates frequently challenge traditional interpretations of reality and truth.",
    },

    grammar: {
      title: "Mixed conditionals",
      explanation:
        "Mixed conditionals kombinují různé časové roviny v jedné podmínce.",
      example:
        "If I had studied medicine, I would be working in a hospital now.",
        exampleCz: "Má oranžovou tašku.",
    },

    reading:
      "Human communication is inherently shaped by ambiguity, context and cultural assumptions. At advanced levels of language proficiency, learners become increasingly sensitive to subtle stylistic differences, irony and implied meaning. True mastery often depends less on grammar itself and more on interpretation, adaptability and rhetorical awareness.",

  },
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showGrammarExample, setShowGrammarExample] = useState(false);
const [readingFlipped, setReadingFlipped] = useState(false);
const [showExampleTranslation, setShowExampleTranslation] = useState(false);

const [allLevels, setAllLevels] = useState<any>(null);

const [levelIndex, setLevelIndex] = useState(3);
const level = levels[levelIndex];
const content = allLevels?.levels?.[level];
const isReady = !!allLevels?.levels;

  const [apiData, setApiData] = useState<any>(null);


 useEffect(() => {
  console.log("USEEFFECT TRIGGERED");

  async function load() {
    const res = await fetch(`/api/daily?lang=${language}`);
    const data = await res.json();

    console.log("API DATA:", data);

    setAllLevels(data);
  }

  load();
}, [language]);

useEffect(() => {
  console.log("ALL LEVELS:", allLevels);
}, [allLevels]);

console.log("CURRENT LEVEL:", level, content);

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
              max={6}
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

</div>

      </div>

      {/* MAIN */}
      

      {/* MAIN */}
<div className="flex-1 flex items-center justify-center p-8">

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
           {content?.word?.foreign ?? "Loading..."}
        </p>

        <p className="text-base text-gray-400 mt-1">
          {content?.word?.czech ?? ""}
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
       {content?.wordForeign ?? ""}
    </p>

    {/* Czech appears BELOW, but without shifting layout */}
    <p
      className={`text-sm leading-relaxed text-gray-500 mt-3 transition-opacity duration-200 ${
        showExampleTranslation ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {content?.wordNative ?? ""}
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
  <div className="mt-5 flex-1">

    {/* Czech sentence (always visible) */}
    <p className="text-base leading-relaxed text-gray-800">
      {content?.translationPrompt ?? ""}
    </p>

    {/* English answer (appears below, no layout shift) */}
    <p
      className={`text-sm leading-relaxed text-gray-500 mt-3 transition-opacity duration-200 ${
        showAnswer ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {content?.translationAnswer ?? ""}
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
      <Eye size={18} />
    </button>
  </div>

  {/* CONTENT */}
  <div className="mt-5 flex-1 flex flex-col justify-between">

    {/* TEXT BLOCK (NO ABSOLUTE) */}
    <div className="transition-opacity duration-200">
      <p className={`text-base leading-8 text-gray-700 ${readingFlipped ? "hidden" : "block"}`}>
        {content?.readingForeign ?? ""}
      </p>

      <p className={`text-base leading-8 text-gray-500 ${readingFlipped ? "block" : "hidden"}`}>
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