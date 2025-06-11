import React from "react";
import ComponetButton from "./button";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmação",
  message = "Tem certeza que deseja continuar?",
  confirmText = "Excluir",
  cancelText = "Cancelar",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      {/* Overlay com transparência */}
      <div
        className="absolute inset-0 bg-black/30 dark:bg-gray-900/80 transition-opacity"
        onClick={onClose}
      />
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded shadow-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          {title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex flex-wrap-reverse justify-end mt-4 gap-2 ">
          <ComponetButton
            className="w-full md:w-auto"
            variant="secondary"
            onClick={onClose}
          >
            {cancelText}
          </ComponetButton>
          <ComponetButton
            className="w-full md:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600"
            variant="primary"
            onClick={onConfirm}
          >
            {confirmText}
          </ComponetButton>
        </div>
      </div>
    </div>
  );
};

export default Modal;
