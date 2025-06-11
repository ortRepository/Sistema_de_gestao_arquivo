import React, { useEffect } from "react";
import DynamicModal from "./DynamicModal";
import { AlertCircle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ErrorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  // Fechar automaticamente após 5 segundos
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Fecha após 5 segundos

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <DynamicModal title={title} isOpen={isOpen} onClose={() => onClose()}>
      <div className="p-4">
        <div className="flex space-x-2 mb-3">
          <AlertCircle className="w-8 h-8 text-yellow-500 dark:text-yellow-300" />
          <span className="text-lg font-semibold">Aviso</span>
        </div>
        <div>{children}</div>
      </div>
    </DynamicModal>
  );
};

export default ErrorModal;
