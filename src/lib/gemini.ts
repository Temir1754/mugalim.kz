"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function callGeminiWithFallback(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateLessonPlan(subject: string, className: string, theme: string, language: string = "kz", book: string = "") {
  const prompt = `Сіз — Қазақстан Республикасының білім беру жүйесінің сарапшы-әдіскерісіз. 
Сіздің міндетіңіз: Қазақстан мұғалімдеріне арналған Сабақтың қысқа мерзімді жоспарын (ҚМЖ) құрастыру.

МӘЛІМЕТТЕР:
- ПӘН: ${subject}
- СЫНЫП: ${className}
- ТАҚЫРЫП: ${theme}
- ОҚУЛЫҚ: ${book}
- ТІЛ: Қазақша

ТАЛАПТАР:
1. Жауап СТРОГО JSON форматында болуы керек (markdown блоктарсыз).
2. Барлық өрістер ТЕК ҚАЗАҚ ТІЛІНДЕ болуы тиіс.
3. JSON өрістері:
   - lessonGoal: Сабақтың SMART-мақсаты (жол)
   - criteria: Бағалау критерийлері (жол)
   - langGoals: Тілдік мақсаттар мен терминдер (жол)
   - values: Құндылықтарды дарыту (жол)
   - links: Пәнаралық байланыстар (жол)
   - priorKnowledge: Алдыңғы білім (жол)
   - lessonFlow: Сабақтың барысы — Басы, Ортасы, Соңы (жол)
   - differentiation: Саралау (жол)
   - assessment: Қалыптастырушы бағалау (жол)
   - resources: Ресурстар (жол)
   - lessonStages: Мынадай объектілер массиві [{ stage, teacherActions, studentActions, evaluation, resources }]

ТЕК валидті JSON объектісін қайтарыңыз.`;

  const text = await callGeminiWithFallback(prompt);

  try {
    const jsonStr = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Response parsing error:", error, text);
    throw new Error("ЖИ жауабын өңдеу кезінде қате кетті.");
  }
}

export async function generateKTPThemes(subject: string, className: string, totalHours: number, language: string = "kz") {
    const prompt = `Күнтізбелік-тақырыптық жоспар (КТЖ) үшін тақырыптар тізімін жасаңыз.
МӘЛІМЕТТЕР:
- ПӘН: ${subject}
- СЫНЫП: ${className}
- САҒАТ САНЫ: ${totalHours}
- ТІЛ: Қазақша

JSON қайтарыңыз:
[
  {"index": 1, "theme": "1-тақырып"},
  {"index": 2, "theme": "2-тақырып"}
]
Тақырыптар саны дәл ${totalHours} болуы керек. Барлық тақырыптар ТЕК ҚАЗАҚ ТІЛІНДЕ болуы тиіс.`;

    const text = await callGeminiWithFallback(prompt);

    try {
        const jsonStr = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI KTP parsing error:", error, text);
        throw new Error("КТЖ тақырыптарын жасау кезінде қате кетті.");
    }
}
