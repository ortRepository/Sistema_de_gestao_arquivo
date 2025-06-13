import React, { useEffect, useState } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponetButton from "@/components/common/button";
import { AlertTriangle, CheckCircle, Camera } from "lucide-react";
import { ModalStudentProps, Student } from "@/types/interfaces";
import { SearchableSelect } from "@/components/common/SearchableSelect";

const ModalStudent: React.FC<ModalStudentProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
}) => {
  const [formData, setFormData] = useState<Student>({
    id: 0,
    name: "",
    biNumber: "",
    room: "1",
    classGroup: "",
    course: "",
    birthDate: "",
    photo: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    biNumber?: string;
    room?: string;
    classGroup?: string;
    course?: string;
    birthDate?: string;
  }>({});

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);

  // Options for select fields
  const roomOptions = [{ value: "1", label: "Sala 1" }]; // Only option is "1" as string
  const classGroupOptions = [
    { value: "A", label: "Turma A" },
    { value: "B", label: "Turma B" },
    { value: "C", label: "Turma C" },
    { value: "D", label: "Turma D" },
  ];
  const courseOptions = [
    { value: "Informática", label: "Informática" },
    { value: "Gestão", label: "Gestão" },
    { value: "Eletrónica", label: "Eletrónica" },
  ];

  useEffect(() => {
    if (student) {
      setFormData({ ...student, room: student.room || "1" }); // Ensure room is "1" as string
      setPreviewPhoto(student.photo);
    } else {
      setFormData({
        id: 0,
        name: "",
        biNumber: "",
        room: "1", // Default to "1" as string
        classGroup: "",
        course: "",
        birthDate: "",
        photo: "",
      });
      setPreviewPhoto(null);
    }
    setFieldErrors({});
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      return updated;
    });
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoadingPhoto(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({ ...prev, photo: base64String }));
        setPreviewPhoto(base64String);
        setIsLoadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
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
    setFormData({
      id: 0,
      name: "",
      biNumber: "",
      room: "1", // Reset to "1" as string
      classGroup: "",
      course: "",
      birthDate: "",
      photo: "",
    });
    setFieldErrors({});
    setPreviewPhoto(null);
    setStatusMessage(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = () => {
    const requiredFields = [
      "name",
      "biNumber",
      "room",
      "classGroup",
      "course",
      "birthDate",
    ];
    const errors: typeof fieldErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field as keyof Student]) {
        errors[field as keyof typeof errors] = `${field
          .replace(/([A-Z])/g, " $1")
          .trim()} é obrigatório`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const newStudent: Student = {
        id: student ? student.id : Date.now(),
        name: formData.name,
        biNumber: formData.biNumber,
        room: formData.room, // Kept as string "1" to match interface
        classGroup: formData.classGroup,
        course: formData.course,
        birthDate: formData.birthDate,
        photo: formData.photo,
      };
      // Ensure room is string for interface
      const finalStudent: Student = {
        ...newStudent,
        room: newStudent.room === "1" ? "1" : newStudent.room,
      };
      setStatusMessage({
        text: student
          ? "Aluno atualizado com sucesso!"
          : "Aluno cadastrado com sucesso!",
        type: "success",
      });
      setTimeout(() => {
        onSave(finalStudent);
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
              accept="image/*"
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
            <div className="mt-4 w-40 h-40 border-2 border-gray-300 rounded-lg overflow-hidden shadow-md">
              <img
                src={previewPhoto}
                alt="Preview do Aluno"
                className="w-full h-full object-cover"
              />
            </div>
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
          value={formData.classGroup}
          onChange={(value) => handleSelectChange("classGroup", value)}
          options={classGroupOptions}
          error={fieldErrors.classGroup}
        />
        <SearchableSelect
          label="Curso"
          value={formData.course}
          onChange={(value) => handleSelectChange("course", value)}
          options={courseOptions}
          error={fieldErrors.course}
        />
        <ComponentInput
          label="Data de Nascimento"
          name="birthDate"
          type="date"
          placeholder="Digite a data de nascimento"
          value={formData.birthDate}
          error={fieldErrors.birthDate || ""}
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
