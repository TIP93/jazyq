import { NextResponse } from "next/server";

const buildLevel = (level: string) => {
  switch (level) {
    case "A0":
      return {
        word: {
          foreign: "Apple",
          czech: "jablko",
        },
        wordExample: "I eat an apple every day.",
        wordExampleTranslation: "Jím jablko každý den.",
        translation: {
          cz: "To je moje kniha.",
          answer: "This is my book.",
        },
        grammar: {
          explanation: "Používáme 'a/an' před podstatnými jmény v jednotném čísle.",
          example: "I have a dog.",
          exampleCz: "Mám psa.",
        },
        reading:
          "Tom is a boy. He likes apples and dogs. He goes to school every day.",
        readingCz:
          "Tom je chlapec. Má rád jablka a psy. Každý den chodí do školy.",
      };

    case "A1":
      return {
        word: {
          foreign: "Holiday",
          czech: "dovolená",
        },
        wordExample: "We are going on holiday next week.",
        wordExampleTranslation: "Příští týden jedeme na dovolenou.",
        translation: {
          cz: "Pojedeme do Prahy vlakem.",
          answer: "We are going to Prague by train.",
        },
        grammar: {
          explanation: "Používáme 'going to' pro budoucí plány.",
          example: "I am going to visit my friend.",
          exampleCz: "Půjdu navštívit svého kamaráda.",
        },
        reading:
          "People like holidays. They travel to beaches, cities or mountains.",
        readingCz:
          "Lidé mají rádi dovolenou. Cestují k moři, do měst nebo do hor.",
      };

    case "A2":
      return {
        word: {
          foreign: "Neighbour",
          czech: "soused",
        },
        wordExample: "My neighbour is very friendly.",
        wordExampleTranslation: "Můj soused je velmi přátelský.",
        translation: {
          cz: "Když jsem byl malý, hrával jsem venku.",
          answer: "When I was a child, I used to play outside.",
        },
        grammar: {
          explanation: "Minulý čas používáme pro ukončené děje v minulosti.",
          example: "They visited London last year.",
          exampleCz: "Navštívili Londýn minulý rok.",
        },
        reading:
          "Learning languages takes time and practice every day.",
        readingCz:
          "Učení jazyků vyžaduje čas a každodenní praxi.",
      };

    case "B1":
      return {
        word: {
          foreign: "Journey",
          czech: "cesta",
        },
        wordExample: "The journey was long but exciting.",
        wordExampleTranslation: "Cesta byla dlouhá, ale vzrušující.",
        translation: {
          cz: "Kdybych měl více času, učil bych se více jazyků.",
          answer: "If I had more time, I would study more languages.",
        },
        grammar: {
          explanation: "Second conditional používáme pro hypotetické situace.",
          example: "If I were rich, I would travel the world.",
          exampleCz: "Kdybych byl bohatý, cestoval bych po světě.",
        },
        reading:
          "People travel for many reasons such as work, study or adventure.",
        readingCz:
          "Lidé cestují z mnoha důvodů, například kvůli práci, studiu nebo dobrodružství.",
      };

    case "B2":
      return {
        word: {
          foreign: "Awareness",
          czech: "uvědomění",
        },
        wordExample:
          "There is a growing awareness of environmental issues.",
        wordExampleTranslation:
          "Roste povědomí o environmentálních problémech.",
        translation: {
          cz: "Navzdory dešti jsme pokračovali v cestě.",
          answer: "Despite the rain, we continued our journey.",
        },
        grammar: {
          explanation:
            "Použití 'despite' a 'although' pro kontrastní věty.",
          example: "Although it was late, we kept working.",
          exampleCz: "I když bylo pozdě, pokračovali jsme v práci.",
        },
        reading:
          "Technology has changed communication dramatically in recent years.",
        readingCz:
          "Technologie v posledních letech dramaticky změnila komunikaci.",
      };

    case "C1":
      return {
        word: {
          foreign: "Perception",
          czech: "vnímání",
        },
        wordExample:
          "Perception often differs from reality.",
        wordExampleTranslation:
          "Vnímání se často liší od reality.",
        translation: {
          cz: "Mnoho odborníků tvrdí, že společnost se mění rychleji než kdy dřív.",
          answer:
            "Many experts argue that society is changing faster than ever before.",
        },
        grammar: {
          explanation:
            "Inverze po negativních výrazech pro důraz.",
          example: "Rarely have I seen such dedication.",
          exampleCz: "Zřídka jsem viděl takové nasazení.",
        },
        reading:
          "Language is deeply connected to identity and culture.",
        readingCz:
          "Jazyk je hluboce propojen s identitou a kulturou.",
      };

    case "C2":
      return {
        word: {
          foreign: "Ambiguity",
          czech: "nejednoznačnost",
        },
        wordExample:
          "Ambiguity is often intentional in literature.",
        wordExampleTranslation:
          "Nejednoznačnost je v literatuře často záměrná.",
        translation: {
          cz: "Filozofické debaty často zpochybňují samotnou podstatu reality.",
          answer:
            "Philosophical debates often question the very nature of reality.",
        },
        grammar: {
          explanation:
            "Pokročilé struktury kombinující různé časové roviny.",
          example:
            "Had I known earlier, I would be handling this differently now.",
          exampleCz:
            "Kdybych to věděl dříve, řešil bych to jinak.",
        },
        reading:
          "At advanced levels, language becomes a tool for subtle meaning and interpretation.",
        readingCz:
          "Na pokročilé úrovni se jazyk stává nástrojem jemného významu a interpretace.",
      };

    default:
      return null;
  }
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "en";

  const levels = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

  const data = Object.fromEntries(
    levels.map((lvl) => [lvl, buildLevel(lvl)])
  );

  return NextResponse.json({
    lang,
    date: new Date().toISOString().split("T")[0],
    levels: data,
  });
}