// src/components/common/Modal.tsx
import React from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";

interface ModalProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ message, type, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div
        className="absolute inset-0 bg-black/30 dark:bg-gray-900/80 transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg p-6 max-w-sm mx-auto z-10 shadow-lg border-l-4 border-r-2 border-t-2 border-b-2 border-gray-100 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Conteúdo do Modal */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            {type === "success" ? (
              <CheckCircle2 className="h-16 w-16 text-green-500 animate-pop-in" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 animate-pop-in" />
            )}
          </div>

          <h3
            className={`text-2xl font-bold mb-2 ${
              type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {type === "success" ? "Sucesso!" : "Oops!"}
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

          <button
            onClick={onClose}
            className={`w-full py-2 px-6 rounded-md font-medium transition-colors
              ${
                type === "success"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;