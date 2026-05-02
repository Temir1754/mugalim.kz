import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { subject, className, theme, language } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const langLabel = language === 'kz' ? 'Казахский' : 'Русский';

    const prompt = `Вы — эксперт-методист образовательной системы Республики Казахстан. 
Ваша задача: составить Краткосрочный план урока (КСП) для учителей Казахстана.

ДАННЫЕ:
- ПРЕДМЕТ: ${subject}
- КЛАСС: ${className}
- ТЕМА: ${theme}
- ЯЗЫК: ${langLabel}

ТРЕБОВАНИЯ:
1. Ответ должен быть СТРОГО в формате JSON без markdown блоков.
2. Все поля должны быть на языке: ${langLabel}.
3. Поля JSON:
   - lessonGoal: SMART-цель урока (строка)
   - criteria: критерии оценивания (строка)
   - langGoals: языковые цели и термины (строка)
   - values: привитие ценностей (строка)
   - links: межпредметные связи (строка)
   - priorKnowledge: предварительные знания (строка)
   - lessonFlow: ход урока — Начало, Середина, Конец (строка)
   - differentiation: дифференциация (строка)
   - assessment: формативное оценивание (строка)
   - resources: ресурсы (строка)

Верни ТОЛЬКО валидный JSON объект, без пояснений и markdown.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);
      return NextResponse.json({ error: `Gemini API error: ${response.status}` }, { status: 500 });
    }

    const geminiData = await response.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip markdown code fences if present
    const jsonStr = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(jsonStr);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
