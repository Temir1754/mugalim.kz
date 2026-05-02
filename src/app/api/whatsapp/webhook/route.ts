import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Это заглушка для функции отправки сообщений. 
// Позже мы подключим сюда реальный API (Green-API, Twilio и т.д.)
async function sendWhatsAppMessage(phone: string, text: string) {
  console.log(`[WhatsApp Outgoing] To: ${phone}, Text: ${text}`);
  // Пример для Green-API:
  // await fetch(`https://api.green-api.com/waInstance.../sendMessage/...`, { ... })
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Входящие данные (зависит от провайдера, приводим к общему виду)
    const phone = body.sender || body.from || body.chatId?.split('@')[0];
    const message = body.text || body.message?.text?.body || body.body;

    if (!phone || !message) return NextResponse.json({ ok: true });

    // 1. Ищем или создаем профиль WhatsApp
    let profile = await prisma.whatsAppProfile.findUnique({
      where: { phone },
      include: { user: true }
    });

    if (!profile) {
      profile = await prisma.whatsAppProfile.create({
        data: { phone, currentState: 'START' },
        include: { user: true }
      });
    }

    // 2. Проверка подписки (если есть привязанный юзер)
    const hasSubscription = profile.user?.subEndsAt && new Date(profile.user.subEndsAt) > new Date();
    
    // Логика состояний (State Machine)
    const state = profile.currentState;

    if (state === 'START' || message.toLowerCase() === 'привет') {
      await sendWhatsAppMessage(phone, 
        "Сәлем! Я ИИ-ассистент Мұғалім.kz 🤖\n\nЧтобы я мог готовить для вас документы, мне нужно один раз узнать данные вашей школы.\n\nНапишите название вашей школы:");
      
      await prisma.whatsAppProfile.update({
        where: { phone },
        data: { currentState: 'AWAITING_SCHOOL' }
      });
      return NextResponse.json({ ok: true });
    }

    if (state === 'AWAITING_SCHOOL') {
      await prisma.whatsAppProfile.update({
        where: { phone },
        data: { 
          schoolName: message,
          currentState: 'AWAITING_LANGUAGE'
        }
      });
      await sendWhatsAppMessage(phone, "Принято! На каком языке вы ведете уроки? \n1. Казахский \n2. Русский");
      return NextResponse.json({ ok: true });
    }

    if (state === 'AWAITING_LANGUAGE') {
      const lang = message.includes('1') || message.toLowerCase().includes('каз') ? 'kz' : 'ru';
      await prisma.whatsAppProfile.update({
        where: { phone },
        data: { 
          language: lang,
          currentState: 'IDLE'
        }
      });
      await sendWhatsAppMessage(phone, `Отлично! Профиль настроен.\nШкола: ${profile.schoolName}\nЯзык: ${lang === 'kz' ? 'Қазақша' : 'Русский'}\n\nЧто создаем сегодня?\n1. КТП (Календарный план)\n2. КСП (Поурочный план)`);
      return NextResponse.json({ ok: true });
    }

    // Если профиль настроен и мы в IDLE (Основное меню)
    if (state === 'IDLE') {
      if (message.includes('1')) {
        await prisma.whatsAppProfile.update({
          where: { phone },
          data: { currentState: 'AWAITING_KTP_CLASS' }
        });
        await sendWhatsAppMessage(phone, "Генерируем КТП. Для какого класса? (Напишите цифру, например: 8)");
      } else if (message.includes('2')) {
        await prisma.whatsAppProfile.update({
          where: { phone },
          data: { currentState: 'AWAITING_KSP_THEME' }
        });
        await sendWhatsAppMessage(phone, "Генерируем КСП (Поурочный план).\nНапишите тему урока:");
      } else {
        await sendWhatsAppMessage(phone, "Я вас не понял. Напишите '1' для КТП или '2' для КСП.");
      }
      return NextResponse.json({ ok: true });
    }

    // ЛОГИКА ДЛЯ КСП
    if (state === 'AWAITING_KSP_THEME') {
      await prisma.whatsAppProfile.update({
        where: { phone },
        data: { 
          tempData: { theme: message },
          currentState: 'AWAITING_KSP_CLASS'
        }
      });
      await sendWhatsAppMessage(phone, "Принято. Для какого класса этот урок?");
      return NextResponse.json({ ok: true });
    }

    if (state === 'AWAITING_KSP_CLASS') {
      const currentTemp = (profile.tempData as any) || {};
      const theme = currentTemp.theme;
      const className = message;
      
      await sendWhatsAppMessage(phone, `✨ Начинаю магию ИИ...\n\nСоздаю план для ${className} класса на тему: "${theme}".\n\nЭто займет около 10-15 секунд...`);

      try {
        const { generateAIContent, createDocx } = await import('@/lib/generator-core');
        const fs = await import('fs');
        const path = await import('path');

        // 1. Генерируем контент через ИИ
        const aiData = await generateAIContent(
          profile.mainSubject || "Предмет", 
          className, 
          theme, 
          profile.language || "ru"
        );

        // 2. Создаем Word файл
        const buf = await createDocx(
          aiData, 
          "КСП", 
          profile.user?.fio || "Учитель", 
          profile.schoolName || "Школа"
        );

        // 3. Сохраняем временно в public/temp
        const filename = `plan_${phone}_${Date.now()}.docx`;
        const filePath = path.join(process.cwd(), 'public', 'temp', filename);
        fs.writeFileSync(filePath, buf);

        const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/temp/${filename}`;

        await sendWhatsAppMessage(phone, `✅ Ваш план готов! \n\nСкачать файл: ${downloadUrl}`);
      } catch (err) {
        console.error("WhatsApp Generation Error:", err);
        await sendWhatsAppMessage(phone, "❌ Произошла ошибка при генерации. Пожалуйста, попробуйте позже или обратитесь в поддержку.");
      }

      await prisma.whatsAppProfile.update({
        where: { phone },
        data: { currentState: 'IDLE', tempData: {} }
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
