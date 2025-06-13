import React from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponetButton from "@/components/common/button";
import { User, Mail, Book, Phone, Calendar, Layers } from "lucide-react";
import { Teacher } from "@/types/interfaces";

interface ModalViewTeacherProps {
  isOpen: boolean;
  onClose: () => void;
  teacherData: Teacher | null;
}

const ModalViewTeacher: React.FC<ModalViewTeacherProps> = ({
  isOpen,
  onClose,
  teacherData,
}) => {
  if (!teacherData) return null;

  return (
    <DynamicModal
      title="Detalhes do Professor"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 overflow-y-auto max-h-[50vh] px-2">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-blue-500" />
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Nome:
            </label>
          </div>
          <p className="ml-8 text-gray-600 dark:text-gray-400">
            {teacherData.name}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-blue-500" />
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Email:
            </label>
          </div>
          <p className="ml-8 text-gray-600 dark:text-gray-400">
            {teacherData.email}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Book className="w-5 h-5 text-blue-500" />
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Função:
            </label>
          </div>
          <p className="ml-8 text-gray-600 dark:text-gray-400">
            {teacherData.role}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Curso:
            </label>
          </div>
          <p className="ml-8 text-gray-600 dark:text-gray-400">
            {teacherData.curso}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-blue-500" />
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Gênero:
            </label>
          </div>
          <p className="ml-8 text-gray-600 dark:text-gray-400">
            {teacherData.gender}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Phone className="w-5 h-5 text-blue-500" />
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Telefone:
            </label>
          </div>
          <p className="ml-8 text-gray-600 dark:text-gray-400">
            {teacherData.phoneNumber}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Book className="w-5 h-5 text-blue-500" />
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Disciplinas:
            </label>
          </div>
          {teacherData.subjects.length > 0 ? (
            <ul className="list-disc pl-8 text-gray-600 dark:text-gray-400">
              {teacherData.subjects.map((subject) => (
                <li key={subject.id} className="ml-2">
                  {subject.name} ({subject.course})
                </li>
              ))}
            </ul>
          ) : (
            <p className="ml-8 text-gray-600 dark:text-gray-400">
              Nenhuma disciplina selecionada.
            </p>
          )}
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Criado Em:
            </label>
          </div>
          <p className="ml-8 text-gray-600 dark:text-gray-400">
            {new Date(teacherData.createdIn).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Expiração da Licença:
            </label>
          </div>
          <p className="ml-8 text-gray-600 dark:text-gray-400">
            {new Date(teacherData.licenseExpirationDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-6 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={onClose}
        >
          Fechar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ModalViewTeacher;
