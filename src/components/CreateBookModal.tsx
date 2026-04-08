import { useState } from 'react';
import Modal from './Modal';
import StickerImagePicker from './StickerImagePicker';
import { useApp } from '../context';
import type { StickerBook } from '../types';

const COLORS = ['#FF9EB5', '#C9A0FF', '#A0C4FF', '#6EE7B7', '#FDE68A', '#FDBA74'];

interface Props {
  childId: string;
  onClose: () => void;
  editBook?: StickerBook;
}

export default function CreateBookModal({ childId, onClose, editBook }: Props) {
  const { addBook, updateBook, deleteBook } = useApp();
  const [name, setName] = useState(editBook?.name ?? '');
  const [stickerImage, setStickerImage] = useState(editBook?.stickerImage ?? '⭐');
  const [color, setColor] = useState(editBook?.color ?? COLORS[0]);
  const [step, setStep] = useState<'info' | 'sticker'>('info');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editBook) {
      updateBook({ ...editBook, name: name.trim(), stickerImage, color });
    } else {
      addBook({ childId, name: name.trim(), stickerImage, color });
    }
    onClose();
  };

  if (confirmDelete) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center">
          <div className="text-5xl mb-4">🗑️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">シール帳を削除しますか？</h2>
          <p className="text-sm text-gray-500 mb-6">「{editBook?.name}」のシールデータがすべて消えます</p>
          <button
            onClick={() => { deleteBook(editBook!.id); onClose(); }}
            className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold text-lg mb-3"
          >
            削除する
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold"
          >
            やっぱりやめる
          </button>
        </div>
      </Modal>
    );
  }

  if (step === 'sticker') {
    return (
      <Modal onClose={onClose}>
        <button
          onClick={() => setStep('info')}
          className="flex items-center gap-1 text-gray-400 text-sm mb-4"
        >
          ‹ もどる
        </button>
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">シールを選ぼう 🎀</h2>
        <StickerImagePicker value={stickerImage} onChange={setStickerImage} />
        <button
          onClick={() => setStep('info')}
          className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold text-lg active:scale-95 transition-transform"
        >
          決定 ✨
        </button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
        {editBook ? '✏️ 編集する' : '📚 シール帳を追加'}
      </h2>

      {/* Name */}
      <div className="mb-5">
        <label className="text-sm font-bold text-gray-500 mb-2 block">シール帳の名前</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="歯磨き、宿題、早起き..."
          autoFocus
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg font-rounded focus:outline-none focus:border-pink-400 transition-colors"
        />
      </div>

      {/* Sticker image selector */}
      <div className="mb-5">
        <label className="text-sm font-bold text-gray-500 mb-2 block">シールの絵</label>
        <button
          onClick={() => setStep('sticker')}
          className="flex items-center gap-3 w-full border-2 border-gray-200 rounded-2xl px-4 py-3 hover:border-pink-300 transition-colors active:scale-95"
        >
          <span className="text-3xl">
            {stickerImage.startsWith('data:') || stickerImage.startsWith('http') ? (
              <img src={stickerImage} className="w-8 h-8 object-contain rounded" alt="sticker" />
            ) : stickerImage}
          </span>
          <span className="text-gray-500 text-sm">タップして変更</span>
          <span className="ml-auto text-gray-300">›</span>
        </button>
      </div>

      {/* Color */}
      <div className="mb-7">
        <label className="text-sm font-bold text-gray-500 mb-2 block">カラー</label>
        <div className="flex gap-3">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full border-4 transition-all active:scale-90 ${
                color === c ? 'border-gray-600 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="w-full py-4 rounded-2xl font-bold text-lg text-white shadow-md active:scale-95 transition-transform disabled:opacity-40"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
      >
        {editBook ? '保存する ✨' : '追加する 🎉'}
      </button>

      {editBook && (
        <button
          onClick={() => setConfirmDelete(true)}
          className="w-full mt-3 py-3 text-red-400 font-medium text-sm"
        >
          削除する
        </button>
      )}
    </Modal>
  );
}
