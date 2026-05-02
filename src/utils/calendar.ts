/**
 * Умный календарь для расчета дат уроков КТП
 * Учебный год 2025-2026 (Казахстан)
 */

export interface LessonDate {
  index: number;
  date: string;
}

export class SmartCalendar {
  private yearStart = new Date("2025-09-01");
  private yearEnd = new Date("2026-05-25");

  // Государственные праздники РК (ММ-ДД)
  private holidays = [
    "10-25", // День Республики
    "12-16", // День Независимости
    "03-08", // 8 марта
    "03-21", // Наурыз
    "03-22",
    "03-23",
    "05-01", // День Единства
    "05-07", // День Защитника Отчества
    "05-09", // День Победы
    "01-01", // Новый год
    "01-02",
  ];

  // Каникулы 2025-2026
  private vacations = [
    { start: new Date("2025-10-27"), end: new Date("2025-11-02") }, // Осенние
    { start: new Date("2025-12-29"), end: new Date("2026-01-08") }, // Зимние
    { start: new Date("2026-03-21"), end: new Date("2026-03-31") }, // Весенние
  ];

  isValidSchoolDay(date: Date): boolean {
    // 1. Пропуски выходных (Воскресенье всегда выходной)
    // По умолчанию считаем, что Суббота может быть рабочей (для 6-дневки)
    if (date.getDay() === 0) return false;

    // 2. Праздники
    const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
    if (this.holidays.includes(monthDay)) return false;

    // 3. Каникулы
    for (const vac of this.vacations) {
      if (date >= vac.start && date <= vac.end) return false;
    }

    return true;
  }

  /**
   * Генерирует массив дат на основе выбранных дней недели
   * @param selectedWeekDays Массив дней недели (0=Вс, 1=Пн, ..., 6=Сб)
   * @param totalHours Общее количество часов в году
   */
  generateDates(selectedWeekDays: number[], totalHours: number): string[] {
    const dates: string[] = [];
    let currentDate = new Date(this.yearStart);

    // Пока не набрали нужное количество часов и не вышли за границы года
    while (dates.length < totalHours && currentDate <= this.yearEnd) {
      if (selectedWeekDays.includes(currentDate.getDay())) {
        if (this.isValidSchoolDay(currentDate)) {
          dates.push(currentDate.toLocaleDateString("ru-RU"));
        }
      }
      // Переходим к следующему дню
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
}

export const calendar = new SmartCalendar();
