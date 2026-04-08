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
      <button
        onClick={onEdit}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-sm text-white hover:bg-white/50 transition-colors"
      >
        ✏️
      </button>
    </motion.div>
  );
}

function useSeedTestData() {
  const { addChild, addBook, addEntry } = useApp();

  return () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const pad = (n: number) => String(n).padStart(2, '0');

    // Add child directly via context (reuse addChild which generates its own id,
    // but we need the id for books — so we call addChild and look it up after,
    // or use a workaround: add child first then grab the last one)
    addChild({ name: 'テストさん', color: '#A0C4FF', emoji: '🧒' });

    // We can't get the id from addChild directly, so schedule books after React state updates
    // Instead, generate id manually and bypass — but addChild doesn't accept id.
    // Workaround: use setTimeout to read the new child from localStorage after state settles.
    setTimeout(() => {
      const raw = localStorage.getItem('sticker-app-v1');
      if (!raw) return;
      const data = JSON.parse(raw);
      const child = data.children.find((c: Child) => c.name === 'テストさん');
      if (!child) return;

      addBook({ childId: child.id, name: '歯磨き', stickerImage: '🦷', color: '#A0C4FF' });
      addBook({ childId: child.id, name: '宿題', stickerImage: '📚', color: '#C9A0FF' });
      addBook({ childId: child.id, name: '早起き', stickerImage: '☀️', color: '#FDE68A' });

      setTimeout(() => {
        const raw2 = localStorage.getItem('sticker-app-v1');
        if (!raw2) return;
        const data2 = JSON.parse(raw2);
        const books = data2.books.filter((b: { childId: string }) => b.childId === child.id);

        // Add entries: scattered days in current month
        const daysToMark = [1, 2, 3, 5, 6, 8, 9, 10, 12, 13, 15, 16, 18, 20];
        books.forEach((book: { id: string }) => {
          daysToMark
            .filter(d => d <= now.getDate())
            .forEach(d => {
              addEntry(book.id, `${y}-${pad(m)}-${pad(d)}`);
            });
        });
      }, 100);
    }, 100);
  };
}

export default function HomeScreen() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [editChild, setEditChild] = useState<Child | undefined>();
  const seedTestData = useSeedTestData();

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

        <motion.button
          onClick={() => setShowAdd(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-pink-300 text-pink-500 font-bold text-lg hover:bg-pink-50 transition-colors active:scale-95"
          whileTap={{ scale: 0.95 }}
        >
          ＋ 子どもを追加
        </motion.button>

        {/* Test data button */}
        <button
          onClick={seedTestData}
          className="w-full mt-3 py-2 text-gray-300 text-xs"
        >
          テストデータを追加
        </button>
      </div>

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
