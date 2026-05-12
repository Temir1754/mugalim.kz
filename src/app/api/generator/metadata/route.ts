import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "subjects", "textbooks", "topics"

  try {
    // 1. Получение всех предметов
    if (type === "subjects") {
      // @ts-ignore
      const subjects = await prisma.subject.findMany({
        orderBy: { name: "asc" },
      });
      return NextResponse.json(subjects);
    }

    // 2. Получение учебников для предмета и класса
    if (type === "textbooks") {
      const subjectName = searchParams.get("subjectName");
      const grade = searchParams.get("grade");
      const language = searchParams.get("language");

      if (!subjectName || !grade) {
        return NextResponse.json({ error: "Missing subjectName or grade" }, { status: 400 });
      }

      const whereClause: any = {
        subject: { name: subjectName },
        grade: parseInt(grade),
      };
      
      if (language) {
        whereClause.language = language;
      }

      // @ts-ignore
      const textbooks = await prisma.textbook.findMany({
        where: whereClause,
        orderBy: { year: "desc" },
      });

      return NextResponse.json(textbooks);
    }

    // 3. Получение всех учебников для админки (со статистикой)
    if (type === "admin-textbooks") {
      // @ts-ignore
      const textbooks = await prisma.textbook.findMany({
        include: {
          subject: true,
          _count: {
            select: { chunks: true }
          }
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(textbooks);
    }

    // 4. Получение тем для конкретного учебника
    if (type === "topics") {
      const textbookId = searchParams.get("textbookId");

      if (!textbookId) {
        return NextResponse.json({ error: "Missing textbookId" }, { status: 400 });
      }

      // @ts-ignore
      const topics = await prisma.topic.findMany({
        where: { textbookId },
        orderBy: { order: "asc" },
      });

      return NextResponse.json(topics);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Metadata API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
