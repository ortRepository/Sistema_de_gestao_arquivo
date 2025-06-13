import React, { useEffect, useState, useMemo } from "react";
import { z } from "zod";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponetButton from "@/components/common/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { Teacher, ModalRegisterTeacherProps } from "@/types/interfaces";
import { teacherSchema } from "@/types/type";

type TeacherForm = z.infer<typeof teacherSchema>;

const genderOptions = [
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Outro", label: "Outro" },
];

const roleOptions = [
  { value: "Professor", label: "Professor" },
  { value: "Coordenador", label: "Coordenador" },
];

const ModalRegisterTeacher: React.FC<ModalRegisterTeacherProps> = ({
  isOpen,
  onClose,
  teacherData,
  onSave,
  subjects,
}) => {
  const [formData, setFormData] = useState<TeacherForm>({
    name: "",
    email: "",
    gender: "Masculino",
    phoneNumber: "",
    subjects: [],
    role: "Professor",
    curso: "",
  });

  const defaultForm: TeacherForm = {
    name: "",
    email: "",
    gender: "Masculino",
    phoneNumber: "",
    subjects: [],
    role: "Professor",
    curso: "",
  };

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    gender?: string;
    phoneNumber?: string;
    subjects?: string;
    role?: string;
    curso?: string;
  }>({});

  useEffect(() => {
    if (teacherData) {
      setFormData({
        name: teacherData.name,
        email: teacherData.email,
        gender: teacherData.gender,
        phoneNumber: teacherData.phoneNumber,
        subjects: teacherData.subjects.map((s) => s.id),
        role: teacherData.role,
        curso: teacherData.curso,
      });
    } else {
      setFormData(defaultForm);
    }
    setFieldErrors({});
  }, [teacherData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    if (name === "subjects") {
      const values = Array.isArray(value) ? value : [value];
      setFormData((prev) => ({ ...prev, subjects: values.map(Number) }));
      setFieldErrors((prev) => ({ ...prev, subjects: undefined }));
    } else if (name === "gender") {
      const selectedGender = Array.isArray(value) ? value[0] : value;
      if (["Masculino", "Feminino", "Outro"].includes(selectedGender)) {
        setFormData((prev) => ({
          ...prev,
          gender: selectedGender as "Masculino" | "Feminino" | "Outro",
        }));
        setFieldErrors((prev) => ({ ...prev, gender: undefined }));
      }
    } else if (name === "role") {
      const selectedRole = Array.isArray(value) ? value[0] : value;
      if (["Professor", "Coordenador"].includes(selectedRole)) {
        setFormData((prev) => ({
          ...prev,
          role: selectedRole as "Professor" | "Coordenador",
        }));
        setFieldErrors((prev) => ({ ...prev, role: undefined }));
      }
    } else if (name === "curso") {
      const selectedCurso = Array.isArray(value) ? value[0] : value;
      setFormData((prev) => ({
        ...prev,
        curso: selectedCurso,
        subjects: [], // Clear subjects when curso changes
      }));
      setFieldErrors((prev) => ({
        ...prev,
        curso: undefined,
        subjects: undefined,
      }));
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
    setFormData(defaultForm);
    setFieldErrors({});
    setStatusMessage(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async () => {
    const result = teacherSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        email: errors.email?.[0],
        gender: errors.gender?.[0],
        phoneNumber: errors.phoneNumber?.[0],
        subjects: errors.subjects?.[0],
        role: errors.role?.[0],
        curso: errors.curso?.[0],
      });
      return;
    }

    setIsLoading(true);
    try {
      const newTeacher: Teacher = {
        id: teacherData ? teacherData.id : Date.now(),
        name: result.data.name,
        email: result.data.email,
        gender: result.data.gender,
        phoneNumber: result.data.phoneNumber,
        createdIn: teacherData
          ? teacherData.createdIn
          : new Date().toISOString(),
        subjects: result.data.subjects.map(
          (id) => subjects.find((s) => s.id === id)!
        ),
        role: result.data.role,
        curso: result.data.curso,
        licenseExpirationDate: "",
        photo: ""
      };
      setStatusMessage({
        text: teacherData
          ? "Professor atualizado com sucesso!"
          : "Professor cadastrado com sucesso!",
        type: "success",
      });
      setTimeout(() => {
        onSave(newTeacher);
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

  // Generate unique course options from subjects
  const courseOptions = useMemo(() => {
    const uniqueCourses = Array.from(new Set(subjects.map((s) => s.course)));
    return uniqueCourses.map((course) => ({
      value: course,
      label: course,
    }));
  }, [subjects]);

  // Filter subject options based on selected curso
  const subjectOptions = useMemo(() => {
    return subjects
      .filter((s) => !formData.curso || s.course === formData.curso)
      .map((s) => ({
        value: s.id.toString(),
        label: s.name,
      }));
  }, [subjects, formData.curso]);

  return (
    <DynamicModal
      title={teacherData ? "Editar Professor" : "Cadastrar Professor"}
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
      <div className="space-y-4 max-h-[50vh] overflow-y-auto px-2">
        <ComponentInput
          label="Nome"
          name="name"
          type="text"
          placeholder="Digite o nome"
          value={formData.name}
          error={fieldErrors.name || ""}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Email"
          name="email"
          type="email"
          placeholder="Digite o email"
          value={formData.email}
          error={fieldErrors.email || ""}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Gênero"
          value={formData.gender}
          onChange={(value) => handleSelectChange("gender", value)}
          options={genderOptions}
          error={fieldErrors.gender}
        />
        <SearchableSelect
          label="Função"
          value={formData.role}
          onChange={(value) => handleSelectChange("role", value)}
          options={roleOptions}
          error={fieldErrors.role}
        />
        <ComponentInput
          label="Telefone"
          name="phoneNumber"
          type="tel"
          placeholder="Digite o número de telefone (ex: +244912345678)"
          value={formData.phoneNumber}
          error={fieldErrors.phoneNumber || ""}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Curso"
          value={formData.curso}
          onChange={(value) => handleSelectChange("curso", value)}
          options={courseOptions}
          error={fieldErrors.curso}
        />
        <SearchableSelect
          label="Disciplinas"
          value={formData.subjects.map(String).join(",")}
          onChange={(value) => handleSelectChange("subjects", value)}
          options={subjectOptions}
          error={fieldErrors.subjects}
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={handleClose}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {teacherData ? "Atualizar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ModalRegisterTeacher;
