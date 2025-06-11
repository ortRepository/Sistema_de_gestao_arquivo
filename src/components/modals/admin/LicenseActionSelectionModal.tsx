import React, { useState } from "react";
import ComponetButton from "@/components/common/button";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentSelect from "@/components/common/ComponentSelect";
import { z } from "zod";

interface LicenseActionSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (action: "generate" | "update") => void;
}

const selectionSchema = z.object({
  action: z.enum(["generate", "update"], {
    errorMap: () => ({ message: "Selecione uma ação" }),
  }),
});

const LicenseActionSelectionModal: React.FC<LicenseActionSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [formData, setFormData] = useState<{ action: string }>({ action: "" });
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ action: e.target.value });
    setError("");
  };

  const handleSubmit = () => {
    const result = selectionSchema.safeParse(formData);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    onSelect(formData.action as "generate" | "update");
    onClose();
  };

  const options = [
    { value: "", label: "Selecione a ação…" },
    { value: "generate", label: "Gerar Licença" },
    { value: "update", label: "Atualizar Licença" },
  ];

  return (
    <DynamicModal title="Selecionar Ação da Licença" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <ComponentSelect
          label="Ação"
          name="action"
          value={formData.action}
          onChange={handleChange}
          options={options}
          error={error}
          required
        />
      </div>
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponetButton
          className="w-full md:w-auto"
          variant="secondary"
          onClick={onClose}
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={handleSubmit}
          className="w-full md:w-auto"
        >
          Selecionar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default LicenseActionSelectionModal;