const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Начинаю наполнение базы данных...");

  // 1. Создаем предмет
  const subject = await prisma.subject.upsert({
    where: { name: "Жаратылыстану" },
    update: {},
    create: { name: "Жаратылыстану" },
  });

  // 2. Создаем учебник
  const textbook = await prisma.textbook.create({
    data: {
      subjectId: subject.id,
      grade: 1,
      publisher: "Алматыкітап",
      year: 2023,
      author: "Каратабанов",
    },
  });

  // 3. Добавляем темы
  const topics = [
    "Тірі және өлі табиғат",
    "Өсімдіктердің негізгі бөліктері",
    "Жануарлардың әртүрлілігі",
    "Адам және оның денсаулығы",
    "Табиғаттағы маусымдық өзгерістер",
  ];

  for (let i = 0; i < topics.length; i++) {
    await prisma.topic.create({
      data: {
        textbookId: textbook.id,
        name: topics[i],
        order: i + 1,
      },
    });
  }

  console.log("✅ База данных наполнена тестовыми данными!");
  console.log(`Добавлен предмет: ${subject.name}`);
  console.log(`Добавлен учебник: ${textbook.publisher} (${textbook.author}), ${textbook.year}`);
  console.log(`Добавлено тем: ${topics.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
