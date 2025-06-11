import { FC, useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Repeat,
  XCircle,
  Check,
  FileX,
} from "lucide-react";
import ForwardModal from "./ForwardModal";
import TableModal from "./TableModal";
import { ReviewModal } from "./ReviewModal";
import { BudgetMap, Entities } from "@/types/interfaces";

import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import { useDeleteBudgetMap } from "@/hooks/DynamicApiHooks";

interface TablePageProps {
  data: BudgetMap[];
  allUsers: Entities[];
  onEdit: (row: BudgetMap) => void;
  onDelete: (id: number) => void;
  activeTab: "cust" | "capex" | "others";
  isHistoryPage?: boolean;
  isReviewPage?: boolean;
  userType: string;
}

const TablePage: FC<TablePageProps> = ({
  data = [],
  onEdit,
  onDelete,
  isHistoryPage = false,
  isReviewPage = false,
  userType,
  allUsers,
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [forwardBudgetId, setForwardBudgetId] = useState<number | null>(null);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewBudget, setReviewBudget] = useState<BudgetMap | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState<{
    [key: number]: "approved" | "rejected" | null;
  }>({});
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<{ comment?: string }>({});
  const { mutate: usedeleteBudgetMap } = useDeleteBudgetMap();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteBudgetId, setDeleteBudgetId] = useState<number | null>(null);

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
  const getTotalBudgetValue = (budgetMap: BudgetMap): number => {
    return budgetMap.costs.reduce((sum, cost) => sum + cost.value, 0);
  };

  const openDeleteModal = (id: number) => {
    console.log("Opening Delete Modal for budgetId:", id);
    setDeleteBudgetId(id);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const closeDeleteModal = () => {
    console.log("Closing Delete Modal");
    setIsDeleteModalOpen(false);
    setDeleteBudgetId(null);
  };

  const handleDelete = async () => {
    if (deleteBudgetId !== null) {
      try {
        onDelete(deleteBudgetId);

        closeDeleteModal();
        usedeleteBudgetMap({ idBudgetMap: deleteBudgetId });
        closeDeleteModal();
      } catch (error) {}
    }
  };

  const actionsMenu = [
    {
      label: "Visualizar",
      icon: <Eye size={16} />,
      action: () => setIsTableModalOpen(true),
    },
    ...(isReviewPage
      ? [
          {
            label: "Revisar Orçamento",
            icon: <Check size={16} />,
            action: (budget: BudgetMap) => {
              setReviewBudget(budget);
              setIsReviewModalOpen(true);
            },
          },
        ]
      : !isHistoryPage && userType === "PLANNER"
      ? [
          {
            label: "Encaminhar",
            icon: <Repeat size={16} />,
            action: (budget: BudgetMap) => {
              setForwardBudgetId(budget.idBudgetMap);
              setIsForwardModalOpen(true);
            },
          },

          {
            label: "Eliminar",
            icon: <XCircle size={16} />,
            action: (budget: BudgetMap) => openDeleteModal(budget.idBudgetMap),
          },
        ]
      : []),
  ];

  const handleApprove = (id: number) => {
    if (userType !== "MASTER_USER" && !reviewComment.trim()) {
      setErrors({ comment: "O comentário é obrigatório para revisar." });
      return;
    }
    setReviewStatus((prev) => ({ ...prev, [id]: "approved" }));
    setStatusMessage({
      type: "success",
      text: "Orçamento aprovado com sucesso!",
    });
    setErrors({});
  };

  const handleReject = (id: number) => {
    if (userType !== "MASTER_USER" && !reviewComment.trim()) {
      setErrors({ comment: "O comentário é obrigatório para revisar." });
      return;
    }
    setReviewStatus((prev) => ({ ...prev, [id]: "rejected" }));
    setStatusMessage({ type: "error", text: "Orçamento reprovado." });
    setErrors({});
  };

  const handleCommentSubmit = () => {
    if (userType !== "MASTER_USER" && !reviewComment.trim()) {
      setErrors({ comment: "O comentário é obrigatório para revisar." });
      return;
    }
    if (!reviewBudget) return;

    setStatusMessage({ type: "success", text: "Parecer enviado com sucesso!" });
    setReviewComment("");
    setErrors({});
  };

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {data.length > 0 ? (
          data.map((budget: BudgetMap) => (
            <div
              key={budget.idBudgetMap}
              className="relative bg-white dark:bg-gray-900 p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <FileX size={48} className="text-yellow-500 mb-2" />
              <h3 className="text-lg font-semibold mb-1">Mapa de orçamento</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Para {new Date(budget.budgetYear).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                Valor Total: {formatCurrency(getTotalBudgetValue(budget))}
              </p>
              <p className="text-xs text-gray-400">
                Direção: {budget.directionName || "-"}
              </p>
              <p className="text-xs text-gray-400">
                Criado Em: {new Date(budget.createdIn).toLocaleDateString()}
              </p>

              <div className="absolute top-4 right-4">
                <MoreHorizontal
                  size={18}
                  className="cursor-pointer text-gray-400"
                  onClick={() =>
                    setOpenMenuId((prev) =>
                      prev === budget.idBudgetMap ? null : budget.idBudgetMap
                    )
                  }
                />
                {openMenuId === budget.idBudgetMap && (
                  <div className="absolute right-0 mt-2 w-auto bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg z-10">
                    {actionsMenu.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.action(budget);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 cursor-pointer py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center col-span-full">
            <p className="text-gray-500">Nenhum orçamento encontrado.</p>
          </div>
        )}
      </div>

      <ForwardModal
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        users={allUsers}
        onSend={(recipients) => {
          console.log(`Orçamento ${forwardBudgetId} Enviado para:`, recipients);
          setIsForwardModalOpen(false);
        }}
      />

      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        data={data}
        onDelete={onDelete}
        onEdit={onEdit}
        isHistoryPage={isHistoryPage}
        userType={userType}
      />

      {reviewBudget && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewComment("");
            setStatusMessage(null);
            setErrors({});
          }}
          budget={reviewBudget}
          userType={userType}
          reviewComment={reviewComment}
          setReviewComment={setReviewComment}
          reviewStatus={reviewStatus[reviewBudget.idBudgetMap] || null}
          handleApprove={() => handleApprove(reviewBudget.idBudgetMap)}
          handleReject={() => handleReject(reviewBudget.idBudgetMap)}
          handleCommentSubmit={handleCommentSubmit}
          statusMessage={statusMessage}
          errors={errors}
        />
      )}

      <DeletePublicationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Excluir Orçamento"
        message="Tem certeza que deseja excluir este orçamento?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default TablePage;
