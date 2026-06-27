import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Confirm', confirmVariant = 'danger' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                confirmVariant === 'danger' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  confirmVariant === 'danger' ? 'text-red-500' : 'text-amber-500'
                }`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {title || 'Are you sure?'}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {message || 'This action cannot be undone.'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onCancel} className="btn btn-ghost">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`btn ${confirmVariant === 'danger' ? 'btn-danger bg-red-500 hover:bg-red-600 text-white' : 'btn-primary'}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
