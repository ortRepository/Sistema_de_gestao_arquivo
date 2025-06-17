import React, { useEffect, useState } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponetButton from "@/components/common/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { CourseData, ModalManageCourseProps } from "@/types/interfaces";

const ModalManageCourse: React.FC<ModalManageCourseProps> = ({
  isOpen,
  onClose,
  course,
  onSave,
}) => {
  const [formData, setFormData] = useState<{
    nome: string;
  }>({
    nome: "",
  });
  const defaultForm = {
    nome: "",
  };

  const [fieldErrors, setFieldErrors] = useState<{
    nome?: string;
    coordenadorDoCurso?: string;
  }>({});

  useEffect(() => {
    if (course) {
      setFormData({
        nome: course.nome,
      });
    } else {
      setFormData(defaultForm);
    }
    setFieldErrors({});
  }, [course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleClose = () => {
    setFormData(defaultForm);
    setFieldErrors({});
    setStatusMessage(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = () => {
    const errors: { nome?: string; coordenadorDoCurso?: string } = {};
    if (!formData.nome.trim()) errors.nome = "Nome é obrigatório";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const newCourse: CourseData = {
        id: course ? course.id : Date.now(),
        nome: formData.nome,
        coordenadorDoCurso: "",
        disciplinas: [],
      };
      setStatusMessage({
        text: course
          ? "Curso atualizado com sucesso!"
          : "Curso cadastrado com sucesso!",
        type: "success",
      });
      setTimeout(() => {
        onSave(newCourse);
        setIsLoading(false);
        handleClose();
      }, 2000);
    } catch (error) {
      setStatusMessage({
        text: "Erro ao salvar. Tente novamente!",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  return (
    <DynamicModal
      title={course ? "Editar Curso" : "Cadastrar Curso"}
      isOpen={isOpen}
      onClose={course ? onClose : handleClose}
    >
      {statusMessage && (
        <div
          className={`${
            statusMessage.type === "success"
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          } border-t-4 mb-4 p-4 rounded-lg shadow-md`}
        >
          <p
            className={`${
              statusMessage.type === "success"
                ? "text-green-700"
                : "text-red-700"
            } text-sm flex items-center gap-2`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {statusMessage.text}
          </p>
        </div>
      )}
      <div className="space-y-4">
        <ComponentInput
          label="Nome"
          name="nome"
          type="text"
          placeholder="Digite o nome do curso"
          value={formData.nome}
          error={fieldErrors.nome || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={course ? onClose : handleClose}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {course ? "Atualizar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ModalManageCourse;
