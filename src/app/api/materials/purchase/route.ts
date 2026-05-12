import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, materialId } = await request.json();

    if (!userId || !materialId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Connect the user to the material in the PurchasedMaterials relationship
    await prisma.user.update({
      where: { id: userId },
      data: {
        purchasedMaterials: {
          connect: { id: materialId }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Purchase Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
