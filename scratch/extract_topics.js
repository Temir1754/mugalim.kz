const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-extraction");
const prisma = new PrismaClient();

const API_KEY = "AIzaSyAlDF7kI8ncmz5grF2t94Jsc5RgVSO3_oY";

async function extractTopicsWithAI(text, language) {
  const langPrompt = language === "kz" ? "на казахском языке" : "на русском языке";
  const prompt = `
    ПРОАНАЛИЗИРУЙ ТЕКСТ ШКОЛЬНОГО УЧЕБНИКА И НАЙДИ ОГЛАВЛЕНИЕ (МАЗМҰНЫ).
    ВЫПИШИ ВСЕ НАЗВАНИЯ ТЕМ УРОКОВ ИЛИ ПАРАГРАФОВ.
    
    ТРЕБОВАНИЯ:
    1. Верни ТОЛЬКО JSON массив строк.
    2. Каждая строка должна быть темой (например: "1-сабақ. Заттарды санау").
    3. Используй ${langPrompt}.
    4. Если видишь "Сабақ" или "Урок", обязательно включай номер урока.
    
    ТЕКСТ:
    ${text}
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      }),
    }
  );
  const data = await response.json();
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error(`AI Response failed: ${JSON.stringify(data)}`);
  }
  let content = data.candidates[0].content.parts[0].text;
  return JSON.parse(content);
}

async function processTextbookTopics(textbook) {
  console.log(`\n🔍 ГЛУБОКИЙ ПОИСК ТЕМ: ${textbook.subject.name} (${textbook.grade} класс)`);
  
  const manifest = JSON.parse(fs.readFileSync("scratch/manifest.json", "utf-8"));
  let bookData = manifest.find(b => b.subject === textbook.subject.name && Number(b.grade) === Number(textbook.grade));
  
  if (!bookData) {
    console.warn("⚠️ Файл не найден.");
    return;
  }

  const basePath = "C:/Users/FGS-4/Desktop/классы";
  const fullPath = bookData.filePath.startsWith("C:") ? bookData.filePath : path.join(basePath, bookData.filePath).replace(/\\/g, '/');

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Файл не найден: ${fullPath}`);
    return;
  }

  try {
    const dataBuffer = fs.readFileSync(fullPath);
    const pdfData = await pdf(dataBuffer); 
    
    const totalText = pdfData.text;
    // Берем первые 25000 и последние 15000 символов
    const combinedText = totalText.substring(0, 25000) + "\n... [SKIP] ...\n" + totalText.substring(totalText.length - 15000);

    const topics = await extractTopicsWithAI(combinedText, textbook.language || "kz");
    
    if (!Array.isArray(topics) || topics.length === 0) {
      console.warn("⚠️ Темы не найдены ИИ даже при глубоком поиске.");
      return;
    }

    console.log(`🧩 УСПЕХ! Найдено тем: ${topics.length}. Сохраняю...`);

    for (let i = 0; i < topics.length; i++) {
      await prisma.topic.create({
        data: {
          textbookId: textbook.id,
          name: topics[i],
          order: i + 1
        }
      });
    }
  } catch (e) {
    console.error("❌ Ошибка:", e.message);
  }
}

async function main() {
  const textbooks = await prisma.textbook.findMany({
    include: { subject: true }
  });

  for (const book of textbooks) {
    const existingCount = await prisma.topic.count({ where: { textbookId: book.id } });
    if (existingCount === 0) {
      await processTextbookTopics(book);
    }
  }
  console.log("\n🏁 Все книги проверены.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
