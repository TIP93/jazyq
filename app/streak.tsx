"use client";

import { CheckIcon, XIcon, GiftIcon } from "lucide-react";

interface StreakPageProps {
  stats: {
    current_streak: number;
    max_streak: number;
    logged_days?: string[];
  };
  setView: (view: "learn" | "streak") => void;
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
    <div className="w-full max-w-xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-8 shadow-sm">
      
      {/* KULATÝ PROGRESS BAR KOLEM OHÝNKU */}
      <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
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
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          {streak} {streak === 1 ? 'den' : (streak > 1 && streak < 5 ? 'dny' : 'dní')} v řadě
        </h1>
        <p className="text-sm text-gray-400">
          CÍL: {milestone.target} DNÍ
        </p>
      </div>

      {/* VYCENTROVANÝ ORANŽOVÝ BLOK OD KRAJE KE KRAJI */}
<div className="w-full flex flex-col items-center gap-3 bg-gradient-to-b from-amber-50 to-orange-50/30 border border-amber-100 rounded-2xl p-6 text-center shadow-xs">
  <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md transform -rotate-3 animate-bounce-slow">
    <GiftIcon size={22} className="stroke-[2.5px]" />
  </div>
  
  <div className="space-y-1">
    <p className="text-sm text-amber-900/80 max-w-sm mx-auto leading-relaxed">
      {milestone.remaining === 0 ? (
        <span className="font-bold text-green-700 block">Skvělé! Odemkl jsi týdenní Premium zdarma.</span>
      ) : (
        <>
          Zbývá <strong>{milestone.remaining} {milestone.remaining === 1 ? 'den' : (milestone.remaining > 1 && milestone.remaining < 5 ? 'dny' : 'dní')}</strong> do získání <span className="font-semibold text-amber-950">Premium členství na týden zdarma</span>.
        </>
      )}
    </p>
  </div>
</div>

      {/* DYNAMICKÝ TÝDENNÍ GRID */}
      <div className="grid grid-cols-7 gap-2.5 pt-2">
        {dynamicWeek.map((d, i) => {
          const base = `h-16 rounded-2xl flex flex-col items-center justify-center text-xs font-medium transition-all ${
            d.isToday 
              ? "shadow-sm border-2 z-10 scale-[1.06] bg-white" 
              : "border bg-transparent"
          }`;

          const labelWeight = d.isToday ? "font-bold text-gray-900 text-xs" : "text-[10px] text-gray-400";

          if (d.status === "done") {
            return (
              <div key={i} className={`${base} ${d.isToday ? 'border-green-500 bg-green-50/20' : 'border-green-100 bg-green-50/40'} text-green-600`}>
                <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
                <CheckIcon size={d.isToday ? 18 : 14} className={d.isToday ? "stroke-[3px]" : ""} />
              </div>
            );
          }

          if (d.status === "missed") {
            return (
              <div key={i} className={`${base} ${d.isToday ? 'border-red-400 text-red-500 bg-red-50/10' : 'border-gray-100 text-gray-400 bg-gray-50/20'}`}>
                <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
                <XIcon size={d.isToday ? 18 : 14} className={d.isToday ? "stroke-[3px]" : ""} />
              </div>
            );
          }

          return (
            <div key={i} className={`${base} border-dashed border-gray-200 text-gray-300`}>
              <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
              <span className="text-base leading-none">•</span>
            </div>
          );
        })}
      </div>

      {/* VYCENTROVANÉ MINI STATS */}
      <div className="grid grid-cols-2 gap-4 pt-2">
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

      {/* SUBTLE SUBTEXTOVÉ TLAČÍTKO */}
      <div className="pt-2">
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