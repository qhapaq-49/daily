import { useState } from 'react';
import Modal from './Modal';
import { useApp } from '../context';
import type { Child } from '../types';
import { AVATAR_ASSETS } from '../utils/assetImages';
import StickerImg from './StickerImg';

const COLORS = ['#FF9EB5', '#C9A0FF', '#A0C4FF', '#6EE7B7', '#FDE68A', '#FDBA74'];
const AVATAR_EMOJIS = ['👧', '👦', '🧒', '👶', '🐱', '🐰', '🦊', '🐼', '🐨', '🦁', '🐸', '🐯'];

interface Props {
  onClose: () => void;
  editChild?: Child;
}

export default function CreateChildModal({ onClose, editChild }: Props) {
  const { addChild, updateChild, deleteChild } = useApp();
  const [name, setName] = useState(editChild?.name ?? '');
  const [color, setColor] = useState(editChild?.color ?? COLORS[0]);
  const [emoji, setEmoji] = useState(editChild?.emoji ?? '👧');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editChild) {
      updateChild({ ...editChild, name: name.trim(), color, emoji });
    } else {
      addChild({ name: name.trim(), color, emoji });
    }
    onClose();
  };

  if (confirmDelete) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center">
          <div className="text-5xl mb-4">😱</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">本当に削除しますか？</h2>
          <p className="text-sm text-gray-500 mb-6">
            {editChild?.name}のシール帳とシールのデータが<br />すべて消えます
          </p>
          <button
            onClick={() => { deleteChild(editChild!.id); onClose(); }}
            className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold text-lg mb-3"
          >
            全部削除する
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

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
        {editChild ? '✏️ 編集する' : '👶 子どもを追加'}
      </h2>

      {/* Name */}
      <div className="mb-5">
        <label className="text-sm font-bold text-gray-500 mb-2 block">なまえ</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="たろう、はなこ..."
          autoFocus
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg font-rounded focus:outline-none focus:border-pink-400 transition-colors"
        />
      </div>

      {/* Avatar */}
      <div className="mb-5">
        <label className="text-sm font-bold text-gray-500 mb-2 block">アバター</label>
        {/* Emoji options */}
        <div className="flex flex-wrap gap-2 mb-2">
          {AVATAR_EMOJIS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`text-2xl w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all active:scale-90 ${
                emoji === e ? 'border-pink-400 bg-pink-50 scale-110' : 'border-gray-200 bg-white'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        {/* Image options from src/assets/avatars/ */}
        {AVATAR_ASSETS.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {AVATAR_ASSETS.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setEmoji(src)}
                className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all active:scale-90 ${
                  emoji === src ? 'border-pink-400 scale-110' : 'border-gray-200'
                }`}
              >
                <StickerImg src={src} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color */}
      <div className="mb-7">
        <label className="text-sm font-bold text-gray-500 mb-2 block">テーマカラー</label>
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
        {editChild ? '保存する ✨' : '追加する 🎉'}
      </button>

      {editChild && (
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
