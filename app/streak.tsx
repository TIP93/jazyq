"use client";

import { CheckIcon, XIcon, GiftIcon, Calendar, Flame, Trophy, Award, ArrowRight } from "lucide-react";

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
        dateNum: currentTargetDate.getDate(),
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
          <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl border border-orange-100">
            <Flame size={20} className="stroke-[2.5px]" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Série aktivních dní
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Sleduj svůj denní pokrok, plň milníky a odemykej odměny
            </p>
          </div>
        </div>
      </div>

      {/* DVOU-SLOUPCOVÝ MODERNÍ LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEVÝ PANEL (md:col-span-5) - Kruhový pokrok a stav milníku */}
        <div className="md:col-span-5 flex flex-col items-center text-center space-y-6 md:border-r md:border-gray-100 md:pr-8 pb-6 md:pb-0">
          
          {/* MODERNÍ KRUHOVÝ PROGRESS BAR */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" className="stroke-gray-100 fill-none" strokeWidth="2.5" />
              <circle 
                cx="50" 
                cy="50" 
                r="44" 
                className={`fill-none transition-all duration-1000 ease-out ${streak > 0 ? "stroke-orange-500" : "stroke-gray-300"}`} 
                strokeWidth="3.5" 
                strokeDasharray="276.4"
                strokeDashoffset={276.4 - (276.4 * milestone.percentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className={`text-4xl mb-0.5 ${streak > 0 ? "animate-pulse" : "grayscale opacity-50"}`}>🔥</span>
              <span className="text-2xl font-bold text-gray-900 leading-none">{streak}</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Dní v řadě</span>
            </div>
          </div>

          {/* DETAIL MILNÍKU */}
          <div className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
              <span>Aktuální cíl</span>
              <span className="text-orange-600">{milestone.target} dní</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${milestone.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-left pt-1">
              Dokončeno **{Math.round(milestone.percentage)}%** z cesty k dalšímu milníku.
            </p>
          </div>

          {/* STATISTIKY (Přesunuto do levého panelu pod cíl) */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="bg-white border border-gray-100 rounded-xl p-3 text-left shadow-xs">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Trophy size={14} className="text-amber-500" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Rekord</span>
              </div>
              <p className="text-base font-semibold text-gray-800">
                {stats.max_streak} {stats.max_streak === 1 ? 'den' : (stats.max_streak > 1 && stats.max_streak < 5 ? 'dny' : 'dní')}
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-3 text-left shadow-xs">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Award size={14} className="text-blue-500" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Celkem</span>
              </div>
              <p className="text-base font-semibold text-gray-800">
                {loggedDays.length > 0 ? loggedDays.length : streak} {loggedDays.length === 1 ? 'den' : (loggedDays.length > 1 && loggedDays.length < 5 ? 'dny' : 'dní')}
              </p>
            </div>
          </div>

        </div>

        {/* PRAVÝ PANEL (md:col-span-7) - Moderní kalendář a dárková sekce */}
        <div className="md:col-span-7 bg-gray-50/40 border border-gray-100 rounded-2xl p-6 space-y-6">
          
          {/* SEKCE: MODERNÍ HORIZONTÁLNÍ KALENDÁŘ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-medium text-sm">
              <Calendar size={16} className="text-gray-400" />
              <h3>Aktivita v tomto týdnu</h3>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {dynamicWeek.map((d, i) => {
                // Výchozí stylování pro moderní minimalistické dny
                let dayStyle = "bg-white border-gray-200 text-gray-600";
                let iconEl = <span className="text-lg leading-none font-semibold mt-1">{d.dateNum}</span>;

                if (d.status === "done") {
                  dayStyle = d.isToday 
                    ? "border-green-500 bg-green-50/30 text-green-700 font-bold ring-2 ring-green-100" 
                    : "border-green-200 bg-green-50/10 text-green-600";
                  iconEl = (
                    <div className={`rounded-full p-0.5 mt-1 ${d.isToday ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}>
                      <CheckIcon size={12} className="stroke-[3px]" />
                    </div>
                  );
                } else if (d.status === "missed") {
                  dayStyle = d.isToday
                    ? "border-red-400 bg-red-50/30 text-red-700 font-bold"
                    : "border-red-100 bg-transparent text-red-400/80";
                  iconEl = (
                    <div className={`rounded-full p-0.5 mt-1 ${d.isToday ? 'bg-red-400 text-white' : 'bg-red-50 text-red-400'}`}>
                      <XIcon size={12} className="stroke-[3px]" />
                    </div>
                  );
                } else if (d.status === "future") {
                  dayStyle = "border-dashed border-gray-200 text-gray-300 bg-transparent";
                  iconEl = <span className="text-gray-300 font-normal text-sm mt-1">•</span>;
                }

                return (
                  <div 
                    key={i} 
                    className={`h-20 border rounded-xl flex flex-col items-center justify-between py-2.5 transition-all text-center relative ${dayStyle}`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
                      {d.dayLabel}
                    </span>
                    {iconEl}
                    {d.isToday && (
                      <span className="absolute -bottom-1.5 px-1.5 bg-gray-900 text-[8px] text-white font-bold rounded-md uppercase tracking-wide scale-90">
                        Dnes
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEKCE: ODMĚNA (STYL INSPIROVANÝ PREMIUM UPGRADEM V NASTAVENÍ) */}
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50/40 border border-amber-100 rounded-2xl p-5 text-left shadow-xs">
            <div className="flex-shrink-0 p-3 bg-amber-500 text-white rounded-xl shadow-xs">
              <GiftIcon size={20} className="stroke-[2.5px]" />
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-950">
                {milestone.remaining === 0 ? "Odměna odemčena!" : "Odměna na dosah"}
              </h4>
              <p className="text-xs text-amber-900/80 leading-relaxed mt-0.5">
                {milestone.remaining === 0 ? (
                  <span className="font-semibold text-green-700">Skvělé! Právě jsi odemkl týdenní Premium výuku zdarma.</span>
                ) : (
                  <>
                    Udržuj oheň! Zbývá ti už jen <strong>{milestone.remaining} {milestone.remaining === 1 ? 'den' : (milestone.remaining > 1 && milestone.remaining < 5 ? 'dny' : 'dní')}</strong> studia k získání <span className="font-medium text-amber-950">JAZYQ Premium na týden zdarma</span>.
                  </>
                )}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* SPODNÍ AKČNÍ TLAČÍTKO */}
      <div className="pt-4 border-t border-gray-100 flex justify-center">
        <button
          onClick={() => setView("learn")}
          className="group cursor-pointer w-full sm:w-auto px-8 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-2xl hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-2"
        >
          Pokračovat ve studiu
          <ArrowRight size={14} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
        </button>
      </div>

    </div>
  );
}