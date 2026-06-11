"use client";

import { useState } from "react";
import { Bell, Sliders, Palette, Trash2, ArrowLeft, Check, Sparkles, Volume2, Target, RotateCcw, Globe } from "lucide-react";

interface SettingsPageProps {
  user: any;
  setView: (view: "learn" | "streak" | "settings") => void;
}

export default function SettingsPage({ user, setView }: SettingsPageProps) {
  // --- STAVY NASTAVENÍ ---
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "appearance" | "danger">("general");
  
  // Výchozí nastavení podle zadání: Angličtina + B1
  const [nativeLang, setNativeLang] = useState("cs");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [targetLevel, setTargetLevel] = useState("B1");
  
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [appTheme, setAppTheme] = useState("light");
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [dailyGoal, setDailyGoal] = useState("standard");

  // Definice podporovaných jazyků v JAZYQ
  const languages = [
    { code: "en", label: "Angličtina", flag: "🇬🇧" },
    { code: "de", label: "Němčina", flag: "🇩🇪" },
    { code: "es", label: "Španělština", flag: "🇪🇸" },
    { code: "fr", label: "Francouzština", flag: "🇫🇷" },
    { code: "it", label: "Italština", flag: "🇮🇹" },
  ];

  // Škála úrovní A1 - C2
  const levels = [
    { code: "A1", label: "Začátečník" },
    { code: "A2", label: "Mírně pokročilý" },
    { code: "B1", label: "Středně pokročilý" },
    { code: "B2", label: "Vyšší střední" },
    { code: "C1", label: "Pokročilý" },
    { code: "C2", label: "Proficient" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 space-y-8 shadow-sm">
      
      {/* HLAVIČKA NASTAVENÍ S TLAČÍTKEM ZPÊT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("learn")}
            className="p-2.5 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft size={18} className="stroke-[2.5px]" />
          </button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Nastavení aplikace
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Správa tvých preferencí výuky, upozornění a vzhledu rozhraní
            </p>
          </div>
        </div>
      </div>

      {/* DVOU-SLOUPCOVÝ LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEVÝ PANEL: NAVIGACE MEZI SEKCMI */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "general"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Globe size={18} />
            Základní nastavení
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "notifications"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Bell size={18} />
            Upozornění a cíle
          </button>

          <button
            onClick={() => setActiveTab("appearance")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "appearance"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Palette size={18} />
            Barva aplikace
          </button>

          <button
            onClick={() => setActiveTab("danger")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "danger"
                ? "bg-red-50 text-red-600 shadow-xs font-semibold"
                : "bg-transparent text-gray-500 hover:bg-red-50/50 hover:text-red-600"
            }`}
          >
            <Trash2 size={18} />
            Zrušit účet
          </button>
        </div>

        {/* PRAVÝ PANEL: DYNAMICKÝ OBSAH */}
        <div className="md:col-span-8 bg-gray-50/40 border border-gray-100 rounded-2xl p-6 space-y-6">
          
          {/* SEKCE: ZÁKLADNÍ NASTAVENÍ */}
          {activeTab === "general" && (
            <div className="space-y-6">
              
              {/* Výběr výchozího studovaného jazyka (Velké moderní vlajky) */}
              <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-xs space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Výchozí studovaný jazyk</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Tento jazyk uvidíš jako první při otevření aplikace JAZYQ.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setTargetLanguage(lang.code)}
                      className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all cursor-pointer relative group ${
                        targetLanguage === lang.code
                          ? "border-black bg-gray-50 text-gray-900 font-semibold shadow-2xs"
                          : "border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <span className="text-3xl mb-1.5 filter group-hover:scale-105 transition-transform">{lang.flag}</span>
                      <span className="text-[11px] tracking-tight truncate w-full text-center">{lang.label}</span>
                      {targetLanguage === lang.code && (
                        <div className="absolute top-1.5 right-1.5 bg-black text-white rounded-full p-0.5">
                          <Check size={8} className="stroke-[3.5px]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Výběr studované úrovně (Grid A1 - C2) */}
              <div className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-xs space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Výchozí úroveň pokročilosti</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Přizpůsobí náročnost generovaných každodenních frází a rozborů.</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                  {levels.map((lvl) => (
                    <button
                      key={lvl.code}
                      onClick={() => setTargetLevel(lvl.code)}
                      className={`flex flex-col items-center justify-center py-3.5 px-2 border rounded-xl text-center transition cursor-pointer ${
                        targetLevel === lvl.code
                          ? "border-black bg-gray-50 text-gray-900"
                          : "border-gray-100 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`text-base font-bold ${targetLevel === lvl.code ? "text-gray-900" : "text-gray-700"}`}>
                        {lvl.code}
                      </span>
                      <span className="text-[9px] text-gray-400 font-normal mt-0.5 tracking-tight truncate w-full">
                        {lvl.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Výběr mateřského jazyka */}
              <div className="bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Mateřský jazyk pro překlady</h4>
                  <p className="text-xs text-gray-400 mt-0.5">V tomto jazyce se ti budou zobrazovat vysvětlivky a překlady.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { code: "cs", label: "Čeština" },
                    { code: "en", label: "English" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setNativeLang(lang.code)}
                      className={`flex items-center justify-between px-4 py-2.5 border rounded-xl text-xs font-medium transition cursor-pointer ${
                        nativeLang === lang.code
                          ? "border-black bg-gray-50 text-gray-900 font-semibold"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {lang.label}
                      {nativeLang === lang.code && <Check size={14} className="text-black stroke-[3px]" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SEKCE: UPOZORNĚNÍ A CÍLE */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Denní připomenutí e-mailem</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Upozorníme tě, ať nepřerušíš svoji aktivní sérii dní.</p>
                </div>
                <button
                  onClick={() => setDailyReminder(!dailyReminder)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-200 cursor-pointer ${
                    dailyReminder ? "bg-green-500 justify-end" : "bg-gray-200 justify-start"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {dailyReminder && (
                <div className="flex items-center justify-between bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs animate-fade-in">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Čas odeslání e-mailu</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Kdy ti ranní pětiminutovka nejvíce vyhovuje.</p>
                  </div>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>
              )}

              <div className="flex items-center justify-between bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                    <Volume2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Automatické přehrávání audia</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Spustí hlasový poslech okamžitě po načtení věty.</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-200 cursor-pointer ${
                    autoPlayAudio ? "bg-green-500 justify-end" : "bg-gray-200 justify-start"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              <div className="bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 text-gray-500 rounded-lg">
                    <Target size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Tvůj denní cíl cvičení</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Nastav si ideální tempo každodenního studia.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { code: "casual", label: "Lehký", desc: "1 fráze / den" },
                    { code: "standard", label: "Standardní", desc: "3 fráze / den" },
                    { code: "serious", label: "Vážný", desc: "5 frází / den" },
                  ].map((goal) => (
                    <button
                      key={goal.code}
                      onClick={() => setDailyGoal(goal.code)}
                      className={`flex flex-col items-start p-3 border rounded-xl text-left transition cursor-pointer ${
                        dailyGoal === goal.code
                          ? "border-black bg-gray-50 text-gray-900 font-semibold"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-xs">{goal.label}</span>
                      <span className="text-[10px] text-gray-400 font-normal mt-0.5">{goal.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEKCE: BARVA APLIKACE */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Vizuální motiv (Téma)</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Vyber si barevné rozhraní, které lahodí tvému oku.</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { code: "light", label: "Čistá bílá", color: "bg-white border-gray-200" },
                    { code: "sepia", label: "Klidná sépie", color: "bg-[#f4ecd8] border-[#e4dc18]/20 text-[#5b4636]" },
                    { code: "dark", label: "Temný režim", color: "bg-gray-900 border-gray-800 text-gray-100" },
                  ].map((theme) => (
                    <button
                      key={theme.code}
                      onClick={() => setAppTheme(theme.code)}
                      className={`flex flex-col items-center justify-center p-4 border rounded-xl text-xs font-medium transition cursor-pointer ${theme.color} ${
                        appTheme === theme.code ? "ring-2 ring-black ring-offset-2 font-semibold" : "opacity-85 hover:opacity-100"
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Sparkles size={16} />
                </div>
                <p className="text-xs text-gray-500 leading-normal">
                  Při zapnutí sépie nebo tmavého režimu se automaticky upraví i barevné kódování gramatických celků pro maximální čitelnost a ochranu očí.
                </p>
              </div>
            </div>
          )}

          {/* SEKCE: ZRUŠIT ÚČET */}
          {activeTab === "danger" && (
            <div className="space-y-4">
              <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <RotateCcw size={15} className="text-amber-500" />
                    Vymazat pouze historii výuky
                  </h4>
                  <p className="text-xs text-gray-400 leading-normal">
                    Vynuluje tvou aktuální sérii aktivních dní a smaže historii splněných frází. Účet ti zůstane.
                  </p>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 border border-amber-200 bg-amber-50/30 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-50 transition shrink-0 cursor-pointer">
                  Resetovat pokrok
                </button>
              </div>

              <div className="bg-red-50/30 border border-red-100 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-red-950 flex items-center gap-2">
                    Trvalé odstranění účtu
                  </h4>
                  <p className="text-xs text-red-900/60 leading-normal">
                    Kompletně smaže tvůj uživatelský profil z databáze JAZYQ včetně všech statistik bez možnosti obnovy.
                  </p>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition shadow-xs shrink-0 cursor-pointer">
                  Smazat účet navždy
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* SPODNÍ AKČNÍ TLAČÍTKO PRO NÁVRAT DO STUDIA */}
      <div className="pt-4 border-t border-gray-100 flex justify-center">
        <button
          onClick={() => setView("learn")}
          className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-2xl hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
        >
          Uložit a pokračovat ve studiu
        </button>
      </div>

    </div>
  );
}