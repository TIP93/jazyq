"use client";

import { CheckIcon, XIcon } from "lucide-react";

// Nadefinujeme, jaká data musí hlavní page.tsx do této komponenty poslat
interface StreakPageProps {
  stats: {
    current_streak: number;
    max_streak: number;
  };
  setView: (view: "learn" | "streak") => void;
}

const mockStreakDays = [
  { day: "Po", status: "done" },
  { day: "Út", status: "done" },
  { day: "St", status: "missed" },
  { day: "Čt", status: "today" },
  { day: "Pá", status: "today" },
  { day: "So", status: "future" },
  { day: "Ne", status: "future" },
];

export default function StreakPage({ stats, setView }: StreakPageProps) {
  const streak = stats.current_streak;

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

      {/* WEEK GRID */}
      <div className="grid grid-cols-7 gap-2 pt-2">
        {mockStreakDays.map((d, i) => {
          const base =
            "h-16 rounded-2xl flex flex-col items-center justify-center text-xs font-medium transition border";

          if (d.status === "done") {
            return (
              <div key={i} className={`${base} bg-green-50 border-green-200 text-green-600`}>
                <span className="text-[10px] text-gray-400 mb-1">{d.day}</span>
                <CheckIcon size={16} />
              </div>
            );
          }

          if (d.status === "missed") {
            return (
              <div key={i} className={`${base} bg-gray-50 border-gray-200 text-gray-400`}>
                <span className="text-[10px] text-gray-400 mb-1">{d.day}</span>
                <XIcon size={16} />
              </div>
            );
          }

          if (d.status === "today") {
            return (
              <div key={i} className={`${base} bg-green-100 border-green-400 text-green-700 border-2 scale-[1.02]`}>
                <span className="text-[10px] text-green-700 mb-1 font-medium">{d.day}</span>
                <CheckIcon size={22} />
              </div>
            );
          }

          return (
            <div key={i} className={`${base} border-dashed border-gray-300 text-gray-300 bg-transparent`}>
              <span className="text-[10px] text-gray-300 mb-1">{d.day}</span>
              <span className="text-lg">•</span>
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
          <p className="font-medium">43</p> {/* Zde pak můžeš obdobně napojit total count */}
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