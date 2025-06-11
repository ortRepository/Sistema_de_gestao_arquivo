import React, { useEffect, useState } from "react";
import ComponetButton from "@/components/common/button";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import { CostCenter } from "@/types/interfaces";
import { z } from "zod";
import {
  useCreateCostCenter,
  useUpdateCostCenter,
  useGetAccounts, // Hypothetical hook for fetching accounts
} from "@/hooks/DynamicApiHooks";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { costCenterSchema } from "@/types/type";

type CostCenterForm = z.infer<typeof costCenterSchema>;

interface CostCenterManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  costCenter: CostCenter | null;
  onSave: (costCenter: CostCenter) => void;
}

const CostCenterManagementModal: React.FC<CostCenterManagementModalProps> = ({
  isOpen,
  onClose,
  costCenter,
  // onSave,
}) => {
  const [formData, setFormData] = useState<CostCenterForm>({
    idCostCenter: undefined,
    name: "",
    description: "",
    idAccount: 0,
  });
  const defaultForm: CostCenterForm = {
    idCostCenter: undefined,
    name: "",
    description: "",
    idAccount: 0,
  };

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    description?: string;
    idAccount?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Fetch accounts (hypothetical hook)
  const { data: accounts = [] } = useGetAccounts(); // Replace with actual hook if available

  // Map accounts to select options
  const accountOptions = accounts.map(
    (account: { idAccount: number; name: string }) => ({
      value: account.idAccount.toString(),
      label: account.name,
    })
  );

  // API mutations
  const { mutateAsync: createCostCenter } = useCreateCostCenter();
  const { mutateAsync: updateCostCenter } = useUpdateCostCenter();

  useEffect(() => {
    if (costCenter) {
      setFormData({
        idCostCenter: costCenter.idCostCenter,
        name: costCenter.name,
        description: costCenter.description,
        idAccount: costCenter.idAccount,
      });
    } else {
      setFormData(defaultForm);
    }
    setFieldErrors({});
    setStatusMessage(null);
  }, [costCenter]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "idAccount" ? Number(value) : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
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

  const handleSubmit = async () => {
    // Validate with Zod
    const result = costCenterSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.formErrors.fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        description: errors.description?.[0],
        idAccount: errors.idAccount?.[0],
      });
      return;
    }

    setIsLoading(true);
    try {
      let response: any;
      if (formData.idCostCenter) {
        response = await updateCostCenter({
          idCostCenter: formData.idCostCenter,
          name: formData.name,
          description: formData.description,
          idAccount: formData.idAccount,
        });
        if (response.message === "Cost Center updated successfully") {
          setStatusMessage({
            text: "Centro de custo atualizado com sucesso!",
            type: "success",
          });
          setTimeout(onClose, 2000);
        } else {
          setStatusMessage({
            text: "Erro ao atualizar centro de custo. Tente novamente!",
            type: "error",
          });
        }
      } else {
        response = await createCostCenter({
          name: formData.name,
          description: formData.description,
          idAccount: formData.idAccount,
        });

        if (response.message === "Cost Center saved successfully") {
          setStatusMessage({
            text: "Centro de custo cadastrado com sucesso!",
            type: "success",
          });
          setTimeout(handleClose, 2000);
        } else {
          setStatusMessage({
            text: "Erro ao cadastrar centro de custo. Tente novamente!",
            type: "error",
          });
        }
      }
    } catch (error) {
      setStatusMessage({
        text: "Erro ao salvar. Tente novamente!",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicModal
      title={
        costCenter ? "Editar centro de custo" : "Cadastrar centro de custo"
      }
      isOpen={isOpen}
      onClose={costCenter ? onClose : handleClose}
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
          label="Nome do Centro de Custo"
          name="name"
          type="text"
          placeholder="Digite o nome do centro de custo"
          value={formData.name}
          error={fieldErrors.name || ""}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Descrição"
          name="description"
          type="text"
          placeholder="Digite a descrição"
          error={fieldErrors.description || ""}
          value={formData.description}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Conta"
          value={formData.idAccount.toString()}
          onChange={(value) => handleSelectChange("idAccount", value)}
          options={accountOptions}
          error={fieldErrors.idAccount || ""}
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={costCenter ? onClose : handleClose}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {costCenter ? "Actualizar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default CostCenterManagementModal;
