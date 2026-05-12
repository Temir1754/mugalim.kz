const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const topics = await prisma.topic.findMany({
    include: { textbook: { include: { subject: true } } },
    take: 20
  });
  console.log("📊 Найденные темы в базе:");
  topics.forEach(t => {
    console.log(`[${t.textbook.subject.name}] ${t.name}`);
  });
}

check().catch(console.error).finally(() => prisma.$disconnect());
