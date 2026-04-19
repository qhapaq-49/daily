import type { AppData } from '../types';

const DB_NAME = 'sticker-app-backup-db';
const STORE = 'handles';
const KEY = 'backup-file';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getHandle(): Promise<FileSystemFileHandle | null> {
  try {
    const db = await openDB();
    return new Promise(resolve => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

async function putHandle(handle: FileSystemFileHandle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(handle, KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function isSupported(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

export async function setupBackupFile(): Promise<boolean> {
  if (!isSupported()) return false;
  try {
    const handle = await (window as unknown as { showSaveFilePicker: (o: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
      suggestedName: 'シール帳バックアップ.json',
      types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
    });
    await putHandle(handle);
    return true;
  } catch { return false; }
}

export async function hasBackupFile(): Promise<boolean> {
  return (await getHandle()) !== null;
}

type ExtHandle = FileSystemFileHandle & {
  queryPermission: (o: unknown) => Promise<string>;
  requestPermission: (o: unknown) => Promise<string>;
};

let sessionPermissionGranted = false;

export async function writeBackupFile(data: AppData): Promise<void> {
  const handle = await getHandle();
  if (!handle) return;
  try {
    const h = handle as ExtHandle;
    if (!sessionPermissionGranted) {
      let perm = await h.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') perm = await h.requestPermission({ mode: 'readwrite' });
      if (perm !== 'granted') return;
      sessionPermissionGranted = true;
    }
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2));
    await writable.close();
  } catch { /* fail silently */ }
}
