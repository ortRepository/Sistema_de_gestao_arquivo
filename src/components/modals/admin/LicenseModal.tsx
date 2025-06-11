import React, { useEffect, useState } from "react";
import ComponetButton from "@/components/common/button";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import { BudgetManager } from "@/types/interfaces";
import { z } from "zod";
import {
  useUpdateBudgetManagerLicense,
  useGenerateBudgetManagerLicense,
} from "@/hooks/DynamicApiHooks";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { licenseSchema } from "@/types/type";

type LicenseForm = z.infer<typeof licenseSchema>;

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetManager: BudgetManager | null;
  onSave: () => void;
  mode: "generate" | "update";
  onBack: () => void;
}

const LicenseModal: React.FC<LicenseModalProps> = ({
  isOpen,
  onClose,
  budgetManager,
  onSave,
  mode,
  onBack,
}) => {
  const [formData, setFormData] = useState<LicenseForm>({
    idBudgetManager: undefined,
    license: "",
    licenseDate: "",
    licenseExpirationDate: "",
    licenseNumber: "",
  });
  const [fieldErrors, setFieldErrors] = useState<{
    license?: string;
    licenseDate?: string;
    licenseExpirationDate?: string;
    licenseNumber?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const { mutateAsync: updateLicense } = useUpdateBudgetManagerLicense();
  const { mutateAsync: generateLicense } = useGenerateBudgetManagerLicense();

  useEffect(() => {
    if (budgetManager) {
      setFormData({
        idBudgetManager: budgetManager.idBudgetManager,
        license: budgetManager.license || "",
        licenseDate: budgetManager.licenseDate || "",
        licenseExpirationDate: budgetManager.licenseExpirationDate || "",
        licenseNumber: budgetManager.licenseNumber || "",
      });
    } else {
      setFormData({
        idBudgetManager: undefined,
        license: "",
        licenseDate: "",
        licenseExpirationDate: "",
        licenseNumber: "",
      });
    }
    setFieldErrors({});
    setStatusMessage(null);
  }, [budgetManager, isOpen]);

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

  const handleGenerateLicense = async () => {
    if (!budgetManager?.email) {
      setStatusMessage({
        text: "Email do gestor de orçamento é necessário para gerar a licença!",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateLicense({ email: budgetManager.email });
      setFormData((prev) => ({
        ...prev,
        licenseNumber: response.licenseNumber,
        licenseDate: response.licenseIssuanceDate,
        licenseExpirationDate: response.licenseExpirationDate,
        license: `LIC-${response.licenseNumber}`,
      }));
      setStatusMessage({
        text: "Licença gerada com sucesso!",
        type: "success",
      });
      await handleSubmit(); // Save after generating
    } catch (error) {
      setStatusMessage({
        text: "Erro ao gerar licença. Tente novamente!",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    const result = licenseSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.formErrors.fieldErrors;
      setFieldErrors({
        license: errors.license?.[0],
        licenseDate: errors.licenseDate?.[0],
        licenseExpirationDate: errors.licenseExpirationDate?.[0],
        licenseNumber: errors.licenseNumber?.[0],
      });
      return;
    }

    if (!formData.idBudgetManager) {
      setStatusMessage({
        text: "ID do gestor de orçamento é necessário!",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateLicense({
        idBudgetManager: formData.idBudgetManager,
        license: formData.license,
        licenseDate: formData.licenseDate,
        licenseExpirationDate: formData.licenseExpirationDate,
        licenseNumber: formData.licenseNumber,
      });
      setStatusMessage({
        text: "Licença atualizada com sucesso!",
        type: "success",
      });
      onSave();
      setTimeout(onClose, 2000);
    } catch (error) {
      setStatusMessage({
        text: "Erro ao atualizar licença. Tente novamente!",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicModal
      title={mode === "generate" ? "Gerar Licença" : "Atualizar Licença"}
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
            )}
            {statusMessage.text}
          </p>
        </div>
      )}
      <div className="space-y-4">
        <ComponentInput
          label="Licença"
          name="license"
          type="text"
          placeholder="Digite a licença"
          value={formData.license}
          error={fieldErrors.license || ""}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Data de Emissão"
          name="licenseDate"
          type="date"
          placeholder="Selecione a data de emissão"
          value={formData.licenseDate}
          error={fieldErrors.licenseDate || ""}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Data de Expiração"
          name="licenseExpirationDate"
          type="date"
          placeholder="Selecione a data de expiração"
          value={formData.licenseExpirationDate}
          error={fieldErrors.licenseExpirationDate || ""}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Número da Licença"
          name="licenseNumber"
          type="text"
          placeholder="Digite o número da licença"
          value={formData.licenseNumber}
          error={fieldErrors.licenseNumber || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={onBack}
        >
          Voltar
        </ComponetButton>
        {mode === "generate" && (
          <ComponetButton
            variant="primary"
            onClick={handleGenerateLicense}
            className="w-full md:w-auto"
            loading={isLoading}
          >
            Gerar Licença
          </ComponetButton>
        )}
        {mode === "update" && (
          <ComponetButton
            variant="primary"
            onClick={handleSubmit}
            className="w-full md:w-auto"
            loading={isLoading}
          >
            Atualizar
          </ComponetButton>
        )}
      </div>
    </DynamicModal>
  );
};

export default LicenseModal;