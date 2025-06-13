import React, { useEffect, useState } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponetButton from "@/components/common/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { ModalManageRoomProps, Room } from "@/types/interfaces";
import { roomSchema } from "@/types/type";

const ModalManageRoom: React.FC<ModalManageRoomProps> = ({
  isOpen,
  onClose,
  room,
  onSave,
}) => {
  const [formData, setFormData] = useState<Room>({
    id: 0,
    sala: 0,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    sala?: string;
  }>({});

  useEffect(() => {
    if (room) {
      setFormData({ ...room });
    } else {
      setFormData({ id: 0, sala: 0 });
    }
    setFieldErrors({});
  }, [room]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10) || 0;
    setFormData((prev) => ({ ...prev, [name]: numValue }));
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
    setFormData({ id: 0, sala: 0 });
    setFieldErrors({});
    setStatusMessage(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = () => {
    const validation = roomSchema.safeParse(formData);
    if (!validation.success) {
      const errors = validation.error.format();
      setFieldErrors({
        sala: errors.sala?._errors[0] || "",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newRoom: Room = {
        id: room ? room.id : Date.now(),
        sala: formData.sala,
      };
      setStatusMessage({
        text: room
          ? "Sala atualizada com sucesso!"
          : "Sala cadastrada com sucesso!",
        type: "success",
      });
      setTimeout(() => {
        onSave(newRoom);
        setIsLoading(false);
        handleClose();
      }, 2000);
    } catch (error) {
      setStatusMessage({
        text: "Erro ao salvar. Tente novamente!",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  return (
    <DynamicModal
      title={room ? "Editar Sala" : "Cadastrar Sala"}
      isOpen={isOpen}
      onClose={room ? onClose : handleClose}
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
          label="Número da Sala"
          name="sala"
          type="number"
          placeholder="Digite o número da sala"
          value={formData.sala.toString()}
          error={fieldErrors.sala || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={room ? onClose : handleClose}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {room ? "Atualizar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ModalManageRoom;
