import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      docType, teacherName, subject, className, theme, docLanguage,
      lessonGoal, criteria, langGoals, values, links, priorKnowledge,
      lessonStages, lessonFlow, assessment, resources,
      lessons, // Array of { index, date, theme } for KTP
      lessonDate // String for KSP
    } = data;

    const isRu = docLanguage === 'ru';
    
    // Переводы
    const titleKtp = isRu ? "КАЛЕНДАРНО-ТЕМАТИЧЕСКИЙ ПЛАН (КТП)" : "КҮНТІЗБЕЛІК-ТАҚЫРЫПТЫҚ ЖОСПАР";
    const titleKsp = isRu ? "КРАТКОСРОЧНЫЙ ПЛАН (КСП)" : "ҚЫСҚА МЕРЗІМДІ ЖОСПАР (ҚМЖ)";
    const lblSubject = isRu ? "Предмет: " : "Пән: ";
    const lblClass = isRu ? "\tКласс: " : "\tСынып: ";
    const lblTheme = isRu ? "Тема: " : "Тақырып: ";
    const lblTeacher = isRu ? "Учитель: " : "Мұғалім: ";
    const lblGoal = isRu ? "Цель урока" : "Сабақтың мақсаты";
    const lblCriteria = isRu ? "Критерии оценивания" : "Бағалау критерийлері";
    const lblFlow = isRu ? "Ход урока" : "Сабақтың барысы";
    const lblStage = isRu ? "Этап" : "Кезең";
    const lblTeacherAct = isRu ? "Действия педагога" : "Педагогтің әрекеті";
    const lblStudentAct = isRu ? "Действия ученика" : "Оқушының әрекеті";
    const lblEval = isRu ? "Оценивание" : "Бағалау";
    const lblEvalPrefix = isRu ? "Оценивание: " : "Бағалау: ";
    const lblResPrefix = isRu ? "Ресурсы: " : "Ресурстар: ";

    let formattedDate = "";
    if (lessonDate) {
      const d = new Date(lessonDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString("ru-RU");
      }
    }

    console.log("Starting docx generation for docType:", docType);

    let docChildren: any[] = [];

    if (docType === 'КТП') {
      const ktpLessons = Array.isArray(lessons) ? lessons : [];
      const totalHours = ktpLessons.length || 34;

      docChildren = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ 
              text: isRu 
                ? `Календарно-тематическое планирование по предмету «${subject || ""}»` 
                : `«${subject || ""}» пәнінен күнтізбелік-тақырыптық жоспарлау`, 
              bold: true, size: 28 
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ 
              text: isRu 
                ? `${className || ""}-класс\t\t\t${totalHours} часов в учебном году` 
                : `${className || ""}-сынып\t\t\tОқу жылында ${totalHours} сағат`, 
              bold: true 
            }),
          ],
        }),
        new Paragraph({ text: "" }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Разделы долгосрочного плана" : "Ұзақ мерзімді жоспардың бөлімдері", bold: true })], alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Темы урока" : "Сабақтың тақырыбы", bold: true })], alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Цели обучения" : "Оқу мақсаттары", bold: true })], alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Кол-во часов" : "Сағат саны", bold: true })], alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Сроки" : "Мерзімі", bold: true })], alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Примечание" : "Ескерту", bold: true })], alignment: AlignmentType.CENTER })] }),
              ],
            }),
            ...ktpLessons.map((l: any) => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "" })] }), // Раздел (empty for now)
                new TableCell({ children: [new Paragraph({ text: l.theme || "-" })] }), // Тема
                new TableCell({ children: [new Paragraph({ text: "" })] }), // Цели (empty for now)
                new TableCell({ children: [new Paragraph({ text: "1", alignment: AlignmentType.CENTER })] }), // Кол-во часов
                new TableCell({ children: [new Paragraph({ text: l.date || "-", alignment: AlignmentType.CENTER })] }), // Сроки
                new TableCell({ children: [new Paragraph({ text: "" })] }), // Примечание
              ],
            })),
          ],
        }),
      ];
    } else {
      // КСП (Краткосрочный план)
      docChildren = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `КГУ «Наименование школы»`, bold: true }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: isRu ? "(наименование организации образования)" : "(білім беру ұйымының атауы)", size: 20 }),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: titleKsp, bold: true }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${lblTheme} 1`, bold: true }), // Placeholder for lesson number
          ],
        }),
        new Paragraph({ text: "" }),

        // Basic Info Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Раздел" : "Бөлім", bold: true })] })] }),
                new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: subject || "-" })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRu ? "ФИО педагога" : "Педагогтің Т.А.Ә.", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: teacherName || "-" })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Дата" : "Күні", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: formattedDate })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${isRu ? "Класс" : "Сынып"} ${className || "-"}`, bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Количество присутствующих: \t\t отсутствующих: " : "Қатысушылар саны: \t\t Қатыспағандар саны: ", bold: true })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Тема урока" : "Сабақтың тақырыбы", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: theme || "-" })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Цели обучения, которые достигаются на данном уроке" : "Осы сабақта қол жеткізілетін оқу мақсаттары", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: criteria || "-" })] }), // Using criteria as learning goals mapping
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: lblGoal, bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: lessonGoal || "-" })] }),
              ],
            }),
          ],
        }),
        
        new Paragraph({ text: "" }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: lblFlow, bold: true, size: 28 })] }),
        new Paragraph({ text: "" }),

        // Lesson Flow Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Этап урока/ Время" : "Сабақтың кезеңі/ Уақыт", bold: true })], alignment: AlignmentType.CENTER })] }),
                new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: lblTeacherAct, bold: true })], alignment: AlignmentType.CENTER })] }),
                new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: lblStudentAct, bold: true })], alignment: AlignmentType.CENTER })] }),
                new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: lblEval, bold: true })], alignment: AlignmentType.CENTER })] }),
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: isRu ? "Ресурсы" : "Ресурстар", bold: true })], alignment: AlignmentType.CENTER })] }),
              ],
            }),
            ...(lessonStages && lessonStages.length > 0 ? lessonStages : [{stage: "Басы", teacherActions: lessonFlow?.substring(0, 500), studentActions: "-", evaluation: "-", resources: "-"}]).map((s: any) => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: s.stage || "-" })] }),
                new TableCell({ children: [new Paragraph({ text: s.teacherActions || "-" })] }),
                new TableCell({ children: [new Paragraph({ text: s.studentActions || "-" })] }),
                new TableCell({ children: [new Paragraph({ text: s.evaluation || "-" })] }),
                new TableCell({ children: [new Paragraph({ text: s.resources || resources || "-" })] }),
              ],
            })),
          ],
        }),
      ];
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: docChildren,
      }],
    });

    console.log("Doc object created, converting to buffer...");
    const buffer = await Packer.toBuffer(doc);
    console.log("Buffer ready, size:", buffer.length);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="zhospar.docx"',
      },
    });

  } catch (error: any) {
    console.error('Docx Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
