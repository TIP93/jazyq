"use client";

import { CheckIcon, XIcon } from "lucide-react";

// Rozšíříme rozhraní o pole přihlášených dnů (formát "YYYY-MM-DD")
interface StreakPageProps {
  stats: {
    current_streak: number;
    max_streak: number;
    logged_days?: string[]; // Nepovinné, pokud data ještě netečou, ošetříme fallbackem
  };
  setView: (view: "learn" | "streak") => void;
}

export default function StreakPage({ stats, setView }: StreakPageProps) {
  const streak = stats.current_streak;
  const loggedDays = stats.logged_days || [];

  // --- GENEROVÁNÍ DYNAMICKÉHO TÝDNE (Dnešek uprostřed, 3 dny zpět, 3 dny vpřed) ---
  const generateDynamicWeek = () => {
    const daysArr = [];
    const today = new Date();

    // Jména dnů pro české zobrazení
    const dayNames = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];

    // Projdeme od -3 do +3 (dnešek bude mít index offsetu 0, tedy přesně uprostřed)
    for (let offset = -3; offset <= 3; offset++) {
      const currentTargetDate = new Date();
      currentTargetDate.setDate(today.getDate() + offset);

      // Klíč pro porovnání s DB (YYYY-MM-DD v lokálním čase)
      const year = currentTargetDate.getFullYear();
      const month = String(currentTargetDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(currentTargetDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${dayStr}`;

      // Zjištění stavu dne
      let status: "done" | "missed" | "future" = "missed";
      
      if (offset > 0) {
        status = "future"; // Dny v budoucnosti
      } else if (loggedDays.includes(dateString)) {
        status = "done";   // Den nalezen v poli přihlášení z DB
      } else if (offset === 0 && streak > 0) {
        status = "done";   // Pojistka pro dnešek, pokud zápis proběhl, ale DB se nestihla refreshnout
      }

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
    <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-6">
      
      {/* FIRE ICON */}
      <div className="text-5xl">🔥</div>

      {/* STREAK NUMBER */}
      <h1 className="text-4xl font-semibold tracking-tight">
        {streak} {streak === 1 ? 'den' : (streak > 1 && streak < 5 ? 'dny' : 'dní')} v řadě
      </h1>

      {/* MOTIVATION */}
      <p className="text-gray-500 text-sm leading-relaxed">
        {streak > 0 
          ? "Skvělá práce. Každý den, kdy se vrátíš, posiluješ svoji jazykovou paměť. Konzistence je silnější než intenzita."
          : "Začni svoji sérii ještě dnes! Stačí jedna pětiminutovka denně."
        }
      </p>

      {/* TODAY STATUS */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <span className={`w-2 h-2 rounded-full ${streak > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
        {streak > 0 ? 'Dnes hotovo' : 'Dnes ještě neprocvičeno'}
      </div>

      {/* DYNAMICKÝ WEEK GRID (3-1-3) */}
      <div className="grid grid-cols-7 gap-2 pt-2">
        {dynamicWeek.map((d, i) => {
          const base = `h-16 rounded-2xl flex flex-col items-center justify-center text-xs font-medium transition border ${
            d.isToday ? "border-2 scale-[1.05]" : ""
          }`;

          const labelWeight = d.isToday ? "font-bold text-black text-xs" : "text-[10px] text-gray-400";

          if (d.status === "done") {
            return (
              <div key={i} className={`${base} bg-green-50 ${d.isToday ? 'border-green-500' : 'border-green-200'} text-green-600`}>
                <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
                <CheckIcon size={d.isToday ? 20 : 16} className={d.isToday ? "stroke-[3px]" : ""} />
              </div>
            );
          }

          if (d.status === "missed") {
            return (
              <div key={i} className={`${base} bg-gray-50 ${d.isToday ? 'border-red-400 text-red-500' : 'border-gray-200 text-gray-400'}`}>
                <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
                <XIcon size={d.isToday ? 20 : 16} className={d.isToday ? "stroke-[3px]" : ""} />
              </div>
            );
          }

          // Budoucí dny (status === "future")
          return (
            <div key={i} className={`${base} border-dashed border-gray-300 text-gray-300 bg-transparent`}>
              <span className={`${labelWeight} mb-1`}>{d.dayLabel}</span>
              <span className="text-lg leading-none">•</span>
            </div>
          );
        })}
      </div>

      {/* MINI STATS */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <div className="border border-gray-200 rounded-2xl p-3">
          <p className="text-xs text-gray-400">Nejdelší streak</p>
          <p className="font-medium">
            {stats.max_streak} {stats.max_streak === 1 ? 'den' : (stats.max_streak > 1 && stats.max_streak < 5 ? 'dny' : 'dní')}
          </p>
        </div>

        <div className="border border-gray-200 rounded-2xl p-3">
          <p className="text-xs text-gray-400">Celkem dní</p>
          <p className="font-medium">{loggedDays.length > 0 ? loggedDays.length : streak}</p>
        </div>
      </div>

      {/* CONTINUE CTA */}
      <button
        onClick={() => setView("learn")}
        className="mt-4 px-5 py-3 bg-black text-white rounded-2xl text-sm hover:opacity-90 transition"
      >
        Pokračovat ve studiu
      </button>

    </div>
  );
}