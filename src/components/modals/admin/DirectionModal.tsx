import React, { useEffect, useState } from "react";
import ComponetButton from "@/components/common/button";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import { Direction } from "@/types/interfaces";
import { z } from "zod";
import {
  useUpdateDirections,
  useCreatDirections,
} from "@/hooks/DynamicApiHooks";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { directionSchema } from "@/types/type";

type DirectionForm = z.infer<typeof directionSchema>;

interface DirectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction: Direction | null;
  onSave: (dir: Direction) => void;
}

const DirectionModal: React.FC<DirectionModalProps> = ({
  isOpen,
  onClose,
  direction,
  // onSave,
}) => {
  const [formData, setFormData] = useState<DirectionForm>({
    idDirection: undefined,
    name: "",
    description: "",
  });
  const defaultForm: DirectionForm = {
    idDirection: undefined,
    name: "",
    description: "",
  };

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (direction) {
      setFormData({
        idDirection: direction.idDirection,
        name: direction.name,
        description: direction.description,
      });
    } else {
      setFormData({ idDirection: undefined, name: "", description: "" });
    }
    setFieldErrors({});
  }, [direction]);

  // API mutations
  const { mutateAsync: createDirection } = useCreatDirections();
  const { mutateAsync: updateDirection } = useUpdateDirections();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
    // Validate with Zod
    const result = directionSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.formErrors.fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        description: errors.description?.[0],
      });
      return;
    }

    setIsLoading(true);
    try {
      let response: any;
      if (formData.idDirection) {
        response = await updateDirection({
          idDirection: formData.idDirection,
          name: formData.name,
          description: formData.description,
        });

        if (response.message === "Direction updated successfully") {
          {
            setStatusMessage({
              text: "Direção atualizada com sucesso!",
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
      } else {
        response = await createDirection({
          name: formData.name,
          description: formData.description,
        });
        if (response.message === "Direction saved successfully") {
          {
            setStatusMessage({
              text: "Direção cadastrada com sucesso!",
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

  return (
    <DynamicModal
      title={direction ? "Editar direção" : "Cadastrar direção"}
      isOpen={isOpen}
      onClose={direction ? onClose : handleClose}
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
          label="Nome da Direção"
          name="name"
          type="text"
          placeholder="Digite o nome da direção"
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
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={() => {
            direction ? onClose : handleClose;
          }}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {direction ? "Actualizar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default DirectionModal;
