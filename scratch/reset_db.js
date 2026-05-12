const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function reset() {
  console.log("🧹 Полный сброс базы данных...");
  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "KnowledgeChunk", "Topic", "Textbook", "Subject" CASCADE`);
    console.log("✅ База данных успешно очищена.");
  } catch (err) {
    console.error("❌ Ошибка при очистке:", err.message);
  }
}

reset()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
