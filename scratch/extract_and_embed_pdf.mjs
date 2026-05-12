import { PrismaClient } from "@prisma/client";
import fs from "fs";
import * as pdf from "pdf-parse";

const prisma = new PrismaClient();

// Manually load .env
try {
  const env = fs.readFileSync(".env", "utf8");
  const match = env.match(/GEMINI_API_KEY="?([^\s"\n]+)"?/);
  if (match) process.env.GEMINI_API_KEY = match[1];
} catch (e) {}

async function getGeminiEmbedding(text, apiKey) {
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
  if (!data.embedding) {
    console.error("Embedding error:", data);
    throw new Error("Failed to get embedding");
  }
  return data.embedding.values;
}

async function processPdf() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY не найден в .env");
    return;
  }

  const pdfPath = "C:/Users/FGS-4/Desktop/Ана тілі.pdf";
  const textbookId = "0c42c76c-c9ad-400e-a216-621666763dd9";

  console.log(`📄 Чтение файла: ${pdfPath}`);
  
  if (!fs.existsSync(pdfPath)) {
    console.error("❌ Файл не найден по указанному пути.");
    return;
  }

  const dataBuffer = fs.readFileSync(pdfPath);
  
  let pdfData;
  try {
    const { PDFParse } = pdf;
    const parser = new PDFParse({ data: dataBuffer });
    const textResult = await parser.getText();
    pdfData = { text: textResult.text };
  } catch (err) {
    console.error("PDF Parsing error:", err);
    return;
  }

  const fullText = pdfData.text;
  console.log(`📊 Извлечено символов: ${fullText.length}`);

  const chunkSize = 1500;
  const chunks = [];
  for (let i = 0; i < fullText.length; i += chunkSize) {
    chunks.push(fullText.substring(i, i + chunkSize));
  }

  console.log(`🧩 Создано чанков: ${chunks.length}. Начинаю генерацию векторов...`);

  await prisma.knowledgeChunk.deleteMany({ where: { textbookId } });

  for (let i = 0; i < chunks.length; i++) {
    const content = chunks[i].trim();
    if (content.length < 50) continue;

    try {
      const embedding = await getGeminiEmbedding(content, apiKey);
      const vectorStr = `[${embedding.join(",")}]`;

      await prisma.$executeRawUnsafe(
        `INSERT INTO "KnowledgeChunk" (id, "textbookId", content, embedding, "createdAt") 
         VALUES (gen_random_uuid(), $1, $2, $3::vector, now())`,
        textbookId,
        content,
        vectorStr
      );

      if ((i + 1) % 5 === 0) {
        console.log(`⏳ Обработано: ${i + 1} / ${chunks.length}`);
      }
    } catch (e) {
      console.error(`❌ Ошибка на чанке ${i}:`, e.message);
    }
  }

  console.log("✅ Книга Ана тілі успешно обработана и готова для генератора!");
}

processPdf()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
