import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        purchasedMaterials: {
          include: { author: { select: { fio: true } } }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format subscription for frontend compatibility
    const formattedUser = {
      ...user,
      subscription: user.subEndsAt ? {
        status: new Date(user.subEndsAt) > new Date() ? 'ACTIVE' : 'EXPIRED',
        plan: user.role === 'SCHOOL_ADMIN' ? 'Мектеп' : 'Pro Мұғалім',
        endDate: new Date(user.subEndsAt).toLocaleDateString('ru-RU')
      } : { status: 'INACTIVE', plan: 'Базалық' }
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
