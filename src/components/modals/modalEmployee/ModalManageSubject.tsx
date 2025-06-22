import React, { useEffect, useState } from "react";
import { z } from "zod";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponentButton from "@/components/common/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { subjectSchema } from "@/types/type";
import { SubjectModalProps } from "@/types/interfaces";
import {
  useAddSubject,
  useListCourses,
  useUpdateSubject,
} from "@/hooks/DynamicApiHooks";

// Define Option type for SearchableSelect
interface Option {
  value: string;
  label: string;
}

type SubjectForm = z.infer<typeof subjectSchema>;

const ModalManageSubject: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  subjectData,
}) => {
  const [formData, setFormData] = useState<SubjectForm>({
    name: "",
    course: "",
    status: "true", // Default to "Ativo"
  });
  const defaultForm: SubjectForm = {
    name: "",
    course: "",
    status: "true",
  };
  const { data: courses } = useListCourses();
  const { mutateAsync: addSubject } = useAddSubject();
  const { mutateAsync: updateSubject } = useUpdateSubject();

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    course?: string;
    status?: string;
  }>({});

  // Transform courses into options for SearchableSelect
  const courseOptions: Option[] = courses
    ? courses.map((course) => ({
        value: course.idCourse.toString(),
        label: course.name,
      }))
    : [];

  // Status options for SearchableSelect
  const statusOptions: Option[] = [
    { value: "true", label: "Ativo" },
    { value: "false", label: "Inativo" },
  ];

  useEffect(() => {
    if (subjectData) {
      setFormData({
        name: subjectData.name,
        course: subjectData.idCourse.toString(),
        status: subjectData.status ? "true" : "false",
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

  const handleSelectChange = (name: string, value: string) => {
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

  const handleSubmit = async () => {
    const result = subjectSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        course: errors.course?.[0],
        status: errors.status?.[0],
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        status: formData.status === "true", // Convert string to boolean
        idCourse: parseInt(formData.course),
      };

      if (subjectData) {
        await updateSubject({
          ...payload,
          idCourse: subjectData.idSubject, 
        });
        setStatusMessage({
          text: "Disciplina atualizada com sucesso!",
          type: "success",
        });
      } else {
        await addSubject(payload);
        setStatusMessage({
          text: "Disciplina cadastrada com sucesso!",
          type: "success",
        });
      }
      setFormData(defaultForm);
      setTimeout(handleClose, 3000);
    } catch (error: any) {
      setStatusMessage({
        text: error.message || "Erro ao salvar. Tente novamente!",
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
        {courseOptions.length === 0 ? (
          <p className="text-gray-500">Nenhum curso disponível</p>
        ) : (
          <SearchableSelect
            label="Curso"
            value={formData.course}
            onChange={(value) => handleSelectChange("course", value)}
            options={courseOptions}
            error={fieldErrors.course}
          />
        )}
        <SearchableSelect
          label="Status"
          value={formData.status}
          onChange={(value) => handleSelectChange("status", value)}
          options={statusOptions}
          error={fieldErrors.status}
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponentButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={subjectData ? onClose : handleClose}
        >
          Cancelar
        </ComponentButton>
        <ComponentButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {subjectData ? "Atualizar" : "Cadastrar"}
        </ComponentButton>
      </div>
    </DynamicModal>
  );
};

export default ModalManageSubject;
