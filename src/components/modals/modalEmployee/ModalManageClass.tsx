import React, { useEffect, useState } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponetButton from "@/components/common/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  ClassData,
  ModalManageClassProps,
  OptionClass,
} from "@/types/interfaces";
import { classSchema } from "@/types/type";

const ModalManageClass: React.FC<ModalManageClassProps> = ({
  isOpen,
  onClose,
  classData,
  onSave,
}) => {
  const [formData, setFormData] = useState<{
    turma: string;
    diretorDeTurma: string;
    sala: number | "";
  }>({
    turma: "",
    diretorDeTurma: "",
    sala: "",
  });
  const defaultForm = {
    turma: "",
    diretorDeTurma: "",
    sala: 0,
  };

  const [fieldErrors, setFieldErrors] = useState<{
    turma?: string;
    diretorDeTurma?: string;
    sala?: string;
  }>({});

  // Static options for directors
  const directorOptions: OptionClass[] = [
    { value: "Prof. Ana Silva", label: "Prof. Ana Silva" },
    { value: "Prof. João Pedro", label: "Prof. João Pedro" },
    { value: "Prof. Maria Oliveira", label: "Prof. Maria Oliveira" },
    { value: "Prof. Carlos Mendes", label: "Prof. Carlos Mendes" },
  ];

  useEffect(() => {
    if (classData) {
      setFormData({
        turma: classData.turma,
        diretorDeTurma: classData.diretorDeTurma,
        sala: classData.sala,
      });
    } else {
      setFormData(defaultForm);
    }
    setFieldErrors({});
  }, [classData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "sala") {
        // Allow empty string or valid integer string
        if (value === "") {
          return { ...prev, sala: "" };
        }
        if (/^\d+$/.test(value)) {
          return { ...prev, sala: Number(value) }; // Convert to number
        }
        return prev; // No change if invalid
      }
      return { ...prev, [name]: value };
    });
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, diretorDeTurma: value }));
    setFieldErrors((prev) => ({ ...prev, diretorDeTurma: undefined }));
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

  const handleSubmit = () => {
    // Prepare data for validation
    const dataToValidate = {
      turma: formData.turma,
      diretorDeTurma: formData.diretorDeTurma,
      sala: formData.sala === "" ? undefined : Number(formData.sala),
    };

    // Validate with Zod
    const result = classSchema.safeParse(dataToValidate);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors({
        turma: errors.turma?.[0],
        diretorDeTurma: errors.diretorDeTurma?.[0],
        sala: errors.sala?.[0],
      });
      return;
    }

    setIsLoading(true);
    try {
      const newClass: ClassData = {
        id: classData ? classData.id : Date.now(),
        turma: result.data.turma,
        diretorDeTurma: result.data.diretorDeTurma,
        sala: result.data.sala,
      };
      setStatusMessage({
        text: classData
          ? "Turma atualizada com sucesso!"
          : "Turma cadastrada com sucesso!",
        type: "success",
      });
      setTimeout(() => {
        onSave(newClass);
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
          label="Turma"
          name="turma"
          type="text"
          placeholder="Digite o nome da turma"
          value={formData.turma}
          error={fieldErrors.turma || ""}
          onChange={handleChange}
          required
        />
        <SearchableSelect
          label="Diretor de Turma"
          value={formData.diretorDeTurma}
          onChange={handleSelectChange}
          options={directorOptions}
          error={fieldErrors.diretorDeTurma}
        />
        <ComponentInput
          label="Sala"
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
          onClick={classData ? onClose : handleClose}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
          loading={isLoading}
        >
          {classData ? "Atualizar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ModalManageClass;
