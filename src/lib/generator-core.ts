import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

export async function generateAIContent(subject: string, className: string, theme: string, language: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const langLabel = language === 'kz' ? 'Казахский' : 'Русский';

  const prompt = `Вы — эксперт-методист образовательной системы Республики Казахстан. 
Ваша задача: составить Краткосрочный план урока (КСП) для учителей Казахстана.

ДАННЫЕ:
- ПРЕДМЕТ: ${subject}
- КЛАСС: ${className}
- ТЕМА: ${theme}
- ЯЗЫК: ${langLabel}

ТРЕБОВАНИЯ:
1. Ответ должен быть СТРОГО в формате JSON.
2. Все поля должны быть на языке: ${langLabel}.
3. Поля JSON: lessonGoal, criteria, langGoals, values, links, priorKnowledge, lessonFlow, differentiation, assessment, resources.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const geminiData = await response.json();
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonStr = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(jsonStr);
}

export async function createDocx(data: any, docType: string, teacherName: string, schoolName: string) {
  const templateName = docType.includes("КСП") ? "ksp_template.docx" : "ktp_template_v3.docx";
  const templatePath = path.join(process.cwd(), "src", "templates", templateName);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '[', end: ']' }
  });

  doc.render({
    ...data,
    teacherName,
    schoolName,
    date: new Date().toLocaleDateString('ru-RU'),
  });

  return doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
}
