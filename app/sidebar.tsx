"use client";

import Image from "next/image";
import { Roboto } from "next/font/google";
import { 
  Globe, BookOpen, Crown, Calendar, User, Settings, LogOut 
} from "lucide-react";
import { Theme } from "./settings";

// Zachováváme instanci Roboto přímo zde, aby fungovala třída roboto.className u tlačítek
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["500"],
});

type Language = "en" | "de" | "es" | "fr" | "it";

interface SidebarProps {
  theme: any;
  currentTheme: Theme;
  language: Language;
  setLanguage: (lang: Language) => void;
  levels: string[];
  levelIndex: number;
  setLevelIndex: (index: number) => void;
  user: any;
  streakStats: { current_streak: number; max_streak: number; logged_days: string[] };
  setView: (view: "learn" | "streak" | "settings") => void;
  showLoginOptions: boolean;
  setShowLoginOptions: (show: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithSeznam: () => void;
  handleSignOut: () => Promise<void>;
  provider: string | null;
}

export default function Sidebar({
  theme,
  currentTheme,
  language,
  setLanguage,
  levels,
  levelIndex,
  setLevelIndex,
  user,
  streakStats,
  setView,
  showLoginOptions,
  setShowLoginOptions,
  signInWithGoogle,
  signInWithSeznam,
  handleSignOut,
  provider
}: SidebarProps) {
  
  const iconCircle = "w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center";

  return (
    <div className={`w-72 ${theme.card} border-r ${theme.border} ${theme.text} p-6 flex flex-col justify-between no-print`}>

      {/* TOP */}
      <div className="space-y-10">

        {/* LOGO */}
        <div>
          <h1 className="text-3xl font-light tracking-[0.25em]">
            JAZYQ
          </h1>
          <p className={`text-sm ${theme.textMuted} mt-2`}>
            tvoje denní pětiminutovka
          </p>
        </div>

        {/* LANGUAGE */}
        <div className="space-y-4">
          <p className={`text-xs uppercase ${theme.textMuted} flex items-center gap-2`}>
            <Globe size={16} />
            Jazyk
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              { code: "en", flag: "gb" },
              { code: "de", flag: "de" },
              { code: "es", flag: "es" },
              { code: "fr", flag: "fr" },
              { code: "it", flag: "it" },
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
                    ${language === l.code ? "ring-2 ring-black ring-offset-2 scale-110" : ""}
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
            }}
            className={`w-full cursor-pointer transition-all ${
              currentTheme === "dark" ? "accent-[#E2E8F0]" : "accent-black"
            }`}
          />

          <div className={`flex justify-between text-xs ${theme.textMuted}`}>
            {levels.map((l) => (
              <span key={l} className={levels[levelIndex] === l ? `font-bold ${theme.text}` : ""}>
                {l}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="space-y-3">

        {/* PREMIUM */}
        <div
          onClick={() => console.log("premium")}
          className={`border ${theme.border} ${theme.subPanel} rounded-2xl p-4 flex items-center gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition cursor-pointer`}
          >
          <div className="w-10 h-10 rounded-full border border-purple-200 bg-purple-50 flex items-center justify-center">
            <Crown size={18} className="text-purple-500" />
          </div>

          <div>
            <p className={`text-xs ${theme.textMuted}`}>Premium</p>
            <p className="text-sm font-medium">30 Kč za měsíc</p>
            <p className="text-xs text-purple-500 mt-0.5">
              Poslechy, historie a další
            </p>
          </div>
        </div>

        {/* HISTORY */}
        <div className={`relative border ${theme.border} ${theme.subPanel} rounded-2xl p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition cursor-pointer`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
              <Calendar size={18} className="text-gray-500" />
            </div>

            <div>
              <p className={`text-xs ${theme.textMuted}`}>Historie</p>
              <p className="text-sm">Předchozí dny</p>
            </div>
          </div>

          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center">
            <Crown size={11} className="text-purple-500" />
          </div>
        </div>

        {/* ACCOUNT */}
        <div className="space-y-2">

          {/* STREAK */}
          {user && (
            <div
              onClick={() => setView("streak")}
              className={`border ${theme.border} ${theme.subPanel} rounded-2xl p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition cursor-pointer`}
              >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-orange-200 bg-orange-50 flex items-center justify-center">
                  <span className="text-lg">🔥</span>
                </div>

                <div>
                  <p className={`text-xs ${theme.textMuted}`}>Série</p>
                  <p className="text-sm font-medium">
                    {streakStats.current_streak} {streakStats.current_streak === 1 ? "den" : (streakStats.current_streak > 1 && streakStats.current_streak < 5 ? "dny" : "dní")} v řadě
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* USER CARD & ACTION BUTTONS */}
          {user && (
            <>
              <div className={`border ${theme.border} ${theme.subPanel} rounded-2xl p-4 flex gap-3`}>
                <div className="flex-shrink-0 relative w-10 h-10">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className={`${iconCircle} w-10 h-10`}>
                      <User size={18} className="text-gray-500" />
                    </div>
                  )}

                  {provider && (provider === "google" || provider === "seznam") && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-5 h-5 shadow-sm border border-gray-100 flex items-center justify-center">
                      {provider === "google" && (
                        <img 
                          src="/google-logo.svg" 
                          alt="Google" 
                          className="w-3.5 h-3.5 select-none"
                          draggable={false}
                        />
                      )}
                      {provider === "seznam" && (
                        <img 
                          src="/seznam-logo-esko-18-cerna.svg" 
                          alt="Seznam" 
                          className="w-2.5 h-2.5 select-none"
                          draggable={false}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[10px] uppercase tracking-wider ${theme.textMuted}`}>
                      Free uživatel
                    </p>
                  </div>
                  <p className="text-sm font-medium truncate mt-1">
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 no-print">
                <button
  onClick={() => setView("settings")}
  className={`border ${theme.border} ${theme.subPanel} rounded-2xl py-2 px-3 flex items-center justify-center gap-2 text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition cursor-pointer`}
>
  <Settings size={14} />
  Nastavení
</button>

<button
  onClick={handleSignOut}
  className={`border ${theme.border} ${theme.subPanel} rounded-2xl py-2 px-3 flex items-center justify-center gap-2 text-sm hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition cursor-pointer`}
>
  <LogOut size={14} />
  Odhlásit
</button>
              </div>
            </>
          )}

          {/* ANONYMOUS / LOGIN OPTIONS */}
          {!user && (
            <>
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-out
                  transform origin-bottom
                  ${showLoginOptions ? "max-h-44 opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-2"}
                `}
              >
                <div className={`flex flex-col gap-3 pb-3 ${roboto.className}`}>
                  
                  {/* GOOGLE BUTTON */}
                  <button
                    onClick={signInWithGoogle}
                    type="button"
                    className="group relative h-10 px-3 min-w-max max-w-[400px] w-full bg-white border border-[#747775] rounded-[4px] text-[#1f1f1f] text-sm tracking-[0.25px] text-center select-none cursor-pointer overflow-hidden whitespace-nowrap align-middle outline-none transition-all duration-[0.218s]"
                  >
                    <div className="absolute inset-0 bg-[#303030] opacity-0 transition-opacity duration-[0.218s] group-hover:opacity-[8%] group-active:opacity-[12%] group-focus:opacity-[12%]" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[0.218s] group-hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] pointer-events-none rounded-[3px]" />

                    <div className="relative w-full h-full flex items-center justify-between flex-nowrap">
                      <div className="w-5 h-5 min-w-[20px] mr-2.5 flex items-center justify-center">
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }} className="w-full h-full">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                      </div>
                      <span className="flex-grow font-medium text-left overflow-hidden text-ellipsis align-top">
                        Pokračovat přes Google
                      </span>
                    </div>
                  </button>

                  {/* SEZNAM BUTTON */}
                  <button
                    onClick={signInWithSeznam}
                    type="button"
                    className="group relative h-10 px-3 min-w-max max-w-[400px] w-full bg-white border border-[#747775] rounded-[4px] text-[#1f1f1f] text-sm tracking-[0.25px] text-center select-none cursor-pointer overflow-hidden whitespace-nowrap align-middle outline-none transition-all duration-[0.218s]"
                  >
                    <div className="absolute inset-0 bg-[#303030] opacity-0 transition-opacity duration-[0.218s] group-hover:opacity-[8%] group-active:opacity-[12%] group-focus:opacity-[12%]" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[0.218s] group-hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] pointer-events-none rounded-[3px]" />

                    <div className="relative w-full h-full flex items-center justify-between flex-nowrap">
                      <div className="w-5 h-5 min-w-[20px] mr-2.5 flex items-center justify-center">
                        <Image 
                          src="/seznam-logo-esko-18-cerna.svg" 
                          alt="Seznam logo" 
                          width={20} 
                          height={20}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <span className="flex-grow font-medium text-left overflow-hidden text-ellipsis align-top">
                        Pokračovat přes Seznam
                      </span>
                    </div>
                  </button>

                </div>
              </div>

              {/* LOGIN TOGGLE BUTTON */}
<div
  onClick={() => setShowLoginOptions(!showLoginOptions)}
  className={`border ${theme.border} ${theme.subPanel} rounded-2xl p-4 flex items-center gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition cursor-pointer`}
>
  <div className={`w-10 h-10 rounded-full border ${theme.border} flex items-center justify-center flex-shrink-0 opacity-80`}>
    <User size={18} />
  </div>
  <div>
    <p className={`text-xs ${theme.textMuted}`}>Účet</p>
    <p className="text-sm font-medium">Přihlásit se</p>
  </div>
</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}