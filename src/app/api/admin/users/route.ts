import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { username: 'asc' },
      select: {
        id: true,
        username: true,
        fio: true,
        phone: true,
        region: true,
        schoolType: true,
        schoolName: true,
        specialty: true,
        className: true,
        role: true,
        subEndsAt: true,
        // Mocking subscription object for frontend compatibility
      }
    });

    // Transform data to match the frontend expectations
    const formattedUsers = users.map(u => ({
      ...u,
      subscription: u.subEndsAt ? {
        status: new Date(u.subEndsAt) > new Date() ? 'ACTIVE' : 'EXPIRED',
        plan: u.role === 'SCHOOL_ADMIN' ? 'Мектеп' : 'Pro Мұғалім',
        startDate: '-', // We don't store start date currently
        endDate: new Date(u.subEndsAt).toLocaleDateString('ru-RU')
      } : { status: 'INACTIVE', plan: 'Базалық' }
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, action } = await request.json();

    if (action === 'APPROVE') {
      const end = new Date();
      end.setMonth(end.getMonth() + 1);

      await prisma.user.update({
        where: { username },
        data: { subEndsAt: end }
      });
    } else if (action === 'REJECT') {
      await prisma.user.update({
        where: { username },
        data: { subEndsAt: null }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
