import { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context';
import { generateCsv, downloadCsv, copyToClipboard } from '../utils/csvExport';
import { exportJson, parseBackupFile, applyImport } from '../utils/backup';
import { isSupported, setupBackupFile, hasBackupFile } from '../utils/fileBackup';
import type { AppData } from '../types';

interface Props {
  bookId?: string;
  onClose: () => void;
}

export default function ExportModal({ bookId, onClose }: Props) {
  const { data } = useApp();
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'csv' | 'backup'>('csv');
  const [importState, setImportState] = useState<'idle' | 'confirm' | 'error'>('idle');
  const [importData, setImportData] = useState<AppData | null>(null);
  const [importError, setImportError] = useState('');
  const [autoBackupReady, setAutoBackupReady] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hasBackupFile().then(setAutoBackupReady);
  }, []);

  const csv = generateCsv(data, bookId);
  const book = bookId ? data.books.find(b => b.id === bookId) : null;
  const entryCount = bookId
    ? data.entries.filter(e => e.bookId === bookId).length
    : data.entries.length;

  const handleCopy = async () => {
    const ok = await copyToClipboard(csv);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseBackupFile(file);
      setImportData(parsed);
      setImportState('confirm');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : '不明なエラー');
      setImportState('error');
    }
    e.target.value = '';
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
        📊 データ管理
      </h2>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-gray-100 p-1 mb-5 gap-1">
        {(['csv', 'backup'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t ? 'bg-white shadow text-pink-500' : 'text-gray-400'
            }`}
          >
            {t === 'csv' ? '📋 CSV集計' : '🗂️ バックアップ'}
          </button>
        ))}
      </div>

      {/* CSV tab */}
      {tab === 'csv' && (
        <>
          <p className="text-center text-sm text-gray-400 mb-4">
            {book ? `「${book.name}」` : 'すべて'} — {entryCount}件のシール
          </p>
          <div className="bg-gray-50 rounded-2xl p-3 mb-4">
            <p className="text-xs font-bold text-gray-400 mb-1">プレビュー</p>
            <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre">
              {csv.split('\n').slice(0, 8).join('\n')}
              {csv.split('\n').length > 8 ? '\n...' : ''}
            </pre>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => downloadCsv(data, bookId)}
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
              onClick={() => {
                const subject = encodeURIComponent('シール帳レポート');
                const body = encodeURIComponent('シール帳のデータをお送りします。\n\n※ダウンロードしたCSVファイルを添付してください');
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-teal-400 text-white font-bold text-lg active:scale-95 transition-transform shadow-md"
            >
              📧 メールアプリを開く
            </button>
          </div>
        </>
      )}

      {/* Backup tab */}
      {tab === 'backup' && importState === 'idle' && (
        <>
          <p className="text-sm text-gray-500 text-center mb-5 leading-relaxed">
            子どもの設定・シール画像・全記録を<br />まるごと保存・復元できます
          </p>
          <div className="flex flex-col gap-3">
            {isSupported() && (
              <button
                onClick={async () => {
                  const ok = await setupBackupFile();
                  if (ok) setAutoBackupReady(true);
                }}
                className={`w-full py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform shadow-md text-white bg-gradient-to-r ${autoBackupReady ? 'from-green-400 to-teal-400' : 'from-pink-400 to-rose-400'}`}
              >
                {autoBackupReady ? '✅ 自動保存設定済み（変更する）' : '🔒 自動保存ファイルを設定'}
              </button>
            )}
            <button
              onClick={() => exportJson(data)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-400 text-white font-bold text-lg active:scale-95 transition-transform shadow-md"
            >
              📤 今すぐ手動保存
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 text-white font-bold text-lg active:scale-95 transition-transform shadow-md"
            >
              📥 バックアップから復元
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
          </div>
          <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
            {autoBackupReady ? 'シールを貼るたびに自動でファイルに上書き保存されます' : '自動保存を設定するとシールを貼るたびにファイルに保存されます'}
          </p>
        </>
      )}

      {/* Confirm import */}
      {tab === 'backup' && importState === 'confirm' && importData && (
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">今のデータを上書きしますか？</h3>
          <div className="bg-gray-50 rounded-2xl p-4 mb-5 text-sm text-gray-600 text-left">
            <p>📦 復元するデータ:</p>
            <p className="mt-1">・子ども {importData.children.length}人</p>
            <p>・シール帳 {importData.books.length}冊</p>
            <p>・シール記録 {importData.entries.length}件</p>
          </div>
          <p className="text-xs text-red-400 mb-5">現在のデータはすべて消えます</p>
          <button
            onClick={() => applyImport(importData)}
            className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-lg mb-3 active:scale-95 transition-transform"
          >
            復元する
          </button>
          <button
            onClick={() => setImportState('idle')}
            className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold"
          >
            キャンセル
          </button>
        </div>
      )}

      {/* Error */}
      {tab === 'backup' && importState === 'error' && (
        <div className="text-center">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-gray-600 mb-5">{importError}</p>
          <button
            onClick={() => setImportState('idle')}
            className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold"
          >
            もどる
          </button>
        </div>
      )}
    </Modal>
  );
}
