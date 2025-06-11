import React, { useEffect, useState } from "react";
import ComponetButton from "@/components/common/button";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import { Class, BudgetControl } from "@/types/interfaces";
import {
  useCreateClass,
  useUpdateClass,
  useGetBudgetControls, // Importar o hook
} from "@/hooks/DynamicApiHooks";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { classSchema } from "@/types/type";
import { SearchableSelect } from "@/components/common/SearchableSelect";

interface ManageClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Class | null;
  onSave: (cat: Class) => void;
}

type ClassForm = z.infer<typeof classSchema>;

const defaultForm: ClassForm = {
  name: "",
  description: "",
  idBudgetControl: 0,
};

const ManageClassModal: React.FC<ManageClassModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const [formData, setFormData] = useState<{
    idClass?: number;
    name: string;
    description: string;
    idBudgetControl: number;
  }>({
    idClass: undefined,
    ...defaultForm,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ClassForm, string>>
  >({});

  const { mutateAsync: createClass } = useCreateClass();
  const { mutateAsync: updateClass } = useUpdateClass();
  const {
    data: apiBudget = [],
    isLoading: isLoadingBudgetControls,
    error: budgetControlError,
  } = useGetBudgetControls();

  // Mapear os controles de orçamento para o formato do SearchableSelect
  const budgetControlOptions = apiBudget.map((budget: BudgetControl) => ({
    value: budget.idBudgetControl.toString(),
    label: budget.name,
  }));

  useEffect(() => {
    if (category) {
      setFormData({
        idClass: category.idClass,
        name: category.name,
        description: category.description,
        idBudgetControl: category.idBudgetControl,
      });
    } else {
      setFormData({
        idClass: undefined,
        ...defaultForm,
      });
    }
    setStatusMessage(null);
    setFieldErrors({});
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
      [name]: name === "idBudgetControl" ? Number(value) : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value), // Converter para número, já que idBudgetControl é number
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleClose = () => {
    setFormData({
      idClass: undefined,
      ...defaultForm,
    });
    setStatusMessage(null);
    setIsLoading(false);
    setFieldErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    const result = classSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.formErrors.fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        description: errors.description?.[0],
        idBudgetControl: errors.idBudgetControl?.[0],
      });
      return;
    }
    try {
      let response: any;
      setIsLoading(true);
      setStatusMessage(null);
      if (category && formData.idClass) {
        response = await updateClass({
          idClass: formData.idClass,
          name: formData.name,
          description: formData.description,
          idBudgetControl: formData.idBudgetControl,
        });

        if (response.message === "Class updated successfully") {
          setStatusMessage({
            text: "Classe atualizada com sucesso!",
            type: "success",
          });
          setIsLoading(false);
          setTimeout(handleClose, 2000);
        } else {
          setStatusMessage({
            text: "Erro ao atualizar classe. Tente novamente!",
            type: "error",
          });
          setIsLoading(false);
        }
      } else {
        response = await createClass({
          name: formData.name,
          description: formData.description,
          idBudgetControl: formData.idBudgetControl,
        });

        if (response.message === "Class saved successfully") {
          setStatusMessage({
            text: "Classe cadastrada com sucesso!",
            type: "success",
          });
          setIsLoading(false);
          setTimeout(handleClose, 2000);
        } else {
          setStatusMessage({
            text: "Erro ao cadastrar classe. Tente novamente!",
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
      setIsLoading(false);
    }
  };

  return (
    <DynamicModal
      title={category ? "Editar classe" : "Cadastrar classe"}
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
          label="Nome da classe"
          name="name"
          type="text"
          placeholder="Digite o nome da classe"
          value={formData.name}
          error={fieldErrors.name || ""}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Descrição"
          name="description"
          type="text"
          placeholder="Escrever"
          value={formData.description}
          error={fieldErrors.description || ""}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Controle de Orçamento"
          value={formData.idBudgetControl.toString()}
          onChange={(value) => handleSelectChange("idBudgetControl", value)}
          options={budgetControlOptions}
          error={fieldErrors.idBudgetControl || ""}
        />
      </div>

      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          variant="secondary"
          onClick={category ? onClose : handleClose}
          className="w-full md:w-auto"
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
          disabled={isLoadingBudgetControls || !!budgetControlError}
        >
          {category ? "Salvar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ManageClassModal;
