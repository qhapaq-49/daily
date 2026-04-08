import type { AppData } from '../types';

const STORAGE_KEY = 'sticker-app-v1';

interface BackupFile {
  version: number;
  exportedAt: string;
  data: AppData;
}

export function exportJson(data: AppData): void {
  const backup: BackupFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `シール帳バックアップ_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackupFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as BackupFile;
        if (!parsed.data?.children || !parsed.data?.books || !parsed.data?.entries) {
          reject(new Error('ファイルの形式が正しくありません'));
          return;
        }
        resolve(parsed.data);
      } catch {
        reject(new Error('ファイルを読み込めませんでした'));
      }
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsText(file);
  });
}

export function applyImport(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.location.reload();
}
