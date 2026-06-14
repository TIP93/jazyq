// print.tsx
"use client";

import React from "react";
import { Globe, BookOpen, Calendar, Sparkles, Languages, Lightbulb, FileText } from "lucide-react";

// Tady definujeme, co přesně tato komponenta přijímá za data z page.tsx
interface PrintLayoutProps {
  language: string;
  level: string;
  content: any; // Zjednodušeno, aby to přesně sedělo na tvůj allLevels?.levels?.[level]
  pdfWithTranslations: boolean;
  languages: { code: string; flag: string }[]; // ZDE OPRAVENO: z 'name' na 'flag'
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({
  language,
  level,
  content,
  pdfWithTranslations,
  languages,
}) => {
  return (
    <div className="print-only relative w-[210mm] h-[297mm] max-h-[297mm] text-slate-900 pt-[12mm] pb-[12mm] px-[11mm] flex flex-col justify-between box-border font-['Inter',sans-serif] bg-white antialiased">
      
      {/* HEADER */}
      <div className="w-full flex flex-col items-center mb-4">
        <div className="font-['Poppins',sans-serif] text-4xl font-black tracking-[0.2em] text-slate-950 mb-2">
          JAZYQ
        </div>
        
        <div className="font-['Inter',sans-serif] text-[10px] text-slate-400 uppercase tracking-[0.15em] flex items-center gap-3 mb-4 font-semibold">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Globe size={12} className="text-slate-400" /> 
            {languages.find(l => l.code === language)?.code || "Zahraniční"}
          </span>
          <span className="w-1 h-1 bg-slate-200 rounded-full" />
          <span className="flex items-center gap-1.5 text-slate-500">
            <BookOpen size={12} className="text-slate-400" /> Úroveň {level}
          </span>
          <span className="w-1 h-1 bg-slate-200 rounded-full" />
          <span className="flex items-center gap-1.5 text-slate-500">
            <Calendar size={12} className="text-slate-400" /> 
            {new Date().toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
        
        <div className="w-full border-b border-slate-100" />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col justify-start gap-8 mt-8">
        
        {/* SLOVÍČKO DNE */}
        <div className="relative bg-slate-50/40 rounded-2xl p-5 border border-slate-200/60">
          <div className="absolute -top-3 left-5 z-10 bg-white px-2.5 font-['Poppins',sans-serif] text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 flex items-center gap-2 select-none h-5">
            <Sparkles size={14} className="text-slate-400" />
            Slovíčko dne
          </div>
          <h1 className="font-['Poppins',sans-serif] text-3xl font-bold tracking-wide text-slate-950 mb-1 leading-tight">
            {content?.wordForeign}
          </h1>
          <p className="font-['Inter',sans-serif] text-sm font-normal text-slate-500 leading-relaxed">
            {content?.wordNative}
          </p>
        </div>

        {/* SEKCE: PŘÍKLAD */}
        <div className="relative bg-slate-50/40 rounded-2xl p-5 border border-slate-200/60">
          <div className="absolute -top-3 left-5 z-10 bg-white px-2.5 font-['Poppins',sans-serif] text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 flex items-center gap-2 select-none h-5">
            <Languages size={14} className="text-slate-400" />
            Příkladová věta
          </div>
          <p className="font-['Inter',sans-serif] text-sm font-semibold text-slate-900 tracking-wide leading-relaxed mb-1.5">
            {content?.wordExampleForeign}
          </p>
          {pdfWithTranslations ? (
            <p className="font-['Inter',sans-serif] text-sm font-normal text-slate-500 leading-relaxed">
              {content?.wordExampleNative}
            </p>
          ) : (
            <div className="w-full h-10 bg-slate-100/50 border-l-2 border-indigo-400 rounded-r-md mt-2 select-none" />
          )}
        </div>

        {/* SEKCE: GRAMATIKA */}
        <div className="relative bg-slate-50/40 rounded-2xl p-5 border border-slate-200/60">
          <div className="absolute -top-3 left-5 z-10 bg-white px-2.5 font-['Poppins',sans-serif] text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 flex items-center gap-2 select-none h-5">
            <Lightbulb size={14} className="text-slate-400" />
            Gramatika
          </div>
          <p className="font-['Inter',sans-serif] text-sm font-normal text-slate-600 leading-relaxed mb-3">
            {content?.grammarExplanation}
          </p>
          <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
            <p className="font-['Inter',sans-serif] text-sm font-semibold text-slate-900 tracking-wide">
              {content?.grammarExample}
            </p>
          </div>
        </div>

        {/* SEKCE: PŘEKLAD GRAMATIKY */}
        <div className="relative bg-slate-50/40 rounded-2xl p-5 border border-slate-200/60">
          <div className="absolute -top-3 left-5 z-10 bg-white px-2.5 font-['Poppins',sans-serif] text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 flex items-center gap-2 select-none h-5">
            <BookOpen size={14} className="text-slate-400" />
            Překlad gramatiky
          </div>
          <p className="font-['Inter',sans-serif] text-sm font-semibold text-slate-900 tracking-wide leading-relaxed mb-1.5">
            {content?.grammarTranslationOrig}
          </p>
          {pdfWithTranslations ? (
            <p className="font-['Inter',sans-serif] text-sm font-normal text-slate-500 leading-relaxed">
              {content?.grammarTranslationCz}
            </p>
          ) : (
            <div className="w-full h-10 bg-slate-100/50 border-l-2 border-indigo-400 rounded-r-md mt-2 select-none" />
          )}
        </div>

        {/* SEKCE: ČTENÍ / READING */}
        <div className="relative bg-slate-50/40 rounded-2xl p-5 border border-slate-200/60">
          <div className="absolute -top-3 left-5 z-10 bg-white px-2.5 font-['Poppins',sans-serif] text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 flex items-center gap-2 select-none h-5">
            <FileText size={14} className="text-slate-400" />
            Čtení
          </div>
          <p className="font-['Inter',sans-serif] text-sm font-semibold text-slate-900 tracking-wide leading-relaxed mb-2">
            {content?.readingForeign}
          </p>
          {pdfWithTranslations ? (
            <p className="font-['Inter',sans-serif] text-sm font-normal text-slate-500 leading-relaxed">
              {content?.readingNative}
            </p>
          ) : (
            <div className="w-full h-20 bg-slate-100/50 border-l-2 border-indigo-400 rounded-r-md mt-3 select-none" />
          )}
        </div>

      </div>

      {/* FOOTER */}
      <div className="w-full flex flex-col items-center mt-5">
        <div className="w-full border-t border-slate-100 mb-3" />
        <div className="font-['Poppins',sans-serif] text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] mb-1">
          tvoje denní pětiminutovka
        </div>
        <div className="font-['Inter',sans-serif] text-[11px] text-slate-500 font-bold tracking-wider">
          www.jazyq.cz
        </div>
      </div>

    </div>
  );
};