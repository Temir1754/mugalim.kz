import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { title, type, subject, classNumber, price, fileUrl, authorId } = await request.json();

    if (!fileUrl || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const material = await prisma.material.create({
      data: {
        type: type || 'КТП',
        subject: subject || 'Көрсетілмеген',
        dayOfWeek: '-', // Can be expanded later
        classNumber: classNumber || '1',
        fileUrl: fileUrl,
        authorId: authorId,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, material });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const isAdmin = searchParams.get('admin') === 'true';

    if (id) {
      const material = await prisma.material.findUnique({
        where: { id },
        include: { author: { select: { fio: true } } }
      });
      return NextResponse.json(material);
    }

    const materials = await prisma.material.findMany({
      where: isAdmin ? {} : { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { fio: true } } }
    });
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}
