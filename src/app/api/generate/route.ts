import { NextResponse } from 'next/server';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

// Запрещаем Next.js кэшировать эту генерацию!
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const docType = body.docType || "ҚМЖ"; // "КТЖ (Күнтізбелік-тақырыптық жоспар)" немесе "ҚМЖ (Сабақ жоспары)"
    const teacherName = body.teacherName || "Мұғалімнің аты-жөні";
    const subject = body.subject || "Пән";
    const className = body.className || "Сынып";
    const lessonDates = body.lessonDates || [];

    // Выбираем шаблон
    let templateName = "ktp_template_v3.docx";
    if (docType.includes("ҚМЖ") || docType.includes("КСП")) {
      templateName = "ksp_template.docx";
    }

    const templatePath = path.join(process.cwd(), "src", "templates", templateName);
    const content = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '[', end: ']' }
    });

    if (docType.includes("КТЖ") || docType.includes("КТП")) {
      // Логика для КТЖ (Массив уроков на год)
      const lessons = body.lessons || [];

      doc.render({
        teacherName,
        subject,
        className,
        lessons
      });
    } else {
      // Логика для ҚМЖ (Один конкретный урок)
      const lessonDate = lessonDates.length > 0 ? lessonDates[0] : new Date().toLocaleDateString("kz-KZ");
      
      // Обработка структурированного хода урока (lessonStages)
      const lessonStages = body.lessonStages || [];

      doc.render({
        teacherName,
        subject,
        className,
        date: lessonDate,
        docLanguage: "kz",
        theme: body.theme || "Сабақ тақырыбы",
        book: body.book || "",
        lessonNumber: body.lessonNumber || "1",
        goals: body.lessonGoal || "",
        lessonGoal: body.lessonGoal || "",
        criteria: body.criteria || "",
        langGoals: body.langGoals || "",
        values: body.values || "",
        links: body.links || "",
        priorKnowledge: body.priorKnowledge || "",
        lessonFlow: body.lessonFlow || "",
        differentiation: body.differentiation || "",
        assessment: body.assessment || "",
        methodology: body.methodology || "",
        selfReflection: body.selfReflection || "",
        resources: (lessonStages && lessonStages.length > 0) 
          ? lessonStages.map((s: any) => s.resources).join(", ") 
          : (body.resources || ""),
        
        lessonStages: lessonStages.map((s: any) => ({
          stage: s.stage || "",
          teacherActions: s.teacherActions || "",
          studentActions: s.studentActions || "",
          evaluation: s.evaluation || "",
          resources: s.resources || ""
        })),
        
        allTeacherActions: lessonStages.map((s: any) => `${s.stage}:\n${s.teacherActions}`).join("\n\n"),
        allStudentActions: lessonStages.map((s: any) => `${s.stage}:\n${s.studentActions}`).join("\n\n"),
        allEvaluation: lessonStages.map((s: any) => `${s.stage}:\n${s.evaluation}`).join("\n\n"),
        
        teacherActions2: lessonStages[1]?.teacherActions || "",
        studentActions2: lessonStages[1]?.studentActions || "",
        evaluation2: lessonStages[1]?.evaluation || "",
        
        teacherActions3: lessonStages[2]?.teacherActions || "",
        studentActions3: lessonStages[2]?.studentActions || "",
        evaluation3: lessonStages[2]?.evaluation || "",
      });
    }

    const buf = doc.getZip().generate({
      type: "arraybuffer",
      compression: "DEFLATE",
    });

    const filename = `mugalim_${(docType.includes('КТЖ') || docType.includes('КТП')) ? 'ktj' : 'qmj'}.docx`;

    // Save to Database if authorId is present
    if (body.authorId) {
      try {
        const { prisma } = await import('@/lib/prisma');
        await prisma.material.create({
          data: {
            type: docType,
            subject: subject,
            dayOfWeek: new Date().toLocaleDateString('kz-KZ', { weekday: 'short' }),
            classNumber: className,
            authorId: body.authorId,
            fileUrl: `/api/download/${filename}`,
            status: 'APPROVED',
          }
        });
      } catch (dbError) {
        console.error("Failed to save material to DB:", dbError);
      }
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': buf.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error("Генератор қатесі:", error);
    return NextResponse.json({ error: "Күрделі қате кетті" }, { status: 500 });
  }
}
