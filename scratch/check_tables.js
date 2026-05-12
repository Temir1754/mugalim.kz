const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const columns = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'KnowledgeChunk'`;
  console.log("Колонки в KnowledgeChunk:", columns);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
