const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function aggressiveClean() {
  console.log("🧹 Начинаю агрессивную очистку...");
  
  const patterns = ["учебник", "класс", "сынып", "жыл", "Алматыкітап", "Мектеп", ","];
  const textbooks = await prisma.textbook.findMany({
    include: { subject: true }
  });

  for (const t of textbooks) {
    const name = t.subject?.name || "";
    const shouldDelete = patterns.some(p => name.toLowerCase().includes(p.toLowerCase())) || name.length > 60;

    if (shouldDelete) {
      console.log(`🗑️ Полное удаление: ${name}`);
      try {
        // Удаляем через Raw SQL для надежности
        await prisma.$executeRawUnsafe(`DELETE FROM "KnowledgeChunk" WHERE "textbookId" = $1`, t.id);
        await prisma.$executeRawUnsafe(`DELETE FROM "Topic" WHERE "textbookId" = $1`, t.id);
        await prisma.$executeRawUnsafe(`DELETE FROM "Textbook" WHERE "id" = $1`, t.id);
      } catch (err) {
        console.error(`❌ Ошибка при удалении ${name}:`, err.message);
      }
    }
  }

  console.log("\n✅ Агрессивная очистка завершена.");
}

aggressiveClean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
