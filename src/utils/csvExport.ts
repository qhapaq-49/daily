import type { AppData } from '../types';

export function generateCsv(data: AppData, bookId?: string): string {
  const header = '子ども名,シール帳名,日付,達成時刻,メモ';

  const entries = bookId
    ? data.entries.filter(e => e.bookId === bookId)
    : data.entries;

  const rows = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(entry => {
      const book = data.books.find(b => b.id === entry.bookId);
      const child = book ? data.children.find(c => c.id === book.childId) : null;
      const time = new Date(entry.completedAt).toLocaleTimeString('ja-JP', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
      const note = entry.note ?? '';
      return `${child?.name ?? ''},${book?.name ?? ''},${entry.date},${time},${note}`;
    });

  return [header, ...rows].join('\n');
}

export function downloadCsv(data: AppData, bookId?: string): void {
  const csv = generateCsv(data, bookId);
  const bom = '\uFEFF'; // BOM for Excel / Numbers compatibility
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `シール帳_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
