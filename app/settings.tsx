"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell, Palette, Trash2, ArrowLeft, Check, Sparkles, Volume2, Target, RotateCcw, Sliders } from "lucide-react";

interface SettingsPageProps {
  user: any;
  setView: (view: "learn" | "streak" | "settings") => void;
}

export default function SettingsPage({ user, setView }: SettingsPageProps) {
  // --- STAVY NASTAVENÍ ---
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "appearance" | "danger">("general");
  
  // Výchozí nastavení aplikace (Angličtina + B1)
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [targetLevel, setTargetLevel] = useState("B1");
  
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [appTheme, setAppTheme] = useState("light");
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [dailyGoal, setDailyGoal] = useState("standard");

  // Definice 6 jazyků (matice 3x2, čeština na konci) podle assetů z page.tsx
  const languages = [
    { code: "en", label: "Angličtina", flag: "gb" },
    { code: "de", label: "Němčina", flag: "de" },
    { code: "es", label: "Španělština", flag: "es" },
    { code: "fr", label: "Francouzština", flag: "fr" },
    { code: "it", label: "Italština", flag: "it" },
    { code: "cs", label: "Čeština", flag: "cz" },
  ];

  // Škála 6 úrovní na jeden kompaktní řádek
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      
      {/* HLAVIČKA NASTAVENÍ */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <button
          onClick={() => setView("learn")}
          className="p-2 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition shadow-xs cursor-pointer"
        >
          <ArrowLeft size={16} className="stroke-[2.5px]" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Nastavení aplikace
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Správa tvých preferencí výuky, upozornění a vzhledu rozhraní
          </p>
        </div>
      </div>

      {/* DVOU-SLOUPCOVÝ LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* LEVÝ PANEL: NAVIGACE (Kompaktnější paddingy) */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "general"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Sliders size={16} />
            Základní nastavení
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "notifications"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Bell size={16} />
            Upozornění a cíle
          </button>

          <button
            onClick={() => setActiveTab("appearance")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "appearance"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Palette size={16} />
            Barva aplikace
          </button>

          <button
            onClick={() => setActiveTab("danger")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "danger"
                ? "bg-red-50 text-red-600 shadow-xs font-semibold"
                : "bg-transparent text-gray-500 hover:bg-red-50/50 hover:text-red-600"
            }`}
          >
            <Trash2 size={16} />
            Zrušit účet
          </button>
        </div>

        {/* PRAVÝ PANEL: DYNAMICKÝ OBSAH (Vsunuto rovnou bez vnitřních boxů) */}
        <div className="md:col-span-8 bg-gray-50/40 border border-gray-100 rounded-2xl p-5 space-y-5">
          
          {/* SEKCE: ZÁKLADNÍ NASTAVENÍ */}
          {activeTab === "general" && (
            <div className="space-y-5">
              
              {/* Volba jazyka - matice 3x2 */}
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Výchozí studovaný jazyk</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Tento jazyk se ti otevře při spuštění JAZYQ.</p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setTargetLanguage(lang.code)}
                      className={`flex flex-col items-center justify-center py-2 px-3 border rounded-xl transition-all cursor-pointer relative group bg-white ${
                        targetLanguage === lang.code
                          ? "border-black text-gray-900 font-semibold shadow-2xs"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="w-7 h-4.5 relative mb-1 shadow-3xs rounded-xs overflow-hidden filter group-hover:scale-105 transition-transform">
                        <Image
                          src={`https://flagcdn.com/${lang.flag}.svg`}
                          alt={lang.label}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-[11px] tracking-tight truncate w-full text-center">{lang.label}</span>
                      
                      {targetLanguage === lang.code && (
                        <div className="absolute top-1.5 right-1.5 bg-black text-white rounded-full p-0.5">
                          <Check size={6} className="stroke-[3.5px]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200/60 my-1" />

              {/* Volba úrovně - kompaktní řádek 1x6 */}
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Výchozí úroveň pokročilosti</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">Přizpůsobí náročnost každodenních frází.</p>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {levels.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setTargetLevel(lvl)}
                      className={`flex items-center justify-center py-2.5 border rounded-xl text-center text-xs font-bold transition cursor-pointer bg-white relative ${
                        targetLevel === lvl
                          ? "border-black bg-gray-50 text-gray-900 shadow-2xs"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {lvl}
                      {targetLevel === lvl && (
                        <div className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5 shadow-2xs">
                          <Check size={6} className="stroke-[3.5px]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SEKCE: UPOZORNĚNÍ A CÍLE */}
          {activeTab === "notifications" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white border border-gray-200/60 rounded-xl p-3 shadow-2xs">
                <div>
                  <h4 className="text-xs font-medium text-gray-900">Denní připomenutí e-mailem</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Upozorníme tě, ať nepřerušíš svoji aktivní sérii.</p>
                </div>
                <button
                  onClick={() => setDailyReminder(!dailyReminder)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all duration-200 cursor-pointer ${
                    dailyReminder ? "bg-green-500 justify-end" : "bg-gray-200 justify-start"
                  }`}
                >
                  <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md" />
                </button>
              </div>

              {dailyReminder && (
                <div className="flex items-center justify-between bg-white border border-gray-200/60 rounded-xl p-3 shadow-2xs animate-fade-in">
                  <div>
                    <h4 className="text-xs font-medium text-gray-900">Čas odeslání e-mailu</h4>
                  </div>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black font-medium"
                  />
                </div>
              )}

              <div className="flex items-center justify-between bg-white border border-gray-200/60 rounded-xl p-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Volume2 size={14} className="text-gray-400" />
                  <div>
                    <h4 className="text-xs font-medium text-gray-900">Automatické přehrávání audia</h4>
                  </div>
                </div>
                <button
                  onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all duration-200 cursor-pointer ${
                    autoPlayAudio ? "bg-green-500 justify-end" : "bg-gray-200 justify-start"
                  }`}
                >
                  <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md" />
                </button>
              </div>

              <div className="bg-white border border-gray-200/60 rounded-xl p-3 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-gray-400" />
                  <h4 className="text-xs font-medium text-gray-900">Tvůj denní cíl cvičení</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: "casual", label: "Lehký", desc: "1 fráze" },
                    { code: "standard", label: "Standardní", desc: "3 fráze" },
                    { code: "serious", label: "Vážný", desc: "5 frází" },
                  ].map((goal) => (
                    <button
                      key={goal.code}
                      onClick={() => setDailyGoal(goal.code)}
                      className={`flex flex-col items-center p-2 border rounded-xl text-center transition cursor-pointer ${
                        dailyGoal === goal.code
                          ? "border-black bg-gray-50 text-gray-900 font-semibold"
                          : "border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                      }`}
                    >
                      <span className="text-[11px]">{goal.label}</span>
                      <span className="text-[9px] font-normal opacity-80 mt-0.5">{goal.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEKCE: BARVA APLIKACE */}
          {activeTab === "appearance" && (
            <div className="space-y-3">
              <div className="bg-white border border-gray-200/60 rounded-xl p-3 shadow-2xs space-y-2">
                <div>
                  <h4 className="text-xs font-medium text-gray-900">Vizuální motiv (Téma)</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: "light", label: "Čistá bílá", color: "bg-white border-gray-200 text-gray-900" },
                    { code: "sepia", label: "Klidná sépie", color: "bg-[#f4ecd8] border-[#e4dc18]/20 text-[#5b4636]" },
                    { code: "dark", label: "Temný režim", color: "bg-gray-900 border-gray-800 text-gray-100" },
                  ].map((theme) => (
                    <button
                      key={theme.code}
                      onClick={() => setAppTheme(theme.code)}
                      className={`py-2.5 px-2 border rounded-xl text-[11px] font-medium text-center transition cursor-pointer ${theme.color} ${
                        appTheme === theme.code ? "ring-2 ring-black font-semibold" : "opacity-85 hover:opacity-100"
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white/60 border border-gray-100 rounded-xl p-3 flex items-start gap-2">
                <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-normal">
                  Barevné kódování gramatiky se automaticky přizpůsobí vybranému tématu pro maximální kontrast a ochranu očí.
                </p>
              </div>
            </div>
          )}

          {/* SEKCE: ZRUŠIT ÚČET */}
          {activeTab === "danger" && (
            <div className="space-y-3">
              <div className="bg-white border border-red-100 rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <RotateCcw size={13} className="text-amber-500" />
                    Smazat pouze historii výuky
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-normal">Vynuluje aktivní sérii a historii vět. Účet zůstane.</p>
                </div>
                <button className="px-3 py-1.5 border border-amber-200 bg-amber-50/30 text-amber-700 text-[11px] font-semibold rounded-lg hover:bg-amber-50 transition shrink-0 cursor-pointer">
                  Resetovat pokrok
                </button>
              </div>

              <div className="bg-red-50/30 border border-red-100 rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-red-950">Trvalé odstranění účtu</h4>
                  <p className="text-[10px] text-red-900/60 mt-0.5 leading-normal">Kompletně a nevratně odstraní profil JAZYQ z databáze.</p>
                </div>
                <button className="px-3 py-1.5 bg-red-600 text-white text-[11px] font-semibold rounded-lg hover:bg-red-700 transition shrink-0 cursor-pointer">
                  Smazat navždy
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* SPODNÍ AKČNÍ TLAČÍTKO */}
      <div className="pt-3 border-t border-gray-100 flex justify-center">
        <button
          onClick={() => setView("learn")}
          className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-xl hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
        >
          Uložit a pokračovat ve studiu
        </button>
      </div>

    </div>
  );
} 