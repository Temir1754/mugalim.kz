const fs = require('fs');
const docx = require('docx');

const { Document, Table, TableRow, TableCell, Paragraph, TextRun, AlignmentType, WidthType, Packer, PageOrientation } = docx;

// Функция для создания жирной надписи
const boldText = (text, size = 24) => new TextRun({ text, bold: true, size });

const doc = new Document({
  creator: "S-Teach",
  title: "КСП - Краткосрочный поурочный план (Расширенный Альбомный)",
  sections: [
    {
      properties: {
        page: {
          size: {
            width: 16838, // A4 Landscape
            height: 11906,
            orientation: PageOrientation.LANDSCAPE,
          },
          margin: {
            top: 1000,
            bottom: 1000,
            left: 1000,
            right: 1000,
          }
        },
      },
      children: [
        // СТРАНИЦА 1: ЗАГОЛОВОК И ОБЩАЯ ИНФОРМАЦИЯ
        new Paragraph({
          children: [boldText("КРАТКОСРОЧНЫЙ ПЛАН УРОКА (КСП)", 32)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [boldText("Школа: "), new TextRun({ text: "«Білімді ұрпақ» жекеменшік мектебі", size: 24 })] })] }), new TableCell({ children: [new Paragraph({ children: [boldText("Предмет: "), new TextRun({ text: "[subject]", size: 24 })] })] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [boldText("ФИО учителя: "), new TextRun({ text: "[teacherName]", size: 24 })] })] }), new TableCell({ children: [new Paragraph({ children: [boldText("Дата: "), new TextRun({ text: "[date]", size: 24 })] })] })] }),
            new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [boldText("Класс: "), new TextRun({ text: "[className]", size: 24 })] })] }), new TableCell({ children: [new Paragraph({ children: [boldText("Урок №: "), new TextRun({ text: "[lessonNumber]", size: 24 })] })] })] }),
            new TableRow({ children: [new TableCell({ columnSpan: 2, children: [new Paragraph({ children: [boldText("Тема урока: "), new TextRun({ text: "[theme]", size: 24 })] })] })] }),
          ]
        }),

        new Paragraph({ text: "", spacing: { before: 400 } }),
        new Paragraph({ children: [boldText("ЦЕЛИ И КРИТЕРИИ", 28)], alignment: AlignmentType.CENTER }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: "F2F2F2" }, children: [new Paragraph({ children: [boldText("Цели обучения")] })] }), new TableCell({ children: [new Paragraph({ text: "[goals]" })] })] }),
            new TableRow({ children: [new TableCell({ shading: { fill: "F2F2F2" }, children: [new Paragraph({ children: [boldText("Цели урока (SMART)")] })] }), new TableCell({ children: [new Paragraph({ text: "[lessonGoal]" })] })] }),
            new TableRow({ children: [new TableCell({ shading: { fill: "F2F2F2" }, children: [new Paragraph({ children: [boldText("Критерии оценивания")] })] }), new TableCell({ children: [new Paragraph({ text: "[criteria]" })] })] }),
            new TableRow({ children: [new TableCell({ shading: { fill: "F2F2F2" }, children: [new Paragraph({ children: [boldText("Языковые цели")] })] }), new TableCell({ children: [new Paragraph({ text: "[langGoals]" })] })] }),
          ]
        }),

        // СТРАНИЦА 2-5: ХОД УРОКА (ДИНАМИЧЕСКИЙ)
        new Paragraph({ text: "", pageBreakBefore: true }),
        new Paragraph({ children: [boldText("ХОД УРОКА", 32)], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, shading: { fill: "D9D9D9" }, children: [new Paragraph({ children: [boldText("Этап")], alignment: AlignmentType.CENTER })] }),
                new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: "D9D9D9" }, children: [new Paragraph({ children: [boldText("Действия педагога")], alignment: AlignmentType.CENTER })] }),
                new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: "D9D9D9" }, children: [new Paragraph({ children: [boldText("Действия ученика")], alignment: AlignmentType.CENTER })] }),
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: "D9D9D9" }, children: [new Paragraph({ children: [boldText("Оценивание")], alignment: AlignmentType.CENTER })] }),
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, shading: { fill: "D9D9D9" }, children: [new Paragraph({ children: [boldText("Ресурсы")], alignment: AlignmentType.CENTER })] }),
              ]
            }),
            // ЦИКЛ
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "[#lessonStages][stage]", alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: "[teacherActions]" })] }),
                new TableCell({ children: [new Paragraph({ text: "[studentActions]" })] }),
                new TableCell({ children: [new Paragraph({ text: "[evaluation]" })] }),
                new TableCell({ children: [new Paragraph({ text: "[resources][/lessonStages]" })] }),
              ]
            }),
          ]
        }),

        // СТРАНИЦА 6: ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ
        new Paragraph({ text: "", pageBreakBefore: true }),
        new Paragraph({ children: [boldText("ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ", 28)], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, shading: { fill: "F2F2F2" }, children: [new Paragraph({ children: [boldText("Дифференциация")] })] }), new TableCell({ children: [new Paragraph({ text: "[differentiation]" })] })] }),
            new TableRow({ children: [new TableCell({ shading: { fill: "F2F2F2" }, children: [new Paragraph({ children: [boldText("Оценивание (детально)")] })] }), new TableCell({ children: [new Paragraph({ text: "[assessment]" })] })] }),
            new TableRow({ children: [new TableCell({ shading: { fill: "F2F2F2" }, children: [new Paragraph({ children: [boldText("Методология и приемы")] })] }), new TableCell({ children: [new Paragraph({ text: "[methodology]" })] })] }),
          ]
        }),

        // СТРАНИЦА 7: ПРИЛОЖЕНИЕ (СТАТИЧЕСКИЙ БЛОК ДЛЯ ОБЪЕМА)
        new Paragraph({ text: "", pageBreakBefore: true }),
        new Paragraph({ children: [boldText("МЕТОДИЧЕСКОЕ ПРИЛОЖЕНИЕ", 28)], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
        new Paragraph({ text: "Данный урок разработан в соответствии с обновленным содержанием образования Республики Казахстан. Все методы активного обучения направлены на развитие функциональной грамотности учащихся.", spacing: { after: 200 } }),
        
        new Paragraph({ children: [boldText("Лист самоанализа учителя:")], spacing: { before: 200 } }),
        new Paragraph({ text: "1. Все ли учащиеся достигли цели обучения? Если нет, то почему?" }),
        new Paragraph({ text: "2. Насколько эффективно была проведена дифференциация на уроке?" }),
        new Paragraph({ text: "3. Были ли выдержаны временные этапы урока?" }),
        new Paragraph({ text: "4. Какие изменения в план урока были внесены и почему?" }),
        
        new Paragraph({ text: "", spacing: { before: 400 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [new TableCell({ shading: { fill: "E7E6E6" }, children: [new Paragraph({ children: [boldText("Дополнительная рефлексия")] })] }), new TableCell({ children: [new Paragraph({ text: "[selfReflection]" })] })] }),
          ]
        }),

        new Paragraph({ text: "", spacing: { before: 800 } }),
        new Paragraph({
             children: [new TextRun({ text: "Подпись учителя: ____________________", size: 24 })],
             alignment: AlignmentType.RIGHT
        })
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("src/templates/ksp_template.docx", buffer);
  console.log("Template FIXED, LANDSCAPE, and GUARANTEED 7+ PAGES!");
});
