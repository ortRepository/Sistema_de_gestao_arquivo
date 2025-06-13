// import React, { useEffect, useState } from "react";
// import DynamicModal from "@/components/common/DynamicModal";
// import ComponetButton from "@/components/common/button";
// import ComponentInput from "@/components/common/FormInput";
// import { SearchableSelect } from "@/components/common/SearchableSelect";
// import { DocumentItem, Secretary, Admin } from "@/types/interfaces";
// import { useGetSecretaries, useGetAdmins, useSendDocument } from "@/hooks/DynamicApiHooks";
// import { z } from "zod";
// import { sendDocumentSchema } from "@/types/type";

// interface SendDocumentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   document: DocumentItem | null;
//   onSendSuccess: () => void;
// }

// export const SendDocumentModal: React.FC<SendDocumentModalProps> = ({
//   isOpen,
//   onClose,
//   document,
//   onSendSuccess,
// }) => {
//   const [role, setRole] = useState<"" | "admin" | "secretary">("");
//   const [recipientId, setRecipientId] = useState<string>("");
//   const [message, setMessage] = useState<string>("");
//   const [errors, setErrors] = useState<Partial<{ role: string; recipientId: string; message: string }>>({});
//   const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

//   const { data: secretaries = [] } = useGetSecretaries();
//   const { data: admins = [] } = useGetAdmins();
//   const { mutateAsync: sendDocument } = useSendDocument();

//   // options for role select
//   const roleOptions = [
//     { value: "secretary", label: "Secretário" },
//     { value: "admin", label: "Admin" },
//   ];

//   // map based on role
//   const entityOptions = (role === "admin" ? admins : role === "secretary" ? secretaries : []).map(entity => ({
//     value: entity.id.toString(),
//     label: entity.name,
//   }));

//   useEffect(() => {
//     if (!isOpen) {
//       setRole("");
//       setRecipientId("");
//       setMessage("");
//       setErrors({});
//       setStatusMessage(null);
//     }
//   }, [isOpen]);

//   const handleSessionClose = () => {
//     onClose();
//     setErrors({});
//     setStatusMessage(null);
//   };

//   const handleSubmit = async () => {
//     // basic validation
//     const result = sendDocumentSchema.safeParse({ role, recipientId, message });
//     if (!result.success) {
//       const fieldErrors = result.error.formErrors.fieldErrors;
//       setErrors({
//         role: fieldErrors.role?.[0],
//         recipientId: fieldErrors.recipientId?.[0],
//         message: fieldErrors.message?.[0],
//       });
//       return;
//     }

//     if (!document) return;

//     try {
//       const payload = {
//         documentId: document.id,
//         recipientId: Number(recipientId),
//         role,
//         message,
//       };
//       const response = await sendDocument(payload);
//       if (response.message === "Sent successfully") {
//         setStatusMessage({ text: "Documento enviado com sucesso!", type: "success" });
//         setTimeout(() => {
//           onSendSuccess();
//           onClose();
//         }, 1500);
//       } else {
//         setStatusMessage({ text: "Falha ao enviar. Tente novamente.", type: "error" });
//       }
//     } catch (err) {
//       setStatusMessage({ text: "Erro inesperado. Tente mais tarde.", type: "error" });
//     }
//   };

//   return (
//     <DynamicModal
//       title={`Enviar: ${document?.title}`}
//       isOpen={isOpen}
//       onClose={handleSessionClose}
//     >
//       <div className="space-y-4">
//         {statusMessage && (
//           <div
//             className={`${
//               statusMessage.type === "success"
//                 ? "border-green-500 bg-green-50"
//                 : "border-red-500 bg-red-50"
//             } border-t-4 mb-2 p-3 rounded`}
//           >
//             <p className={`text-sm ${statusMessage.type === "success" ? "text-green-700" : "text-red-700"}`}>
//               {statusMessage.text}
//             </p>
//           </div>
//         )}

//         {/* Role select */}
//         <SearchableSelect
//           label="Tipo de destinatário"
//           value={role}
//           onChange={(val) => {
//             setRole(val as "admin" | "secretary");
//             setRecipientId("");
//           }}
//           options={roleOptions}
//           error={errors.role}
//         />

//         {/* Dynamic recipient select */}
//         {role && (
//           <SearchableSelect
//             label={role === "admin" ? "Administrador" : "Secretário"}
//             value={recipientId}
//             onChange={(val) => setRecipientId(val)}
//             options={entityOptions}
//             error={errors.recipientId}
//           />
//         )}

//         <ComponentInput
//           label="Mensagem (opcional)"
//           name="message"
//           type="text"
//           placeholder="Digite uma mensagem"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           error={errors.message || ''}
//         />
//       </div>

//       <div className="flex justify-end gap-2 mt-4">
//         <ComponetButton variant="secondary" onClick={handleSessionClose}>
//           Cancelar
//         </ComponetButton>
//         <ComponetButton variant="primary" onClick={handleSubmit}>
//           Enviar
//         </ComponetButton>
//       </div>
//     </DynamicModal>
//   );
// };
