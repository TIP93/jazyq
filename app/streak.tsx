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

  // --- DYNAMICKÝ VÝPOČET MILNÍKŮ (14 -> 30 -> 60 -> 90 -> 90+90...) ---
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
      // Nekonečná smyčka po 90 dnech (90, 180, 270...)
      const cycle = Math.floor((currentStreak - 60) / 90);
      currentMilestoneTarget = 60 + (cycle + 1) * 90;
      previousMilestoneTarget = 60 + cycle * 90;
    }

    // Výpočet procent do progress baru (bereme v úvahu posun od minulého milníku)
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
    <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-8 shadow-sm">
      
      {/* HERO SECTION: Ohýnek */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-orange-50 rounded-2xl">
        <div className={`text-4xl ${streak > 0 ? "animate-pulse" : "grayscale opacity-60"}`}>
          🔥
        </div>
      </div>

      {/* SÉRIE S TEXTEM */}
      <div className="space-y-1">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          {streak} {streak === 1 ? 'den' : (streak > 1 && streak < 5 ? 'dny' : 'dní')} v řadě
        </h1>
        <p className="text-sm text-gray-500">
          {streak > 0 
            ? "Pokračuj v pravidelném učení. Každý den posiluje tvou paměť."
            : "Začni svou sérii ještě dnes. Stačí jedno cvičení denně."
          }
        </p>
      </div>

      {/* MODERNÍ PROGRESS BAR A ODMĚNA */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4 text-left">
        <div className="flex justify-between items-end text-sm">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Aktuální cíl</span>
            <p className="font-semibold text-gray-900">{milestone.target} dní pravidelnosti</p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-white px-2.5 py-1 rounded-lg border border-gray-200/60 shadow-2xs">
            {milestone.remaining === 0 ? "Splněno!" : `Zbývá ${milestone.remaining} ${milestone.remaining === 1 ? 'den' : (milestone.remaining > 1 && milestone.remaining < 5 ? 'dny' : 'dní')}`}
          </span>
        </div>

        {/* Samotná linka pokroku */}
        <div className="w-full h-2 bg-gray-200/70 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black rounded-full transition-all duration-700 ease-out"
            style={{ width: `${milestone.percentage}%` }}
          />
        </div>

        {/* Decentní info o prémiu */}
        <div className="flex items-start gap-3 pt-1 text-xs text-gray-600 border-t border-gray-200/50 mt-2">
          <GiftIcon size={16} className="text-gray-900 shrink-0 mt-0.5" />
          <p className="leading-normal">
            {milestone.remaining === 0 ? (
              <span className="font-medium text-green-600">Gratulujeme! Odemkl jsi týdenní Premium členství zdarma.</span>
            ) : (
              <>Dosáhni tohoto cíle a získej <strong>týdenní Premium členství zdarma</strong> jako poděkování za tvou píli.</>
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
          className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-medium hover:bg-gray-800 active:scale-[0.98] transition-all shadow-xs"
        >
          Pokračovat ve studiu
        </button>
      </div>

    </div>
  );
}