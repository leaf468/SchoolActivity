import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  type = 'warning',
}) => {
  const typeConfig = {
    danger: {
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    info: {
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    },
  };

  const config = typeConfig[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200"
          >
            <div className="flex items-start gap-4">
              <div className={`${config.iconBg} rounded-md p-2 flex-shrink-0`}>
                <ExclamationTriangleIcon className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-5 py-2.5 text-sm font-semibold rounded-md transition ${config.confirmButton}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
