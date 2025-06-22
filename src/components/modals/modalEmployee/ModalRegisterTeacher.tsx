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
  { value: "Coordenador", label: "Coordenador" },
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
  onSave,
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    teacherData?.photo || null
  );

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    telephone?: string;
    role?: string;
    function?: string;
    photo?: string;
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
          teacherData.function === "Coordenador" ? "Coordenador" : "Professor",
        function: teacherData.function,
        status: teacherData.status ? "Ativo" : "Inativo",
      });
      setPreviewUrl(teacherData.photo || null);
      setSelectedFile(null);
    } else {
      setFormData(defaultForm);
      setPreviewUrl(null);
      setSelectedFile(null);
    }
    setFieldErrors({});
  }, [teacherData]);

  useEffect(() => {
    return () => {
      if (previewUrl && !teacherData?.photo) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, teacherData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        setFieldErrors((prev) => ({
          ...prev,
          photo: "Formato inválido. Use PNG, JPG ou JPEG.",
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({
          ...prev,
          photo: "Imagem muito grande (máximo 5MB).",
        }));
        return;
      }
      setSelectedFile(file);
      if (previewUrl && !teacherData?.photo) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFieldErrors((prev) => ({ ...prev, photo: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "role") {
      const selectedRole = value as "Professor" | "Coordenador";
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
    setSelectedFile(null);
    if (previewUrl && !teacherData?.photo) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onClose();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
      let photo = teacherData?.photo || "";
      if (selectedFile) {
        photo = await fileToBase64(selectedFile);
      }

      const payload = {
        name: result.data.name,
        email: result.data.email,
        telephone: result.data.telephone,
        role: result.data.role === "Professor" ? 1 : 2,
        function: result.data.function,
        photo,
        path: "",
        status: result.data.status === "Ativo",
      };

      if (teacherData) {
        const updatedTeacher: Teacher = {
          idTeacher: teacherData.idTeacher,
          function: result.data.function,
          photo,
          path: teacherData.path || "",
          idUser: teacherData.idUser || 0,
          createdIn: teacherData.createdIn,
          name: result.data.name,
          email: result.data.email,
          telephone: result.data.telephone,
          status: result.data.status === "Ativo",
        };
        setStatusMessage({
          text: "Professor atualizado com sucesso!",
          type: "success",
        });
        setIsLoading(false);
        setTimeout(() => {
          onSave(updatedTeacher);
          handleClose();
        }, 2000);
      } else {
        await addTeacher(payload, {
          onSuccess: (response: { code: number; message: string }) => {
            if (response.code === 200) {
              setStatusMessage({
                text: "Professor cadastrado com sucesso!",
                type: "success",
              });
              setTimeout(() => {
                teacherData ? onClose : handleClose;
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
          label="Função"
          value={formData.role}
          onChange={(value) => handleSelectChange("role", value)}
          options={roleOptions}
          error={fieldErrors.role}
        />
        <ComponentInput
          label="Descrição da Função"
          name="function"
          type="text"
          placeholder="Digite a descrição da função"
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
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all hover:border-[#FF9E01]">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="w-8 h-8 text-[#FF9E01]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">
                    Clique para enviar uma foto
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos suportados: PNG, JPG, JPEG (máx. 5MB)
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {previewUrl && (
              <div className="mt-4 relative group">
                <p className="text-sm text-gray-500 mb-2">Pré-visualização:</p>
                <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-56 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (previewUrl && !teacherData?.photo) {
                        URL.revokeObjectURL(previewUrl);
                      }
                      setPreviewUrl(teacherData?.photo || null);
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
            {!previewUrl && (
              <p className="text-center text-gray-400 text-sm mt-3 italic">
                Nenhuma imagem selecionada
              </p>
            )}
          </div>
        </div>
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
