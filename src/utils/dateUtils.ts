export function today(): string {
  return formatDate(new Date());
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getMonthDays(year: number, month: number): { date: string; dayOfWeek: number }[] {
  const days = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    days.push({ date: formatDate(date), dayOfWeek: date.getDay() });
  }
  return days;
}

export function formatMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}

export function isFuture(dateStr: string): boolean {
  return dateStr > today();
}

export function isToday(dateStr: string): boolean {
  return dateStr === today();
}

export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // 'YYYY-MM'
}
