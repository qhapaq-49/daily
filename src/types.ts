export interface Child {
  id: string;
  name: string;
  color: string;  // hex like '#FF9EB5'
  emoji: string;  // e.g. '👧'
  createdAt: string;
}

export interface StickerBook {
  id: string;
  childId: string;
  name: string;
  stickerImage: string;  // emoji char or data: URL or http URL
  color: string;
  createdAt: string;
}

export interface StickerEntry {
  id: string;
  bookId: string;
  date: string;       // 'YYYY-MM-DD'
  completedAt: string; // ISO8601
  note?: string;
}

export interface AppData {
  children: Child[];
  books: StickerBook[];
  entries: StickerEntry[];
}
