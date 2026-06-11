"use client";

import { CheckIcon, XIcon, GiftIcon, ArrowLeft } from "lucide-react";

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
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      
      {/* HLAVIČKA VE STYLU NASTAVENÍ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("learn")}
            className="p-2 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft size={18} className="stroke-[2.5px]" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Série aktivních dní
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Sleduj svůj denní pokrok a plň milníky pro získání odměn
            </p>
          </div>
        </div>
      </div>

      {/* VYBALANCOVANÝ DUÁLNÍ PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* LEVÝ PANEL - Dominantní ohýnek */}
        <div className="md:col-span-5 flex flex-col items-center justify-center text-center border border-gray-100 rounded-2xl p-6 bg-gray-50/10 space-y-6">
          
          {/* KULATÝ PROGRESS BAR KOLEM OHÝNKU */}
          <div className="relative w-36 h-36 flex items-center justify-center">
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
            <div className={`text-5xl transition-transform duration-300 ${streak > 0 ? "animate-pulse scale-105" : "grayscale opacity-50"}`}>
              🔥
            </div>
          </div>

          {/* SÉRIE TEXT */}
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
              {streak} {streak === 1 ? 'den' : (streak > 1 && streak < 5 ? 'dny' : 'dní')} v řadě
            </h2>
            <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
              CÍL: {milestone.target} DNÍ
            </p>
          </div>
        </div>

        {/* PRAVÝ PANEL - Více vzdušný kalendář a progress bar (statistiky zakomentovány) */}
        <div className="md:col-span-7 bg-gray-50/40 border border-gray-100 rounded-2xl p-6 space-y-8 flex flex-col justify-center">
          
          {/* ZAKOMENTOVANÉ STATISTIKY (Kdyby ses k nim chtěl někdy vrátit)
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-200/60 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Nejdelší série</p>
                <p className="text-base font-semibold text-gray-800 mt-0.5">
                  {stats.max_streak} {stats.max_streak === 1 ? 'den' : (stats.max_streak > 1 && stats.max_streak < 5 ? 'dny' : 'dní')}
                </p>
              </div>

              <div className="bg-white border border-gray-200/60 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-xs">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Celkem odpracováno</p>
                <p className="text-base font-semibold text-gray-800 mt-0.5">
                  {loggedDays.length > 0 ? loggedDays.length : streak} {loggedDays.length === 1 ? 'den' : (loggedDays.length > 1 && loggedDays.length < 5 ? 'dny' : 'dní')}
                </p>
              </div>
            </div>
          */}

          {/* KALENDÁŘ / PROVZDUŠNĚNÝ TÝDENNÍ GRID */}
          <div className="space-y-2.5">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 pl-1">Týdenní přehled aktivity</p>
            <div className="grid grid-cols-7 gap-2">
              {dynamicWeek.map((d, i) => {
                // Zvětšena výška z h-14 na h-16 pro větší vzdušnost
                const base = `h-16 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all ${
                  d.isToday 
                    ? "shadow-sm border-2 z-10 scale-[1.03] bg-white" 
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

          {/* VĚTŠÍ A PROVZDUŠNĚNÁ CESTA K ODRAZE */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pl-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                Cesta k odměně
              </span>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100/70 px-2.5 py-0.5 rounded-full shadow-2xs">
                {Math.round(milestone.percentage)} %
              </span>
            </div>
            
            {/* Větší vnitřní padding p-5 pro dýchání prvků */}
            <div className="flex items-center gap-4 bg-white border border-gray-200/60 rounded-2xl p-5 shadow-xs relative overflow-visible">
              {/* Tlustší elegantní linka h-2.5 */}
              <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    milestone.remaining === 0 ? "bg-green-500" : "bg-gradient-to-r from-orange-500 to-amber-500"
                  }`}
                  style={{ width: `${milestone.percentage}%` }}
                />
              </div>

              {/* Výrazný elegantní dáreček */}
              <div 
                className={`flex-shrink-0 transition-all duration-300 transform rotate-12 hover:rotate-0 hover:scale-110 cursor-help ${
                  milestone.remaining === 0 
                    ? "text-green-500 drop-shadow-[0_4px_6px_rgba(34,197,94,0.3)] animate-bounce" 
                    : "text-orange-500 drop-shadow-[0_4px_6px_rgba(249,115,22,0.25)]"
                }`}
                title={milestone.remaining === 0 ? "Premium aktivováno!" : `Zbývá ${milestone.remaining} dní`}
              >
                <GiftIcon size={24} className="stroke-[2.2px]" />
              </div>
            </div>

            {/* Subtext */}
            <p className="text-xs text-gray-400 pl-1 leading-normal">
              {milestone.remaining === 0 ? (
                <span className="text-green-600 font-medium">Skvělé! Odemkl jsi týdenní Premium zdarma.</span>
              ) : (
                <>
                  Zbývá <strong>{milestone.remaining} {milestone.remaining === 1 ? 'den' : (milestone.remaining > 1 && milestone.remaining < 5 ? 'dny' : 'dní')}</strong> do získání <span className="font-medium text-gray-700">Premium na týden zdarma</span>.
                </>
              )}
            </p>
          </div>

        </div>

      </div>

      {/* SPODNÍ TLAČÍTKO */}
      <div className="pt-4 border-t border-gray-100 flex justify-center">
        <button
          onClick={() => setView("learn")}
          className="cursor-pointer w-full sm:w-auto px-8 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] transition-all shadow-xs"
        >
          Pokračovat ve studiu
        </button>
      </div>

    </div>
  );
}