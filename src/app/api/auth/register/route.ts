import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { 
      username, password, fio, phone, region, 
      schoolType, schoolName, isClassTeacher, className, 
      gender, specialty, role, avatarUrl 
    } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        fio: fio || '',
        phone: phone || '',
        region: region || '',
        schoolType: schoolType || '',
        schoolName: schoolName || '',
        isClassTeacher: isClassTeacher || 'Жоқ',
        className: className || '',
        gender: gender || '',
        specialty: specialty || 'Көрсетілмеген',
        role: role || 'CLIENT',
        avatarUrl: avatarUrl || '',
      },
    });

    return NextResponse.json({ 
        message: 'User created successfully',
        userId: user.id 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
