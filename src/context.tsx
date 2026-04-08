import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppData, Child, StickerBook, StickerEntry } from './types';

const STORAGE_KEY = 'sticker-app-v1';

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { children: [], books: [], entries: [] };
    return JSON.parse(raw);
  } catch {
    return { children: [], books: [], entries: [] };
  }
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type Action =
  | { type: 'ADD_CHILD'; payload: Child }
  | { type: 'UPDATE_CHILD'; payload: Child }
  | { type: 'DELETE_CHILD'; payload: string }
  | { type: 'ADD_BOOK'; payload: StickerBook }
  | { type: 'UPDATE_BOOK'; payload: StickerBook }
  | { type: 'DELETE_BOOK'; payload: string }
  | { type: 'ADD_ENTRY'; payload: StickerEntry }
  | { type: 'REMOVE_ENTRY'; payload: string }
  | { type: 'UPDATE_ENTRY'; payload: StickerEntry };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'ADD_CHILD':
      return { ...state, children: [...state.children, action.payload] };
    case 'UPDATE_CHILD':
      return { ...state, children: state.children.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CHILD': {
      const bookIds = state.books.filter(b => b.childId === action.payload).map(b => b.id);
      return {
        ...state,
        children: state.children.filter(c => c.id !== action.payload),
        books: state.books.filter(b => b.childId !== action.payload),
        entries: state.entries.filter(e => !bookIds.includes(e.bookId)),
      };
    }
    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] };
    case 'UPDATE_BOOK':
      return { ...state, books: state.books.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'DELETE_BOOK':
      return {
        ...state,
        books: state.books.filter(b => b.id !== action.payload),
        entries: state.entries.filter(e => e.bookId !== action.payload),
      };
    case 'ADD_ENTRY':
      if (state.entries.some(e => e.bookId === action.payload.bookId && e.date === action.payload.date)) {
        return state; // prevent duplicate per day
      }
      return { ...state, entries: [...state.entries, action.payload] };
    case 'REMOVE_ENTRY':
      return { ...state, entries: state.entries.filter(e => e.id !== action.payload) };
    case 'UPDATE_ENTRY':
      return { ...state, entries: state.entries.map(e => e.id === action.payload.id ? action.payload : e) };
    default:
      return state;
  }
}

interface AppContextType {
  data: AppData;
  addChild: (child: Omit<Child, 'id' | 'createdAt'>) => void;
  updateChild: (child: Child) => void;
  deleteChild: (id: string) => void;
  addBook: (book: Omit<StickerBook, 'id' | 'createdAt'>) => void;
  updateBook: (book: StickerBook) => void;
  deleteBook: (id: string) => void;
  addEntry: (bookId: string, date: string, note?: string) => string | null;
  removeEntry: (id: string) => void;
  updateEntry: (entry: StickerEntry) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addChild = useCallback((child: Omit<Child, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_CHILD', payload: { ...child, id: uuidv4(), createdAt: new Date().toISOString() } });
  }, []);

  const updateChild = useCallback((child: Child) => {
    dispatch({ type: 'UPDATE_CHILD', payload: child });
  }, []);

  const deleteChild = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CHILD', payload: id });
  }, []);

  const addBook = useCallback((book: Omit<StickerBook, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_BOOK', payload: { ...book, id: uuidv4(), createdAt: new Date().toISOString() } });
  }, []);

  const updateBook = useCallback((book: StickerBook) => {
    dispatch({ type: 'UPDATE_BOOK', payload: book });
  }, []);

  const deleteBook = useCallback((id: string) => {
    dispatch({ type: 'DELETE_BOOK', payload: id });
  }, []);

  const addEntry = useCallback((bookId: string, date: string, note?: string): string | null => {
    const exists = data.entries.some(e => e.bookId === bookId && e.date === date);
    if (exists) return null;
    const id = uuidv4();
    dispatch({
      type: 'ADD_ENTRY',
      payload: { id, bookId, date, completedAt: new Date().toISOString(), note },
    });
    return id;
  }, [data.entries]);

  const removeEntry = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ENTRY', payload: id });
  }, []);

  const updateEntry = useCallback((entry: StickerEntry) => {
    dispatch({ type: 'UPDATE_ENTRY', payload: entry });
  }, []);

  return (
    <AppContext.Provider value={{
      data,
      addChild, updateChild, deleteChild,
      addBook, updateBook, deleteBook,
      addEntry, removeEntry, updateEntry,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
