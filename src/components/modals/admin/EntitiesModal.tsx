import React, { useState, useEffect } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponetButton from "@/components/common/button";
import ComponentInput from "@/components/common/FormInput";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { BudgetManager, Department } from "@/types/interfaces";
import {
  useCreateBudgetManager,
  useUpdateBudgetManager,
  useGetDepartments,
} from "@/hooks/DynamicApiHooks";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { z } from "zod";
import {
  createBudgetManagerSchema,
  updateBudgetManagerSchema,
} from "@/types/type";

interface CreateEntitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker?: BudgetManager | null;
}

type BudgetManagerForm = z.infer<typeof createBudgetManagerSchema> & {
  blocked?: boolean;
};

const CreateEntitiesModal: React.FC<CreateEntitiesModalProps> = ({
  isOpen,
  onClose,
  worker,
}) => {
  const { mutateAsync: createBudgetManager } = useCreateBudgetManager();
  const { mutateAsync: updateBudgetManager } = useUpdateBudgetManager();
  const { data: departments = [] } = useGetDepartments();

  const defaultForm: BudgetManagerForm = {
    idBudgetManager: undefined,
    name: "",
    email: "",
    role: "",
    idDepartment: 0,
    blocked: false,
  };

  const [formData, setFormData] = useState<BudgetManagerForm>(() =>
    worker
      ? {
          idBudgetManager: worker.idBudgetManager,
          name: worker.name,
          email: worker.email || "",
          role: worker.role || "",
          idDepartment: worker.idDepartment,
          blocked: worker.blocked ?? false,
        }
      : defaultForm
  );

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    role?: string;
    idDepartment?: string;
    blocked?: string;
    license?: string;
    licenseNumber?: string;
    licenseDate?: string;
    licenseExpirationDate?: string;
  }>({});

  const departmentOptions = [
    { value: "", label: "Selecione o departamento…" },
    ...departments.map((dep: Department) => ({
      value: dep.idDepartment.toString(),
      label: dep.name,
    })),
  ];

  const roleOptions = [
    { value: "", label: "Selecione o papel…" },
    { value: "USER_MASTER", label: "Usuário Master" },
    { value: "APPROVER", label: "Aprovador" },
    { value: "REVIEWER", label: "Revisor" },
    { value: "PLANNER", label: "Planejador" },
  ];

  const isEditMode = !!formData.idBudgetManager;

  useEffect(() => {
    if (!isOpen) {
      setFormData(defaultForm);
      setFieldErrors({});
      setStatusMessage(null);
      setIsLoading(false);
    } else if (worker) {
      setFormData({
        idBudgetManager: worker.idBudgetManager,
        name: worker.name,
        email: worker.email || "",
        role: worker.role || "",
        idDepartment: worker.idDepartment,
        blocked: worker.blocked ?? false,
      });
    }
  }, [isOpen, worker]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "idDepartment" ? parseInt(value as string) : value,
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
    const schema = isEditMode
      ? updateBudgetManagerSchema
      : createBudgetManagerSchema;
    const result = schema.safeParse(formData);
    if (!result.success) {
      const rawErrors = result.error.formErrors.fieldErrors as Record<
        string,
        string[]
      >;
      setFieldErrors({
        name: rawErrors.name?.[0],
        email: rawErrors.email?.[0],
        role: rawErrors.role?.[0],
        idDepartment: rawErrors.idDepartment?.[0],
        blocked: rawErrors.blocked?.[0],
      });
      return;
    }

    setIsLoading(true);
    try {
      let response: any;
      if (isEditMode) {
        response = await updateBudgetManager({
          idBudgetManager: formData.idBudgetManager!,
          name: formData.name,
          idDepartment: formData.idDepartment,
          blocked: formData.blocked ?? false,
        });

        if (response.message === "Budget Manager updated successfully") {
          setStatusMessage({
            text: "Entidade atualizada com sucesso!",
            type: "success",
          });
          setTimeout(handleClose, 2000);
        } else {
          setStatusMessage({
            text: "Erro ao atualizar entidade. Tente novamente!",
            type: "error",
          });
        }
      } else {
        response = await createBudgetManager({
          name: formData.name,
          email: formData.email!,
          role: formData.role,
          idDepartment: formData.idDepartment,
        });
        if (response.message === "Budget Manager saved successfully") {
          setStatusMessage({
            text: "Entidade cadastrada com sucesso!",
            type: "success",
          });
          setTimeout(handleClose, 2000);
        } else {
          setStatusMessage({
            text: "Erro ao criar entidade. Tente novamente!",
            type: "error",
          });
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
      title={isEditMode ? "Editar Entidade" : "Cadastrar Entidade"}
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
      <div className="space-y-4 text-sm">
        <ComponentInput
          label="Nome"
          name="name"
          type="text"
          placeholder="Digite o nome"
          value={formData.name || ""}
          onChange={(e) => handleChange(e.target.name, e.target.value)}
          required
          error={fieldErrors.name}
        />
        {!isEditMode && (
          <ComponentInput
            label="Email"
            name="email"
            type="email"
            placeholder="Digite o email"
            value={formData.email || ""}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            required
            error={fieldErrors.email}
          />
        )}
        <SearchableSelect
          label="Área"
          value={formData.role || ""}
          onChange={(value) => handleChange("role", value)}
          options={roleOptions}
          error={fieldErrors.role}
        />
        <SearchableSelect
          label="Departamento"
          value={formData.idDepartment?.toString() || ""}
          onChange={(value) => handleChange("idDepartment", value)}
          options={departmentOptions}
          error={fieldErrors.idDepartment}
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          variant="secondary"
          onClick={handleClose}
          className="w-full md:w-auto"
          disabled={isLoading}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {isEditMode ? "Atualizar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default CreateEntitiesModal;
