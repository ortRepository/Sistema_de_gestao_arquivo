import React from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentButton from "@/components/common/button";
import {
  FileText,
  Tag,
  User,
  Calendar,
  Link,
  CheckCircle,
  XCircle,
  Book,
  School,
  User2,
  MapPin,
} from "lucide-react";

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
  title: string;
  entityName: string;
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
    ...(document.subjectName && document.subjectName !== "N/A"
      ? [{ label: "Disciplina", value: document.subjectName, icon: Book }]
      : []),
    ...(document.courseName && document.courseName !== "N/A"
      ? [{ label: "Curso", value: document.courseName, icon: School }]
      : []),
    ...(document.className && document.className !== "N/A"
      ? [{ label: "Turma", value: document.className, icon: User2 }]
      : []),
    ...(document.teacherName && document.teacherName !== "N/A"
      ? [{ label: "Professor", value: document.teacherName, icon: User }]
      : []),
    ...(document.studentName && document.studentName !== "N/A"
      ? [{ label: "Estudante", value: document.studentName, icon: User2 }]
      : []),
    ...(document.roomName && document.roomName !== "N/A"
      ? [{ label: "Sala", value: document.roomName, icon: MapPin }]
      : []),
    {
      label: "Status",
      value: document.status ? "Ativo" : "Inativo",
      icon: document.status ? CheckCircle : XCircle,
    },
    {
      label: "Link",
      value: (
        <a
          href={document.urlLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline break-all"
        >
          Abrir Documento
        </a>
      ),
      icon: Link,
    },

    { label: "Data de Criação", value: document.createdIn, icon: Calendar },
  ].filter((field) => field.value && field.value !== "-");

  return (
    <DynamicModal
      title="Visualizar Documento"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="px-4 sm:px-6 py-4 overflow-y-auto max-h-[60vh] sm:max-h-[70vh] space-y-6">
        <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-md">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-[#4D6BFE]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white overflow-hidden text-ellipsis whitespace-nowrap sm:whitespace-normal sm:overflow-wrap break-words">
              {document.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" /> {document.category}
            </p>
            {document.teacherName && document.teacherName !== "N/A" && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
                {document.teacherName}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detalhes
          </h4>
          <div className="grid gap-3 sm:gap-4">
            {fields.map((field) => (
              <div
                key={field.label}
                className=" gap-3 sm:gap-4 py-2 space-y-2 sm:py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <field.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                      {field.label}
                    </span>
                  </div>
                </div>

                <div className="text-gray-900 dark:text-gray-100 text-xs sm:text-sm break-all">
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 sm:mt-6 px-4 sm:px-6">
        <ComponentButton
          variant="secondary"
          onClick={onClose}
          className="w-full sm:w-auto"
        >
          Fechar
        </ComponentButton>
      </div>
    </DynamicModal>
  );
};

export default ViewDocumentModal;
