const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function clean() {
  console.log("🧹 Очистка предметов...");
  try {
    await prisma.subject.deleteMany({});
    console.log("✅ Все предметы удалены.");
  } catch (e) {
    console.error("❌ Ошибка:", e.message);
  }
}

clean().catch(console.error).finally(() => prisma.$disconnect());
