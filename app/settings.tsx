"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Palette, Trash2, ArrowLeft, Globe, EyeOff, Sliders, Loader2, Printer, Languages } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface SettingsPageProps {
  user: any;
  setView: (view: "learn" | "streak" | "settings") => void;
  onThemeChange?: (theme: Theme) => void;
}

type AuditAction = 
  | "CHANGE_LANGUAGE" 
  | "CHANGE_LEVEL" 
  | "TOGGLE_TRANSLATIONS" 
  | "TOGGLE_PDF_TRANSLATIONS"
  | "CHANGE_THEME"
  | "CHANGE_LOCALE"
  | "RESET_PROGRESS";

// Rozšířená definice témat o moderní jemné tóny
export type Theme = "light" | "dark" | "sepia" | "seaglass" | "sage" | "blush";

export const themeClasses: Record<Theme, { bg: string; card: string; text: string; textMuted: string; border: string; subPanel: string; textInverted: string }> = {
  light: {
    bg: "bg-[#F6F7FB]",
    card: "bg-white border-gray-200 text-black",
    text: "text-gray-900",
    textMuted: "text-gray-400",
    border: "border-gray-200",
    subPanel: "bg-gray-50/40 border-gray-100",
    textInverted: "text-gray-600"
  },
  dark: {
    bg: "bg-[#1A1C20]",          // Moderní temný grafit s kapkou modré (místo ostré černé)
    card: "bg-[#22252A] border-[#2D3139] text-[#E2E8F0]", // Jemnější kontrast, břidlicový panel
    text: "text-[#E2E8F0]",       // Off-white text (příjemný pro oči, netahá)
    textMuted: "text-[#94A3B8]",  // Slate-400 pro sekundární texty a popisky
    border: "border-[#2D3139]",   // Tlumené ohraničení, které neruší celkový layout
    subPanel: "bg-[#16181C]/60 border-[#252930]", // Vnořené panely jsou o kousek tmavší než karta
    textInverted: "text-[#94A3B8]" // Sjednoceno pro sekundární stavy v navigaci
  },
  sepia: {
    bg: "bg-[#F4ECD8]",
    card: "bg-[#FCF6E8] border-[#E4D5B7] text-[#433422]",
    text: "text-[#433422]",
    textMuted: "text-[#7C6A52]",
    border: "border-[#E4D5B7]",
    subPanel: "bg-[#F4ECD8]/40 border-[#E4D5B7]/60",
    textInverted: "text-[#433422]/80"
  },
  seaglass: {
    bg: "bg-[#E0F2F1]",
    card: "bg-[#F0F7F9] border-[#D1E4E8] text-[#1E3A42]",
    text: "text-[#1E3A42]",
    textMuted: "text-[#6A939E]",
    border: "border-[#D1E4E8]",
    subPanel: "bg-[#E5F0F2]/50 border-[#D1E4E8]/70",
    textInverted: "text-[#1E3A42]/80"
  },
  sage: {
    bg: "bg-[#F1F8E9]",
    card: "bg-[#F3F6F2] border-[#D5E0D2] text-[#2D3B29]",
    text: "text-[#2D3B29]",
    textMuted: "text-[#71876D]",
    border: "border-[#D5E0D2]",
    subPanel: "bg-[#E9F0E7]/50 border-[#D5E0D2]/70",
    textInverted: "text-[#2D3B29]/80"
  },
  blush: {
    bg: "bg-[#F7F2EE]",          // Matná, velmi jemná pudrová s kapkou krémové (neruší a nesvítí)
    card: "bg-[#FFFDFB] border-[#EADED6] text-[#4E362F]", // Čistá, teplá bílá pro karty s terakotvým textem
    text: "text-[#4E362F]",       // Hluboká zemitá hnědá s cihlovým podtónem pro skvělou čitelnost
    textMuted: "text-[#9E867E]",  // Tlumená šedohnědá pro sekundární popisky
    border: "border-[#EADED6]",   // Velmi soft ohraničení v barvě suché hlíny
    subPanel: "bg-[#F1E8E1]/60 border-[#E4D5CB]", // Zapuštěný sub-panel, který drží zemitý tón
    textInverted: "text-[#4E362F]/80"
  }
};

export default function SettingsPage({ user, setView, onThemeChange }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<"general" | "behavior" | "appearance" | "locale" | "danger">("general");

  const [targetLanguage, setTargetLanguage] = useState(() => user?.user_settings?.target_language || "en");
  const [targetLevel, setTargetLevel] = useState(() => user?.user_settings?.target_level || "B1");
  const [appTheme, setAppTheme] = useState<Theme>(() => user?.user_settings?.app_theme || "light");
  
  const [showTranslations, setShowTranslations] = useState<boolean>(() => {
    const raw = user?.user_settings?.show_translations;
    return raw === true || String(raw) === "true";
  });

  const [pdfWithTranslations, setPdfWithTranslations] = useState<boolean>(() => {
    const raw = user?.user_settings?.pdf_with_translations;
    if (raw === undefined || raw === null) return true;
    return raw === true || String(raw) === "true";
  });

  const [appLocale, setAppLocale] = useState(() => user?.user_settings?.app_locale || "cs");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [shouldResetProgress, setShouldResetProgress] = useState(false);

  const theme = themeClasses[appTheme] || themeClasses.light;

  useEffect(() => {
    if (user?.user_settings) {
      const settings = user.user_settings;
      
      if (settings.target_language) setTargetLanguage(settings.target_language);
      if (settings.target_level) setTargetLevel(settings.target_level);
      if (settings.app_theme) setAppTheme(settings.app_theme as Theme);
      if (settings.app_locale) setAppLocale(settings.app_locale);
      
      const isTranslationsTrue = settings.show_translations === true || String(settings.show_translations) === "true";
      setShowTranslations(isTranslationsTrue);

      const isPdfTrue = settings.pdf_with_translations === true || String(settings.pdf_with_translations) === "true";
      setPdfWithTranslations(settings.pdf_with_translations !== undefined && settings.pdf_with_translations !== null ? isPdfTrue : true);
    }
  }, [user?.id]);

  const logUserAction = async (action: AuditAction, details: Record<string, any> = {}) => {
    await supabase
      .from("user_settings_history")
      .insert({
        user_id: user.id,
        action: action,
        details: details
      });
  };

  const handleSaveSettings = async () => {
    if (!user?.id) {
      setSaveError("Uživatel není přihlášen.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const oldSettings = user?.user_settings || {};
      
      const oldLanguage = oldSettings.target_language || "en";
      const oldLevel = oldSettings.target_level || "B1";
      const oldTheme = oldSettings.app_theme || "light";
      const oldLocale = oldSettings.app_locale || "cs";
      const oldTranslations = oldSettings.show_translations === true || String(oldSettings.show_translations) === "true";
      const oldPdf = oldSettings.pdf_with_translations === undefined || oldSettings.pdf_with_translations === null 
        ? true 
        : (oldSettings.pdf_with_translations === true || String(oldSettings.pdf_with_translations) === "true");

      const finalLanguage = shouldResetProgress ? "en" : targetLanguage;
      const finalLevel = shouldResetProgress ? "B1" : targetLevel;
      const finalTheme = shouldResetProgress ? "light" : appTheme;
      const finalTranslations = shouldResetProgress ? true : showTranslations;
      const finalPdf = shouldResetProgress ? true : pdfWithTranslations;
      const finalLocale = shouldResetProgress ? "cs" : appLocale;

      const historyPromises: Promise<void>[] = [];

      if (shouldResetProgress) {
        historyPromises.push(logUserAction("RESET_PROGRESS", { triggered_by: "user" }));
        if (onThemeChange) onThemeChange("light");
        if (oldLanguage !== "en") historyPromises.push(logUserAction("CHANGE_LANGUAGE", { old: oldLanguage, new: "en" }));
        if (oldLevel !== "B1") historyPromises.push(logUserAction("CHANGE_LEVEL", { old: oldLevel, new: "B1" }));
        if (oldTheme !== "light") historyPromises.push(logUserAction("CHANGE_THEME", { old: oldTheme, new: "light" }));
        if (oldTranslations !== true) historyPromises.push(logUserAction("TOGGLE_TRANSLATIONS", { old: oldTranslations, new: true }));
        if (oldPdf !== true) historyPromises.push(logUserAction("TOGGLE_PDF_TRANSLATIONS", { old: oldPdf, new: true }));
        if (oldLocale !== "cs") historyPromises.push(logUserAction("CHANGE_LOCALE", { old: oldLocale, new: "cs" }));
      } else {
        if (targetLanguage !== oldLanguage) historyPromises.push(logUserAction("CHANGE_LANGUAGE", { old: oldLanguage, new: targetLanguage }));
        if (targetLevel !== oldLevel) historyPromises.push(logUserAction("CHANGE_LEVEL", { old: oldLevel, new: targetLevel }));
        if (appTheme !== oldTheme) historyPromises.push(logUserAction("CHANGE_THEME", { old: oldTheme, new: appTheme }));
        if (showTranslations !== oldTranslations) historyPromises.push(logUserAction("TOGGLE_TRANSLATIONS", { old: oldTranslations, new: showTranslations }));
        if (pdfWithTranslations !== oldPdf) historyPromises.push(logUserAction("TOGGLE_PDF_TRANSLATIONS", { old: oldPdf, new: pdfWithTranslations }));
        if (appLocale !== oldLocale) historyPromises.push(logUserAction("CHANGE_LOCALE", { old: oldLocale, new: appLocale }));
      }

      const { error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: user.id,
            target_language: finalLanguage,
            target_level: finalLevel,
            app_theme: finalTheme,
            show_translations: finalTranslations,
            pdf_with_translations: finalPdf,
            app_locale: finalLocale,
          },
          { onConflict: "user_id" }
        );

      if (error) {
        setSaveError(error.message);
        setIsSaving(false);
        return;
      }

      if (historyPromises.length > 0) {
        await Promise.all(historyPromises);
      }

      setView("learn");
      window.location.reload();

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
    <div className={`w-full max-w-4xl mx-auto border rounded-3xl p-8 sm:p-10 space-y-8 shadow-sm transition-colors duration-300 ${theme.card}`}>
      
      {/* HLAVIČKA NASTAVENÍ */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${theme.border}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("learn")}
            className={`p-2.5 bg-white border text-gray-500 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition shadow-xs cursor-pointer ${theme.border}`}
          >
            <ArrowLeft size={18} className="stroke-[2.5px]" />
          </button>
          <div>
            <h1 className={`text-3xl font-semibold tracking-tight ${theme.text}`}>
              Nastavení aplikace
            </h1>
            <p className={`text-sm mt-0.5 ${theme.textMuted}`}>
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
        <div className="md:col-span-4 flex flex-col gap-2 md:min-h-[320px]">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "general"
                ? (appTheme === 'dark' ? "bg-white text-black font-semibold" : "bg-gray-900 text-white shadow-xs")
                : `bg-transparent ${theme.textInverted} hover:bg-black/5`
            }`}
          >
            <Globe size={18} />
            Výběr jazyka
          </button>

          <button
            onClick={() => setActiveTab("behavior")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "behavior"
                ? (appTheme === 'dark' ? "bg-white text-black font-semibold" : "bg-gray-900 text-white shadow-xs")
                : `bg-transparent ${theme.textInverted} hover:bg-black/5`
            }`}
          >
            <Sliders size={18} />
            Chování aplikace
          </button>

          <button
            onClick={() => setActiveTab("appearance")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "appearance"
                ? (appTheme === 'dark' ? "bg-white text-black font-semibold" : "bg-gray-900 text-white shadow-xs")
                : `bg-transparent ${theme.textInverted} hover:bg-black/5`
            }`}
          >
            <Palette size={18} />
            Barva aplikace
          </button>

          <button
            onClick={() => setActiveTab("locale")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "locale"
                ? (appTheme === 'dark' ? "bg-white text-black font-semibold" : "bg-gray-900 text-white shadow-xs")
                : `bg-transparent ${theme.textInverted} hover:bg-black/5`
            }`}
          >
            <Languages size={18} />
            App Language
          </button>

          <button
            onClick={() => setActiveTab("danger")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === "danger"
                ? "bg-red-600 text-white shadow-xs font-semibold"
                : "bg-transparent text-red-500 hover:bg-red-500/10"
            }`}
          >
            <Trash2 size={18} />
            Zrušit účet
          </button>
        </div>

        {/* PRAVÝ PANEL: DYNAMICKÝ OBSAH */}
        <div className={`md:col-span-8 border rounded-2xl p-6 flex flex-col justify-start space-y-6 ${theme.subPanel}`}>
          
          {/* SEKCE: VÝBĚR JAZYKA */}
          {activeTab === "general" && (
            <div className="space-y-6 w-full">
              <div className="space-y-4">
                <h4 className={`text-sm font-medium ${theme.text}`}>Výchozí jazyk a úroveň studovaného jazyka</h4>
                
                <div className="grid grid-cols-3 gap-2 w-full">
                  {languages.map((lang) => {
                    const isSelected = targetLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setTargetLanguage(lang.code)}
                        className={`flex items-center justify-start gap-3 px-4 py-2.5 border rounded-xl text-sm transition-all cursor-pointer font-medium w-full ${
                          isSelected
                            ? "border-current bg-black/5 font-semibold ring-1 ring-current"
                            : `${theme.border} bg-white/50 text-current hover:bg-black/5`
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
                  <hr className={theme.border} />
                </div>

                <div className="grid grid-cols-6 gap-2 w-full">
                  {levels.map((lvl) => {
                    const isSelected = targetLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setTargetLevel(lvl)}
                        className={`flex items-center justify-center py-2.5 px-3 border rounded-xl text-sm transition cursor-pointer font-semibold w-full ${
                          isSelected
                            ? "border-current bg-black/5 ring-1 ring-current"
                            : `${theme.border} bg-white/50 text-current hover:bg-black/5`
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
                  <div className="p-2 bg-black/5 text-current rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                    <EyeOff size={16} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${theme.text}`}>Zobrazovat překlady na webu</h4>
                    <p className={`text-xs mt-0.5 ${theme.textMuted}`}>Pokud zapneš, všechny překlady se na webu zobrazí automaticky.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowTranslations(!showTranslations)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-200 cursor-pointer relative ${
                      showTranslations ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div 
                      className={`bg-white w-4 h-4 rounded-full shadow-md transition-all duration-200 ${
                        showTranslations ? "translate-x-5" : "translate-x-0"
                      }`} 
                    />
                  </button>
                </div>
              </div>

              <hr className={theme.border} />

              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-black/5 text-current rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                    <Printer size={16} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${theme.text}`}>Zobrazovat překlady v PDF</h4>
                    <p className={`text-xs mt-0.5 ${theme.textMuted}`}>Určuje, zda se do vygenerovaných materiálů pro tisk vloží překlady.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPdfWithTranslations(!pdfWithTranslations)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-200 cursor-pointer relative ${
                      pdfWithTranslations ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div 
                      className={`bg-white w-4 h-4 rounded-full shadow-md transition-all duration-200 ${
                        pdfWithTranslations ? "translate-x-5" : "translate-x-0"
                      }`} 
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SEKCE: BARVA APLIKACE (ZMENŠENÁ TLAČÍTKA A NOVÉ BARVY) */}
          {activeTab === "appearance" && (
            <div className="space-y-4 w-full">
              <div>
                <h4 className={`text-sm font-medium ${theme.text}`}>Vizuální motiv (Téma)</h4>
                <p className={`text-xs mt-0.5 ${theme.textMuted}`}>Vyber si barevné rozhraní, které lahodí tvému oku.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { code: "light" as Theme, label: "Čistá bílá", color: "bg-white border-gray-200 text-black" },
                  { code: "dark" as Theme, label: "Temný režim", color: "bg-[#1E1E1E] border-[#2D2D2D] text-gray-100" },
                  { code: "sepia" as Theme, label: "Klidná sépie", color: "bg-[#FCF6E8] border-[#E4D5B7] text-[#433422]" },
                  { code: "seaglass" as Theme, label: "Seaglass Blue", color: "bg-[#F0F7F9] border-[#D1E4E8] text-[#1E3A42]" },
                  { code: "sage" as Theme, label: "Sage Garden", color: "bg-[#F3F6F2] border-[#D5E0D2] text-[#2D3B29]" },
                  { code: "blush" as Theme, label: "Blush Clay", color: "bg-[#FAF4F2] border-[#EADAD6] text-[#4A312A]" },
                ].map((t) => (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => {
                      setAppTheme(t.code);
                      if (onThemeChange) onThemeChange(t.code);
                    }}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl text-xs font-medium transition cursor-pointer ${t.color} ${
                      appTheme === t.code 
                        ? "ring-1 ring-current border-current font-semibold" 
                        : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SEKCE: APP LANGUAGE */}
          {activeTab === "locale" && (
            <div className="space-y-4 w-full">
              <div>
                <h4 className={`text-sm font-medium ${theme.text}`}>Jazyk aplikace – App Language</h4>
                <p className={`text-xs mt-0.5 ${theme.textMuted}`}>If you want to use the app to learn Czech, you may switch the interface to English.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setAppLocale("cs")}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 border text-sm rounded-xl transition cursor-pointer w-full ${
                    appLocale === "cs"
                      ? "border-current bg-black/5 font-semibold ring-1 ring-current"
                      : `${theme.border} bg-white/50 text-current hover:bg-black/5`
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
                  className={`flex items-center justify-center gap-2 px-2.5 py-2.5 border text-sm rounded-xl transition cursor-pointer w-full ${
                    appLocale === "en"
                      ? "border-current bg-black/5 font-semibold ring-1 ring-current"
                      : `${theme.border} bg-white/50 text-current hover:bg-black/5`
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
                  <h4 className={`text-sm font-semibold flex items-center gap-2 ${appTheme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                    Vymazat historii výuky a nastavení
                  </h4>
                  <p className={`text-xs leading-normal ${theme.textMuted}`}>
                    Vynuluje tvou aktuální sérii aktivních dní a vrátí veškerá nastavení do výchozího stavu. Účet ti zůstane.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShouldResetProgress(!shouldResetProgress)}
                  className={`w-full sm:w-44 px-4 py-2 text-xs font-semibold rounded-xl transition shrink-0 cursor-pointer text-center justify-center border ${
                    shouldResetProgress 
                      ? "bg-amber-600 border-amber-600 text-white hover:bg-amber-700" 
                      : "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                  }`}
                >
                  {shouldResetProgress ? "Vybráno k resetu" : "Resetovat pokrok"}
                </button>
              </div>

              <hr className={theme.border} />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-red-500">
                    Trvalé odstranění účtu
                  </h4>
                  <p className={`text-xs leading-normal ${theme.textMuted}`}>
                    Kompletně smaže tvůj uživatelský profil z databáze JAZYQ včetně všech statistik bez možnosti obnovy.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="w-full sm:w-44 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition shadow-xs shrink-0 cursor-pointer text-center justify-center"
                >
                  Smazat účet navždy
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SPODNÍ DYNAMICKÉ TLAČÍTKO */}
      <div className={`pt-4 border-t flex justify-center ${theme.border}`}>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className={`w-full sm:w-auto px-8 py-3 text-sm font-medium rounded-2xl active:scale-[0.98] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border ${
            shouldResetProgress 
              ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/70" 
              : (appTheme === 'dark' ? "bg-white text-black border-white hover:bg-gray-200" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900")
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Ukládám...
            </>
          ) : shouldResetProgress ? (
            <>
              <span className="flex h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
              Uložit a resetovat pokrok!
            </>
          ) : (
            "Uložit a pokračovat ve studiu"
          )}
        </button>
      </div>

    </div>
  );
}