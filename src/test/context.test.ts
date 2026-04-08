import { describe, it, expect } from 'vitest';
import { reducer, loadData, saveData } from '../context';
import type { AppData, Child, StickerBook, StickerEntry } from '../types';

const emptyData: AppData = { children: [], books: [], entries: [] };

const child1: Child = { id: 'c1', name: '太郎', color: '#FF9EB5', emoji: '👦', createdAt: '2026-01-01T00:00:00.000Z' };
const child2: Child = { id: 'c2', name: '花子', color: '#C9A0FF', emoji: '👧', createdAt: '2026-01-02T00:00:00.000Z' };
const book1: StickerBook = { id: 'b1', childId: 'c1', name: '歯磨き', stickerImage: '🦷', color: '#A0C4FF', createdAt: '2026-01-01T00:00:00.000Z' };
const book2: StickerBook = { id: 'b2', childId: 'c1', name: '宿題', stickerImage: '📚', color: '#C9A0FF', createdAt: '2026-01-01T00:00:00.000Z' };
const entry1: StickerEntry = { id: 'e1', bookId: 'b1', date: '2026-04-01', completedAt: '2026-04-01T08:00:00.000Z' };

// --- Child operations ---
describe('ADD_CHILD', () => {
  it('adds a child to empty state', () => {
    const next = reducer(emptyData, { type: 'ADD_CHILD', payload: child1 });
    expect(next.children).toHaveLength(1);
    expect(next.children[0]).toEqual(child1);
  });

  it('appends without affecting other children', () => {
    const state: AppData = { ...emptyData, children: [child1] };
    const next = reducer(state, { type: 'ADD_CHILD', payload: child2 });
    expect(next.children).toHaveLength(2);
    expect(next.children[1]).toEqual(child2);
  });
});

describe('UPDATE_CHILD', () => {
  it('updates the matched child', () => {
    const state: AppData = { ...emptyData, children: [child1, child2] };
    const updated = { ...child1, emoji: '🐱', name: '太郎改' };
    const next = reducer(state, { type: 'UPDATE_CHILD', payload: updated });
    expect(next.children).toHaveLength(2);
    expect(next.children[0]).toEqual(updated);
    expect(next.children[1]).toEqual(child2); // unchanged
  });

  it('updates the 2nd child without affecting the 1st', () => {
    const state: AppData = { ...emptyData, children: [child1, child2] };
    const updated = { ...child2, emoji: 'data:image/jpeg;base64,abc123', name: '花子改' };
    const next = reducer(state, { type: 'UPDATE_CHILD', payload: updated });
    expect(next.children[0]).toEqual(child1); // unchanged
    expect(next.children[1]).toEqual(updated);
  });

  it('does not mutate original state', () => {
    const state: AppData = { ...emptyData, children: [child1] };
    const updated = { ...child1, emoji: '🐶' };
    reducer(state, { type: 'UPDATE_CHILD', payload: updated });
    expect(state.children[0].emoji).toBe('👦'); // original unchanged
  });
});

describe('DELETE_CHILD', () => {
  it('removes the child and cascades to books and entries', () => {
    const state: AppData = {
      children: [child1, child2],
      books: [book1, book2, { ...book1, id: 'b3', childId: 'c2' }],
      entries: [entry1, { ...entry1, id: 'e2', bookId: 'b3' }],
    };
    const next = reducer(state, { type: 'DELETE_CHILD', payload: 'c1' });
    expect(next.children).toHaveLength(1);
    expect(next.children[0]).toEqual(child2);
    expect(next.books.every(b => b.childId !== 'c1')).toBe(true);
    expect(next.entries.every(e => e.bookId !== 'b1' && e.bookId !== 'b2')).toBe(true);
    // child2's book/entry remain
    expect(next.books).toHaveLength(1);
    expect(next.entries).toHaveLength(1);
  });
});

// --- Book operations ---
describe('ADD_BOOK', () => {
  it('adds a book', () => {
    const next = reducer(emptyData, { type: 'ADD_BOOK', payload: book1 });
    expect(next.books).toHaveLength(1);
    expect(next.books[0]).toEqual(book1);
  });
});

describe('UPDATE_BOOK', () => {
  it('updates the matched book only', () => {
    const state: AppData = { ...emptyData, books: [book1, book2] };
    const updated = { ...book1, name: '歯磨き（朝）' };
    const next = reducer(state, { type: 'UPDATE_BOOK', payload: updated });
    expect(next.books[0].name).toBe('歯磨き（朝）');
    expect(next.books[1]).toEqual(book2);
  });
});

describe('DELETE_BOOK', () => {
  it('removes the book and its entries', () => {
    const state: AppData = {
      ...emptyData,
      books: [book1, book2],
      entries: [entry1, { ...entry1, id: 'e2', bookId: 'b2' }],
    };
    const next = reducer(state, { type: 'DELETE_BOOK', payload: 'b1' });
    expect(next.books).toHaveLength(1);
    expect(next.books[0]).toEqual(book2);
    expect(next.entries).toHaveLength(1);
    expect(next.entries[0].bookId).toBe('b2');
  });
});

// --- Entry operations ---
describe('ADD_ENTRY', () => {
  it('adds an entry', () => {
    const next = reducer(emptyData, { type: 'ADD_ENTRY', payload: entry1 });
    expect(next.entries).toHaveLength(1);
  });

  it('prevents duplicate entry for same bookId+date', () => {
    const state: AppData = { ...emptyData, entries: [entry1] };
    const dup = { ...entry1, id: 'e_dup' };
    const next = reducer(state, { type: 'ADD_ENTRY', payload: dup });
    expect(next.entries).toHaveLength(1);
  });

  it('allows same date for different books', () => {
    const state: AppData = { ...emptyData, entries: [entry1] };
    const other = { ...entry1, id: 'e2', bookId: 'b2' };
    const next = reducer(state, { type: 'ADD_ENTRY', payload: other });
    expect(next.entries).toHaveLength(2);
  });
});

describe('REMOVE_ENTRY', () => {
  it('removes the entry by id', () => {
    const state: AppData = { ...emptyData, entries: [entry1] };
    const next = reducer(state, { type: 'REMOVE_ENTRY', payload: 'e1' });
    expect(next.entries).toHaveLength(0);
  });
});

// --- Storage ---
describe('saveData / loadData', () => {
  it('round-trips data through localStorage', () => {
    const data: AppData = { children: [child1], books: [book1], entries: [entry1] };
    saveData(data);
    const loaded = loadData();
    expect(loaded).toEqual(data);
  });

  it('loadData returns empty state when nothing stored', () => {
    const loaded = loadData();
    expect(loaded).toEqual({ children: [], books: [], entries: [] });
  });

  it('loadData returns empty state on corrupt JSON', () => {
    localStorage.setItem('sticker-app-v1', 'not-json');
    const loaded = loadData();
    expect(loaded).toEqual({ children: [], books: [], entries: [] });
  });

  it('saveData does not throw on quota error', () => {
    const orig = localStorage.setItem;
    localStorage.setItem = () => { throw new DOMException('QuotaExceededError'); };
    expect(() => saveData(emptyData)).not.toThrow();
    localStorage.setItem = orig;
  });
});
