import React from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentButton from "@/components/common/button";
import { FileText, Tag, User, Calendar, Link, CheckCircle, XCircle, Book, School, User2, MapPin } from "lucide-react";

interface DocumentItem {
  id: number;
  description: string;
  urlLink: string;
  path: string;
  status: boolean;
  createdIn: string;
  updatedIn: string;
  className: string;
  subjectName: string;
  courseName: string;
  studentName: string;
  teacherName: string;
  roomName: string;
  category: string;
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
    { label: "Descrição", value: document.description, icon: FileText },
    { label: "Categoria", value: document.category, icon: Tag },
    { label: "Disciplina", value: document.subjectName, icon: Book },
    { label: "Curso", value: document.courseName, icon: School },
    { label: "Turma", value: document.className, icon: User2 },
    { label: "Professor", value: document.teacherName, icon: User },
    { label: "Estudante", value: document.studentName, icon: User2 },
    { label: "Sala", value: document.roomName, icon: MapPin },
    { label: "Status", value: document.status ? "Ativo" : "Inativo", icon: document.status ? CheckCircle : XCircle },
    { label: "Link", value: document.urlLink, icon: Link },
    { label: "Caminho do Arquivo", value: document.path, icon: FileText },
    { label: "Data de Criação", value: document.createdIn, icon: Calendar },
    { label: "Data de Atualização", value: document.updatedIn, icon: Calendar },
  ];

  return (
    <DynamicModal title="Visualizar Documento" isOpen={isOpen} onClose={onClose}>
      <div className="px-6 py-4 overflow-y-auto max-h-[50vh] space-y-6">
        <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-md">
              <FileText className="w-10 h-10 text-[#4D6BFE]" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {document.description}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Tag className="w-4 h-4" /> {document.category}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
              <User className="w-4 h-4" /> {document.teacherName}
            </p>
          </div>
        </div>

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

      <div className="flex justify-end mt-6">
        <ComponentButton
          variant="secondary"
          onClick={onClose}
          className="w-full md:w-auto"
        >
          Fechar
        </ComponentButton>
      </div>
    </DynamicModal>
  );
};

export default ViewDocumentModal;