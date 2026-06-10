"use client";

import { CheckIcon, XIcon, TargetIcon, ShieldAlertIcon } from "lucide-react";

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
  
  // Výpočet milníku (např. nejbližší násobek 7 nebo 5 dní)
  const nextMilestone = streak <= 7 ? 7 : Math.ceil((streak + 1) / 5) * 5;
  const progressToMilestone = (streak / nextMilestone) * 100;

  // ... (funkce generateDynamicWeek zůstává stejná jako v předchozím kroku)
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
    <div className="w-full max-w-2xl mx-auto bg-white border border-gray-100 rounded-3xl p-10 text-center space-y-8 shadow-sm">
      
      {/* 1. HERO POLOŽKA: Ohýnek s kruhovým indikátorem */}
      <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
        {/* SVG čistý minimalistický kruh na pozadí */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="stroke-gray-100 fill-none" strokeWidth="4" />
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            className={`fill-none transition-all duration-500 ${streak > 0 ? "stroke-orange-500" : "stroke-gray-300"}`} 
            strokeWidth="4" 
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * Math.min(progressToMilestone, 100)) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className={`text-5xl transition-transform duration-300 ${streak > 0 ? "animate-pulse scale-110" : "grayscale opacity-60"}`}>
          🔥
        </div>
      </div>

      {/* STREAK NUMBER */}
      <div className="space-y-1">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          {streak} {streak === 1 ? 'den' : (streak > 1 && streak < 5 ? 'dny' : 'dní')} v řadě
        </h1>
        {/* Drobný milník přímo pod číslem */}
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          <TargetIcon size={12} /> Cíl: {nextMilestone} dní ({nextMilestone - streak} zbývá)
        </p>
      </div>

      {/* MOTIVATION */}
      <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
        {streak > 0 
          ? "Skvělá práce. Každý den, kdy se vrátíš, posiluješ svoji jazykovou paměť. Konzistence je silnější než intenzita."
          : "Začni svoji sérii ještě dnes! Stačit bude jedna pětiminutovka."
        }
      </p>

      {/* DYNAMICKÝ WEEK GRID (Zvýrazněný layering pro dnešek) */}
      <div className="grid grid-cols-7 gap-2.5 pt-2">
        {dynamicWeek.map((d, i) => {
          const base = `h-16 rounded-2xl flex flex-col items-center justify-center text-xs font-medium transition-all ${
            d.isToday 
              ? "shadow-md border-2 z-10 scale-[1.08] bg-white" 
              : "border bg-transparent"
          }`;

          const labelWeight = d.isToday ? "font-bold text-gray-900 text-xs" : "text-[10px] text-gray-400";

          if (d.status === "done") {
            return (
              <div key={i} className={`${base} ${d.isToday ? 'border-green-500 bg-green-50/30' : 'border-green-100 bg-green-50/50'} text-green-600`}>
                <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
                <CheckIcon size={d.isToday ? 18 : 14} className={d.isToday ? "stroke-[3px]" : ""} />
              </div>
            );
          }

          if (d.status === "missed") {
            return (
              <div key={i} className={`${base} ${d.isToday ? 'border-red-400 text-red-500 bg-red-50/20' : 'border-gray-100 text-gray-400 bg-gray-50/30'}`}>
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

      {/* MINI STATS */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-left">
          <p className="text-xs text-gray-400 font-medium">Nejdelší série</p>
          <p className="text-xl font-semibold text-gray-800 mt-0.5">
            {stats.max_streak} {stats.max_streak === 1 ? 'den' : (stats.max_streak > 1 && stats.max_streak < 5 ? 'dny' : 'dní')}
          </p>
        </div>

        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-left">
          <p className="text-xs text-gray-400 font-medium">Celkem odpracováno</p>
          <p className="text-xl font-semibold text-gray-800 mt-0.5">
            {loggedDays.length > 0 ? loggedDays.length : streak} {loggedDays.length === 1 ? 'den' : (loggedDays.length > 1 && loggedDays.length < 5 ? 'dny' : 'dní')}
          </p>
        </div>
      </div>

      {/* CONTINUE CTA */}
      <div className="pt-2">
        <button
          onClick={() => setView("learn")}
          className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-medium hover:bg-gray-800 active:scale-[0.98] transition-all shadow-sm"
        >
          Pokračovat ve studiu
        </button>
      </div>

    </div>
  );
}