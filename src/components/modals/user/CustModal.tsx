// CostsModal.tsx

import { useEffect, useState } from "react";
import {
  X,
  MoreHorizontal,
  CircleFadingPlus,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Info,
} from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import DynamicModal from "@/components/common/DynamicModal";
import ComponetButton from "@/components/common/button";
import ComponentInput from "@/components/common/FormInput";
import ComponentextArea from "@/components/common/FormTextArea";
import SearchFilterBar from "@/components/common/SearchBar";
import { BudgetCost, PayCostRequest } from "@/types/interfaces";
import { useDeleteCost, usePayCost } from "@/hooks/DynamicApiHooks";
import { payCostSchema } from "@/types/type";
import { CostDetailsModal } from "./CostDetailsModal";

interface CostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  costs: BudgetCost[];
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
  userType: string;
  budgetMapId: number;
}

type CostData = PayCostRequest;

export function CostsModal({
  isOpen,
  onClose,
  costs,
  formatCurrency,
  formatDate,
  userType,
}: CostsModalProps) {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [newCostModal, setNewCostModal] = useState<boolean>(false);
  const [costData, setCostData] = useState<CostData>({
    value: 0,
    justification: "",
    idCost: 0,
  } as CostData);
  const [errors, setErrors] = useState<Partial<Record<keyof CostData, string>>>(
    {}
  );
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [confirmDeleteCostId, setConfirmDeleteCostId] = useState<number | null>(
    null
  );
  const [selectedCost, setSelectedCost] = useState<BudgetCost | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

  const { mutateAsync: payCost } = usePayCost();
  const { mutateAsync: deleteCost } = useDeleteCost();

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "id", label: "ID" },
    { value: "justification", label: "Justificação" },
    { value: "account", label: "Conta" },
    { value: "costCenter", label: "Centro de Custo" },
  ];

  const filteredCosts = (costs || []).filter((cost) => {
    const term = searchTerm.toLowerCase();
    switch (filterType) {
      case "id":
        return cost.idCost.toString().includes(term);
      case "justification":
        return cost.justification?.toLowerCase().includes(term) || false;
      case "account":
        return cost.accountName?.toLowerCase().includes(term) || false;
      case "costCenter":
        return cost.costCenterName?.toLowerCase().includes(term) || false;
      default:
        return (
          cost.idCost.toString().includes(term) ||
          cost.justification?.toLowerCase().includes(term) ||
          cost.accountName?.toLowerCase().includes(term) ||
          cost.costCenterName?.toLowerCase().includes(term)
        );
    }
  });

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCost(null);
  };
  const closeNewCostModal = () => {
    setNewCostModal(false);
    setCostData({
      value: 0,
      justification: "",
      idCost: 0,
    } as CostData);
    setErrors({});
    setStatusMessage(null);
  };

  const handleCostSubmit = async () => {
    setStatusMessage(null);
    if (userType === "PLANNER") {
      const parsed = payCostSchema.safeParse(costData);
      if (!parsed.success) {
        const fieldErrors: Partial<Record<keyof PayCostRequest, string>> = {};
        parsed.error.errors.forEach((e) => {
          if (e.path[0])
            fieldErrors[e.path[0] as keyof PayCostRequest] = e.message;
        });
        setErrors(fieldErrors);
        setStatusMessage({
          text: "Por favor, corrija os erros destacados em vermelho",
          type: "error",
        });
        return;
      }

      try {
        const formdate = {
          idCost: costData.idCost,
          justification: costData.justification,
          value: costData.value,
        };
        console.log(formdate);
        const response = await payCost(formdate);
        setStatusMessage({ text: response.message, type: "success" });
        setTimeout(closeNewCostModal, 1000);
      } catch (error: any) {
        setStatusMessage({
          text: error.message || "Erro desconhecido ao pagar custo",
          type: "error",
        });
      }
    }
  };

  const openDeleteCost = (id: number) => {
    if (userType !== "USER_MASTER" && userType !== "PLANNER") return;
    setConfirmDeleteCostId(id);
  };

  const closeDeleteCost = () => {
    setConfirmDeleteCostId(null);
  };

  const handleDeleteCost = async () => {
    if (confirmDeleteCostId !== null) {
      try {
        const response = await deleteCost({ idCost: confirmDeleteCostId });
        setStatusMessage({ text: response.message, type: "success" });
        closeDeleteCost();
      } catch (error: any) {
        setStatusMessage({
          text: error.message || "Erro desconhecido ao excluir custo",
          type: "error",
        });
      }
    }
  };

  const openDetails = (cost: BudgetCost) => {
    setSelectedCost(cost);
    setIsDetailsModalOpen(true);
    setOpenMenuId(null);
  };

  const openAddCostPlanner = (cost: BudgetCost) => {
    setNewCostModal(true);
    setCostData({
      value: cost.value,
      justification: cost.justification || "",
      idCost: cost.idCost,
    });
    setOpenMenuId(null);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-60"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="costs-modal-title"
    >
      <div className="absolute inset-0 bg-black/40 dark:bg-gray-900/90" />
      <div
        className="bg-white dark:bg-gray-900 py-6 px-2 rounded-lg shadow-lg w-full mx-4 relative z-60 max-w-5xl"
        onClick={handleContentClick}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-800">
          <h3 id="costs-modal-title" className="text-xl font-semibold">
            Custos do Orçamento
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            aria-label="Fechar modal de custos"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="px-6 mt-4 flex justify-between items-center">
          <SearchFilterBar
            title=""
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterOptions={filterOptions}
            isFilterOpen={isFilterOpen}
            toggleFilterDropdown={() => setIsFilterOpen((o) => !o)}
            closeFilterDropdown={() => setIsFilterOpen(false)}
          />
        </div>

        <div className="my-6 overflow-auto px-3 w-full min-w-full md:h-[50vh] h-auto">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-2 px-4">ID Custo</th>
                <th className="py-2 px-4">Valor</th>
                <th className="py-2 px-4">Justificação</th>
                <th className="py-2 px-4">Conta</th>
                <th className="py-2 px-4">Centro de Custo</th>
                <th className="py-2 px-4">Criado em</th>
                <th className="py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCosts.map((cost) => (
                <tr
                  key={cost.idCost}
                  className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-2 px-4">#{cost.idCost}</td>
                  <td className="py-2 px-4">{formatCurrency(cost.value)}</td>
                  <td className="py-2 px-4">
                    {cost.justification || "Nenhuma"}
                  </td>
                  <td className="py-2 px-4">{cost.accountName || "N/A"}</td>
                  <td className="py-2 px-4">{cost.costCenterName || "N/A"}</td>
                  <td className="py-2 px-4">{formatDate(cost.createdIn)}</td>
                  <td className="py-2 px-4">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId((prev) =>
                            prev === cost.idCost ? null : cost.idCost
                          );
                        }}
                        className="p-2 bg-gray-50 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Mais ações"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenuId === cost.idCost && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded z-50">
                          <button
                            onClick={() => openDetails(cost)}
                            className="flex items-center w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Info size={16} className="mr-2" />
                            Ver Detalhes
                          </button>

                          {userType === "PLANNER" && (
                            <>
                              <button
                                onClick={() => openAddCostPlanner(cost)}
                                className="flex items-center w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                <CircleFadingPlus size={16} className="mr-2" />
                                Adicionar Custo
                              </button>
                              <button
                                onClick={() => openDeleteCost(cost.idCost)}
                                className="flex items-center w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Excluir Custo
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCosts.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    Nenhum custo encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {newCostModal && (
          <DynamicModal title="Novo Custo" isOpen onClose={closeNewCostModal}>
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
                label="Valor"
                name="value"
                type="number"
                value={costData.value.toString()}
                onChange={(e) =>
                  setCostData({
                    ...costData,
                    value: Number(e.target.value),
                  })
                }
                error={errors.value}
              />
              <ComponentextArea
                label="Justificação"
                name="justification"
                value={costData.justification}
                onChange={(e) =>
                  setCostData({
                    ...costData,
                    justification: e.target.value,
                  })
                }
                rows={4}
                error={errors.justification}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <ComponetButton
                variant="secondary"
                onClick={closeNewCostModal}
                className="px-5 py-2"
              >
                Cancelar
              </ComponetButton>
              <ComponetButton
                variant="primary"
                onClick={handleCostSubmit}
                className="px-5 py-2"
              >
                Criar Custo
              </ComponetButton>
            </div>
          </DynamicModal>
        )}

        {confirmDeleteCostId !== null && (
          <DeletePublicationModal
            isOpen={confirmDeleteCostId !== null}
            onClose={closeDeleteCost}
            onConfirm={handleDeleteCost}
            title="Excluir Custo"
            message="Tem certeza que deseja excluir este custo? Esta ação não pode ser desfeita."
            confirmText="Confirmar"
            cancelText="Cancelar"
          />
        )}

        {selectedCost && (
          <CostDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={closeDetailsModal}
            cost={selectedCost}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
}
