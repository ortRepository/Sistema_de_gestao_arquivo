import React, { useEffect, useState } from "react";
import { z } from "zod";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponetButton from "@/components/common/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { Subject, SubjectModalProps } from "@/types/interfaces";
import { subjectSchema } from "@/types/type";

type SubjectForm = z.infer<typeof subjectSchema>;

// Predefined course options
const courseOptions = [
  { value: "Informática", label: "Informática" },
  { value: "Engenharia", label: "Engenharia" },
  { value: "Letras", label: "Letras" },
  { value: "História", label: "História" },
];

const ModalManageSubject: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  subjectData,
  onSave,
}) => {
  const [formData, setFormData] = useState<SubjectForm>({
    name: "",
    course: "",
  });
  const defaultForm: SubjectForm = {
    name: "",
    course: "",
  };

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    course?: string;
  }>({});

  useEffect(() => {
    if (subjectData) {
      setFormData({
        name: subjectData.name,
        course: subjectData.course,
      });
    } else {
      setFormData(defaultForm);
    }
    setFieldErrors({});
  }, [subjectData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, course: value }));
    setFieldErrors((prev) => ({ ...prev, course: undefined }));
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

  const handleSubmit = async () => {
    const result = subjectSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        course: errors.course?.[0],
      });
      return;
    }

    setIsLoading(true);
    try {
      const newSubject: Subject = {
        id: subjectData ? subjectData.id : Date.now(), // Temporary ID for static data
        name: result.data.name,
        course: result.data.course,
      };
      setStatusMessage({
        text: subjectData
          ? "Disciplina atualizada com sucesso!"
          : "Disciplina cadastrada com sucesso!",
        type: "success",
      });
      setTimeout(() => {
        onSave(newSubject);
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
      title={subjectData ? "Editar Disciplina" : "Cadastrar Disciplina"}
      isOpen={isOpen}
      onClose={subjectData ? onClose : handleClose}
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
          label="Nome da Disciplina"
          name="name"
          type="text"
          placeholder="Digite o nome da disciplina"
          value={formData.name}
          error={fieldErrors.name || ""}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Curso"
          value={formData.course}
          onChange={handleSelectChange}
          options={courseOptions}
          error={fieldErrors.course}
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={subjectData ? onClose : handleClose}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {subjectData ? "Atualizar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ModalManageSubject;