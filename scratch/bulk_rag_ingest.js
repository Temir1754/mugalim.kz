const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
// Используем pdf-extraction, так как она проверена в проекте
const pdf = require("pdf-extraction");
const prisma = new PrismaClient();

// Настройки
const API_KEY = "AIzaSyAlDF7kI8ncmz5grF2t94Jsc5RgVSO3_oY";
const EMBED_MODEL = "models/gemini-embedding-2";
const DIMENSIONS = 1536;

async function getEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${EMBED_MODEL}:embedContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: EMBED_MODEL,
        content: { parts: [{ text }] },
        outputDimensionality: DIMENSIONS
      }),
    }
  );
  const data = await response.json();
  if (!data.embedding) throw new Error(`Embedding failed: ${JSON.stringify(data)}`);
  return data.embedding.values;
}

async function processBook(book) {
  console.log(`\n📖 Обработка: ${book.subject} (${book.grade} класс) - ${book.author} | Часть: ${book.part || '-'}, Язык: ${book.language || '-'}`);
  
  // Определяем полный путь к файлу
  const basePath = "C:/Users/FGS-4/Desktop/классы";
  const fullPath = book.filePath.startsWith("C:") ? book.filePath : path.join(basePath, book.filePath).replace(/\\/g, '/');

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Файл не найден: ${fullPath}`);
    return;
  }

  // 1. Создаем/находим предмет
  const subject = await prisma.subject.upsert({
    where: { name: book.subject },
    update: {},
    create: { name: book.subject }
  });

  // 2. Находим или создаем запись книги
  let textbook = await prisma.textbook.findFirst({
    where: {
      subjectId: subject.id,
      grade: Number(book.grade),
      author: book.author,
      part: book.part ? Number(book.part) : null,
      language: book.language || null
    }
  });

  if (!textbook) {
    textbook = await prisma.textbook.create({
      data: {
        subjectId: subject.id,
        grade: Number(book.grade),
        publisher: book.publisher,
        author: book.author,
        year: Number(book.year),
        part: book.part ? Number(book.part) : null,
        language: book.language || null
      }
    });
    console.log(`🆕 Создана новая книга в базе.`);
  } else {
    console.log(`📚 Найдена существующая книга, обновляю контент...`);
  }

  // 3. Читаем PDF
  try {
    const dataBuffer = fs.readFileSync(fullPath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    if (!text || text.length < 10) {
      console.warn("⚠️ Текст в PDF не найден или слишком короткий.");
      return;
    }

    // 4. Разрезаем на части (chunks)
    let chunks = text.split(/\n\s*\n/).map(c => c.trim()).filter(c => c.length > 100);
    
    if (chunks.length < 10) {
      chunks = [];
      for (let i = 0; i < text.length; i += 1000) {
        chunks.push(text.substring(i, i + 1100).trim());
      }
    }

    console.log(`🧩 Создано чанков: ${chunks.length}. Векторизация...`);

    // 5. Векторизация и сохранение
    let successCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      try {
        if (i >= 150) break; // Ограничение на количество чанков на одну книгу

        const embedding = await getEmbedding(chunks[i]);
        
        await prisma.$executeRawUnsafe(
          `INSERT INTO "KnowledgeChunk" (id, "textbookId", content, embedding, "createdAt") 
           VALUES (gen_random_uuid(), $1, $2, $3::vector, now())`,
          textbook.id,
          chunks[i],
          `[${embedding.join(",")}]`
        );
        successCount++;
        if (successCount % 10 === 0) process.stdout.write(".");
      } catch (e) {
        console.error(`\n⚠️ Ошибка в чанке ${i}:`, e.message);
      }
    }

    console.log(`\n✅ Готово! Сохранено ${successCount} векторов.`);
  } catch (pdfError) {
    console.error(`❌ Ошибка чтения PDF: ${pdfError.message}`);
  }
}

async function main() {
  const manifestPath = path.join(__dirname, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error("❌ Файл scratch/manifest.json не найден!");
    return;
  }

  const books = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`🚀 Начинаю массовую загрузку ${books.length} книг...`);

  for (const book of books) {
    await processBook(book);
  }

  console.log("\n🏁 Все книги успешно обработаны!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
