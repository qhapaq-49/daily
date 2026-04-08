import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMonthDays, isToday, isFuture, formatMonthLabel } from '../utils/dateUtils';
import type { StickerBook, StickerEntry } from '../types';
import StickerImg from './StickerImg';

interface Props {
  book: StickerBook;
  entries: StickerEntry[];  // only entries for current view month
  year: number;
  month: number;
  onNavigate: (year: number, month: number) => void;
  onAddEntry: (date: string) => void;
  onRemoveEntry: (entryId: string) => void;
}

const DOW = ['日', '月', '火', '水', '木', '金', '土'];

function isImage(s: string) {
  return s.startsWith('data:') || s.startsWith('http');
}

export default function StickerGrid({ book, entries, year, month, onNavigate, onAddEntry, onRemoveEntry }: Props) {
  const [removeTarget, setRemoveTarget] = useState<{ id: string; date: string } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const days = getMonthDays(year, month);
  const firstDow = days[0].dayOfWeek;
  const entryMap = new Map(entries.map(e => [e.date, e]));

  const now = new Date();
  const canGoNext = !(year === now.getFullYear() && month === now.getMonth() + 1);

  const prevMonth = () => {
    if (month === 1) onNavigate(year - 1, 12);
    else onNavigate(year, month - 1);
  };
  const nextMonth = () => {
    if (!canGoNext) return;
    if (month === 12) onNavigate(year + 1, 1);
    else onNavigate(year, month + 1);
  };

  const startLongPress = (date: string) => {
    const entry = entryMap.get(date);
    if (!entry) return;
    longPressTimer.current = setTimeout(() => {
      setRemoveTarget({ id: entry.id, date });
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleDayTap = (date: string) => {
    cancelLongPress();
    if (isFuture(date)) return;
    if (!entryMap.has(date)) {
      onAddEntry(date);
    }
  };

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button
          onClick={prevMonth}
          className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xl font-bold active:scale-90 transition-transform"
        >
          ‹
        </button>
        <h2 className="text-xl font-bold text-gray-700">{formatMonthLabel(year, month)}</h2>
        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xl font-bold active:scale-90 transition-transform disabled:opacity-25"
        >
          ›
        </button>
      </div>

      {/* Day of week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-bold py-1 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty leading cells */}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map(({ date }) => {
          const entry = entryMap.get(date);
          const hasSticker = !!entry;
          const future = isFuture(date);
          const todayDate = isToday(date);
          const dayNum = parseInt(date.slice(8));

          return (
            <motion.button
              key={date}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center
                relative overflow-hidden
                ${future
                  ? 'bg-gray-50 opacity-30 cursor-default'
                  : hasSticker
                    ? 'bg-yellow-50 cursor-pointer'
                    : 'bg-white hover:bg-pink-50 active:bg-pink-100 cursor-pointer'}
                ${todayDate ? 'ring-2 ring-orange-400' : ''}
                shadow-sm
              `}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              disabled={future}
              onPointerDown={() => startLongPress(date)}
              onPointerUp={() => handleDayTap(date)}
              onPointerLeave={cancelLongPress}
              whileTap={!future && !hasSticker ? { scale: 0.85 } : undefined}
            >
              {/* Day number */}
              <span className={`text-xs leading-none mb-0.5 ${
                todayDate ? 'text-orange-500 font-extrabold' : 'text-gray-400 font-medium'
              }`}>
                {dayNum}
              </span>

              {/* Sticker */}
              {hasSticker && (
                <motion.div
                  key={`sticker-${date}`}
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="w-7 h-7 flex items-center justify-center"
                >
                  {isImage(book.stickerImage) ? (
                    <StickerImg
                      src={book.stickerImage}
                      className="w-full h-full object-contain rounded"
                    />
                  ) : (
                    <span className="text-xl leading-none">{book.stickerImage}</span>
                  )}
                </motion.div>
              )}

              {/* Today indicator dot */}
              {todayDate && !hasSticker && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-orange-400" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Long-press remove sheet */}
      <AnimatePresence>
        {removeTarget && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRemoveTarget(null)}
          >
            <motion.div
              className="bg-white rounded-t-3xl p-6 w-full max-w-md"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <p className="text-center text-gray-600 mb-5 font-medium">
                {removeTarget.date.slice(5).replace('-', '/')}のシールを外しますか？
              </p>
              <button
                className="w-full py-4 rounded-2xl bg-red-100 text-red-500 font-bold text-lg mb-3 active:scale-95 transition-transform"
                onClick={() => {
                  onRemoveEntry(removeTarget.id);
                  setRemoveTarget(null);
                }}
              >
                シールを外す 😢
              </button>
              <button
                className="w-full py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold active:scale-95 transition-transform"
                onClick={() => setRemoveTarget(null)}
              >
                やっぱりやめる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
