import React, { useEffect, useState } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentButton from "@/components/common/button"; // Fixed typo
import { useListSubjects } from "@/hooks/DynamicApiHooks";
import { Course, Subject } from "@/types/interfaces";

interface ModalManageDisciplinasProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}
const ModalManageDisciplinas: React.FC<ModalManageDisciplinasProps> = ({
  isOpen,
  onClose,
  course,
}) => {
  const { data: subjects, isLoading, error } = useListSubjects();
  const [disciplinas, setDisciplinas] = useState<Subject[]>([]);

  useEffect(() => {
    if (course && subjects) {
      const courseDisciplinas = subjects.filter(
        (subject: Subject) => subject.idCourse === course.idCourse
      );
      setDisciplinas(courseDisciplinas);
    } else {
      setDisciplinas([]);
    }
  }, [course, subjects]);

  const handleClose = () => {
    setDisciplinas([]);
    onClose();
  };

  return (
    <DynamicModal
      title="Visualizar Disciplinas"
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
          Disciplinas do Curso: {course?.name || "N/A"}
        </h4>
        {isLoading ? (
          <p className="text-gray-500 dark:text-gray-400">
            Carregando disciplinas...
          </p>
        ) : error ? (
          <p className="text-red-500 dark:text-red-400">
            Erro ao carregar disciplinas.
          </p>
        ) : disciplinas.length > 0 ? (
          <ul className="list-disc list-inside mb-2 text-sm text-gray-600 dark:text-gray-400">
            {disciplinas.map((disc: Subject) => (
              <li key={disc.idSubject}>
                {disc.name} ({disc.status ? "Ativo" : "Inativo"})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma disciplina cadastrada.
          </p>
        )}
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponentButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={handleClose}
        >
          Fechar
        </ComponentButton>
      </div>
    </DynamicModal>
  );
};

export default ModalManageDisciplinas;
