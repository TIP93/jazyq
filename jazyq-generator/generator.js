import dotenv from "dotenv"; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

dotenv.config();

// Inicializace pomocí klíče z .env souboru
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

const languages = ["it"];
const levels = ["A1"];

// const languages = ["en", "it", "es", "de", "fr"];
// const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function generateAll() {
  // Ujistíme se, že složka pro výstup existuje
  if (!fs.existsSync("./output")) {
    fs.mkdirSync("./output");
  }

  for (const lang of languages) {
    for (const level of levels) {
      console.log(`\n--------------------------------------------------`);
      console.log(`🚀 START: ${lang.toUpperCase()} - ${level}`);
      console.log(`--------------------------------------------------`);
      
      const fileName = `./output/${lang}_${level}_60days.json`;
      
      // Ochrana před přepsáním hotové práce
      if (fs.existsSync(fileName)) {
        console.log(`ℹ️ Soubor ${fileName} už existuje. Přeskakuji.`);
        continue;
      }

      try {
        // ==========================================
        // KROK A: GENERACE 60DENNÍ OSNOVY (SYLLABUS)
        // ==========================================
        console.log(`📋 1. Generuji 60denní osnovu slovíček a gramatiky...`);
        
        const syllabusPrompt = `
          You are an academic language curriculum designer. Create a precise, highly diverse 60-day syllabus for:
          Language: ${lang === 'en' ? 'British English' : lang}
          CEFR Level: ${level}

          Generate a layout for 60 days. For each day (1 to 60), pick:
          1. One vocabulary word (noun, verb, or adjective only) appropriate for this CEFR level. 
          2. One grammarFamily (broad category appropriate for ${level}).
          3. One grammarPattern which MUST be a minimalist structural formula or a single keyword/trigger (e.g., "already" for Present Perfect, "never + auxiliary" for Inversion, or "as... as" for Comparatives). Keep it strictly under 3-4 words. Do NOT write full sentences or textbook titles.
          4. One grammarContext (situation or topic).

          STRICT VARIETY AND DISTRIBUTION RULES (Apply to ALL levels and languages):
          - No duplicate vocabulary words across the 60 days.
          - MANDATORY GRAMMAR DIVERSITY: You MUST introduce at least 12 to 15 DISTINCT grammarFamilies across the 60 days. Do NOT just loop the same 4 or 5 basic categories.
          - EVEN DISTRIBUTION: To prevent clustering, a single grammarFamily can repeat a MAXIMUM of 4 to 5 times in total across the entire 60-day curriculum. Spread them out evenly.
          - ATOMIC UNIQUE PATTERNS: Every single day MUST have a completely unique grammarPattern. Even if a grammarFamily repeats, the specific atomic rule (grammarPattern) must be a completely different sub-rule or usage nuance.
          - ALL categories, patterns, and words must strictly match the pedagogical expectations of the CEFR ${level} level for ${lang}.

          Return ONLY a valid JSON array. No markdown, no explanation.
          [
            { "day": 1, "word": "...", "grammarFamily": "...", "grammarPattern": "...", "grammarContext": "..." }
          ]
        `;

        // OPRAVA: Zde chybělo reálné zavolání API!
        const syllabusResult = await model.generateContent(syllabusPrompt);
        const rawSyllabusText = syllabusResult.response.text();
        
        // Bezpečné oříznutí JSONu
        const cleanSyllabusJson = rawSyllabusText.substring(
          rawSyllabusText.indexOf("["),
          rawSyllabusText.lastIndexOf("]") + 1
        );

        const syllabus = JSON.parse(cleanSyllabusJson);
        console.log(`✅ Osnova úspěšně vytvořena (${syllabus.length} dní).`);
        
        await delay(4000); // Pauza pro ochranu rate-limitu

        // ==========================================
        // KROK B: GENERACE OBSAHU PO 10DENNÍCH DÁVKÁCH
        // ==========================================
        let allDaysContent = [];
        let usedWordsInTexts = []; // Tady budeme sbírat slova, co už prošla textem
        const chunkSize = 10;

        for (let i = 0; i < syllabus.length; i += chunkSize) {
          const chunk = syllabus.slice(i, i + chunkSize);
          const startDay = i + 1;
          const endDay = i + chunk.length;
          
          console.log(`✍️ 2. Generuji textový obsah pro dny ${startDay} až ${endDay}...`);

          const contentPrompt = `
            You are a structured language learning generator. Generate full learning units for days ${startDay} to ${endDay} based on this input syllabus:
            ${JSON.stringify(chunk)}

            CRITICAL BLACKLIST FOR DUPLICITY PROTECTION:
            To maintain rich vocabulary variety, do NOT use any of the following words in your generated texts (readingForeign, listeningForeign, examples) unless it is the specific "word" assigned for that day in the syllabus:
            ${usedWordsInTexts.length > 0 ? usedWordsInTexts.join(", ") : "None yet"}

            For each item, strictly fill the following JSON keys:
            - day (number)
            - language: "${lang}"
            - level: "${level}"
            - wordForeign: (The word from input. For nouns in languages with grammatical gender, ALWAYS include the definite article, e.g., "il libro", "la maison", "der Tisch")
            - wordNative: (Czech translation of the word)
            - wordExampleForeign: (A sentence naturally including wordForeign. Length: A1-A2: 8-12 words, B1-C1: 10-15 words)
            - wordExampleNative: (Natural Czech translation of wordExampleForeign)
            - grammarFamily: (From input)
            - grammarPattern: (From input)
            - grammarContext: (From input)
            - grammarExplanation: (Short grammar reminder in Czech, max 20 words, simple usage hint)
            - grammarExample: (A sentence clearly demonstrating grammarPattern. Length: 5-12 words. Independent from wordExampleForeign)
            - grammarTranslationOrig: (A new sentence in ${lang} preserving grammarPattern)
            - grammarTranslationCz: (Natural Czech translation of grammarTranslationOrig)
            - readingForeign: (Coherent mini-text in ${lang}. MUST naturally include wordForeign AND clearly demonstrate grammarPattern multiple times. Length: STRICTLY 45-55 words. Matches ${level} difficulty)
            - readingNative: (Natural Czech translation of readingForeign)
            - listeningForeign: (A natural, spoken-style monologue or dialogue in ${lang} designed to be roughly 1 minute long when spoken. It MUST naturally include "wordForeign" at least once. Length guidelines: A1-A2: 60-90 words; B1-B2: 100-120 words; C1-C2: 130-150 words.)
            - listeningCzech: (Direct, natural, conversational Czech translation of listeningForeign.)
            - listeningAudioPrompt: (A short English instruction for a Text-to-Speech AI engine describing the speaker and tone.)

            Constraints:
            - Target language for English is strictly British English (use British spelling where appropriate).
            - vocabulary sentence != grammar sentence != reading text != listening text (independent systems).
            
            Return ONLY a valid JSON array. No markdown, no conversation. Start with [ and end with ].
          `;

          const contentResult = await model.generateContent(contentPrompt);
          const rawContentText = contentResult.response.text();
          
          const cleanContentJson = rawContentText.substring(
            rawContentText.indexOf("["),
            rawContentText.lastIndexOf("]") + 1
          );

          const parsedChunk = JSON.parse(cleanContentJson);
          allDaysContent = allDaysContent.concat(parsedChunk);
          
          // OCHRANA: Vytáhneme nově vygenerovaná slova a přidáme je do blacklistu pro příští vlnu
          parsedChunk.forEach(item => {
            if (item.wordForeign) {
              // Uložíme čisté slovo bez členu (např. "libro" místo "il libro") pro lepší shodu v textu
              const cleanWord = item.wordForeign.split(" ").pop();
              usedWordsInTexts.push(cleanWord);
            }
          });
          
          console.log(`   -> Dny ${startDay}-${endDay} hotovy. Blacklist obsahuje ${usedWordsInTexts.length} slov.`);
          await delay(5000);
        }

        // Uložení celého 60denního balíku pro danou kombinaci
        fs.writeFileSync(fileName, JSON.stringify(allDaysContent, null, 2));
        console.log(`🎉 KOMPLETNÍ BALÍK ULOŽEN DO: ${fileName}`);

      } catch (error) {
        console.error(`❌ CHYBA u kombinace ${lang.toUpperCase()}-${level}:`, error.message);
        console.log("Zkouším pokračovat dalším v pořadí...");
      }

      await delay(6000); // Větší pauza před dalším celým cyklem
    }
  }
  console.log("\n🏁 VŠECHNY JAZYKY A ÚROVNĚ BYLY ÚSPĚŠNĚ VYGENEROVÁNY!");
}

generateAll();