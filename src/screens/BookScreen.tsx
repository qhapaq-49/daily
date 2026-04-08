import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context';
import StickerGrid from '../components/StickerGrid';
import UndoToast from '../components/UndoToast';
import ExportModal from '../components/ExportModal';
import CreateBookModal from '../components/CreateBookModal';
import StickerImg from '../components/StickerImg';

function isImage(s: string) {
  return s.startsWith('data:') || s.startsWith('http');
}

export default function BookScreen() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { data, addEntry, removeEntry } = useApp();

  const book = data.books.find(b => b.id === bookId);
  const child = book ? data.children.find(c => c.id === book.childId) : null;
  const allEntries = data.entries.filter(e => e.bookId === bookId);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [undoEntry, setUndoEntry] = useState<{ id: string } | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!book) navigate('/');
  }, [book, navigate]);

  if (!book || !child) return null;

  const monthEntries = allEntries.filter(e => {
    const [ey, em] = e.date.split('-').map(Number);
    return ey === viewYear && em === viewMonth;
  });

  const thisMonthCount = allEntries.filter(e => {
    const [ey, em] = e.date.split('-').map(Number);
    return ey === now.getFullYear() && em === now.getMonth() + 1;
  }).length;

  const handleAddEntry = (date: string) => {
    const id = addEntry(book.id, date);
    if (!id) return;
    setUndoEntry({ id });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndoEntry(null), 3000);
  };

  const handleUndo = () => {
    if (undoEntry) {
      removeEntry(undoEntry.id);
      setUndoEntry(null);
      if (undoTimer.current) clearTimeout(undoTimer.current);
    }
  };

  return (
    <div
      className="min-h-dvh"
      style={{ background: 'linear-gradient(160deg, #fce4ec 0%, #f3e5f5 50%, #e8f4fd 100%)' }}
    >
      {/* Header — small and out of the way */}
      <div className="sticky top-0 backdrop-blur-sm border-b border-white/50 bg-white/70 px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => navigate(`/child/${child.id}`)}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 text-xl flex-shrink-0"
        >
          ‹
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${book.color}33` }}
          >
            {isImage(book.stickerImage) ? (
              <StickerImg src={book.stickerImage} className="w-7 h-7 object-contain rounded-lg" />
            ) : (
              <span className="text-lg">{book.stickerImage}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-gray-800 text-base truncate leading-tight">{book.name}</p>
            <p className="text-xs text-gray-400 leading-tight">{child.name}</p>
          </div>
        </div>
        {/* Admin buttons — small and tucked away */}
        <button
          onClick={() => setShowEdit(true)}
          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs flex-shrink-0"
        >
          ✏️
        </button>
        <button
          onClick={() => setShowExport(true)}
          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-xs flex-shrink-0"
        >
          📊
        </button>
      </div>

      {/* Month summary — kid-friendly, prominent */}
      <div className="px-5 pt-4 pb-2">
        <motion.div
          className="rounded-3xl p-4 text-center shadow-md"
          style={{ background: `linear-gradient(135deg, ${book.color}cc, ${book.color}88)` }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <p className="text-white/80 text-sm font-medium">今月のシール</p>
          <p className="text-white font-extrabold text-5xl leading-tight">{thisMonthCount}</p>
          <p className="text-white/80 text-sm">枚　⭐</p>
        </motion.div>
      </div>

      {/* Calendar — the main child-facing UI */}
      <div className="mx-4 my-3 bg-white rounded-3xl p-4 shadow-md">
        <StickerGrid
          book={book}
          entries={monthEntries}
          year={viewYear}
          month={viewMonth}
          onNavigate={(y, m) => { setViewYear(y); setViewMonth(m); }}
          onAddEntry={handleAddEntry}
          onRemoveEntry={removeEntry}
        />
      </div>

      {/* Padding for toast */}
      <div className="h-20" />

      {/* Undo toast */}
      <UndoToast show={!!undoEntry} onUndo={handleUndo} />

      {/* Modals */}
      {showExport && <ExportModal bookId={bookId} onClose={() => setShowExport(false)} />}
      {showEdit && (
        <CreateBookModal
          childId={child.id}
          editBook={book}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
