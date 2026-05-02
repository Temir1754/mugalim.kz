import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const passwordHash = await bcrypt.hash('teacher123', 10);
    
    const user = await prisma.user.upsert({
      where: { username: 'teacher' },
      update: {
        balance: 5000,
        subEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      create: {
        username: 'teacher',
        passwordHash: passwordHash,
        fio: 'Тестовый Учитель',
        phone: '+77770000000',
        region: 'Алматы',
        gender: 'Мужской',
        specialty: 'Информатика',
        role: 'CLIENT',
        balance: 5000,
        subEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Тестовый клиент создан/обновлен",
      user: {
        username: user.username,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
