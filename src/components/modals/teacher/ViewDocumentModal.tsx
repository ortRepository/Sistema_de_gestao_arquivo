import React from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponetButton from "@/components/common/button";
import {
  FileText,
  Tag,
  User,
  Calendar,
} from "lucide-react";

interface DocumentItem {
  id: number;
  title: string;
  category: string;
  author: string;
  date: string;
}

interface ViewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

const ViewDocumentModal: React.FC<ViewDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  if (!document) return null;

  const fields = [
    { label: "Título", value: document.title, icon: FileText },
    { label: "Categoria", value: document.category, icon: Tag },
    { label: "Autor", value: document.author, icon: User },
    { label: "Data", value: document.date, icon: Calendar },
  ];

  return (
    <DynamicModal title="Visualizar Documento" isOpen={isOpen} onClose={onClose}>
      <div className="px-6 py-4 overflow-y-auto max-h-[50vh] space-y-6">
        {/* Header with Icon and Title */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-md">
              <FileText className="w-10 h-10 text-[#4D6BFE]" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {document.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Tag className="w-4 h-4" /> {document.category}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
              <User className="w-4 h-4" /> {document.author}
            </p>
          </div>
        </div>

        {/* Document Details */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detalhes
          </h4>
          <div className="grid gap-4">
            {fields.map((field) => (
              <div
                key={field.label}
                className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <field.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                    {field.label}
                  </span>
                </div>
                <div className="text-gray-900 dark:text-gray-100 text-sm">
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="flex justify-end mt-6">
        <ComponetButton
          variant="secondary"
          onClick={onClose}
          className="w-full md:w-auto"
        >
          Fechar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ViewDocumentModal;