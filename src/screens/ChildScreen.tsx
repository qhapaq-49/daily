import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context';
import CreateBookModal from '../components/CreateBookModal';
import CreateChildModal from '../components/CreateChildModal';
import ExportModal from '../components/ExportModal';
import StickerImg from '../components/StickerImg';
import type { StickerBook } from '../types';

function isImage(s: string) {
  return s.startsWith('data:') || s.startsWith('http');
}

function BookCard({ book, onClick, onEdit }: {
  book: StickerBook;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
}) {
  const { data } = useApp();
  const now = new Date();
  const thisMonthCount = data.entries.filter(e => {
    if (e.bookId !== book.id) return false;
    const [ey, em] = e.date.split('-').map(Number);
    return ey === now.getFullYear() && em === now.getMonth() + 1;
  }).length;
  const totalCount = data.entries.filter(e => e.bookId === book.id).length;

  return (
    <motion.div
      className="relative rounded-3xl shadow-md overflow-hidden cursor-pointer bg-white active:scale-95"
      style={{ borderTop: `4px solid ${book.color}` }}
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
    >
      <div className="p-4 flex items-center gap-4">
        {/* Sticker icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${book.color}33` }}
        >
          {isImage(book.stickerImage) ? (
            <StickerImg src={book.stickerImage} className="w-10 h-10 object-contain rounded-xl" />
          ) : (
            <span className="text-3xl">{book.stickerImage}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-800 text-base truncate">{book.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            今月 <span className="font-bold" style={{ color: book.color }}>{thisMonthCount}枚</span>
            　合計 {totalCount}枚
          </p>
        </div>
      </div>
      {/* Edit button */}
      <button
        onClick={onEdit}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
      >
        ✏️
      </button>
    </motion.div>
  );
}

export default function ChildScreen() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { data } = useApp();
  const [showAddBook, setShowAddBook] = useState(false);
  const [editBook, setEditBook] = useState<StickerBook | undefined>();
  const [showEditChild, setShowEditChild] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const child = data.children.find(c => c.id === childId);
  const books = data.books.filter(b => b.childId === childId);

  if (!child) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-dvh" style={{ background: 'linear-gradient(160deg, #fce4ec 0%, #f3e5f5 50%, #e8f4fd 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-sm border-b border-white/50 bg-white/70 px-5 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 text-xl"
        >
          ‹
        </button>
        <div className="text-center flex items-center gap-2">
          {isImage(child.emoji) ? (
            <StickerImg src={child.emoji} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="text-2xl">{child.emoji}</span>
          )}
          <div>
            <h1 className="text-lg font-extrabold text-gray-800">{child.name}のシール帳</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExport(true)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg"
          >
            📊
          </button>
          <button
            onClick={() => setShowEditChild(true)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-sm"
          >
            ✏️
          </button>
        </div>
      </div>

      {/* Books list */}
      <div className="px-5 py-5">
        {books.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-400 font-medium">シール帳を追加してね！</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-5">
            {books.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => navigate(`/book/${book.id}`)}
                onEdit={(e) => {
                  e.stopPropagation();
                  setEditBook(book);
                }}
              />
            ))}
          </div>
        )}

        <motion.button
          onClick={() => setShowAddBook(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-purple-300 text-purple-500 font-bold text-lg hover:bg-purple-50 transition-colors active:scale-95"
          whileTap={{ scale: 0.95 }}
        >
          ＋ シール帳を追加
        </motion.button>
      </div>

      {/* Modals */}
      {showAddBook && (
        <CreateBookModal
          childId={childId!}
          onClose={() => setShowAddBook(false)}
        />
      )}
      {editBook && (
        <CreateBookModal
          childId={childId!}
          editBook={editBook}
          onClose={() => setEditBook(undefined)}
        />
      )}
      {showEditChild && (
        <CreateChildModal
          editChild={child}
          onClose={() => setShowEditChild(false)}
        />
      )}
      {showExport && (
        <ExportModal onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
