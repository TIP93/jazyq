"use client";

import { CheckIcon, XIcon, GiftIcon, ArrowLeft, Flame, Trophy, Award, Target } from "lucide-react";

interface StreakPageProps {
  stats: {
    current_streak: number;
    max_streak: number;
    logged_days?: string[];
  };
  setView: (view: "learn" | "streak" | "settings") => void;
}

export default function StreakPage({ stats, setView }: StreakPageProps) {
  const streak = stats.current_streak;
  const loggedDays = stats.logged_days || [];

  // --- LOGIKA MILNÍKŮ (14 -> 30 -> 60 -> 90 -> 90+90...) ---
  const getMilestoneInfo = (currentStreak: number) => {
    let currentMilestoneTarget = 14;
    let previousMilestoneTarget = 0;

    if (currentStreak <= 14) {
      currentMilestoneTarget = 14;
      previousMilestoneTarget = 0;
    } else if (currentStreak <= 30) {
      currentMilestoneTarget = 30;
      previousMilestoneTarget = 14;
    } else if (currentStreak <= 60) {
      currentMilestoneTarget = 60;
      previousMilestoneTarget = 30;
    } else {
      const cycle = Math.floor((currentStreak - 60) / 90);
      currentMilestoneTarget = 60 + (cycle + 1) * 90;
      previousMilestoneTarget = 60 + cycle * 90;
    }

    const range = currentMilestoneTarget - previousMilestoneTarget;
    const earnedInCurrentRange = currentStreak - previousMilestoneTarget;
    const percentage = Math.min(Math.max((earnedInCurrentRange / range) * 100, 0), 100);

    return {
      target: currentMilestoneTarget,
      remaining: Math.max(currentMilestoneTarget - currentStreak, 0),
      percentage: percentage,
    };
  };

  const milestone = getMilestoneInfo(streak);

  // --- GENEROVÁNÍ DYNAMICKÉHO TÝDNE (3-1-3) ---
  const dayNames = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
  const generateDynamicWeek = () => {
    const daysArr = [];
    const today = new Date();
    
    for (let offset = -3; offset <= 3; offset++) {
      const currentTargetDate = new Date();
      currentTargetDate.setDate(today.getDate() + offset);
      const year = currentTargetDate.getFullYear();
      const month = String(currentTargetDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(currentTargetDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${dayStr}`;

      let status: "done" | "missed" | "future" = "missed";
      if (offset > 0) status = "future";
      else if (loggedDays.includes(dateString)) status = "done";
      else if (offset === 0 && streak > 0) status = "done";

      daysArr.push({
        dayLabel: dayNames[currentTargetDate.getDay()],
        isToday: offset === 0,
        status: status,
      });
    }
    return daysArr;
  };

  const dynamicWeek = generateDynamicWeek();

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 space-y-8 shadow-sm">
      
      {/* HLAVIČKA VE STYLU NASTAVENÍ */}
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
              Série aktivních dní
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Sleduj svůj denní pokrok a plň milníky pro získání odměn
            </p>
          </div>
        </div>
      </div>

      {/* NOVÝ STRUKTUROVANÝ LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEVÝ PANEL - Pouze dominantní ohýnek */}
        <div className="md:col-span-5 flex flex-col items-center text-center space-y-4 md:pt-10">
          {/* KULATÝ PROGRESS BAR KOLEM OHÝNKU */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" className="stroke-gray-100 fill-none" strokeWidth="2.5" />
              <circle 
                cx="50" 
                cy="50" 
                r="44" 
                className={`fill-none transition-all duration-700 ease-out ${streak > 0 ? "stroke-orange-500" : "stroke-gray-300"}`} 
                strokeWidth="3.5" 
                strokeDasharray="276.4"
                strokeDashoffset={276.4 - (276.4 * milestone.percentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className={`text-6xl transition-transform duration-300 ${streak > 0 ? "animate-pulse scale-105" : "grayscale opacity-50"}`}>
              🔥
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
              CÍL MILNÍKU
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {milestone.target} dní
            </p>
          </div>
        </div>

        {/* PRAVÝ PANEL - Tři bloky pod sebou, kalendář a spodní progress bar s dárkem */}
        <div className="md:col-span-7 bg-gray-50/40 border border-gray-100 rounded-2xl p-6 space-y-6">
          
          {/* TŘI ELEGANTNÍ BLOKY POD SEBOU (Styl menu / nastavení) */}
          <div className="space-y-2.5">
            {/* 1. Aktuální série */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                  <Flame size={16} className="stroke-[2.5px]" />
                </div>
                <span className="text-sm font-medium text-gray-600">Aktuální série</span>
              </div>
              <span className="text-base font-semibold text-gray-900">
                {streak} {streak === 1 ? 'den' : (streak > 1 && streak < 5 ? 'dny' : 'dní')}
              </span>
            </div>

            {/* 2. Nejdelší série */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                  <Trophy size={16} className="stroke-[2.5px]" />
                </div>
                <span className="text-sm font-medium text-gray-600">Nejdelší série</span>
              </div>
              <span className="text-base font-semibold text-gray-900">
                {stats.max_streak} {stats.max_streak === 1 ? 'den' : (stats.max_streak > 1 && stats.max_streak < 5 ? 'dny' : 'dní')}
              </span>
            </div>

            {/* 3. Celkem odpracováno */}
            <div className="bg-white border border-gray-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                  <Award size={16} className="stroke-[2.5px]" />
                </div>
                <span className="text-sm font-medium text-gray-600">Celkem odpracováno</span>
              </div>
              <span className="text-base font-semibold text-gray-900">
                {loggedDays.length > 0 ? loggedDays.length : streak} {loggedDays.length === 1 ? 'den' : (loggedDays.length > 1 && loggedDays.length < 5 ? 'dny' : 'dní')}
              </span>
            </div>
          </div>

          {/* KALENDÁŘ / TÝDENNÍ GRID */}
          <div className="space-y-2 pt-1">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 pl-1">Týdenní přehled aktivity</p>
            <div className="grid grid-cols-7 gap-2">
              {dynamicWeek.map((d, i) => {
                const base = `h-16 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all ${
                  d.isToday 
                    ? "shadow-sm border-2 z-10 scale-[1.04] bg-white" 
                    : "border bg-white"
                }`;

                if (d.status === "done") {
                  const labelWeight = d.isToday ? "font-bold text-gray-900 text-xs" : "text-[10px] font-bold text-green-700/70";
                  return (
                    <div 
                      key={i} 
                      className={`${base} ${
                        d.isToday ? 'border-green-500 bg-green-50/10' : 'border-green-200 bg-green-50/30'
                      } text-green-600`}
                    >
                      <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
                      <CheckIcon size={d.isToday ? 16 : 13} className={d.isToday ? "stroke-[3px]" : ""} />
                    </div>
                  );
                }

                if (d.status === "missed") {
                  const labelWeight = d.isToday ? "font-bold text-red-500 text-xs" : "text-[10px] text-red-400";
                  return (
                    <div 
                      key={i} 
                      className={`${base} ${
                        d.isToday ? 'border-red-300 bg-red-50/20' : 'border-red-100 bg-red-50/5'
                      } text-red-400`}
                    >
                      <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
                      <XIcon size={d.isToday ? 16 : 13} className={d.isToday ? "stroke-[2.5px]" : "opacity-80"} />
                    </div>
                  );
                }

                const labelWeight = d.isToday ? "font-bold text-gray-900 text-xs" : "text-[10px] text-gray-400";
                return (
                  <div key={i} className={`${base} border-dashed border-gray-200 text-gray-300 bg-white/60`}>
                    <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
                    <span className="text-base leading-none">•</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NOVÝ ČISTÝ PROGRESS BAR S PROCENTY A DÁREČKEM NA KONCI */}
          <div className="pt-2 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-400 pl-1">
              <span>Cesta k Premium zdarma</span>
              <span className="text-gray-600 bg-white border border-gray-200/80 px-2 py-0.5 rounded-md shadow-xs">
                {Math.round(milestone.percentage)} %
              </span>
            </div>
            
            <div className="flex items-center gap-3.5 bg-white border border-gray-200/60 rounded-2xl p-4 shadow-xs">
              {/* Samotná linka progress baru */}
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    milestone.remaining === 0 ? "bg-green-500" : "bg-gradient-to-r from-orange-500 to-amber-500"
                  }`}
                  style={{ width: `${milestone.percentage}%` }}
                />
              </div>

              {/* Ikonka dárku na konci linky */}
              <div 
                className={`flex-shrink-0 p-2 border rounded-xl transition-all ${
                  milestone.remaining === 0 
                    ? "bg-green-500 border-green-500 text-white animate-bounce" 
                    : "bg-gray-50 border-gray-200 text-gray-400"
                }`}
                title={milestone.remaining === 0 ? "Premium odemčeno!" : `Zbývá ${milestone.remaining} dní`}
              >
                <GiftIcon size={16} className="stroke-[2.5px]" />
              </div>
            </div>

            {/* Drobný subtext pod barem (už žádná velká barva) */}
            <p className="text-[11px] text-gray-400 pl-1">
              {milestone.remaining === 0 ? (
                <span className="text-green-600 font-medium">Mise splněna! Týdenní Premium máš aktivní.</span>
              ) : (
                <>
                  Zbývá odehrát <strong>{milestone.remaining} {milestone.remaining === 1 ? 'den' : (milestone.remaining > 1 && milestone.remaining < 5 ? 'dny' : 'dní')}</strong> pro odemčení cíle.
                </>
              )}
            </p>
          </div>

        </div>

      </div>

      {/* SPODNÍ DĚLÍCÍ LINKA A TLAČÍTKO */}
      <div className="pt-4 border-t border-gray-100 flex justify-center">
        <button
          onClick={() => setView("learn")}
          className="cursor-pointer w-full sm:w-auto px-8 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-2xl hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] transition-all shadow-xs"
        >
          Pokračovat ve studiu
        </button>
      </div>

    </div>
  );
}