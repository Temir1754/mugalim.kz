"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function callGeminiWithFallback(prompt: string) {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-flash-latest"];
  
  for (const modelName of models) {
    try {
      console.log(`[AI-LOG] Attempting generation with: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      if (text) return text;
    } catch (error: any) {
      console.error(`[AI-LOG] ${modelName} error:`, error.message);
      // Если это не последняя модель, пробуем следующую
      if (modelName !== models[models.length - 1]) {
        console.log(`[AI-LOG] Falling back to next model...`);
        continue;
      }
      throw new Error(`ИИ серверлері қазір бос емес. Сәл күте тұрып қайта көріңіз (${error.message})`);
    }
  }
  
  throw new Error("ИИ жауап бермеді");
}

async function getGeminiEmbedding(text: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-2",
        content: { parts: [{ text }] },
        outputDimensionality: 1536
      }),
    }
  );

  const data = await response.json();
  return data.embedding.values;
}

async function searchKnowledge(query: string, textbookId: string, limit: number = 10) {
  try {
    const embedding = await getGeminiEmbedding(query);
    const vectorStr = `[${embedding.join(",")}]`;

    const results: any[] = await prisma.$queryRawUnsafe(
      `SELECT content, 1 - (embedding <=> $1::vector) as similarity
       FROM "KnowledgeChunk"
       WHERE "textbookId" = $2
       ORDER BY similarity DESC
       LIMIT $3`,
      vectorStr,
      textbookId,
      limit
    );

    return results.map(r => r.content).join("\n\n");
  } catch (error) {
    console.error("Search error:", error);
    return "";
  }
}

export async function generateLessonPlan(subject: string, className: string, theme: string, language: string = "kz", book: string = "") {
  let context = "";
  if (book) {
    // Если передан ID учебника, ищем в нем контекст
    context = await searchKnowledge(theme, book);
  }

  const prompt = `Сіз — Қазақстан Республикасының білім беру жүйесінің сарапшы-әдіскерісіз. 
Сіздің міндетіңіз: Қазақстан мұғалімдеріне арналған Сабақтың қысқа мерзімді жоспарын (ҚМЖ) құрастыру.

${context ? `ПАЙДАЛАНУҒА АРНАЛҒАН МӘТІН (УЧЕБНИК КОНТЕКСТІ):
${context}
` : ""}

МӘЛІМЕТТЕР:
- ПӘН: ${subject}
- СЫНЫП: ${className}
- ТАҚЫРЫП: ${theme}
- ОҚУЛЫҚ: ${book ? "Арнайы оқулық мәтіні қолданылды" : "Жалпы білім беру стандарттары"}
ТЕЛЕҢІЗ: ${language === "ru" ? "Русский" : "Қазақша"}

ТАЛАПТАР:
1. Жауап СТРОГО JSON форматында болуы керек (markdown блоктарсыз).
2. Барлық өрістер ТЕК ${language === "ru" ? "ОБЯЗАТЕЛЬНО НА РУССКОМ ЯЗЫКЕ" : "ҚАЗАҚ ТІЛІНДЕ"} болуы тиіс.
3. ${context ? "ОБЯЗАТЕЛЬНОЕ УСЛОВИЕ: Вы ДОЛЖНЫ использовать предоставленный текст учебника (задачи, примеры, шифровки, числа) внутри хода урока. Интегрируйте реальные примеры из текста (например, задачи про Петю, числа 565 и 2121 и т.д.) в колонки 'teacherActions' и 'studentActions'." : "Создайте стандартный план урока."}
4. JSON өрістері:
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
   - lessonStages: Мынадай объектілер массиві [{ stage: 'Басы/Ортасы/Соңы', teacherActions: 'Что делает учитель (с конкретными задачами из учебника)', studentActions: 'Что делают ученики (какие задачи решают)', evaluation: 'Оценивание', resources: 'Ресурсы' }]

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
- ТІЛ: ${language === "ru" ? "Русский" : "Қазақша"}

JSON қайтарыңыз:
[
  {"index": 1, "theme": "1-тақырып"},
  {"index": 2, "theme": "2-тақырып"}
]
Тақырыптар саны дәл ${totalHours} болуы керек. Барлық тақырыптар ТЕК ${language === "ru" ? "РУССКОМ ЯЗЫКЕ" : "ҚАЗАҚ ТІЛІНДЕ"} болуы тиіс.`;

    const text = await callGeminiWithFallback(prompt);

    try {
        const jsonStr = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI KTP parsing error:", error, text);
        throw new Error("КТЖ тақырыптарын жасау кезінде қате кетті.");
    }
}
