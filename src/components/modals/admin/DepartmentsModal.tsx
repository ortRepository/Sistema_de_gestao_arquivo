import React, { useEffect, useState } from "react";
import ComponetButton from "@/components/common/button";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import { Department, Section } from "@/types/interfaces";
import {
  useCreateDepartment,
  useUpdateDepartment,
  useGetSections, // Added hook for sections
} from "@/hooks/DynamicApiHooks";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { departmentSchema } from "@/types/type";
import { z } from "zod";
import { SearchableSelect } from "@/components/common/SearchableSelect";

interface DepartmentsProps {
  isOpen: boolean;
  onClose: () => void;
  category: Department | null;
  onSave: (cat: Department) => void;
}

type SectionForm = z.infer<typeof departmentSchema>;

const DepartmentsModal: React.FC<DepartmentsProps> = ({
  isOpen,
  onClose,
  category,
  // onSave,
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    departmentNumber: number;
    idSection: number;
  }>({
    name: "",
    description: "",
    departmentNumber: 0,
    idSection: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SectionForm, string>>
  >({});
  const { mutateAsync: createDepartment } = useCreateDepartment();
  const { mutateAsync: updateDepartment } = useUpdateDepartment();
  const { data: sections = [] } = useGetSections(); // Fetch sections

  // Map sections to select options
  const sectionOptions = sections.map((section: Section) => ({
    value: section.idSection.toString(),
    label: section.name,
  }));

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        departmentNumber: category.departmentNumber,
        idSection: category.idSection,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        departmentNumber: 0,
        idSection: 0,
      });
    }
    setErrors({});
    setStatusMessage(null);
  }, [category]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "departmentNumber" || name === "idSection"
          ? Number(value)
          : value,
    }));
  };

  // Handle SearchableSelect changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value), // Convert value to number for idSection
    }));
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      departmentNumber: 0,
      idSection: 0,
    });
    setStatusMessage(null);
    setIsLoading(false);
    onClose();
    setErrors({});
  };

  const handleSubmit = async () => {
    const result = departmentSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        departmentNumber: fieldErrors.departmentNumber?.[0],
        description: fieldErrors.description?.[0],
        idSection: fieldErrors.idSection?.[0],
      });
      return;
    }
    try {
      let response: any;
      setIsLoading(true);
      if (category) {
        response = await updateDepartment({
          idDepartment: category.idDepartment,
          ...formData,
        });

        if (response.message === "Department updated successfully") {
          setStatusMessage({
            text: "Departamento atualizado com sucesso!",
            type: "success",
          });
          setIsLoading(false);
          setTimeout(onClose, 2000);
        } else {
          setStatusMessage({
            text: "Erro ao atualizar departamento. Tente novamente!",
            type: "error",
          });
          setIsLoading(false);
        }
      } else {
        response = await createDepartment({
          name: formData.name,
          description: formData.description,
          departmentNumber: formData.departmentNumber,
          idSection: formData.idSection,
        });

        if (response.message === "Department saved successfully") {
          setStatusMessage({
            text: "Departamento cadastrado com sucesso!",
            type: "success",
          });
          setIsLoading(false);
          setTimeout(handleClose, 2000);
        } else {
          setStatusMessage({
            text: "Erro ao salvar. Tente novamente!",
            type: "error",
          });
          setIsLoading(false);
        }
      }
    } catch (error) {
      setStatusMessage({
        text: "Erro desconhecido. Tente novamente mais tarde.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicModal
      title={category ? "Editar departamento" : "Cadastrar departamento"}
      isOpen={isOpen}
      onClose={category ? onClose : handleClose}
    >
      <div className="space-y-4">
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
        <ComponentInput
          label="Nome do departamento"
          name="name"
          type="text"
          placeholder="Digite o nome do departamento"
          value={formData.name}
          error={errors.name || ""}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Descrição"
          name="description"
          type="text"
          placeholder="Escrever"
          error={errors.description || ""}
          value={formData.description}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Número do departamento"
          name="departmentNumber"
          type="number"
          placeholder="Digite o número do departamento"
          error={errors.departmentNumber || ""}
          value={formData.departmentNumber.toString()}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Seção"
          value={formData.idSection.toString()}
          onChange={(value) => handleSelectChange("idSection", value)}
          options={sectionOptions}
          error={errors.idSection || ""}
        />
      </div>

      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={category ? onClose : handleClose}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {category ? "Actualizar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default DepartmentsModal;
