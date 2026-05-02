const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('teacher123', 10);
  
  const user = await prisma.user.upsert({
    where: { username: 'teacher' },
    update: {},
    create: {
      username: 'teacher',
      passwordHash: passwordHash,
      fio: 'Тестовый Учитель',
      phone: '+77770000000',
      region: 'Алматы',
      gender: 'Мужской',
      specialty: 'Информатика',
      role: 'CLIENT',
      balance: 1000, // Дадим немного денег на баланс
      subEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Подписка на 30 дней
    },
  });

  console.log('Тестовый клиент создан:', user.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
