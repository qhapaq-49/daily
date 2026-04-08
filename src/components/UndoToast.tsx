import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  show: boolean;
  onUndo: () => void;
}

export default function UndoToast({ show, onUndo }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="bg-gray-800 text-white rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl">
            <span className="text-sm">シールを貼りました ✨</span>
            <button
              onClick={onUndo}
              className="text-sm font-bold text-yellow-300 hover:text-yellow-100 transition-colors"
            >
              取り消し
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
