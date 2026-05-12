import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const materials = await prisma.material.findMany();
  console.log('--- Materials in DB ---');
  console.log(JSON.stringify(materials, null, 2));
  
  const users = await prisma.user.findMany({
    where: { role: 'SELLER' }
  });
  console.log('--- Sellers in DB ---');
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
