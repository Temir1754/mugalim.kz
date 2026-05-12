const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function load() {
  // Ищем учебник "Цифрлық сауаттылық" для 1 класса
  let book = await prisma.textbook.findFirst({
    where: {
      subject: { name: "Цифрлық сауаттылық" },
      grade: 1
    }
  });

  // Если учебника еще нет, создадим его, чтобы темы не пропали
  if (!book) {
    console.log("📝 Учебник не найден, создаю новую запись для 'Цифрлық сауаттылық'...");
    const subject = await prisma.subject.upsert({
      where: { name: "Цифрлық сауаттылық" },
      update: {},
      create: { name: "Цифрлық сауаттылық" }
    });
    
    book = await prisma.textbook.create({
      data: {
        subjectId: subject.id,
        grade: 1,
        publisher: "Мектеп", // По умолчанию
        author: "Автор",
        year: 2023
      }
    });
  }

  const topics = [
    "§1. Өз денсаулығымызды сақтаймыз",
    "§2. Компьютер кабинетіндегі қауіпсіздік ережелери",
    "§3. Желідегі қажетсіз байланыстар",
    "§4. Ақпарат дегеніміз не?",
    "§5. Ақпарат көздері",
    "§6. Ақпарат алмасу",
    "§7. Алгоритм дегеніміз не?",
    "§8. Біздің өміріміздегі алгоритм",
    "§9. Менің алғашқы программам",
    "§10. Робот жайлы не білеміз?",
    "§11. Роботпен танысу",
    "§12. Роботқа арналған программа",
    "§13. Робот дөңгелегінің айналымы",
    "§14. Роботты алға жылжыту қозғалысы",
    "§15. Роботты артқа жылжыту қозғалысы",
    "§16. Лабиринттен шығу",
    "§17. Қорытынды сабақ"
  ];

  console.log(`📡 Загрузка ${topics.length} тем для Цифрлық сауаттылық (ID: ${book.id})`);

  await prisma.topic.deleteMany({ where: { textbookId: book.id } });

  for (let i = 0; i < topics.length; i++) {
    await prisma.topic.create({
      data: {
        textbookId: book.id,
        name: topics[i],
        order: i + 1
      }
    });
  }

  console.log("✅ Все темы для Цифрлық сауаттылық успешно загружены!");
}

load()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
