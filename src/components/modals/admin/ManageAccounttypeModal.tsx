import React, { useEffect, useState } from "react";
import ComponetButton from "@/components/common/button";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import { Account } from "@/types/interfaces";
import {
  useCreateAccount,
  useUpdateAccount,
  useGetClasses,
} from "@/hooks/DynamicApiHooks";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { z } from "zod";
import ComponentSelect from "@/components/common/ComponentSelect";
import { accountSchema } from "@/types/type";

interface ManageAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Account | null;
  onSave: (cat: Account) => void;
}

type AccountForm = z.infer<typeof accountSchema>;

const defaultForm: AccountForm = {
  name: "",
  number: 0,
  description: "",
  idClass: 0,
};

const ManageAccountModal: React.FC<ManageAccountModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const [formData, setFormData] = useState<{
    idAccount?: number;
    name: string;
    number: number;
    description: string;
    idClass: number;
  }>({
    idAccount: undefined,
    ...defaultForm,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AccountForm, string>>
  >({});

  const { mutateAsync: createAccount } = useCreateAccount();
  const { mutateAsync: updateAccount } = useUpdateAccount();
  const { data: classes = [] } = useGetClasses();

  useEffect(() => {
    if (category) {
      setFormData({
        idAccount: category.idAccount,
        name: category.name,
        number: category.number,
        description: category.description,
        idClass: category.idClass,
      });
    } else {
      setFormData({
        idAccount: undefined,
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
      [name]: name === "number" || name === "idClass" ? Number(value) : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleClose = () => {
    setFormData({
      idAccount: undefined,
      ...defaultForm,
    });
    setStatusMessage(null);
    setIsLoading(false);
    setFieldErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    const result = accountSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.formErrors.fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        number: errors.number?.[0],
        description: errors.description?.[0],
        idClass: errors.idClass?.[0],
      });
      return;
    }
    try {
      let response: any;
      setIsLoading(true);
      setStatusMessage(null);

      if (category && formData.idAccount) {
        response = await updateAccount({
          idAccount: formData.idAccount,
          name: formData.name,
          number: formData.number,
          description: formData.description,
          idClass: formData.idClass,
        });

        if (response.message === "Account updated successfully") {
          {
            setStatusMessage({
              text: "Conta atualizada com sucesso!",
              type: "success",
            });

            setIsLoading(false);
            setTimeout(onClose, 2000);
          }
        } else {
          setStatusMessage({
            text: "Erro ao atualizar conta. Tente novamente!",
            type: "error",
          });
          setIsLoading(false);
        }
      } else {
        response = await createAccount({
          name: formData.name,
          number: formData.number,
          description: formData.description,
          idClass: formData.idClass,
        });

        if (response.message === "Account saved successfully") {
          {
            setStatusMessage({
              text: "Conta cadastrada com sucesso!",
              type: "success",
            });

            setIsLoading(false);
            setTimeout(handleClose, 2000);
          }
        } else {
          setStatusMessage({
            text: "Erro ao atualizar conta. Tente novamente!",
            type: "error",
          });
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      const expectedMsg = `Account already exists: ${formData.name}`;
      if (error.message == expectedMsg) {
        setStatusMessage({
          text: `Conta já existe : ${formData.name}`,
          type: "error",
        });
        setIsLoading(false);
      } else {
        setStatusMessage({
          text: "Erro desconhecido. Tente novamente mais tarde.",
          type: "error",
        });
        setIsLoading(false);
      }
    }
  };

  return (
    <DynamicModal
      title={category ? "Editar conta" : "Cadastrar conta"}
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
          label="Nome da conta"
          name="name"
          type="text"
          placeholder="Digite o nome da conta"
          value={formData.name}
          error={fieldErrors.name || ""}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Número da conta"
          name="number"
          type="number"
          placeholder="Digite o número da conta"
          value={formData.number.toString()}
          error={fieldErrors.number || ""}
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
        <div className="space-y-1">
          <ComponentSelect
            label="Classes"
            name="idClass"
            value={String(formData.idClass)}
            onChange={handleChange}
            options={[
              { value: "", label: "Selecione a classe…" },
              ...classes.map((dir) => ({
                value: dir.idClass.toString(),
                label: dir.name,
              })),
            ]}
            error={fieldErrors.idClass || ""}
            required
          />
        </div>
      </div>

      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2 ">
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
        >
          {category ? "Salvar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ManageAccountModal;
