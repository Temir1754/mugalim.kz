const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.subject.count();
  const textbooks = await prisma.textbook.count();
  const topics = await prisma.topic.count();
  
  console.log({ subjects, textbooks, topics });
  
  if (subjects > 0) {
    const lastSubject = await prisma.subject.findFirst({ orderBy: { id: 'desc' } });
    console.log("Last subject:", lastSubject.name);
  }
}

main().finally(() => prisma.$disconnect());
