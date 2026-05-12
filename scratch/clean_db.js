const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function clean() {
  console.log("🧹 Начинаю очистку базы от некорректных названий...");
  
  const patterns = ["учебник", "класс", "сынып", "жыл", "Алматыкітап", "Мектеп", ","];
  const textbooks = await prisma.textbook.findMany({
    include: { subject: true }
  });

  let count = 0;
  for (const t of textbooks) {
    const name = t.subject?.name || "";
    const shouldDelete = patterns.some(p => name.toLowerCase().includes(p.toLowerCase())) || name.length > 60;

    if (shouldDelete) {
      console.log(`\n🔍 Анализ: ${name}`);
      const topicsCount = await prisma.topic.count({ where: { textbookId: t.id } });
      const chunksCount = await prisma.knowledgeChunk.count({ where: { textbookId: t.id } });
      console.log(`📊 Тем: ${topicsCount}, Фрагментов: ${chunksCount}`);

      try {
        await prisma.$transaction([
          prisma.topic.deleteMany({ where: { textbookId: t.id } }),
          prisma.knowledgeChunk.deleteMany({ where: { textbookId: t.id } }),
          prisma.textbook.delete({ where: { id: t.id } })
        ]);
        console.log(`🗑️ Удалено успешно.`);
        count++;
      } catch (err) {
        console.error(`❌ Ошибка удаления:`, err.message);
      }
    }
  }

  console.log(`\n✅ Очистка завершена. Удалено ${count} записей.`);
}

clean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
