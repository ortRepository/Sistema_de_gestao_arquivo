import ComponetButton from "@/components/common/button";
import DynamicModal from "@/components/common/DynamicModal";
import { BudgetMap } from "@/types/interfaces";
import { AlertTriangle, Check, CheckCircle, XCircle } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: BudgetMap;
  userType: string;
  reviewComment: string;
  setReviewComment: (value: string) => void;
  reviewStatus: "approved" | "rejected" | null;
  handleApprove: () => void;
  handleReject: () => void;
  handleCommentSubmit: () => void;
  statusMessage: { type: "success" | "error"; text: string } | null;
  errors: { comment?: string };
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  budget,
  userType,
  reviewComment,
  setReviewComment,
  reviewStatus,
  handleApprove,
  handleReject,
  handleCommentSubmit,
  statusMessage,
  errors,
}) => {
  if (!isOpen) return null;

  return (
    <DynamicModal title="Análise de Custo" isOpen onClose={onClose}>
      {statusMessage && (
        <div
          className={`p-3 rounded-lg ${
            statusMessage.type === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
        >
          <p className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <AlertTriangle size={16} className="text-red-600" />
            )}
            {statusMessage.text}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="font-medium">Detalhes do Orçamento:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Valor Total:{" "}
              {formatCurrency(
                budget.costs.reduce((acc, curr) => acc + curr.value, 0)
              )}
            </li>

            <li>Última atualização: {budget.updatedIn}</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Parecer Técnico
          </label>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={4}
            className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ${
              errors.comment ? "border-red-500" : ""
            }`}
            placeholder={
              userType === "APPROVER" || userType === "REVIEWER"
                ? "Digite seu parecer obrigatório..."
                : "Comentários opcionais..."
            }
          />
          {errors.comment && (
            <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
          )}
        </div>
      </div>

      <div className="flex my-3 gap-3 justify-between">
        <button
          onClick={handleReject}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded transition-all ${
            reviewStatus === "rejected"
              ? "bg-red-700 text-white scale-95"
              : "bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-800 dark:hover:bg-red-700 dark:text-white"
          } ${errors.comment ? "animate-shake" : ""}`}
        >
          <XCircle size={16} />
          {reviewStatus === "rejected" ? "Reprovado" : "Reprovar"}
        </button>

        <button
          onClick={handleApprove}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded transition-all ${
            reviewStatus === "approved"
              ? "bg-green-700 text-white scale-95"
              : "bg-green-100 hover:bg-green-200 text-green-600 dark:bg-green-800 dark:hover:bg-green-700 dark:text-white"
          } ${errors.comment ? "animate-shake" : ""}`}
        >
          <Check size={16} />
          {reviewStatus === "approved" ? "Aprovado" : "Aprovar"}
        </button>
      </div>

      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2 px-4">
        <ComponetButton
          variant="secondary"
          onClick={onClose}
          className="w-full md:w-auto"
        >
          Cancelar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          className="w-full md:w-auto"
          onClick={handleCommentSubmit}
        >
          Enviar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};
const formatCurrency = (value: number): string => {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return "R$0,00";
  }
};
