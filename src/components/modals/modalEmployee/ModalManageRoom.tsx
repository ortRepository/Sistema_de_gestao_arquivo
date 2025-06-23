import React, { useEffect, useState } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponentButton from "@/components/common/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ModalManageRoomProps, Room } from "@/types/interfaces";
import { roomSchema } from "@/types/type";
import {
  useListCourses,
  useAddRoom,
  useUpdateRoom,
} from "@/hooks/DynamicApiHooks";

const ModalManageRoom: React.FC<ModalManageRoomProps> = ({
  isOpen,
  onClose,
  room,
}) => {
  const [formData, setFormData] = useState<Partial<Room>>({
    name: "",
    status: true,
    idCourse: 0,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    status?: string;
    idCourse?: string;
  }>({});

  const { data: courses } = useListCourses();
  const { mutateAsync: addRoom } = useAddRoom();
  const { mutateAsync: updateRoom } = useUpdateRoom();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (room) {
      setFormData({
        idRoom: room.idRoom,
        name: room.name,
        status: room.status,
        idCourse: room.idCourse,
      });
    } else {
      setFormData({
        name: "",
        status: true,
        idCourse: 0,
      });
    }
    setFieldErrors({});
  }, [room]);

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
    setFormData({ name: "", status: true, idCourse: 0 });
    setFieldErrors({});
    setStatusMessage(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = () => {
    setIsLoading(true);
    const validation = roomSchema.safeParse(formData);
    if (!validation.success) {
      const errors = validation.error.format();
      setFieldErrors({
        name: errors.name?._errors[0],
        status: errors.status?._errors[0],
        idCourse: errors.idCourse?._errors[0],
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const payload = {
      name: formData.name!,
      status: formData.status!,
      idCourse: formData.idCourse!,
    };

    const onSuccess = () => {
      setStatusMessage({
        text: room
          ? "Sala atualizada com sucesso!"
          : "Sala cadastrada com sucesso!",
        type: "success",
      });
      setIsLoading(false);
      setTimeout(room ? onClose : handleClose, 2000);
    };

    const onError = (error: any) => {
      setStatusMessage({
        text: error.message || "Erro ao salvar. Tente novamente!",
        type: "error",
      });
      setIsLoading(false);
    };

    if (room) {
      updateRoom(payload, { onSuccess, onError });
    } else {
      addRoom(payload, { onSuccess, onError });
    }
  };

  const courseOptions = (courses || []).map((course) => ({
    value: course.idCourse.toString(),
    label: course.name,
  }));

  const statusOptions = [
    { value: "true", label: "Ativo" },
    { value: "false", label: "Inativo" },
  ];

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
          label="Nome da Sala"
          name="name"
          type="text"
          placeholder="Digite o nome da sala"
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
          label="Curso"
          value={formData.idCourse?.toString() || ""}
          onChange={(value) => handleSelectChange("idCourse", value)}
          options={courseOptions}
          error={fieldErrors.idCourse}
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponentButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={room ? onClose : handleClose}
        >
          Cancelar
        </ComponentButton>
        <ComponentButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {room ? "Atualizar" : "Cadastrar"}
        </ComponentButton>
      </div>
    </DynamicModal>
  );
};

export default ModalManageRoom;
