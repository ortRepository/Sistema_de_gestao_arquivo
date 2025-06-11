import React, { useEffect, useState } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponentSelect from "@/components/common/ComponentSelect";
import ComponetButton from "@/components/common/button";
import { z } from "zod";
import { Section } from "@/types/interfaces";
import {
  useCreateSection,
  useUpdateSection,
  useGetDirections,
} from "@/hooks/DynamicApiHooks";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { sectionSchema } from "@/types/type";

type SectionForm = z.infer<typeof sectionSchema>;

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section | null;
  onSave: (section: Section) => void;
}

const SectionModal: React.FC<SectionModalProps> = ({
  isOpen,
  onClose,
  section,
  // onSave,
}) => {
  const [form, setForm] = useState<SectionForm>({
    name: "",
    sectionNumber: 0,
    description: "",
    idDirection: 0,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SectionForm, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const defaultForm: SectionForm = {
    name: "",
    sectionNumber: 0,
    description: "",
    idDirection: 0,
  };
  // Load directions for select
  const { data: directions = [] } = useGetDirections();

  // API hooks
  const { mutateAsync: createSectionAsync } = useCreateSection();
  const { mutateAsync: updateSectionAsync } = useUpdateSection();

  useEffect(() => {
    if (section) {
      setForm({
        name: section.name,
        sectionNumber: section.sectionNumber,
        description: section.description,
        idDirection: section.idDirection,
      });
    } else {
      setForm({ name: "", sectionNumber: 0, description: "", idDirection: 0 });
    }
    setErrors({});
    setStatusMessage(null);
  }, [section]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);
  const handleClose = () => {
    // limpa tudo
    setForm(defaultForm);
    setErrors({});
    setStatusMessage(null);
    setIsLoading(false);
    onClose();
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "sectionNumber" || name === "idDirection"
          ? Number(value)
          : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    // Validate
    const result = sectionSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        sectionNumber: fieldErrors.sectionNumber?.[0],
        description: fieldErrors.description?.[0],
        idDirection: fieldErrors.idDirection?.[0],
      });
      return;
    }

    setIsLoading(true);
    try {
      let response: any;
      if (section) {
        response = await updateSectionAsync({
          idSection: section.idSection,
          ...form,
        });

        if (response.message === "Section updated successfully") {
          setStatusMessage({
            text: "Seção atualizada com sucesso!",
            type: "success",
          });
          setIsLoading(false);
          setTimeout(onClose, 2000);
        } else {
          setStatusMessage({
            text: "Erro ao salvar. Tente novamente!",
            type: "error",
          });
          setIsLoading(false);
        }
      } else {
        response = await createSectionAsync(form);
        if (response.message === "Section saved successfully") {
          setStatusMessage({
            text: "Seção cadastrada com sucesso!",
            type: "success",
          });
          setTimeout(handleClose, 2000);
          setIsLoading(false);
        } else {
          setStatusMessage({
            text: "Erro ao salvar. Tente novamente!",
            type: "error",
          });
          setIsLoading(false);
        }
      }
      // onSave(saved);
    } catch (error) {
      setStatusMessage({
        text: "Erro desconhecido. Tente novamente mais tarde.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicModal
      title={section ? "Editar Seção" : "Cadastrar Seção"}
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
      <div className="space-y-4">
        <ComponentInput
          label="Nome"
          name="name"
          type="text"
          placeholder="Nome da seção"
          value={form.name}
          error={errors.name || ""}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Número da Seção"
          name="sectionNumber"
          type="number"
          placeholder="1"
          value={form.sectionNumber.toString()}
          error={errors.sectionNumber || ""}
          onChange={handleChange}
          required
        />
        <ComponentInput
          label="Descrição"
          name="description"
          type="text"
          placeholder="Descrição da seção"
          value={form.description}
          error={errors.description || ""}
          onChange={handleChange}
          required
        />
        <ComponentSelect
          label="Direção"
          name="idDirection"
          value={String(form.idDirection)}
          onChange={handleChange}
          options={[
            { value: "", label: "Selecione a direção…" },
            ...directions.map((dir) => ({
              value: dir.idDirection.toString(),
              label: dir.name,
            })),
          ]}
          error={errors.idDirection || ""}
          required
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2 ">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={() => {
            handleClose();
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
          {section ? "Actualizar" : "Cadastrar"}
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default SectionModal;
