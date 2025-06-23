import React, { useEffect, useState } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponentButton from "@/components/common/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { classSchema } from "@/types/type";
import {
  useAddClass,
  useListRooms,
  useUpdateClass,
} from "@/hooks/DynamicApiHooks";
import { Class, ModalManageClassProps } from "@/types/interfaces";

const ModalManageClass: React.FC<ModalManageClassProps> = ({
  isOpen,
  onClose,
  classData,
}) => {
  const [formData, setFormData] = useState<Partial<Class>>({
    name: "",
    status: true,
    idRoom: 0,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    status?: string;
    idRoom?: string;
  }>({});

  const { data: rooms } = useListRooms();
  const { mutateAsync: addClass } = useAddClass();
  const { mutateAsync: updateClass } = useUpdateClass();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (classData) {
      setFormData({
        idClass: classData.idClass,
        name: classData.name,
        status: classData.status,
        idRoom: classData.idRoom,
      });
    } else {
      setFormData({
        name: "",
        status: true,
        idRoom: 0,
      });
    }
    setFieldErrors({});
  }, [classData]);

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
      [name]: name === "status" ? value === "true" : parseInt(value, 10) || 0,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleClose = () => {
    setFormData({ name: "", status: true, idRoom: 0 });
    setFieldErrors({});
    setStatusMessage(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = () => {
    setIsLoading(true);
    const validation = classSchema.safeParse(formData);
    if (!validation.success) {
      const errors = validation.error.format();
      setFieldErrors({
        name: errors.name?._errors[0],
        status: errors.status?._errors[0],
        idRoom: errors.idRoom?._errors[0],
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const payload = {
      name: formData.name!,
      status: formData.status!,
      idRoom: formData.idRoom!,
    };

    const onSuccess = () => {
      setStatusMessage({
        text: classData
          ? "Turma atualizada com sucesso!"
          : "Turma cadastrada com sucesso!",
        type: "success",
      });
      setIsLoading(false);
      setTimeout(classData ? onClose : handleClose, 2000);
    };

    const onError = (error: any) => {
      setStatusMessage({
        text: error.message || "Erro ao salvar. Tente novamente!",
        type: "error",
      });
      setIsLoading(false);
    };

    if (classData) {
      updateClass(payload, { onSuccess, onError });
    } else {
      addClass(payload, { onSuccess, onError });
    }
  };

  const roomOptions = (rooms || []).map((room) => ({
    value: room.idRoom.toString(),
    label: room.name,
  }));

  const statusOptions = [
    { value: "true", label: "Ativo" },
    { value: "false", label: "Inativo" },
  ];

  return (
    <DynamicModal
      title={classData ? "Editar Turma" : "Cadastrar Turma"}
      isOpen={isOpen}
      onClose={classData ? onClose : handleClose}
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
          label="Nome da Turma"
          name="name"
          type="text"
          placeholder="Digite o nome da turma"
          value={formData.name || ""}
          error={fieldErrors.name || ""}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Status"
          value={formData.status?.toString() || "true"}
          onChange={(value) => handleSelectChange("status", value)}
          options={statusOptions}
          error={fieldErrors.status}
        />

        <SearchableSelect
          label="Sala"
          value={formData.idRoom?.toString() || ""}
          onChange={(value) => handleSelectChange("idRoom", value)}
          options={roomOptions}
          error={fieldErrors.idRoom}
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponentButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={classData ? onClose : handleClose}
        >
          Cancelar
        </ComponentButton>
        <ComponentButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {classData ? "Atualizar" : "Cadastrar"}
        </ComponentButton>
      </div>
    </DynamicModal>
  );
};

export default ModalManageClass;
