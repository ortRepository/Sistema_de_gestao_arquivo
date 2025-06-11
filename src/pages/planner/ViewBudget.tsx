import { useState, useMemo, useEffect } from "react";
import {
  MoreHorizontal,
  Eye,
  Download,
  Repeat,
  FileX,
  Check,
  XCircle,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import SearchFilterBar from "@/components/common/SearchBar";
import TableModal from "@/components/modals/user/TableModal";
import ForwardModal from "@/components/modals/user/ForwardModal";
import TablePage from "@/components/modals/user/TablePage";
import { ReviewModal } from "@/components/modals/user/ReviewModal";
import ComponentButton from "@/components/common/button";
import ComponentInput from "@/components/common/FormInput";

import DynamicModal from "@/components/common/DynamicModal";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  useListBudgetMaps,
  useListBudgetMapsReceived,
  useGetUser,
  useGetAll,
  useGetDepartments,
  useListTimelines,
  useCreateBudgetMap,
  useForwardBudgetMap,
  useDeleteBudgetMap,
} from "@/hooks/DynamicApiHooks";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import {
  BudgetMap,
  Department,
  Entities,
  MenuItem,
  Timeline,
} from "@/types/interfaces";

interface FilterOption {
  value: string;
  label: string;
}

export default function ViewBudget() {
  const [activeTab, setActiveTab] = useState<"cust" | "capex" | "others">(
    "cust"
  );
  const location = useLocation();
  const isHistoryPage = location.pathname.includes("/budget-history");
  const isReviewPage = location.pathname.includes("/master/review-budget");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"nome" | "id" | "data">("nome");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableData, setTableData] = useState<BudgetMap[]>([]);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardBudgetId, setForwardBudgetId] = useState<number | null>(null);
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteBudgetId, setDeleteBudgetId] = useState<number | null>(null);
  const [isCreateBudgetModalOpen, setIsCreateBudgetModalOpen] = useState(false);

  const { mutateAsync: createBudgetMap } = useCreateBudgetMap();
  const { mutateAsync: forwardBudgetMap } = useForwardBudgetMap();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError,
  } = useGetUser();
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments();
  const { data: timelines, isLoading: isTimelinesLoading } = useListTimelines();
  const {
    data: allUsers,
    isLoading: isUsersLoading,
    error: usersError,
  } = useGetAll();
  const {
    data: budgetMaps,
    isLoading: isBudgetMapsLoading,
    error: budgetMapsError,
    refetch,
  } = userData?.role === "APPROVER" || userData?.role === "REVIEWER"
    ? useListBudgetMapsReceived()
    : useListBudgetMaps();

  const { mutate: usedeleteBudgetMap } = useDeleteBudgetMap();
  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(
      (user: Entities) => user.role === "APPROVER" || user.role === "REVIEWER"
    );
  }, [allUsers]);

  useEffect(() => {
    console.log("budgetMaps:", budgetMaps);
  }, [userData, budgetMaps, budgetMapsError, filteredUsers]);

  const departmentOptions = useMemo(() => {
    if (!departments)
      return [{ value: "", label: "Selecione um departamento" }];
    return [
      { value: "", label: "Selecione um departamento" },
      ...departments.map((dept: Department) => ({
        value: dept.idDepartment.toString(),
        label: dept.name,
      })),
    ];
  }, [departments]);

  const timelineOptions = useMemo(() => {
    if (!timelines) return [{ value: "", label: "Selecione um cronograma" }];
    return [
      { value: "", label: "Selecione um cronograma" },
      ...timelines.map((timeline: Timeline) => ({
        value: timeline.idTimeline.toString(),
        label: `${timeline.yearOfApplication} - ${new Date(
          timeline.mapCreationDate
        ).toLocaleString()}`,
      })),
    ];
  }, [timelines]);

  const [costData, setCostData] = useState({
    costDate: "",
    idDepartment: "",
    costDescription: "",
    idTimeline: "",
    costValue: "",
    costCategory: "",
  });

  const handleCostChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCostData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCostData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateBudget = async () => {
    const { costDate, idDepartment, idTimeline } = costData;

    if (!costDate || !idDepartment || !idTimeline) {
      setStatusMessage({
        type: "error",
        text: "Data, Departamento e Linha do Tempo são obrigatórios!",
      });
      return;
    }
    try {
      setIsLoading(true);
      const response = await createBudgetMap({
        budgetYear: costDate,
        idDepartment: Number(idDepartment),
        idTimeline: Number(idTimeline),
      });

      if (response.message === "Budget Map saved successfully") {
        setStatusMessage({
          type: "success",
          text: "Mapa orçamental criado com sucesso!",
        });

        setTimeout(() => {
          setIsCreateBudgetModalOpen(false);
        }, 2000);

        refetch();
      } else {
        setStatusMessage({
          text: "Erro ao criar mapa orçamental. Tente novamente!",
          type: "error",
        });
      }
    } catch (error: any) {
      const expectedMsg = "This map has already been created";
      setStatusMessage({
        text:
          error.message === expectedMsg
            ? "Este mapa já foi criado"
            : `Erro: ${error.message || "Desconhecido"}. Tente novamente.`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleForward = async (selected: Entities[]) => {
    if (!forwardBudgetId || selected.length === 0) {
      setStatusMessage({
        type: "error",
        text: "Selecione pelo menos um destinatário!",
      });
      return;
    }

    try {
      setIsLoading(true);
      for (const user of selected) {
        await forwardBudgetMap({
          idBudgetMap: forwardBudgetId,
          idEntity: user.idUser,
        });
      }
      setStatusMessage({
        type: "success",
        text: `Orçamento encaminhado com sucesso para ${selected.length} usuário(s)!`,
      });
      setIsForwardModalOpen(false);

      refetch();
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: `Erro ao encaminhar orçamento: ${
          error.message || "Desconhecido"
        }.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    try {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    } catch (error) {
      return "R$0,00";
    }
  };

  const getTotalBudgetValue = (budgetMap: BudgetMap): number => {
    return budgetMap.costs.reduce((sum, cost) => sum + cost.value, 0);
  };

  const isHistoricalByYear = (createdIn: string): boolean => {
    try {
      const year = new Date(createdIn).getFullYear();
      const currentYear = new Date().getFullYear();
      return year < currentYear;
    } catch (error) {
      return false;
    }
  };

  const openDeleteModal = (id: number) => {
    setDeleteBudgetId(id);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteBudgetId(null);
  };

  const handleDelete = async () => {
    if (deleteBudgetId !== null) {
      try {
        setTableData((prev) =>
          prev.filter((b) => b.idBudgetMap !== deleteBudgetId)
        );
        usedeleteBudgetMap({ idBudgetMap: deleteBudgetId });
        closeDeleteModal();
      } catch (error) {}
    }
  };

  const actionsMenu: MenuItem[] = useMemo(() => {
    const baseActions: MenuItem[] = [
      {
        label: "Visualizar",
        icon: <Eye size={16} />,
        action: () => setIsTableModalOpen(true),
      },
    ];

    if (isReviewPage) {
      baseActions.push({
        label: "Revisar Orçamento",
        icon: <Check size={16} />,
        action: (budget: BudgetMap) => {
          setReviewBudget(budget);
          setIsReviewModalOpen(true);
        },
      });
    } else if (!isHistoryPage && userData?.role === "PLANNER") {
      baseActions.push(
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
        }
      );
    } else {
      baseActions.push({
        label: "Baixar",
        icon: <Download size={16} />,
        action: (budget: BudgetMap) =>
          console.log(`Download orçamento ${budget.idBudgetMap}`),
      });
    }

    return baseActions;
  }, [isHistoryPage, isReviewPage, userData?.role]);

  const filterOptions: FilterOption[] = [
    { value: "nome", label: "Nome" },
    { value: "id", label: "ID" },
    { value: "data", label: "Data" },
  ];

  const yearOptions = useMemo(() => {
    try {
      const years = Array.from(
        new Set(
          budgetMaps?.map((b: BudgetMap) =>
            new Date(b.budgetYear).getFullYear().toString()
          ) || []
        )
      ).sort();
      return [
        { value: "", label: "Todos os anos" },
        ...years.map((year) => ({ value: year, label: year })),
      ];
    } catch (error) {
      return [{ value: "", label: "Todos os anos" }];
    }
  }, [budgetMaps]);

  const filteredBudgets = useMemo(() => {
    try {
      let result = (budgetMaps || []).filter((b: BudgetMap) => {
        const isHistorical = isHistoricalByYear(b.createdIn);
        if (isHistoryPage && !isHistorical) return false;
        if (!isHistoryPage && !isReviewPage && isHistorical) return false;

        const term = searchTerm.toLowerCase();
        let matchesSearch = true;
        if (filterType === "nome" && searchTerm) {
          matchesSearch =
            b.currentDepartmentName?.toLowerCase().includes(term) ||
            b.currentSectionName?.toLowerCase().includes(term) ||
            false;
        } else if (filterType === "id" && searchTerm) {
          matchesSearch = b.idBudgetMap.toString().includes(term);
        } else if (filterType === "data" && selectedYear) {
          matchesSearch =
            new Date(b.budgetYear).getFullYear().toString() === selectedYear;
        }

        const matchesTab =
          activeTab === "cust"
            ? b.budgetYear !== null
            : activeTab === "capex"
            ? b.currentDepartmentName !== "Not forwarded"
            : activeTab === "others"
            ? b.costs.some((cost) =>
                ["Recursos Humanos", "Outros"].includes(cost.accountName)
              )
            : true;

        return matchesSearch && matchesTab;
      });

      result = result.sort((a: BudgetMap, b: BudgetMap) => {
        try {
          const dateA = new Date(a.createdIn);
          const dateB = new Date(b.createdIn);
          return dateB.getTime() - dateA.getTime();
        } catch (error) {
          console.error("Error sorting budgets:", error);
          return 0;
        }
      });

      return result;
    } catch (error) {
      return [];
    }
  }, [
    budgetMaps,
    activeTab,
    isHistoryPage,
    isReviewPage,
    searchTerm,
    filterType,
    selectedYear,
  ]);

  useEffect(() => {
    setTableData(filteredBudgets);
  }, [filteredBudgets]);

  const toggleFilterDropdown = () => setIsFilterOpen((o) => !o);
  const closeFilterDropdown = () => setIsFilterOpen(false);

  const handleApprove = (id: number) => {
    if (userData?.role !== "MASTER_USER" && !reviewComment.trim()) {
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
    if (userData?.role !== "MASTER_USER" && !reviewComment.trim()) {
      setErrors({ comment: "O comentário é obrigatório para revisar." });
      return;
    }
    setReviewStatus((prev) => ({ ...prev, [id]: "rejected" }));
    setStatusMessage({ type: "error", text: "Orçamento reprovado." });
    setErrors({});
  };

  const handleCommentSubmit = () => {
    if (userData?.role !== "MASTER_USER" && !reviewComment.trim()) {
      setErrors({ comment: "O comentário é obrigatório para revisar." });
      return;
    }
    console.log(
      `Comentário enviado para orçamento ${reviewBudget?.idBudgetMap}: ${reviewComment}`
    );
    setStatusMessage({ type: "success", text: "Parecer enviado com sucesso!" });
    setReviewComment("");
    setErrors({});
  };

  const onCloseModal = () => {
    setIsCreateBudgetModalOpen(false);
    setCostData({
      costDate: "",
      idDepartment: "",
      costDescription: "",
      idTimeline: "",
      costValue: "",
      costCategory: "",
    });
  };

  if (
    isUserLoading ||
    isBudgetMapsLoading ||
    isTimelinesLoading ||
    isDepartmentsLoading ||
    isUsersLoading ||
    userError ||
    budgetMapsError ||
    usersError
  ) {
    return (
      <div className="flex justify-center h-full items-center">
        <DataStatusHandler
          isLoading={isUserLoading || isBudgetMapsLoading || isUsersLoading}
          error={userError || budgetMapsError || usersError}
          onRetry={refetch}
          children={undefined}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full dark:bg-gray-800 dark:text-white mb-16 md:mb-0">
      <main className="flex-1 p-8">
        <div className="flex flex-wrap justify-between space-y-4 md:space-y-0 items-center mb-6">
          <div className="inline-flex bg-gray-100 rounded overflow-hidden">
            {["cust", "capex", "others"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "cust" | "capex" | "others")}
                className={`px-6 py-2 font-medium cursor-pointer ${
                  activeTab === tab
                    ? "bg-yellow-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab === "cust"
                  ? "Custo"
                  : tab === "capex"
                  ? "Capex"
                  : "Outros"}
              </button>
            ))}
          </div>
          {userData?.role === "PLANNER" && !isHistoryPage && !isReviewPage && (
            <ComponentButton
              variant="primary"
              onClick={() => setIsCreateBudgetModalOpen(true)}
              className="flex items-center w-full md:w-auto gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-700 focus:ring-gray-500"
            >
              <PlusCircle size={16} />
              Criar Mapa Orçamental
            </ComponentButton>
          )}
        </div>

        <SearchFilterBar
          title={
            activeTab === "cust"
              ? "Custo"
              : activeTab === "capex"
              ? "Capex"
              : "Outros"
          }
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterOptions={filterOptions}
          isFilterOpen={isFilterOpen}
          toggleFilterDropdown={toggleFilterDropdown}
          closeFilterDropdown={closeFilterDropdown}
          yearOptions={filterType === "data" ? yearOptions : []}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />

        {activeTab === "cust" ? (
          <TablePage
            data={tableData}
            onEdit={(updated: BudgetMap) => {
              setTableData((prev) =>
                prev.map((row) =>
                  row.idBudgetMap === updated.idBudgetMap ? updated : row
                )
              );
            }}
            onDelete={(id) => {
              setTableData((prev) =>
                prev.filter((row) => row.idBudgetMap !== id)
              );
            }}
            allUsers={filteredUsers}
            activeTab={activeTab}
            isHistoryPage={isHistoryPage}
            isReviewPage={isReviewPage}
            userType={userData?.role || ""}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {filteredBudgets.length > 0 ? (
              filteredBudgets.map((budget: BudgetMap) => (
                <div
                  key={budget.idBudgetMap}
                  className="relative bg-white dark:bg-gray-900 p-4 rounded-lg shadow hover:shadow-md transition"
                >
                  <FileX size={48} className="text-yellow-500 mb-2" />
                  <h3 className="text-lg font-semibold mb-1">
                    Mapa de orçamento
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {budget.budgetYear || "Não disponível"}
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
                          prev === budget.idBudgetMap
                            ? null
                            : budget.idBudgetMap
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
                            className="flex items-center gap-2 w-full cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                <p className="text-gray-500">
                  {budgetMapsError
                    ? "Erro ao carregar orçamentos."
                    : "Nenhum orçamento encontrado."}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        data={tableData}
        onDelete={(id) => {
          setTableData((prev) => prev.filter((r) => r.idBudgetMap !== id));
        }}
        onEdit={(updated: BudgetMap) => {
          setTableData((prev) =>
            prev.map((r) =>
              r.idBudgetMap === updated.idBudgetMap ? updated : r
            )
          );
        }}
        isHistoryPage={isHistoryPage}
        userType={userData?.role || ""}
      />

      <ForwardModal
        isOpen={isForwardModalOpen}
        onClose={() => {
          setIsForwardModalOpen(false);
          setForwardBudgetId(null);
        }}
        users={filteredUsers}
        onSend={handleForward}
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
          userType={userData?.role || ""}
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

      <DynamicModal
        title="Criar Mapa Orçamental"
        isOpen={isCreateBudgetModalOpen}
        onClose={onCloseModal}
      >
        <div className="space-y-4">
          {statusMessage && (
            <div
              className={`border-t-4 mb-4 p-4 rounded-lg shadow-md ${
                statusMessage.type === "success"
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <p
                className={`text-sm flex items-center gap-2 ${
                  statusMessage.type === "success"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
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
          <ComponentInput
            label="Data"
            name="costDate"
            type="date"
            placeholder="Selecione a data"
            value={costData.costDate}
            onChange={handleCostChange}
            required
          />
          <SearchableSelect
            label="Departamento"
            value={costData.idDepartment}
            onChange={(value) => handleSelectChange("idDepartment", value)}
            options={departmentOptions}
          />
          <SearchableSelect
            label="Cronograma"
            value={costData.idTimeline}
            onChange={(value) => handleSelectChange("idTimeline", value)}
            options={timelineOptions}
          />
        </div>
        <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
          <ComponentButton
            variant="secondary"
            onClick={onCloseModal}
            className="w-full md:w-auto"
          >
            Cancelar
          </ComponentButton>
          <ComponentButton
            variant="primary"
            onClick={handleCreateBudget}
            className="w-full md:w-auto"
            loading={isLoading}
          >
            Criar
          </ComponentButton>
        </div>
      </DynamicModal>
    </div>
  );
}
