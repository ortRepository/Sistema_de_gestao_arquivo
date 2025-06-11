import React, { useEffect, useState } from "react";
import ComponentInput from "@/components/common/FormInput";
import DynamicModal from "@/components/common/DynamicModal";
import ComponetButton from "@/components/common/button";
import { useCreateBudgetControl } from "@/hooks/DynamicApiHooks";
import { z } from "zod";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { BudgetControl } from "@/types/interfaces";
import { budgetControlSchema } from "@/types/type";

type BudgetControlForm = z.infer<typeof budgetControlSchema>;

export interface CreateBudgetControlDto extends BudgetControlForm {}

interface CreateBudgetControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BudgetControl) => void;
}

export default function CreateBudgetControlModal({
  isOpen,
  onClose,
}: // onSave,
CreateBudgetControlModalProps) {
  const [formData, setFormData] = useState<BudgetControlForm>({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  const { mutateAsync: createBudgetControl } = useCreateBudgetControl();

  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", description: "" });
      setFieldErrors({});
      setStatusMessage(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setFieldErrors({});
    setStatusMessage(null);
    setIsLoading(false);
    onClose();
  };
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
    setFormData((prev) => ({ ...prev, [name]: value } as BudgetControlForm));
    if (fieldErrors[name as keyof BudgetControlForm]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    // Validação Zod
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

      response = await createBudgetControl(formData);

      if (response.message === "Budget Control saved successfully") {
        {
          setStatusMessage({
            text: "Controle Cadastrado com sucesso!",
            type: "success",
          });

          setIsLoading(false);
          setTimeout(handleClose, 2000);
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
      title="Cadastrar Controle de Orçamento"
      isOpen={isOpen}
      onClose={handleClose}
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
      </div>

      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          variant="secondary"
          className="w-full md:w-auto"
          onClick={handleClose}
          disabled={isLoading}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          className="w-full md:w-auto"
          onClick={handleSubmit}
          loading={isLoading}
        >
          Cadastrar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
}
