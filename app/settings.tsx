"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Palette, Trash2, ArrowLeft, Globe, EyeOff, RotateCcw, Sliders, Loader2, Printer, Languages } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface SettingsPageProps {
  user: any;
  setView: (view: "learn" | "streak" | "settings") => void;
}

export default function SettingsPage({ user, setView }: SettingsPageProps) {
  // --- STAVY NASTAVENÍ ---
  const [activeTab, setActiveTab] = useState<"general" | "behavior" | "appearance" | "locale" | "danger">("general");

  const [targetLanguage, setTargetLanguage] = useState(() => user?.user_settings?.target_language || "en");
  const [targetLevel, setTargetLevel] = useState(() => user?.user_settings?.target_level || "B1");
  const [appTheme, setAppTheme] = useState(() => user?.user_settings?.app_theme || "light");
  const [showTranslations, setShowTranslations] = useState(() => user?.user_settings?.show_translations ?? false);
  const [pdfWithTranslations, setPdfWithTranslations] = useState(() => user?.user_settings?.pdf_with_translations ?? true);
  const [appLocale, setAppLocale] = useState(() => user?.user_settings?.app_locale || "cs");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.user_settings) {
      const settings = user.user_settings;
      if (settings.target_language) setTargetLanguage(settings.target_language);
      if (settings.target_level) setTargetLevel(settings.target_level);
      if (settings.app_theme) setAppTheme(settings.app_theme);
      if (settings.show_translations !== undefined) setShowTranslations(settings.show_translations);
      if (settings.pdf_with_translations !== undefined) setPdfWithTranslations(settings.pdf_with_translations);
      if (settings.app_locale) setAppLocale(settings.app_locale);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user?.id) {
      setSaveError("Uživatel není přihlášen.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            target_language: targetLanguage,
            target_level: targetLevel,
            app_theme: appTheme,
            show_translations: showTranslations,
            pdf_with_translations: pdfWithTranslations,
            app_locale: appLocale,
          },
          { onConflict: "user_id" }
        );

      if (error) {
        setSaveError(error.message);
      } else {
        setView("learn");
        window.location.reload();
      }
    } catch (err) {
      setSaveError("Došlo k neočekávané chybě při komunikaci s databází.");
    } finally {
      setIsSaving(false);
    }
  };

  const languages = [
    { code: "en", label: "Angličtina", flag: "gb" },
    { code: "de", label: "Němčina", flag: "de" },
    { code: "es", label: "Španělština", flag: "es" },
    { code: "fr", label: "Francouzština", flag: "fr" },
    { code: "it", label: "Italština", flag: "it" },
    { code: "cs", label: "Čeština", flag: "cz" },
  ];

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 space-y-8 shadow-sm">
      
      {/* HLAVIČKA NASTAVENÍ */}
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
              Správa tvých preferencí výuky, chování lekcí a vzhledu rozhraní
            </p>
          </div>
        </div>
      </div>

      {/* CHYBOVÁ HLÁŠKA */}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-sm rounded-2xl">
          {saveError}
        </div>
      )}

      {/* DVOU-SLOUPCOVÝ LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEVÝ PANEL: NAVIGACE */}
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
            Výběr jazyka
          </button>

          <button
            onClick={() => setActiveTab("behavior")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "behavior"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Sliders size={18} />
            Chování aplikace
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
            onClick={() => setActiveTab("locale")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "locale"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Languages size={18} />
            App Language
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

        {/* PRAVÝ PANEL: DYNAMICKÝ OBSAH (Výška přesně podle obsahu, bez zbytečného prázdného místa) */}
        <div className="md:col-span-8 bg-gray-50/40 border border-gray-100 rounded-2xl p-6 flex flex-col justify-start space-y-6">
          
          {/* SEKCE: VÝBĚR JAZYKA */}
          {activeTab === "general" && (
            <div className="space-y-6 w-full">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Výchozí jazyk a úroveň studovaného jazyka</h4>
                
                <div className="grid grid-cols-3 gap-2 w-full">
                  {languages.map((lang) => {
                    const isSelected = targetLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setTargetLanguage(lang.code)}
                        className={`flex items-center justify-start gap-3 px-4 py-2.5 border rounded-xl text-sm transition-all cursor-pointer bg-white font-medium w-full ${
                          isSelected
                            ? "border-black bg-gray-50 text-gray-900 font-semibold shadow-2xs"
                            : "border-gray-200/70 text-gray-600 hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                      >
                        <div className="w-5 h-3.5 relative shadow-3xs rounded-xs overflow-hidden shrink-0">
                          <Image
                            src={`https://flagcdn.com/${lang.flag}.svg`}
                            alt={lang.label}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="truncate">{lang.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="py-2">
                  <hr className="border-gray-100/70" />
                </div>

                <div className="grid grid-cols-6 gap-2 w-full">
                  {levels.map((lvl) => {
                    const isSelected = targetLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTargetLevel(lvl)}
                        className={`flex items-center justify-center py-2.5 px-3 border rounded-xl text-sm transition cursor-pointer bg-white font-semibold w-full ${
                          isSelected
                            ? "border-black bg-gray-50 text-gray-900 shadow-2xs"
                            : "border-gray-200/70 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SEKCE: CHOVÁNÍ APLIKACE */}
          {activeTab === "behavior" && (
            <div className="space-y-6 w-full">
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-gray-200/50 text-gray-600 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                    <EyeOff size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Zobrazovat překlady okamžitě</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Pokud zapneš, všechny překlady se budou zobrazovat automaticky.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTranslations(!showTranslations)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-200 cursor-pointer shrink-0 ${
                    showTranslations ? "bg-green-500 justify-end" : "bg-gray-200"
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              <hr className="border-gray-100/70" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-200/50 text-gray-600 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                    <Printer size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Výchozí styl pro tisk studijních materiaalů (PDF)</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Nastav si, zda chceš generovat pracovní listy rovnou s překladem, nebo nechat místo prázdné.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pl-12">
                  <button
                    type="button"
                    onClick={() => setPdfWithTranslations(true)}
                    className={`flex items-center justify-center p-3 border rounded-xl text-xs font-medium transition cursor-pointer bg-white ${
                      pdfWithTranslations
                        ? "border-black bg-gray-50 text-gray-900 font-semibold shadow-2xs"
                        : "border-gray-200/70 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Tisknout s překlady
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfWithTranslations(false)}
                    className={`flex items-center justify-center p-3 border rounded-xl text-xs font-medium transition cursor-pointer bg-white ${
                      !pdfWithTranslations
                        ? "border-black bg-gray-50 text-gray-900 font-semibold shadow-2xs"
                        : "border-gray-200/70 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Tisknout bez překladů
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SEKCE: BARVA APLIKACE */}
          {activeTab === "appearance" && (
            <div className="space-y-4 w-full">
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
                    type="button"
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
          )}

          {/* SEKCE: APP LANGUAGE */}
          {activeTab === "locale" && (
            <div className="space-y-4 w-full">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Jazyk aplikace – App Language</h4>
                <p className="text-xs text-gray-400 mt-0.5">Zvol si jazyk, ve kterém se bude zobrazovat samotné prostředí webu JAZYQ.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setAppLocale("cs")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 border text-sm rounded-xl transition cursor-pointer w-full ${
                    appLocale === "cs"
                      ? "border-black bg-gray-50 text-gray-900 font-semibold shadow-2xs"
                      : "border-gray-200/70 text-gray-600 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="w-5 h-3.5 relative shadow-3xs rounded-xs overflow-hidden shrink-0">
                    <Image src="https://flagcdn.com/cz.svg" alt="Čeština" fill className="object-cover" />
                  </div>
                  <span>Čeština</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAppLocale("en")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 border text-sm rounded-xl transition cursor-pointer w-full ${
                    appLocale === "en"
                      ? "border-black bg-gray-50 text-gray-900 font-semibold shadow-2xs"
                      : "border-gray-200/70 text-gray-600 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="w-5 h-3.5 relative shadow-3xs rounded-xs overflow-hidden shrink-0">
                    <Image src="https://flagcdn.com/gb.svg" alt="Angličtina" fill className="object-cover" />
                  </div>
                  <span>English</span>
                </button>
              </div>
            </div>
          )}

          {/* SEKCE: NEBEZPEČNÁ ZÓNA */}
          {activeTab === "danger" && (
            <div className="space-y-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <RotateCcw size={15} className="text-amber-500" />
                    Vymazat pouze historii výuky
                  </h4>
                  <p className="text-xs text-gray-400 leading-normal">
                    Vynuluje tvou aktuální sérii aktivních dní a smaže historii splněných frází. Účet ti zůstane.
                  </p>
                </div>
                <button type="button" className="w-full sm:w-auto px-4 py-2 border border-amber-200 bg-amber-50/30 text-amber-700 text-xs font-semibold rounded-xl hover:bg-amber-50 transition shrink-0 cursor-pointer">
                  Resetovat pokrok
                </button>
              </div>

              <hr className="border-gray-100" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-red-600">
                    Trvalé odstranění účtu
                  </h4>
                  <p className="text-xs text-gray-400 leading-normal">
                    Kompletně smaže tvůj uživatelský profil z databáze JAZYQ včetně všech statistik bez možnosti obnovy.
                  </p>
                </div>
                <button type="button" className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition shadow-xs shrink-0 cursor-pointer">
                  Smazat účet navždy
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SPODNÍ TLAČÍTKO */}
      <div className="pt-4 border-t border-gray-100 flex justify-center">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-2xl hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Ukládám...
            </>
          ) : (
            "Uložit a pokračovat ve studiu"
          )}
        </button>
      </div>

    </div>
  );
}