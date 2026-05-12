import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ error: 'ID and action are required' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      await prisma.material.update({
        where: { id },
        data: { status: 'APPROVED' }
      });
    } else if (action === 'REJECT') {
      await prisma.material.update({
        where: { id },
        data: { status: 'REJECTED' }
      });
    } else if (action === 'DELETE') {
      await prisma.material.delete({
        where: { id }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin Materials Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
