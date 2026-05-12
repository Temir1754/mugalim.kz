import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  if (!data.embedding) throw new Error("Gemini API Embedding failed");
  return data.embedding.values;
}

export async function POST(req: Request) {
  console.log("--- START RAG UPLOAD ---");
  
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const textbookId = formData.get("textbookId") as string;

    console.log("File received:", file?.name, "Size:", file?.size);
    console.log("Textbook ID:", textbookId);

    if (!file || !textbookId) {
      return NextResponse.json({ error: "No file or textbookId" }, { status: 400 });
    }

    // Читаем текст
    let text = "";
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const data = await pdf(buffer);
      text = data.text;
    } catch (pdfError) {
      console.error("PDF Parse error:", pdfError);
      return NextResponse.json({ error: "Failed to read PDF file content" }, { status: 500 });
    }

    if (!text || text.length < 10) {
      return NextResponse.json({ error: "PDF is empty or unreadable" }, { status: 400 });
    }

    const chunks = text.split(/\n\n/).filter(c => c.trim().length > 50).slice(0, 50);
    console.log(`Processing ${chunks.length} chunks...`);

    let count = 0;
    for (const chunk of chunks) {
      try {
        const embedding = await getGeminiEmbedding(chunk);
        await prisma.$executeRawUnsafe(
          `INSERT INTO "KnowledgeChunk" (id, "textbookId", content, embedding, "createdAt") 
           VALUES (gen_random_uuid(), $1, $2, $3::vector, now())`,
          textbookId,
          chunk.trim(),
          `[${embedding.join(",")}]`
        );
        count++;
      } catch (e) {
        console.error("Chunk error:", e);
      }
    }

    console.log(`--- SUCCESS: ${count} chunks saved ---`);
    return NextResponse.json({ success: true, message: `Оқытылды! ${count} блок сақталды.` });

  } catch (error: any) {
    console.error("FATAL API ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
