const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getGeminiEmbedding(text) {
  const apiKey = "AIzaSyAlDF7kI8ncmz5grF2t94Jsc5RgVSO3_oY";
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

async function main() {
  const textbookId = "855a6f11-3920-4398-8377-392166b42ac8";
  const content = "Тірі табиғатқа адамдар, жануарлар, өсімдіктер және саңырауқұлақтар жатады. Олар тыныс алады, қоректенеді, өседі және көбейеді.";
  
  console.log("🚀 Генерация эмбеддинга...");
  const embedding = await getGeminiEmbedding(content);
  
  console.log("📥 Вставка чанка в БД...");
  await prisma.$executeRawUnsafe(
    `INSERT INTO "KnowledgeChunk" (id, "textbookId", content, embedding, "createdAt") 
     VALUES (gen_random_uuid(), $1, $2, $3::vector, now())`,
    textbookId,
    content,
    `[${embedding.join(",")}]`
  );
  
  console.log("✅ Чанк успешно добавлен!");
}

main().finally(() => prisma.$disconnect());
