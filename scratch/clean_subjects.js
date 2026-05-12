const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanSubjects() {
  console.log("🧹 Начинаю очистку списка предметов...");
  
  const patterns = ["учебник", "класс", "сынып", "жыл", "Алматыкітап", "Мектеп", ","];
  const subjects = await prisma.subject.findMany({
    include: { textbooks: true }
  });

  let count = 0;
  for (const s of subjects) {
    const shouldDelete = patterns.some(p => s.name.toLowerCase().includes(p.toLowerCase())) || s.name.length > 50;

    if (shouldDelete) {
      console.log(`🗑️ Удаляю предмет: ${s.name}`);
      
      if (s.textbooks.length > 0) {
        for (const t of s.textbooks) {
          try {
            await prisma.$transaction([
              prisma.knowledgeChunk.deleteMany({ where: { textbookId: t.id } }),
              prisma.topic.deleteMany({ where: { textbookId: t.id } }),
              prisma.textbook.delete({ where: { id: t.id } })
            ]);
          } catch (err) {
            console.error(`⚠️ Не удалось удалить книгу ${t.id}: ${err.message}`);
          }
        }
      }
      
      try {
        await prisma.subject.delete({
          where: { id: s.id }
        });
        count++;
      } catch (err) {
        console.error(`⚠️ Не удалось удалить предмет ${s.name}: ${err.message}`);
      }
    }
  }

  console.log(`\n✅ Очистка завершена. Удалено ${count} мусорных предметов.`);
}

cleanSubjects()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
