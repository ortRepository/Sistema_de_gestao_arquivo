import React, { useEffect, useState } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponetButton from "@/components/common/button";
import { AlertTriangle, CheckCircle, Camera } from "lucide-react";
import { ModalStudentProps, Student } from "@/types/interfaces";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  useAddStudent,
  useUpdateStudent,
  useListClasses,
  useListRooms,
} from "@/hooks/DynamicApiHooks";
import { studentSchema } from "@/types/type";

const ModalStudent: React.FC<ModalStudentProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [formData, setFormData] = useState<Student>({
    idStudent: 0,
    name: "",
    biNumber: "",
    room: "",
    plainToClassFromExist: "",
    dateOfBirth: "",
    photo: "",
    createdIn: "",
    updatedIn: "",
    status: true,
    idClass: 0,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    biNumber?: string;
    room?: string;
    plainToClassFromExist?: string;
    dateOfBirth?: string;
    idClass?: string;
    photo?: string;
  }>({});

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Fetch rooms and classes
  const { data: rooms } = useListRooms();
  const { data: classes } = useListClasses();

  // API hooks for add/update
  const { mutateAsync: addStudent } = useAddStudent();
  const { mutateAsync: updateStudent } = useUpdateStudent();

  // Room options
  const roomOptions =
    rooms
      ?.filter((room) => room.status)
      .map((room) => ({
        value: room.name,
        label: room.name,
      })) || [];

  // Class options
  const classOptions =
    classes
      ?.filter((cls) => cls.status)
      .map((cls) => {
        return {
          value: cls.idClass.toString(),
          label: `${cls.name}`,
          className: cls.name,
        };
      }) || [];

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        room: student.room || roomOptions[0]?.value || "",
        plainToClassFromExist: student.plainToClassFromExist || "",
        idClass: student.idClass || 0,
      });
      setPreviewPhoto(student.photo || null);
      setSelectedFile(null);
    } else {
      setFormData({
        idStudent: 0,
        name: "",
        biNumber: "",
        room: roomOptions[0]?.value || "",
        plainToClassFromExist: "",
        dateOfBirth: "",
        photo: "",
        createdIn: "",
        updatedIn: "",
        status: true,
        idClass: 0,
      });
      setPreviewPhoto(null);
      setSelectedFile(null);
    }
    setFieldErrors({});
  }, []);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  useEffect(() => {
    return () => {
      if (previewPhoto && !student?.photo) {
        URL.revokeObjectURL(previewPhoto);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "idClass") {
      const selectedClass = classOptions.find((opt) => opt.value === value);
      setFormData((prev) => ({
        ...prev,
        idClass: parseInt(value) || 0,
        plainToClassFromExist: selectedClass?.className || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        setStatusMessage({
          text: "Formato inválido. Use PNG, JPG ou JPEG.",
          type: "error",
        });
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        setStatusMessage({
          text: "Imagem muito grande (máximo 1MB).",
          type: "error",
        });

        return;
      }
      setSelectedFile(file);
      if (previewPhoto && !student?.photo) {
        URL.revokeObjectURL(previewPhoto);
      }
      const url = URL.createObjectURL(file);
      setPreviewPhoto(url);
      setFieldErrors((prev) => ({ ...prev, photo: undefined }));
      setIsLoadingPhoto(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
        setIsLoadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleClose = () => {
    setFormData({
      idStudent: 0,
      name: "",
      biNumber: "",
      room: roomOptions[0]?.value || "",
      plainToClassFromExist: "",
      dateOfBirth: "",
      photo: "",
      createdIn: "",
      updatedIn: "",
      status: true,
      idClass: 0,
    });
    setFieldErrors({});
    setSelectedFile(null);
    if (previewPhoto && !student?.photo) {
      URL.revokeObjectURL(previewPhoto);
    }
    setPreviewPhoto(null);
    setStatusMessage(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const validationData = {
      name: formData.name,
      biNumber: formData.biNumber,
      room: formData.room,
      plainToClassFromExist: formData.plainToClassFromExist,
      dateOfBirth: formData.dateOfBirth,
      idClass: formData.idClass,
    };

    const result = studentSchema.safeParse(validationData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        biNumber: errors.biNumber?.[0],
        room: errors.room?.[0],
        plainToClassFromExist: errors.plainToClassFromExist?.[0],
        dateOfBirth: errors.dateOfBirth?.[0],
        idClass: errors.idClass?.[0],
      });
      setIsLoading(false);
      return;
    }

    try {
      let photo = formData.photo || "";
      if (selectedFile) {
        photo = await fileToBase64(selectedFile);
      }

      const payload = {
        name: result.data.name,
        biNumber: result.data.biNumber,
        room: result.data.room,
        dateOfBirth: result.data.dateOfBirth.toISOString(),
        photo,
        status: formData.status,
        idClass: result.data.idClass,
      };

      if (student) {
        await updateStudent(payload, {
          onSuccess: () => {
            setStatusMessage({
              text: "Aluno atualizado com sucesso!",
              type: "success",
            });
            setTimeout(onClose, 2000);
          },
          onError: (error: any) => {
            setStatusMessage({
              text: error.message || "Erro ao atualizar. Tente novamente!",
              type: "error",
            });
            setIsLoading(false);
          },
        });
      } else {
        await addStudent(payload, {
          onSuccess: (_data: { code: number; message: string }) => {
            setStatusMessage({
              text: "Aluno cadastrado com sucesso!",
              type: "success",
            });
            setTimeout(handleClose, 2000);
          },
          onError: (error: any) => {
            setStatusMessage({
              text: error.message || "Erro ao cadastrar. Tente novamente!",
              type: "error",
            });
            setIsLoading(false);
          },
        });
      }
    } catch (error: any) {
      console.log(error.message);
      if (error.message === "Student already exists") {
        setStatusMessage({
          text: "Erro ao salvar. Estudante já registrado!",
          type: "error",
        });
        setIsLoading(false);
      } else {
        setStatusMessage({
          text: "Erro ao salvar. Tente novamente!",
          type: "error",
        });
        setIsLoading(false);
      }
    }
  };

  return (
    <DynamicModal
      title={student ? "Editar Aluno" : "Cadastrar Aluno"}
      isOpen={isOpen}
      onClose={student ? onClose : handleClose}
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

      <div className="space-y-4 overflow-y-auto max-h-[50vh] px-2">
        <div className="flex flex-col items-center space-y-4">
          <label className="block text-gray-700 dark:text-gray-300 font-medium">
            Foto do Aluno
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handlePhotoChange}
              className="hidden"
              id="photoUpload"
            />
            <label
              htmlFor="photoUpload"
              className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition duration-300 flex items-center gap-3"
            >
              <Camera className="w-6 h-6" />
              Carregar Foto
            </label>
            {isLoadingPhoto && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 rounded-lg">
                <span className="text-gray-700">Carregando...</span>
              </div>
            )}
          </div>

          {previewPhoto && (
            <div className="mt-4 relative group">
              <p className="text-sm text-center text-gray-500 mb-2">
                Pré-visualização:
              </p>
              <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={previewPhoto}
                  alt="Preview do Aluno"
                  className="w-full h-54 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (previewPhoto && !student?.photo) {
                      URL.revokeObjectURL(previewPhoto);
                    }
                    setPreviewPhoto(student?.photo || null);
                    setFormData((prev) => ({
                      ...prev,
                      photo: student?.photo || "",
                    }));
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full shadow-sm transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {!previewPhoto && (
            <p className="text-center text-gray-400 text-sm mt-3 italic">
              Nenhuma imagem selecionada
            </p>
          )}
        </div>
        <ComponentInput
          label="Nome Completo"
          name="name"
          type="text"
          placeholder="Digite o nome completo"
          value={formData.name}
          error={fieldErrors.name || ""}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Número do BI"
          name="biNumber"
          type="text"
          placeholder="Digite o número do BI"
          value={formData.biNumber}
          error={fieldErrors.biNumber || ""}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Sala"
          value={formData.room}
          onChange={(value) => handleSelectChange("room", value)}
          options={roomOptions}
          error={fieldErrors.room}
        />
        <SearchableSelect
          label="Turma"
          value={formData.idClass.toString()}
          onChange={(value) => handleSelectChange("idClass", value)}
          options={classOptions}
          error={fieldErrors.idClass}
        />
        <ComponentInput
          label="Data de Nascimento"
          name="dateOfBirth"
          type="date"
          placeholder="Digite a data de nascimento"
          value={formData.dateOfBirth}
          error={fieldErrors.dateOfBirth || ""}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-6 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={student ? onClose : handleClose}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {student ? "Atualizar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ModalStudent;
