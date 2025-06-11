import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import React, { Fragment } from "react";

interface DynamicModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  title,
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={() => onClose}
        className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      >
        {/* Overlay com transparência */}
        <div
          className="absolute inset-0 bg-black/30 dark:bg-gray-900/80 transition-opacity"
          onClick={onClose}
        />

        <div className="bg-white dark:bg-gray-900 py-6 px-2 rounded-lg shadow-lg w-full max-w-xl relative transform transition-all  z-50">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
          <div className="flex justify-between items-center mb-4 px-4">
            <h2 className="text-xl my-2">{title}</h2>
          </div>
          <div className="mb-4 px-4">{children}</div>
          <div className="flex justify-end"></div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DynamicModal;
