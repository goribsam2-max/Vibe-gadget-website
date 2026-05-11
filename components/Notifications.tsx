
import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import { toast, Toaster } from 'sonner';

type ToastType = 'success' | 'error' | 'info';

interface ConfirmOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface ToastContextType {
  notify: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [confirmModal, setConfirmModal] = useState<ConfirmOptions | null>(null);

  const notify = (message: string, type: ToastType = 'info') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };

  const confirm = (options: ConfirmOptions) => {
    setConfirmModal(options);
  };

  return (
    <ToastContext.Provider value={{ notify, confirm }}>
      {children}
      <Toaster position="top-right" duration={4000} richColors />
      
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-sm relative z-10 text-center border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xl font-semibold mb-2 tracking-tight">{confirmModal.title}</h3>
              <p className="text-xs text-zinc-500 font-medium mb-8 leading-relaxed">{confirmModal.message}</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} className="w-full py-4 bg-primary-500 text-white rounded-full font-bold text-xs  tracking-normal shadow-lg">
                  {confirmModal.confirmText || 'Confirm'}
                </button>
                <button onClick={() => { if(confirmModal.onCancel) confirmModal.onCancel(); setConfirmModal(null); }} className="w-full py-4 text-zinc-400 font-bold text-[10px]  tracking-normal">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useNotify must be used within ToastProvider");
  return context.notify;
};

export const useConfirm = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useConfirm must be used within ToastProvider");
  return context.confirm;
};
