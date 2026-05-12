"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
// @ts-ignore
import pdf from "pdf-extraction";

async function getGeminiEmbedding(text: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-2",
        content: { parts: [{ text }] },
        outputDimensionality: 1536
      }),
    }
  );

  const data = await response.json();
  if (!data.embedding) {
    console.error("Embedding API Error:", data);
    throw new Error("Gemini API Embedding failed");
  }
  return data.embedding.values;
}

export async function processTextbookPdf(formData: FormData) {
  const file = formData.get("file") as File;
  const textbookId = formData.get("textbookId") as string;

  if (!file || !textbookId) throw new Error("File or TextbookId missing");

  console.log(`[ServerAction] Processing ${file.name} (${file.size} bytes)`);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const pdfData = await pdf(buffer);
    const text = pdfData.text;

    if (!text || text.length < 10) {
        console.error("PDF text extraction failed or text too short");
        throw new Error("PDF content unreadable or empty");
    }

    console.log(`[ServerAction] Extracted text length: ${text.length} chars`);

    // Более надежное разбиение: сначала пробуем по абзацам, если не вышло — по длине
    let rawChunks = text.split(/\n\s*\n/).map((c: string) => c.trim()).filter((c: string) => c.length > 50);
    
    if (rawChunks.length < 5) {
        console.log("[ServerAction] Paragraph splitting failed, using length-based splitting");
        // Разбиваем каждые 1000 символов
        rawChunks = [];
        for (let i = 0; i < text.length; i += 1000) {
            rawChunks.push(text.substring(i, i + 1100).trim()); // Небольшое перекрытие
        }
    }

    const chunks = rawChunks.slice(0, 50); // Берем 50 чанков для теста
    console.log(`[ServerAction] Final chunks to process: ${chunks.length}`);

    let count = 0;
    for (const chunkText of chunks) {
      try {
        const embedding = await getGeminiEmbedding(chunkText);
        const id = crypto.randomUUID();
        
        await prisma.$executeRawUnsafe(
          `INSERT INTO "KnowledgeChunk" (id, "textbookId", content, embedding, "createdAt") 
           VALUES ($1, $2, $3, $4::vector, now())`,
          id,
          textbookId,
          chunkText,
          `[${embedding.join(",")}]`
        );
        count++;
        if (count % 10 === 0) console.log(`[ServerAction] Progress: ${count} chunks saved...`);
      } catch (e: any) {
        console.error("Chunk save error:", e.message);
      }
    }

    return { success: true, message: `${count} блок сақталды.` };
  } catch (error: any) {
    console.error("Server Action Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getSubjects() {
  return await prisma.subject.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function addTextbook(data: { 
  subjectId?: string, 
  newSubjectName?: string,
  grade: number,
  publisher: string,
  author: string,
  year: number,
  part?: number | string,
  language?: string
}) {
  try {
    let finalSubjectId = data.subjectId;

    // Если передан текст нового предмета
    if (data.newSubjectName && data.newSubjectName.trim()) {
      const subject = await prisma.subject.upsert({
        where: { name: data.newSubjectName.trim() },
        update: {},
        create: { name: data.newSubjectName.trim() }
      });
      finalSubjectId = subject.id;
    }

    if (!finalSubjectId || finalSubjectId === "new" || finalSubjectId === "") {
      throw new Error("Пән таңдалмаған немесе дұрыс емес");
    }

    const textbook = await prisma.textbook.create({
      data: {
        subjectId: finalSubjectId,
        grade: data.grade ? Number(data.grade) : 0,
        publisher: data.publisher || "",
        author: data.author || "",
        year: data.year ? Number(data.year) : new Date().getFullYear(),
        // @ts-ignore
        part: (data.part && data.part.toString().trim() !== "") ? Number(data.part) : null,
        // @ts-ignore
        language: data.language || null
      }
    });

    return { success: true, textbook };
  } catch (error: any) {
    console.error("Add Textbook Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTextbook(id: string, data: {
  subjectId: string,
  subjectName?: string,
  grade: number,
  publisher: string,
  author: string,
  year: number,
  part?: number | string,
  language?: string
}) {
  try {
    let finalSubjectId = data.subjectId;

    // Если передано новое имя предмета
    if (data.subjectName && data.subjectName.trim()) {
      const cleanName = data.subjectName.trim();
      
      // Ищем, нет ли уже предмета с таким (правильным) именем
      const existingSubject = await prisma.subject.findUnique({
        where: { name: cleanName }
      });

      if (existingSubject) {
        // Если такой предмет уже есть, просто переносим книгу в него
        finalSubjectId = existingSubject.id;
      } else {
        // Если такого имени еще нет, переименовываем текущий предмет
        await prisma.subject.update({
          where: { id: data.subjectId },
          data: { name: cleanName }
        });
      }
    }

    const textbook = await prisma.textbook.update({
      where: { id },
      data: {
        subjectId: finalSubjectId,
        grade: data.grade ? Number(data.grade) : 0,
        publisher: data.publisher || "",
        author: data.author || "",
        year: data.year ? Number(data.year) : new Date().getFullYear(),
        // @ts-ignore
        part: (data.part && data.part.toString().trim() !== "") ? Number(data.part) : null,
        // @ts-ignore
        language: data.language || null
      }
    });
    return { success: true, textbook };
  } catch (error: any) {
    console.error("Update Textbook Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTextbook(id: string) {
  try {
    await prisma.$transaction([
      prisma.topic.deleteMany({ where: { textbookId: id } }),
      prisma.knowledgeChunk.deleteMany({ where: { textbookId: id } }),
      prisma.textbook.delete({ where: { id } })
    ]);
    return { success: true };
  } catch (error: any) {
    console.error("Delete Textbook Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getTextbookTopicsRaw(textbookId: string) {
  try {
    const topics = await prisma.topic.findMany({
      where: { textbookId },
      orderBy: { order: "asc" }
    });
    return { success: true, text: topics.map(t => t.name).join("\n") };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveTextbookTopicsRaw(textbookId: string, rawText: string) {
  try {
    const lines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    
    await prisma.$transaction(async (tx) => {
      await tx.topic.deleteMany({ where: { textbookId } });
      
      let order = 1;
      for (const line of lines) {
        await tx.topic.create({
          data: {
            textbookId,
            name: line,
            order: order++
          }
        });
      }
    });

    return { success: true, count: lines.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
