'use client';

import { useToastStore } from '@/store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "mb-3 p-4 rounded-2xl shadow-xl border flex items-center gap-3 pointer-events-auto",
              toast.type === 'success' && "bg-white border-green-100 text-green-800",
              toast.type === 'error' && "bg-white border-red-100 text-red-800",
              toast.type === 'info' && "bg-white border-blue-100 text-blue-800"
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="text-green-500" size={20} />}
            {toast.type === 'error' && <XCircle className="text-red-500" size={20} />}
            {toast.type === 'info' && <Info className="text-blue-500" size={20} />}
            
            <span className="flex-1 text-sm font-bold tracking-tight">{toast.message}</span>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
