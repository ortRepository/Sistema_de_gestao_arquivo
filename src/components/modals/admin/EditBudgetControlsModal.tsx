import React, { useEffect, useState } from "react";
import ComponentInput from "@/components/common/FormInput";
import DynamicModal from "@/components/common/DynamicModal";
import ComponetButton from "@/components/common/button";
import { useUpdateBudgetControl } from "@/hooks/DynamicApiHooks";
import { z } from "zod";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { BudgetControl } from "@/types/interfaces";
import { budgetControlSchema } from "@/types/type";

type BudgetControlForm = z.infer<typeof budgetControlSchema> & {
  idBudgetControl: number;
};

interface EditBudgetControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetControl: BudgetControl | null;
  onSave: (updated: BudgetControl) => void;
}

const defaultForm: BudgetControlForm = {
  idBudgetControl: 0,
  name: "",
  description: "",
};

export default function EditBudgetControlsModal({
  isOpen,
  onClose,
  budgetControl,
}: // onSave,
EditBudgetControlsModalProps) {
  const [formData, setFormData] = useState<BudgetControlForm>(defaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    description?: string;
  }>({});
  const { mutateAsync: updateBudgetControl } = useUpdateBudgetControl();

  useEffect(() => {
    if (isOpen && budgetControl) {
      setFormData({
        idBudgetControl: budgetControl.idBudgetControl,
        name: budgetControl.name,
        description: budgetControl.description,
      });
    } else if (!isOpen) {
      setFieldErrors({});
      setStatusMessage(null);
      setIsLoading(false);
    }
  }, [budgetControl, isOpen]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (!formData) return;
    setFormData((prev) => prev && { ...prev, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData) return;

    const result = budgetControlSchema.safeParse(formData);
    if (!result.success) {
      const issues = result.error.format();
      setFieldErrors({
        name: issues.name?._errors[0],
        description: issues.description?._errors[0],
      });
      return;
    }
    setIsLoading(true);
    try {
      let response: any;
      response = await updateBudgetControl({
        idBudgetControl: formData.idBudgetControl,
        name: formData.name,
        description: formData.description,
      });
     console.log(response.message )
      if (response.message === "Budget control updated successfully") {
        {
          setStatusMessage({
            text: "Controle atualizada com sucesso!",
            type: "success",
          });

          setIsLoading(false);
          setTimeout(onClose, 2000);
        }
      } else {
        setStatusMessage({
          text: "Erro ao salvar.Tente novamente!",
          type: "error",
        });
        setIsLoading(false);
      }

      // onSave(responseData);
    } catch (error) {
      setStatusMessage({
        text: "Erro ao salvar. Tente novamente!",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <DynamicModal
      title="Editar Controle de Orçamento"
      isOpen={isOpen}
      onClose={onClose}
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
            )}{" "}
            {statusMessage.text}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <ComponentInput
          label="Nome do Controle"
          name="name"
          type="text"
          placeholder="Digite o nome"
          value={formData.name}
          onChange={handleChange}
          error={fieldErrors.name}
          required
        />

        <ComponentInput
          label="Descrição"
          name="description"
          type="text"
          placeholder="Digite a descrição"
          value={formData.description}
          onChange={handleChange}
          error={fieldErrors.description}
          required
        />

        <div className="flex justify-end gap-2 mt-4">
          <ComponetButton
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </ComponetButton>
          <ComponetButton
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
          >
            Salvar
          </ComponetButton>
        </div>
      </div>
    </DynamicModal>
  );
}
