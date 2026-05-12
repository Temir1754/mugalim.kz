const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    const textbooks = await prisma.textbook.findMany({
        where: { grade: 2 },
        include: { subject: true }
    });
    console.log(textbooks.map(t => ({ id: t.id, subject: t.subject.name, author: t.author })));
}
main().finally(() => prisma.$disconnect());
