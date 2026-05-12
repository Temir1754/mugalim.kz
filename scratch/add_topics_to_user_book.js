const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const textbookId = "a4cecea7-2fdf-4903-b9c3-040f01cd7e43";
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

    await prisma.topic.deleteMany({ where: { textbookId: textbookId } });

    let order = 1;
    for (const line of topicLines) {
        await prisma.topic.create({
            data: {
                textbookId: textbookId,
                name: line,
                order: order++
            }
        });
    }

    console.log(`✅ Успешно добавлено тем: ${topicLines.length}!`);
}

main().finally(() => prisma.$disconnect());
