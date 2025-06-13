import React, { useEffect, useState } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponetButton from "@/components/common/button";

interface CourseData {
  id: number;
  nome: string;
  coordenadorDoCurso: string;
  disciplinas: string[];
}

interface ModalManageDisciplinasProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseData | null;
}

const ModalManageDisciplinas: React.FC<ModalManageDisciplinasProps> = ({
  isOpen,
  onClose,
  course,
}) => {
  const [disciplinas, setDisciplinas] = useState<string[]>([]);

  useEffect(() => {
    if (course) {
      setDisciplinas([...course.disciplinas]); // Copy to avoid mutation
    } else {
      setDisciplinas([]);
    }
  }, [course]);

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
          Disciplinas do Curso: {course?.nome}
        </h4>
        {disciplinas.length > 0 ? (
          <ul className="list-disc list-inside mb-2 text-sm text-gray-600 dark:text-gray-400">
            {disciplinas.map((disc, index) => (
              <li key={index}>{disc}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma disciplina cadastrada.
          </p>
        )}
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={handleClose}
        >
          Fechar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ModalManageDisciplinas;