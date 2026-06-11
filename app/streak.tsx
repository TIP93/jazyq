"use client";

import { CheckIcon, XIcon, GiftIcon } from "lucide-react";

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
      
      {/* ŠIROKÝ DVOU-SLOUPCOVÝ GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEVÝ SLOUPEC (md:col-span-5) - Kompletně vycentrovaný plamínek + dáreček pod ním */}
        <div className="md:col-span-5 flex flex-col items-center text-center space-y-6 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
          
          {/* KULATÝ PROGRESS BAR KOLEM OHÝNKU */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" className="stroke-gray-100 fill-none" strokeWidth="3" />
              <circle 
                cx="50" 
                cy="50" 
                r="44" 
                className={`fill-none transition-all duration-700 ease-out ${streak > 0 ? "stroke-orange-500" : "stroke-gray-300"}`} 
                strokeWidth="4" 
                strokeDasharray="276.4"
                strokeDashoffset={276.4 - (276.4 * milestone.percentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className={`text-5xl transition-transform duration-300 ${streak > 0 ? "animate-pulse scale-105" : "grayscale opacity-50"}`}>
              🔥
            </div>
          </div>

          {/* SÉRIE S TEXTEM */}
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 leading-tight">
              {streak} {streak === 1 ? 'den' : (streak > 1 && streak < 5 ? 'dny' : 'dní')} v řadě
            </h1>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">
              CÍL: {milestone.target} DNÍ
            </p>
          </div>

          {/* BLOK S DÁREČKEM PŘESUNUTÝ SEM DOLŮ (POD PLAMÍNEK) */}
          <div className="w-full flex flex-row items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50/30 border border-amber-100 rounded-2xl p-4 text-left shadow-xs">
            <div className="flex-shrink-0 p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
              <GiftIcon size={18} className="stroke-[2.5px]" />
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-amber-950 leading-snug">
                {milestone.remaining === 0 ? (
                  <span className="font-bold text-green-700">Skvělé! Odemkl jsi týdenní Premium zdarma.</span>
                ) : (
                  <>
                    Zbývá <strong>{milestone.remaining} {milestone.remaining === 1 ? 'den' : (milestone.remaining > 1 && milestone.remaining < 5 ? 'dny' : 'dní')}</strong> do získání <span className="font-medium">Premium na týden zdarma</span>.
                  </>
                )}
              </p>
            </div>
          </div>

        </div>

        {/* PRAVÝ SLOUPEC (md:col-span-7) - Grid a Statistiky */}
        <div className="md:col-span-7 space-y-6">
          
          {/* DYNAMICKÝ TÝDENNÍ GRID */}
          <div className="grid grid-cols-7 gap-2">
            {dynamicWeek.map((d, i) => {
              const base = `h-16 rounded-2xl flex flex-col items-center justify-center text-xs font-medium transition-all ${
                d.isToday 
                  ? "shadow-sm border-2 z-10 scale-[1.06] bg-white" 
                  : "border bg-transparent"
              }`;

              if (d.status === "done") {
                const labelWeight = d.isToday ? "font-bold text-gray-900 text-xs" : "text-[10px] font-bold text-green-700/70";
                
                return (
                  <div 
                    key={i} 
                    className={`${base} ${
                      d.isToday 
                        ? 'border-green-500 bg-green-50/20' 
                        : 'border-green-300 bg-green-50/40'
                    } text-green-600`}
                  >
                    <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
                    <CheckIcon size={d.isToday ? 18 : 14} className={d.isToday ? "stroke-[3px]" : ""} />
                  </div>
                );
              }

              if (d.status === "missed") {
                const labelWeight = d.isToday ? "font-bold text-red-500 text-xs" : "text-[10px] text-red-400";
                
                return (
                  <div 
                    key={i} 
                    className={`${base} ${
                      d.isToday 
                        ? 'border-red-300 bg-red-50/30 text-red-500' 
                        : 'border-red-100 bg-red-50/10 text-red-400'
                    }`}
                  >
                    <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
                    <XIcon size={d.isToday ? 18 : 14} className={d.isToday ? "stroke-[2.5px]" : "opacity-80"} />
                  </div>
                );
              }

              const labelWeight = d.isToday ? "font-bold text-gray-900 text-xs" : "text-[10px] text-gray-400";
              return (
                <div key={i} className={`${base} border-dashed border-gray-200 text-gray-300 bg-transparent`}>
                  <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
                  <span className="text-base leading-none">•</span>
                </div>
              );
            })}
          </div>

          {/* MINI STATS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-center">
              <p className="text-xs text-gray-400 font-medium">Nejdelší série</p>
              <p className="text-xl font-semibold text-gray-800 mt-0.5">
                {stats.max_streak} {stats.max_streak === 1 ? 'den' : (stats.max_streak > 1 && stats.max_streak < 5 ? 'dny' : 'dní')}
              </p>
            </div>

            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-center">
              <p className="text-xs text-gray-400 font-medium">Celkem odpracováno</p>
              <p className="text-xl font-semibold text-gray-800 mt-0.5">
                {loggedDays.length > 0 ? loggedDays.length : streak} {loggedDays.length === 1 ? 'den' : (loggedDays.length > 1 && loggedDays.length < 5 ? 'dny' : 'dní')}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* SPODNÍ AKČNÍ TLAČÍTKO */}
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