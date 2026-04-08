import { useState, useRef } from 'react';
import { STICKER_ASSETS } from '../utils/assetImages';
import StickerImg from './StickerImg';

const PRESET_EMOJIS = [
  '⭐','🌟','💫','✨','🌈','🦄','🎀','💖','🎉','🏆',
  '🥇','🌸','🍓','🎂','🍦','🌺','🦋','🐱','🐶','🐰',
  '🦊','🐨','🐯','🐸','🐼','🐥','🌻','🍩','🎵','🔥',
];

type Tab = 'emoji' | 'assets' | 'url' | 'upload';

interface Props {
  value: string;
  onChange: (value: string) => void;
  assets?: string[];   // override default STICKER_ASSETS
  presetEmojis?: string[];  // override default emoji list
}

export default function StickerImagePicker({ value, onChange, assets, presetEmojis }: Props) {
  const resolvedAssets = assets ?? STICKER_ASSETS;
  const resolvedEmojis = presetEmojis ?? PRESET_EMOJIS;
  const [tab, setTab] = useState<Tab>(resolvedAssets.length > 0 ? 'assets' : 'emoji');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const isImageValue = value.startsWith('data:') || value.startsWith('http') || value.startsWith('/');

  const handleUrlLoad = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) throw new Error();
      const reader = new FileReader();
      reader.onload = e => {
        onChange(e.target?.result as string);
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch {
      setError('画像を読み込めませんでした。URLを確認してください。');
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const TABS: { id: Tab; label: string }[] = [
    ...(resolvedAssets.length > 0 ? [{ id: 'assets' as Tab, label: '画像' }] : []),
    { id: 'emoji', label: '絵文字' },
    { id: 'url', label: 'URL' },
    { id: 'upload', label: '端末から' },
  ];

  return (
    <div>
      {/* Preview */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50 flex items-center justify-center">
          {isImageValue ? (
            <StickerImg src={value} className="w-full h-full object-contain rounded-2xl" />
          ) : (
            <span className="text-4xl">{value || '❓'}</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-gray-100 p-1 mb-4 gap-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white shadow text-pink-500' : 'text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Asset image grid */}
      {tab === 'assets' && (
        <div>
          {resolvedAssets.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              <p className="text-2xl mb-2">📂</p>
              <p>画像ファイルを追加してビルドしてください</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {resolvedAssets.map((src, i) => (
                <button
                  key={i}
                  onClick={() => onChange(src)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-90 ${
                    value === src ? 'border-pink-400 scale-105' : 'border-transparent'
                  }`}
                >
                  <StickerImg src={src} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Emoji grid */}
      {tab === 'emoji' && (
        <div className="grid grid-cols-8 gap-2">
          {resolvedEmojis.map(e => (
            <button
              key={e}
              onClick={() => onChange(e)}
              className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                value === e ? 'border-pink-400 bg-pink-50 scale-110' : 'border-transparent hover:border-gray-200'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* URL input */}
      {tab === 'url' && (
        <div>
          <p className="text-xs text-gray-400 mb-2">
            画像のURLを貼り付けてください
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
            />
            <button
              onClick={handleUrlLoad}
              disabled={loading || !urlInput.trim()}
              className="px-4 py-2 bg-pink-400 text-white rounded-xl text-sm font-bold disabled:opacity-40"
            >
              {loading ? '...' : '読込'}
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>
      )}

      {/* File upload */}
      {tab === 'upload' && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-pink-300 rounded-2xl text-pink-500 font-medium text-sm hover:bg-pink-50 transition-colors"
          >
            📱 写真フォルダから選ぶ
          </button>
        </div>
      )}
    </div>
  );
}
