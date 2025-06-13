import React, { useEffect, useState } from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponetButton from "@/components/common/button";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { DocumentItem } from "@/types/interfaces";
import { sendDocumentSchema } from "@/types/type";
import ComponentextArea from "@/components/common/FormTextArea";

interface SendDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onSendSuccess: () => void;
}

// Arrays estáticos de exemplo
const staticSecretaries = [
  { id: 1, name: "Maria Silva" },
  { id: 2, name: "João Pereira" },
  { id: 3, name: "Ana Costa" },
];

const staticAdmins = [
  { id: 10, name: "Carlos Santos" },
  { id: 11, name: "Beatriz Oliveira" },
  { id: 12, name: "Ricardo Lima" },
];

export const SendDocumentModal: React.FC<SendDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
  onSendSuccess,
}) => {
  const [role, setRole] = useState<"" | "admin" | "secretary">("");
  const [recipientId, setRecipientId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<
    Partial<{ role: string; recipientId: string; message: string }>
  >({});
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // opções de tipo de destinatário
  const roleOptions = [
    { value: "secretary", label: "Secretário" },
    { value: "admin", label: "Admin" },
  ];

  // opções dinâmicas com dados estáticos
  const entityOptions =
    role === "admin"
      ? staticAdmins.map((entity) => ({
          value: entity.id.toString(),
          label: entity.name,
        }))
      : role === "secretary"
      ? staticSecretaries.map((entity) => ({
          value: entity.id.toString(),
          label: entity.name,
        }))
      : [];

  useEffect(() => {
    if (!isOpen) {
      setRole("");
      setRecipientId("");
      setMessage("");
      setErrors({});
      setStatusMessage(null);
    }
  }, [isOpen]);

  const handleSessionClose = () => {
    onClose();
    setErrors({});
    setStatusMessage(null);
  };

  const handleSubmit = async () => {
    const result = sendDocumentSchema.safeParse({ role, recipientId, message });
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors({
        role: fieldErrors.role?.[0],
        recipientId: fieldErrors.recipientId?.[0],
        message: fieldErrors.message?.[0],
      });
      return;
    }

    if (!document) return;

    try {
      // Simulação de envio
      console.log("Enviando documento:", {
        documentId: document.id,
        recipientId: Number(recipientId),
        role,
        message,
      });

      // Simulação de sucesso
      setStatusMessage({
        text: "Documento enviado com sucesso!",
        type: "success",
      });
      setTimeout(() => {
        onSendSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setStatusMessage({
        text: "Erro inesperado. Tente mais tarde.",
        type: "error",
      });
    }
  };

  return (
    <DynamicModal
      title={`Enviar Documento`}
      isOpen={isOpen}
      onClose={handleSessionClose}
    >
      <div className="space-y-4">
        {statusMessage && (
          <div
            className={`${
              statusMessage.type === "success"
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            } border-t-4 mb-2 p-3 rounded`}
          >
            <p
              className={`text-sm ${
                statusMessage.type === "success"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {statusMessage.text}
            </p>
          </div>
        )}

        <SearchableSelect
          label="Tipo de destinatário"
          value={role}
          onChange={(val) => {
            setRole(val as "admin" | "secretary");
            setRecipientId("");
          }}
          options={roleOptions}
          error={errors.role}
        />

        {role && (
          <SearchableSelect
            label={role === "admin" ? "Administrador" : "Secretário"}
            value={recipientId}
            onChange={(val) => setRecipientId(val)}
            options={entityOptions}
            error={errors.recipientId}
          />
        )}

        <ComponentextArea
          label="Mensagem"
          name="message"
          placeholder="Digite uma mensagem"
          value={message}
          rows={3}
          onChange={(e) => setMessage(e.target.value)}
          error={errors.message || ""}
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <ComponetButton variant="secondary" onClick={handleSessionClose}>
          Cancelar
        </ComponetButton>
        <ComponetButton variant="primary" onClick={handleSubmit}>
          Enviar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};
