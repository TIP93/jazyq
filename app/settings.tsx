"use client";

import { useState } from "react";
import { User, Bell, Shield, Sliders, Crown, ArrowLeft, Check, Sparkles } from "lucide-react";

interface SettingsPageProps {
  user: any;
  setView: (view: "learn" | "streak" | "settings") => void;
}

export default function SettingsPage({ user, setView }: SettingsPageProps) {
  // Lokální stavy pro ukázku nastavení (lze později propojit s DB/databází)
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "preferences">("account");
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState("08:00");
  const [nativeLang, setNativeLang] = useState("cs");

  // Pomocná data o poskytovateli přihlášení
  const provider = user?.user_metadata?.provider || user?.app_metadata?.provider;

  return (
    // Pevná, ale podstatně širší karta s designem ladícím ke StreakPage
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

      {/* DVOU-SLOUPCOVÝ LAYOUT (ROZDĚLENÍ PRO ŠIRŠÍ PLOCHU) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEVÝ PANEL: NAVIGACE MEZI SEKCMI */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "account"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <User size={18} />
            Můj Účet
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
            Upozornění
          </button>

          <button
            onClick={() => setActiveTab("preferences")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "preferences"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Sliders size={18} />
            Předvolby výuky
          </button>
        </div>

        {/* PRAVÝ PANEL: DYNAMICKÝ OBSAH PODLE VYBRANÉ SEKCE */}
        <div className="md:col-span-8 bg-gray-50/40 border border-gray-100 rounded-2xl p-6 space-y-6">
          
          {/* SEKCE: MŮJ ÚČET */}
          {activeTab === "account" && (
            <div className="space-y-6">
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

              {/* UPGRADE NA PREMIUM (Kopíruje dárkový/oranžový styl ze Streaku) */}
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gradient-to-r from-purple-50 to-indigo-50/30 border border-purple-100 rounded-2xl p-5 text-left shadow-xs">
                <div className="flex-shrink-0 p-3 bg-purple-600 text-white rounded-xl shadow-xs">
                  <Crown size={20} className="stroke-[2.5px]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-purple-950">Získej JAZYQ Premium</h4>
                  <p className="text-xs text-purple-900/80 leading-relaxed mt-0.5">
                    Odemkni kompletní audio poslechy, neomezenou historii předchozích dní a detailní gramatické rozbory bez omezení.
                  </p>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition shadow-xs shrink-0 cursor-pointer">
                  Aktivovat za 30 Kč
                </button>
              </div>
            </div>
          )}

          {/* SEKCE: UPOZORNĚNÍ */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Denní připomenutí e-mailem</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Upozorníme tě, ať nepřerušíš svoji sérii.</p>
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
            </div>
          )}

          {/* SEKCE: PREFERENCE VÝUKY */}
          {activeTab === "preferences" && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Mateřský jazyk pro překlady</h4>
                  <p className="text-xs text-gray-400 mt-0.5">V tomto jazyce se ti budou zobrazovat vysvětlivky gramatiky.</p>
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

              <div className="bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Sparkles size={16} />
                </div>
                <p className="text-xs text-gray-500 leading-normal">
                  Chceš do denních cvičení přidat víc frází z běžného života? Aplikace inteligentně přizpůsobuje slovíčka na základě zvolené úrovně v hlavním menu.
                </p>
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