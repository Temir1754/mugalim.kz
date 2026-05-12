const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.knowledgeChunk.count();
  const textbooks = await prisma.textbook.findMany({
    include: { _count: { select: { chunks: true } } }
  });
  
  console.log("Total KnowledgeChunks in DB:", count);
  console.log("Textbooks stats:", textbooks.map(t => ({
    id: t.id,
    name: t.author,
    chunks: t._count.chunks
  })));
  
  await prisma.$disconnect();
}

check();
