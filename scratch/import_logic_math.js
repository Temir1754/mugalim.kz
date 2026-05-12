const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const subjectName = "Логика (математика)";
    const grade = 2;
    const author = "-";
    const publisher = "-";
    const year = 2024;
    const language = "ru";

    let subject = await prisma.subject.findUnique({ where: { name: subjectName } });
    if (!subject) {
        subject = await prisma.subject.create({ data: { name: subjectName } });
        console.log("Создан предмет:", subject.name);
    }

    let textbook = await prisma.textbook.findFirst({
        where: { subjectId: subject.id, grade: grade }
    });

    if (!textbook) {
        textbook = await prisma.textbook.create({
            data: {
                subjectId: subject.id,
                grade: grade,
                author: author,
                publisher: publisher,
                year: year,
                language: language
            }
        });
        console.log("Создан учебник для 2 класса");
    }

    const topicsText = `Цепочки
Точка. Прямая. Кривая линия
Луч. Отрезок
Ломаная линия
Многоугольник
Периметр многоугольника
Сложение и вычитание двузначных чисел
Выражения
Порядок действий
Скобки
Уравнения
Задачи на сложение и вычитание
Таблица умножения
Умножение
Деление
Компоненты умножения и деления
Площадь фигур
Единицы длины
Единицы времени
Единицы массы
Единицы стоимости
Задачи на движение
Геометрические фигуры
Повторение`;

    const topicLines = topicsText.split('\n').map(t => t.trim()).filter(t => t.length > 0);

    // Удаляем старые темы, если они были
    await prisma.topic.deleteMany({ where: { textbookId: textbook.id } });

    let order = 1;
    for (const line of topicLines) {
        await prisma.topic.create({
            data: {
                textbookId: textbook.id,
                name: line,
                order: order++
            }
        });
    }

    console.log(`✅ Успешно добавлено тем: ${topicLines.length}!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
