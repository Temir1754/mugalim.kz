const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT atttypmod 
    FROM pg_attribute 
    WHERE attrelid = '"KnowledgeChunk"'::regclass 
    AND attname = 'embedding';
  `;
  console.log(JSON.stringify(result, null, 2));
}

main().finally(() => prisma.$disconnect());
