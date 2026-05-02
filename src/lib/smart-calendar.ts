export class SmartCalendar {
    yearStart: Date;
    yearEnd: Date;
    holidays: string[];
    vacations: { start: Date; end: Date }[];
  
    constructor() {
      // Учебный год: 1 сентября 2025 - 25 мая 2026
      this.yearStart = new Date("2025-09-01T00:00:00");
      this.yearEnd = new Date("2026-05-25T00:00:00");
  
      // Массив государственных праздников РК (в формате ММ-ДД)
      this.holidays = [
        "10-25", // День Республики
        "12-16", // День Независимости
        "03-08", // 8 марта
        "03-21", // Наурыз (21-23 марта)
        "03-22",
        "03-23",
        "05-01", // День Единства
        "05-07", // День Защитника Отчества
        "05-09"  // День Победы
      ];
  
      // Каникулы (диапазоны дат)
      this.vacations = [
        { start: new Date("2025-10-27T00:00:00"), end: new Date("2025-11-02T23:59:59") }, // Осенние
        { start: new Date("2025-12-29T00:00:00"), end: new Date("2026-01-08T23:59:59") }, // Зимние
        { start: new Date("2026-03-21T00:00:00"), end: new Date("2026-03-31T23:59:59") }  // Весенние
      ];
    }
  
    // Проверка, является ли день выходным или праздником
    isValidSchoolDay(date: Date): boolean {
      // 1. Проверяем выходные (суббота - 6, воскресенье - 0)
      if (date.getDay() === 0 || date.getDay() === 6) {
        return false;
      }
  
      // 2. Проверяем государственные праздники
      const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if (this.holidays.includes(monthDay)) {
        return false;
      }
  
      // 3. Проверяем каникулы
      for (const vac of this.vacations) {
        if (date >= vac.start && date <= vac.end) {
          return false;
        }
      }
  
      return true;
    }
  
    // Генерация массива "чистых" дат
    generateLessonDates(dayOfWeekStr: string, totalHours: number): string[] {
      // Маппинг строкового аббревиатурного дня в JS Date getDay (0-6)
      const daysMap: Record<string, number> = {
        "Пн": 1, "Вт": 2, "Ср": 3, "Чт": 4, "Пт": 5, "Сб": 6
      };
      
      const targetDay = daysMap[dayOfWeekStr] || 1; 

      let currentDate = new Date(this.yearStart);
      const validDates: string[] = [];
  
      // Находим первый нужный день недели
      while (currentDate.getDay() !== targetDay) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      // Набираем часы
      // Ограничиваем цикл концом учебного года
      while (validDates.length < totalHours && currentDate <= this.yearEnd) {
        if (this.isValidSchoolDay(currentDate)) {
          // Преобразуем в красивый формат (DD.MM.YYYY)
          const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${currentDate.getFullYear()}`;
          validDates.push(formattedDate);
        }
        
        // Прыгаем на неделю вперед
        currentDate.setDate(currentDate.getDate() + 7);
      }
  
      return validDates;
    }
  }
