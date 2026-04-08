import { today, formatDate } from './dateUtils';
import type { AppData } from '../types';

// Unique dates on which any sticker was placed for a child
function childDates(data: AppData, childId: string): string[] {
  const bookIds = new Set(data.books.filter(b => b.childId === childId).map(b => b.id));
  return [...new Set(data.entries.filter(e => bookIds.has(e.bookId)).map(e => e.date))];
}

// Current streak: consecutive days ending today (or yesterday)
export function calcStreak(data: AppData, childId: string): number {
  const dates = new Set(childDates(data, childId));
  if (dates.size === 0) return 0;

  const todayStr = today();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // Streak is valid if today or yesterday has a sticker
  let cursor = dates.has(todayStr) ? todayStr : dates.has(yesterdayStr) ? yesterdayStr : null;
  if (!cursor) return 0;

  let streak = 0;
  while (dates.has(cursor!)) {
    streak++;
    const d = new Date(cursor!);
    d.setDate(d.getDate() - 1);
    cursor = formatDate(d);
  }
  return streak;
}

// Best streak ever
export function calcBestStreak(data: AppData, childId: string): number {
  const dates = [...new Set(childDates(data, childId))].sort();
  if (dates.length === 0) return 0;

  let best = 1, current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    prev.setDate(prev.getDate() + 1);
    if (formatDate(prev) === dates[i]) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

// This month's total sticker count for a child
export function calcThisMonth(data: AppData, childId: string): number {
  const bookIds = new Set(data.books.filter(b => b.childId === childId).map(b => b.id));
  const now = new Date();
  return data.entries.filter(e => {
    if (!bookIds.has(e.bookId)) return false;
    const [ey, em] = e.date.split('-').map(Number);
    return ey === now.getFullYear() && em === now.getMonth() + 1;
  }).length;
}

// Last month's total
export function calcLastMonth(data: AppData, childId: string): number {
  const bookIds = new Set(data.books.filter(b => b.childId === childId).map(b => b.id));
  const now = new Date();
  const lm = now.getMonth() === 0 ? 12 : now.getMonth();
  const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return data.entries.filter(e => {
    if (!bookIds.has(e.bookId)) return false;
    const [ey, em] = e.date.split('-').map(Number);
    return ey === ly && em === lm;
  }).length;
}

// All-time total
export function calcTotal(data: AppData, childId: string): number {
  const bookIds = new Set(data.books.filter(b => b.childId === childId).map(b => b.id));
  return data.entries.filter(e => bookIds.has(e.bookId)).length;
}
