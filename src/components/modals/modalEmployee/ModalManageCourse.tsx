import React, { useEffect, useState } from "react";
import { z } from "zod";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponentButton from "@/components/common/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ModalManageCourseProps } from "@/types/interfaces";
import { useAddCourse, useUpdateCourse } from "@/hooks/DynamicApiHooks";
import { courseSchema } from "@/types/type";

interface Option {
  value: string;
  label: string;
}

type CourseForm = z.infer<typeof courseSchema>;

const ModalManageCourse: React.FC<ModalManageCourseProps> = ({
  isOpen,
  onClose,
  course,
  onSave,
}) => {
  const [formData, setFormData] = useState<CourseForm>({
    name: "",
    status: true,
  });

  const defaultForm: CourseForm = {
    name: "",
    status: true,
  };

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    status?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const { mutateAsync: addCourse } = useAddCourse();
  const { mutateAsync: updateCourse } = useUpdateCourse();

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        status: course.status,
      });
    } else {
      setFormData(defaultForm);
    }
    setFieldErrors({});
  }, [course]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? value === "true" : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleClose = () => {
    setFormData(defaultForm);
    setFieldErrors({});
    setStatusMessage(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = () => {
    const validation = courseSchema.safeParse(formData);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        status: errors.status?.[0],
      });
      return;
    }

    setIsLoading(true);
    const payload = {
      name: formData.name,
      status: formData.status,
    };

    const onSuccess = () => {
      setStatusMessage({
        text: course
          ? "Curso atualizado com sucesso!"
          : "Curso cadastrado com sucesso!",
        type: "success",
      });
      setIsLoading(false);
      onSave({
        ...payload,
        idCourse: course ? course.idCourse : 0,
        createdIn: course ? course.createdIn : new Date().toISOString(),
        updatedIn: new Date().toISOString(),
      });
      setTimeout(course ? onClose : handleClose, 2000);
    };

    const onError = (error: any) => {
      setStatusMessage({
        text: error.message || "Erro ao salvar. Tente novamente!",
        type: "error",
      });
      setIsLoading(false);
    };

    if (course) {
      updateCourse(
        { ...payload, idcourses: course.idCourse },
        { onSuccess, onError }
      );
    } else {
      addCourse(payload, { onSuccess, onError });
    }
  };

  const statusOptions: Option[] = [
    { value: "true", label: "Ativo" },
    { value: "false", label: "Inativo" },
  ];

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
          label="Nome do Curso"
          name="name"
          type="text"
          placeholder="Digite o nome do curso"
          value={formData.name}
          error={fieldErrors.name || ""}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Status"
          value={formData.status.toString()}
          onChange={(value) => handleSelectChange("status", value)}
          options={statusOptions}
          error={fieldErrors.status}
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponentButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={course ? onClose : handleClose}
        >
          Cancelar
        </ComponentButton>
        <ComponentButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {course ? "Atualizar" : "Cadastrar"}
        </ComponentButton>
      </div>
    </DynamicModal>
  );
};

export default ModalManageCourse;
