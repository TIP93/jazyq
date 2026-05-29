"use client";

import { useState, useEffect, useMemo } from "react";

import {
  Globe,
  BookOpen,
  Sparkles,
  FileText,
  Languages,
  Lightbulb,
  Eye,
  Crown,
  Headphones,
  PlayCircle,
  User,
  Calendar,
} from "lucide-react";

type Language = "en" | "cs" | "it" | "es" | "de";

const levels = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [levelIndex, setLevelIndex] = useState(3);

  const [allLevels, setAllLevels] = useState<any>(null);

  const [showAnswer, setShowAnswer] = useState(false);
  const [showExampleTranslation, setShowExampleTranslation] = useState(false);
  const [readingFlipped, setReadingFlipped] = useState(false);

  const level = levels[levelIndex];

  // LOAD DATA (NO AI HERE)
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/daily?lang=${language}`);
      const data = await res.json();
      setAllLevels(data);
    }

    load();
  }, [language]);

  // NORMALIZED CONTENT (supports both API formats)
  const content = useMemo(() => {
    if (!allLevels) return null;

    // format 1: grouped by levels
    if (allLevels?.levels) {
      return allLevels.levels?.[level] ?? null;
    }

    // format 2: flat array fallback
    if (Array.isArray(allLevels)) {
      return allLevels.find(
        (item: any) =>
          item.language === language && item.level === level
      );
    }

    return null;
  }, [allLevels, level, language]);

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex text-black font-[Poppins]">

      {/* SIDEBAR */}
      <div className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">

        <div className="space-y-10">

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
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code as Language)}
                  className="w-10 h-10 flex items-center justify-center"
                >
                  <span
                    className={`fi fi-${l.flag} text-2xl rounded-md ${
                      language === l.code ? "ring-2 ring-black" : ""
                    }`}
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
          <div className="border p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={20} />
              <div>
                <p className="text-xs text-gray-500">Historie</p>
                <p className="text-sm">Předchozí dny</p>
              </div>
            </div>
            <Crown size={16} />
          </div>

          <div className="border p-4 rounded-2xl flex items-center gap-3">
            <User size={20} />
            <div>
              <p className="text-xs text-gray-500">Účet</p>
              <p className="text-sm">Přihlásit se</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 flex justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-10 gap-4">

          {/* WORD */}
          <div className="md:col-span-4 bg-white p-6 rounded-3xl border">
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles size={20} />
              Slovíčko dne
            </div>

            <p className="text-3xl mt-5">
              {content?.wordForeign ?? "Loading..."}
            </p>

            <p className="text-gray-400">
              {content?.wordNative ?? ""}
            </p>
          </div>

          {/* EXAMPLE */}
          <div className="md:col-span-6 bg-white p-6 rounded-3xl border">
            <div className="flex justify-between">
              <Languages size={20} />
              <button onClick={() => setShowExampleTranslation(!showExampleTranslation)}>
                <Eye />
              </button>
            </div>

            <p className="mt-4 text-lg">
              {content?.wordExampleForeign ?? ""}
            </p>

            <p
              className={`text-gray-500 mt-2 ${
                showExampleTranslation ? "block" : "hidden"
              }`}
            >
              {content?.wordExampleNative ?? ""}
            </p>
          </div>

          {/* GRAMMAR */}
          <div className="md:col-span-5 bg-white p-6 rounded-3xl border">
            <Lightbulb size={20} />
            <p className="mt-4 text-sm">
              {content?.grammarExplanation ?? ""}
            </p>
            <p className="mt-2 font-medium">
              {content?.grammarExample ?? ""}
            </p>
          </div>

          {/* TRANSLATION */}
          <div className="md:col-span-5 bg-white p-6 rounded-3xl border">
            <BookOpen size={20} />

            <p className="mt-4">
              {content?.translationPrompt ?? ""}
            </p>

            <button onClick={() => setShowAnswer(!showAnswer)}>
              Show
            </button>

            <p className={`text-gray-500 mt-2 ${showAnswer ? "block" : "hidden"}`}>
              {content?.translationAnswer ?? ""}
            </p>
          </div>

          {/* READING */}
          <div className="md:col-span-7 bg-white p-6 rounded-3xl border">
            <FileText size={20} />

            {!readingFlipped ? (
              <p className="mt-4">{content?.readingForeign ?? ""}</p>
            ) : (
              <p className="mt-4 text-gray-500">{content?.readingNative ?? ""}</p>
            )}

            <button onClick={() => setReadingFlipped(!readingFlipped)}>
              Flip
            </button>
          </div>

          {/* LISTENING */}
          <div className="md:col-span-3 bg-white p-6 rounded-3xl border opacity-60">
            <Headphones size={20} />
            <div className="mt-4 flex items-center gap-2">
              <PlayCircle />
              <div className="w-full h-2 bg-gray-200 rounded">
                <div className="w-1/3 h-full bg-gray-400" />
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-400 flex justify-between">
              <span>0:12</span>
              <span>1:04</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}