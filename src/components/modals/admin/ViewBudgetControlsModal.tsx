import ComponetButton from "@/components/common/button";
import DynamicModal from "@/components/common/DynamicModal";
import { BudgetControl } from "@/types/interfaces";
import { User, MessageSquare, Calendar } from "lucide-react";

interface ViewBudgetControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetControl: BudgetControl | null;
}

export default function ViewBudgetControlsModal({
  isOpen,
  onClose,
  budgetControl,
}: ViewBudgetControlsModalProps) {
  if (!isOpen || !budgetControl) return null;

  return (
    <DynamicModal
      title="Detalhes do Controle de Orçamento"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="overflow-y-auto px-4 h-auto max-h-[50vh] space-y-4 my-4">
        {/* Nome */}
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <div>
            <span className="font-semibold dark:text-white">Nome:</span>{" "}
            <span className="dark:text-gray-100">
              {budgetControl.name.trim()}
            </span>
          </div>
        </div>

        {/* Descrição (comentário) */}
        <div className="flex items-start gap-2">
          <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300 mt-1" />
          <div>
            <span className="font-semibold dark:text-white">Descrição:</span>
            <p className="mt-1 dark:text-gray-100 whitespace-pre-wrap break-words max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded">
              {budgetControl.description.trim()}
            </p>
          </div>
        </div>

        {/* Data de Criação */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <div>
            <span className="font-semibold dark:text-white">
              Data de Criação:
            </span>{" "}
            <span className="dark:text-gray-100">
              {new Date(budgetControl.createdIn).toLocaleDateString("pt-AO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <ComponetButton
          variant="secondary"
          onClick={onClose}
          className="w-full md:w-auto"
        >
          Fechar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
}
