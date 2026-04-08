import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context';
import CreateChildModal from '../components/CreateChildModal';
import StickerImg from '../components/StickerImg';
import type { Child } from '../types';

function isImage(s: string) {
  return s.startsWith('data:') || s.startsWith('http');
}

function ChildCard({ child, onClick, onEdit }: {
  child: Child;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
}) {
  const { data } = useApp();
  const now = new Date();
  const thisMonthEntries = data.entries.filter(e => {
    const book = data.books.find(b => b.id === e.bookId);
    if (!book || book.childId !== child.id) return false;
    const [ey, em] = e.date.split('-').map(Number);
    return ey === now.getFullYear() && em === now.getMonth() + 1;
  }).length;

  return (
    <motion.div
      className="relative rounded-3xl shadow-md overflow-hidden cursor-pointer active:scale-95 transition-transform"
      style={{ background: `linear-gradient(135deg, ${child.color}dd, ${child.color}88)` }}
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
    >
      <div className="p-5 flex flex-col items-center gap-3">
        {isImage(child.emoji) ? (
          <StickerImg src={child.emoji} className="w-14 h-14 rounded-full object-cover shadow" />
        ) : (
          <div className="text-5xl">{child.emoji}</div>
        )}
        <div className="text-center">
          <p className="font-extrabold text-white text-lg leading-tight drop-shadow">{child.name}</p>
          <p className="text-white/80 text-xs mt-1">今月 {thisMonthEntries}枚 ⭐</p>
        </div>
      </div>
      {/* Edit button */}
      <button
        onClick={onEdit}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-sm text-white hover:bg-white/50 transition-colors"
      >
        ✏️
      </button>
    </motion.div>
  );
}

export default function HomeScreen() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [editChild, setEditChild] = useState<Child | undefined>();

  return (
    <div className="min-h-dvh" style={{ background: 'linear-gradient(160deg, #fce4ec 0%, #f3e5f5 50%, #e8f4fd 100%)' }}>
      {/* Header */}
      <div className="pt-safe px-5 pt-8 pb-4 text-center">
        <h1 className="text-4xl font-extrabold" style={{
          background: 'linear-gradient(135deg, #f06292, #ab47bc, #5c6bc0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          ⭐ シール帳 ⭐
        </h1>
        <p className="text-gray-400 text-sm mt-1">がんばったらシールをはろう！</p>
      </div>

      {/* Children grid */}
      <div className="px-5 pb-8">
        {data.children.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <p className="text-gray-400 font-medium">子どもを追加してスタート！</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {data.children.map(child => (
              <ChildCard
                key={child.id}
                child={child}
                onClick={() => navigate(`/child/${child.id}`)}
                onEdit={(e) => {
                  e.stopPropagation();
                  setEditChild(child);
                }}
              />
            ))}
          </div>
        )}

        {/* Add child button */}
        <motion.button
          onClick={() => setShowAdd(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-pink-300 text-pink-500 font-bold text-lg hover:bg-pink-50 transition-colors active:scale-95"
          whileTap={{ scale: 0.95 }}
        >
          ＋ 子どもを追加
        </motion.button>
      </div>

      {/* Modals */}
      {showAdd && <CreateChildModal onClose={() => setShowAdd(false)} />}
      {editChild && (
        <CreateChildModal
          editChild={editChild}
          onClose={() => setEditChild(undefined)}
        />
      )}
    </div>
  );
}
