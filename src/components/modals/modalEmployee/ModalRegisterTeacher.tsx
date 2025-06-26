import React, { useEffect, useState } from "react";
import { z } from "zod";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponentButton from "@/components/common/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useAddTeacher } from "@/hooks/DynamicApiHooks";
import { Teacher } from "@/types/interfaces";
import { teacherSchema } from "@/types/type";

type TeacherForm = z.infer<typeof teacherSchema>;

const roleOptions = [
  { value: "Professor", label: "Professor" },
  { value: "Secretario", label: "Secretário" },
];

const statusOptions = [
  { value: "Ativo", label: "Ativo" },
  { value: "Inativo", label: "Inativo" },
];

interface ModalRegisterTeacherProps {
  isOpen: boolean;
  onClose: () => void;
  teacherData: Teacher | null;
  onSave: (teacher: Teacher) => void;
}

const ModalRegisterTeacher: React.FC<ModalRegisterTeacherProps> = ({
  isOpen,
  onClose,
  teacherData,
}) => {
  const [formData, setFormData] = useState<TeacherForm>({
    name: "",
    email: "",
    telephone: "",
    role: "Professor",
    function: "",
    status: "Ativo",
  });

  const defaultForm: TeacherForm = {
    name: "",
    email: "",
    telephone: "",
    role: "Professor",
    function: "",
    status: "Ativo",
  };

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    telephone?: string;
    role?: string;
    function?: string;
    status?: string;
  }>({});

  const { mutateAsync: addTeacher } = useAddTeacher();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (teacherData) {
      setFormData({
        name: teacherData.name || "",
        email: teacherData.email || "",
        telephone: teacherData.telephone || "",
        role:
          teacherData.function === "Secretário" ? "Secretario" : "Professor",
        function: teacherData.function,
        status: teacherData.status ? "Ativo" : "Inativo",
      });
      setFieldErrors({});
    } else {
      setFormData(defaultForm);
      setFieldErrors({});
    }
  }, [teacherData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "role") {
      const selectedRole = value as "Professor" | "Secretario";
      setFormData((prev) => ({ ...prev, role: selectedRole }));
      setFieldErrors((prev) => ({ ...prev, role: undefined }));
    } else if (name === "status") {
      const selectedStatus = value as "Ativo" | "Inativo";
      setFormData((prev) => ({ ...prev, status: selectedStatus }));
      setFieldErrors((prev) => ({ ...prev, status: undefined }));
    }
  };

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
    onClose();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const result = teacherSchema.safeParse(formData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        email: errors.email?.[0],
        telephone: errors.telephone?.[0],
        role: errors.role?.[0],
        function: errors.function?.[0],
        status: errors.status?.[0],
      });
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        name: result.data.name,
        email: result.data.email,
        telephone: result.data.telephone,
        role: result.data.role === "Professor" ? 1 : 2,
        function: result.data.function,
        path: "Não disponível",
        status: result.data.status === "Ativo",
      };

      if (teacherData) {
        setStatusMessage({
          text: "Professor atualizado com sucesso!",
          type: "success",
        });
        setIsLoading(false);
        setTimeout(teacherData ? onClose : handleClose, 2000);
      } else {
        await addTeacher(payload, {
          onSuccess: (response: { code: number; message: string }) => {
            if (response.message === "Teacher added successfully") {
              setStatusMessage({
                text: "Professor cadastrado com sucesso!",
                type: "success",
              });
              setTimeout(() => {
                handleClose();
              }, 2000);
            } else {
              setStatusMessage({
                text: response.message || "Erro ao cadastrar. Tente novamente!",
                type: "error",
              });
            }
          },
          onError: (error: any) => {
            setStatusMessage({
              text:
                error?.response?.data?.message ||
                "Erro ao cadastrar. Tente novamente!",
              type: "error",
            });
          },
        });
      }
    } catch (error: any) {
      if (error.message === "Email already registered") {
        setStatusMessage({
          text: "Erro ao salvar. Email já registrado!",
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicModal
      title={teacherData ? "Editar Professor" : "Cadastrar Professor"}
      isOpen={isOpen}
      onClose={teacherData ? onClose : handleClose}
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
        <ComponentInput
          label="Telefone"
          name="telephone"
          type="tel"
          placeholder="Digite o número de telefone (ex: +244912345678)"
          value={formData.telephone}
          error={fieldErrors.telephone || ""}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Cargo"
          value={formData.role}
          onChange={(value) => handleSelectChange("role", value)}
          options={roleOptions}
          error={fieldErrors.role}
        />
        <ComponentInput
          label="Função"
          name="function"
          type="text"
          placeholder="Digite a função"
          value={formData.function}
          error={fieldErrors.function || ""}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Status"
          value={formData.status}
          onChange={(value) => handleSelectChange("status", value)}
          options={statusOptions}
          error={fieldErrors.status}
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponentButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={teacherData ? onClose : handleClose}
        >
          Cancelar
        </ComponentButton>
        <ComponentButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {teacherData ? "Atualizar" : "Cadastrar"}
        </ComponentButton>
      </div>
    </DynamicModal>
  );
};

export default ModalRegisterTeacher;
