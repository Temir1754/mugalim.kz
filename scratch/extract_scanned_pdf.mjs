import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

// Manually load .env
try {
  const env = fs.readFileSync(".env", "utf8");
  const match = env.match(/GEMINI_API_KEY="?([^\s"\n]+)"?/);
  if (match) process.env.GEMINI_API_KEY = match[1];
} catch (e) {}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing");
  process.exit(1);
}

const fileManager = new GoogleAIFileManager(apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

async function getGeminiEmbedding(text) {
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
  if (!data.embedding) throw new Error("Failed to get embedding");
  return data.embedding.values;
}

async function processScannedPdf() {
  const pdfPath = "C:/Users/FGS-4/Desktop/Логическое математика.pdf";
  const subjectName = "Логика (математика)";
  
  if (!fs.existsSync(pdfPath)) {
    console.error("❌ Файл не найден:", pdfPath);
    return;
  }

  const textbook = await prisma.textbook.findUnique({
    where: { id: "a4cecea7-2fdf-4903-b9c3-040f01cd7e43" }
  });

  if (!textbook) {
    console.error("❌ Учебник не найден в базе. Пожалуйста, не удаляйте предмет Логика (математика).");
    return;
  }

  console.log(`📄 Загружаю сканированный PDF в ИИ для распознавания (это займет время)...`);
  
  // 1. Upload the file to Google AI
  const uploadResponse = await fileManager.uploadFile(pdfPath, {
    mimeType: "application/pdf",
    displayName: "Logic Math",
  });
  
  console.log(`✅ Файл загружен в ИИ: ${uploadResponse.file.uri}`);

  // 2. Process with Gemini 1.5 Flash (supports up to 1 million tokens, ~1000 pages of PDF)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  console.log("🧠 ИИ читает книгу и извлекает полезный текст (задачи, правила, определения)...");
  
  const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri
      }
    },
    { text: "Извлеки весь полезный обучающий текст, правила и примеры задач из этого учебника по математике. Раздели текст на логические части, разделенные строкой '---CHUNK---'. Каждая часть должна содержать примерно одну-две темы. Игнорируй картинки, которые не содержат текста. Пиши только извлеченный текст, без своих комментариев." }
  ]);

  const extractedText = result.response.text();
  console.log(`📊 ИИ успешно прочитал книгу! Извлечено символов: ${extractedText.length}`);

  // 3. Delete old chunks
  await prisma.knowledgeChunk.deleteMany({ where: { textbookId: textbook.id } });

  // 4. Split and embed
  const rawChunks = extractedText.split("---CHUNK---").map(c => c.trim()).filter(c => c.length > 50);
  
  console.log(`🧩 Создано смысловых частей: ${rawChunks.length}. Начинаю векторизацию...`);

  for (let i = 0; i < rawChunks.length; i++) {
    try {
      const chunkText = rawChunks[i];
      const embedding = await getGeminiEmbedding(chunkText);
      const vectorStr = `[${embedding.join(",")}]`;

      await prisma.$executeRawUnsafe(
        `INSERT INTO "KnowledgeChunk" (id, "textbookId", content, embedding, "createdAt") 
         VALUES (gen_random_uuid(), $1, $2, $3::vector, now())`,
        textbook.id,
        chunkText,
        vectorStr
      );

      if ((i + 1) % 5 === 0) console.log(`⏳ Обработано: ${i + 1} / ${rawChunks.length}`);
    } catch (e) {
      console.error(`❌ Ошибка на части ${i}:`, e.message);
    }
  }

  // Очистка файла на сервере Google
  try {
    await fileManager.deleteFile(uploadResponse.file.name);
    console.log("🧹 Временный файл удален с сервера ИИ.");
  } catch(e) {}

  console.log("✅ Книга «Логическое математика» полностью распознана, прочитана и добавлена в память генератора!");
}

processScannedPdf()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
