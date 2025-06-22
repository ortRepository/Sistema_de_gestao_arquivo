// import React, { useState } from "react";
// import { z } from "zod";
// import DynamicModal from "@/components/common/DynamicModal";
// import ComponentInput from "@/components/common/FormInput";
// import ComponetButton from "@/components/common/button";
// import { AlertTriangle, CheckCircle } from "lucide-react";
// import { Teacher } from "@/types/interfaces";

// interface ModalRenewLicenseProps {
//   isOpen: boolean;
//   onClose: () => void;
//   teacherData: Teacher | null;
//   onSave: (teacher: Teacher) => void;
// }

// const renewLicenseSchema = z.object({
//   licenseExpirationDate: z
//     .string()
//     .min(1, "Data de expiração é obrigatória")
//     .refine((val) => !isNaN(Date.parse(val)), {
//       message: "Data inválida",
//     })
//     .refine((val) => new Date(val) > new Date(), {
//       message: "A data deve ser futura",
//     }),
// });

// type RenewLicenseForm = z.infer<typeof renewLicenseSchema>;

// const ModalRenewLicense: React.FC<ModalRenewLicenseProps> = ({
//   isOpen,
//   onClose,
//   teacherData,
//   onSave,
// }) => {
//   const [formData, setFormData] = useState<RenewLicenseForm>({
//     licenseExpirationDate: teacherData?.licenseExpirationDate || "",
//   });

//   const [fieldErrors, setFieldErrors] = useState<{
//     licenseExpirationDate?: string;
//   }>({});

//   const [isLoading, setIsLoading] = useState(false);
//   const [statusMessage, setStatusMessage] = useState<{
//     text: string;
//     type: "success" | "error";
//   } | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
//   };

//   const handleSubmit = async () => {
//     const result = renewLicenseSchema.safeParse(formData);
//     if (!result.success) {
//       const errors = result.error.flatten().fieldErrors;
//       setFieldErrors({
//         licenseExpirationDate: errors.licenseExpirationDate?.[0],
//       });
//       return;
//     }

//     if (!teacherData) return;

//     setIsLoading(true);
//     try {
//       const updatedTeacher: Teacher = {
//         ...teacherData,
//         licenseExpirationDate: result.data.licenseExpirationDate,
//       };
//       setStatusMessage({
//         text: "Licença renovada com sucesso!",
//         type: "success",
//       });
//       setTimeout(() => {
//         onSave(updatedTeacher);
//         setIsLoading(false);
//         handleClose();
//       }, 2000);
//     } catch (error) {
//       setStatusMessage({
//         text: "Erro ao renovar licença. Tente novamente!",
//         type: "error",
//       });
//       setIsLoading(false);
//     }
//   };

//   const handleClose = () => {
//     setFormData({ licenseExpirationDate: teacherData?.licenseExpirationDate || "" });
//     setFieldErrors({});
//     setStatusMessage(null);
//     setIsLoading(false);
//     onClose();
//   };

//   return (
//     <DynamicModal
//       title="Renovar Licença"
//       isOpen={isOpen}
//       onClose={handleClose}
//     >
//       {statusMessage && (
//         <div
//           className={`${
//             statusMessage.type === "success"
//               ? "border-green-500 bg-green-50"
//               : "border-red-500 bg-red-50"
//           } border-t-4 mb-4 p-4 rounded-lg shadow-md`}
//         >
//           <p
//             className={`${
//               statusMessage.type === "success"
//                 ? "text-green-700"
//                 : "text-red-700"
//             } text-sm flex items-center gap-2`}
//           >
//             {statusMessage.type === "success" ? (
//               <CheckCircle className="w-4 h-4" />
//             ) : (
//               <AlertTriangle className="w-4 h-4" />
//             )}
//             {statusMessage.text}
//           </p>
//         </div>
//       )}
//       <div className="space-y-4">
//         <ComponentInput
//           label="Nova Data de Expiração"
//           name="licenseExpirationDate"
//           type="date"
//           value={formData.licenseExpirationDate}
//           error={fieldErrors.licenseExpirationDate || ""}
//           onChange={handleChange}
//           required
//         />
//       </div>
//       <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
//         <ComponetButton
//           className="w-full md:w-auto"
//           variant="secondary"
//           onClick={handleClose}
//         >
//           Cancelar
//         </ComponetButton>
//         <ComponetButton
//           variant="primary"
//           onClick={handleSubmit}
//           className="w-full md:w-auto"
//           loading={isLoading}
//         >
//           Renovar
//         </ComponetButton>
//       </div>
//     </DynamicModal>
//   );
// };

// export default ModalRenewLicense;