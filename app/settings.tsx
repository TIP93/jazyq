"use client";

import { useState } from "react";
import { User, Bell, Sliders, Palette, Trash2, ArrowLeft, Check, Sparkles, Volume2, Target, RotateCcw } from "lucide-react";

interface SettingsPageProps {
  user: any;
  setView: (view: "learn" | "streak" | "settings") => void;
}

export default function SettingsPage({ user, setView }: SettingsPageProps) {
  // --- STAVY NASTAVENÍ ---
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "appearance" | "danger">("general");
  const [nativeLang, setNativeLang] = useState("cs");
  const [targetLevel, setTargetLevel] = useState("A2");
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [appTheme, setAppTheme] = useState("light");
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [dailyGoal, setDailyGoal] = useState("standard");

  // Pomocná data o poskytovateli přihlášení
  const provider = user?.user_metadata?.provider || user?.app_metadata?.provider;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 space-y-8 shadow-sm">
      
      {/* HLAVIČKA NASTAVENÍ S TLAČÍTKEM ZPĚT */}
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
              Správa tvého profilu, upozornění a preferencí výuky
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
            <User size={18} />
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
              {/* Profil uživatele */}
              <div className="flex items-center gap-4 bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-14 h-14 rounded-full border border-gray-100"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                    <User size={24} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                    Přihlášený profil
                  </p>
                  <h3 className="text-lg font-medium text-gray-900 truncate mt-0.5">
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || "Uživatel JAZYQ"}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
                {provider && (
                  <div className="bg-gray-100 px-3 py-1 rounded-xl text-xs font-medium text-gray-600 capitalize">
                    {provider}
                  </div>
                )}
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

              {/* Výběr cílové úrovně */}
              <div className="bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Studovaná úroveň jazyka</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Přizpůsobí náročnost generovaných každodenních frází.</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { code: "A1", label: "A1 (Začátečník)" },
                    { code: "A2", label: "A2 (Mírně pokročilý)" },
                    { code: "B1", label: "B1 (Středně pokročilý)" },
                  ].map((lvl) => (
                    <button
                      key={lvl.code}
                      onClick={() => setTargetLevel(lvl.code)}
                      className={`flex flex-col items-start gap-0.5 px-4 py-2.5 border rounded-xl text-left transition cursor-pointer ${
                        targetLevel === lvl.code
                          ? "border-black bg-gray-50 text-gray-900 font-semibold"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-xs font-bold">{lvl.code}</span>
                      <span className="text-[10px] opacity-80 font-normal">{lvl.label.split(" ")[1]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEKCE: UPOZORNĚNÍ A CÍLE */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              {/* Denní e-mail */}
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

              {/* Audio preference */}
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

              {/* Denní cíle */}
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

          {/* SEKCE: ZRUŠIT ÚČET / NEBEZPEČNÁ ZÓNA */}
          {activeTab === "danger" && (
            <div className="space-y-4">
              {/* Resetování pokroku */}
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

              {/* Smazání účtu */}
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