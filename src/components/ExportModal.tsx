import { useState } from 'react';
import Modal from './Modal';
import { useApp } from '../context';
import { generateCsv, downloadCsv, copyToClipboard } from '../utils/csvExport';

interface Props {
  bookId?: string;  // if undefined, export all data
  onClose: () => void;
}

export default function ExportModal({ bookId, onClose }: Props) {
  const { data } = useApp();
  const [copied, setCopied] = useState(false);

  const csv = generateCsv(data, bookId);

  const book = bookId ? data.books.find(b => b.id === bookId) : null;
  const entryCount = bookId
    ? data.entries.filter(e => e.bookId === bookId).length
    : data.entries.length;

  const handleDownload = () => {
    downloadCsv(data, bookId);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(csv);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('シール帳レポート');
    const body = encodeURIComponent(
      'シール帳のデータをお送りします。\n\n' +
      '※ダウンロードしたCSVファイルを添付してください\n\n' +
      csv.split('\n').slice(0, 6).join('\n') + (csv.split('\n').length > 6 ? '\n...' : '')
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
        📊 データを書き出す
      </h2>
      <p className="text-center text-sm text-gray-400 mb-5">
        {book ? `「${book.name}」` : 'すべて'} — {entryCount}件のシール
      </p>

      {/* CSV preview */}
      <div className="bg-gray-50 rounded-2xl p-3 mb-5 overflow-hidden">
        <p className="text-xs font-bold text-gray-400 mb-1">プレビュー</p>
        <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre">
          {csv.split('\n').slice(0, 8).join('\n')}
          {csv.split('\n').length > 8 ? '\n...' : ''}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleDownload}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold text-lg active:scale-95 transition-transform shadow-md"
        >
          💾 CSVをダウンロード
        </button>

        <button
          onClick={handleCopy}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold text-lg active:scale-95 transition-transform shadow-md"
        >
          {copied ? '✅ コピーしました！' : '📋 クリップボードにコピー'}
        </button>

        <button
          onClick={handleEmail}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-teal-400 text-white font-bold text-lg active:scale-95 transition-transform shadow-md"
        >
          📧 メールアプリを開く
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
        CSVをダウンロードしてからメールアプリで添付してください
      </p>
    </Modal>
  );
}
