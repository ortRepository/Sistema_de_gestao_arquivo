import { useEffect, useState, useMemo } from "react";
import {
  X,
  MoreHorizontal,
  CircleFadingPlus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Info,
  DollarSign,
  Clock,
  MessageCircle,
  Table2,
  Download,
} from "lucide-react";
import { jsPDF } from "jspdf";
import SearchFilterBar from "@/components/common/SearchBar";
import DynamicModal from "@/components/common/DynamicModal";
import ComponentInput from "@/components/common/FormInput";
import ComponentTextArea from "@/components/common/FormTextArea";
import ComponentButton from "@/components/common/button";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import {
  BudgetMap,
  TableModalProps,
  BudgetMapComment,
  CommentCost,
  CreateCostRequest,
  CostCenter,
  CreateCostShema,
} from "@/types/interfaces";
import "react-datepicker/dist/react-datepicker.css";
import { z } from "zod";
import { getCache } from "@/lib/Cache";
import {
  useCreateCommentCost,
  useCreateCommentMap,
  useDeleteBudgetMap,
  useDeleteCommentCost,
  useDeleteCommentMap,
  useGetCommentsCost,
  useGetCommentsMap,
  useUpdateBudgetMap,
  useUpdateCommentCost,
  useUpdateCommentMap,
  useGetDepartments,
  useListTimelines,
  useListCostCenters,
  useCreateCost,
} from "@/hooks/DynamicApiHooks";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  commentSchema,
  costSchema,
  editSchema,
} from "@/types/type";
import { CostsModal } from "./CustModal";

type EditData = z.infer<typeof editSchema>;
type cust = z.infer<typeof costSchema>;

export default function TableModal({
  isOpen,
  onClose,
  data,
  onDelete,
  onEdit,
  isHistoryPage = false,
  userType: propUserType,
}: TableModalProps & { userType: string }) {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditData | "comment", string>>
  >({});
  const [custerrors, setCustErrors] = useState<
    Partial<Record<keyof cust, string>>
  >({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [detailsRow, setDetailsRow] = useState<BudgetMap | null>(null);
  const [editingMap, setEditingMap] = useState<BudgetMap | null>(null);
  const [commentModal, setCommentModal] = useState<{
    type: "cost" | "map";
    id: number;
    isEdit: boolean;
    comment?: string;
    approval?: boolean;
  } | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<boolean>(true);
  const [infoModalRow, setInfoModalRow] = useState<BudgetMap | null>(null);
  const [costsModalRow, setCostsModalRow] = useState<BudgetMap | null>(null);
  const userType = propUserType;
  const currentUserEntity = getCache("entityName") || "Usuário Atual"; // Assuming entityName is cached
  const { mutateAsync: createCost } = useCreateCost();
  const { data: costCenters, isLoading: isCostCentersLoading } =
    useListCostCenters();
  const [createCostModal, setCreateCostModal] = useState<{
    idBudgetMap: number;
  } | null>(null);
  const [newCost, setNewCost] = useState<CreateCostRequest>({
    idBudgetMap: 0,
    idCostCenter: 0,
  });
  const { data: departments, isLoading: isDepartmentsLoading } =
    useGetDepartments();
  const { data: timelines, isLoading: isTimelinesLoading } = useListTimelines();
  const { mutateAsync: deleteBudgetMap } = useDeleteBudgetMap();
  const { mutateAsync: updateBudgetMap } = useUpdateBudgetMap();
  const { mutateAsync: createCommentCost } = useCreateCommentCost();
  const { data: commentsCost = [], isLoading: isLoadingCommentsCost } =
    useGetCommentsCost();
  const { mutateAsync: updateCommentCost } = useUpdateCommentCost();
  const { mutateAsync: deleteCommentCost } = useDeleteCommentCost();
  const { mutateAsync: createCommentMap } = useCreateCommentMap();
  const { data: commentsMap = [], isLoading: isLoadingCommentsMap } =
    useGetCommentsMap();
  const { mutateAsync: updateCommentMap } = useUpdateCommentMap();
  const { mutateAsync: deleteCommentMap } = useDeleteCommentMap();

  const [editBudgetYear, setEditBudgetYear] = useState<string>("");
  const [editIdDepartment, setEditIdDepartment] = useState<number>(0);
  const [editIdTimeline, setEditIdTimeline] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>("");

  const departmentOptions = useMemo(() => {
    if (!departments || isDepartmentsLoading)
      return [{ value: "", label: "Carregando departamentos..." }];
    return [
      { value: "", label: "Selecione um departamento" },
      ...departments.map((dept: { idDepartment: number; name: string }) => ({
        value: dept.idDepartment.toString(),
        label: dept.name,
      })),
    ];
  }, [departments, isDepartmentsLoading]);

  const timelineOptions = useMemo(() => {
    if (!timelines || isTimelinesLoading)
      return [{ value: "", label: "Carregando cronogramas..." }];
    return [
      { value: "", label: "Selecione um cronograma" },
      ...timelines.map(
        (timeline: {
          idTimeline: number;
          yearOfApplication: string;
          mapCreationDate: string;
        }) => ({
          value: timeline.idTimeline.toString(),
          label: `${timeline.yearOfApplication} - ${new Date(
            timeline.mapCreationDate
          ).toLocaleString()}`,
        })
      ),
    ];
  }, [timelines, isTimelinesLoading]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (costsModalRow) {
          closeCostsModal();
        } else if (infoModalRow) {
          closeInfoModal();
        } else if (editingMap) {
          closeEditMap();
        } else if (commentModal) {
          closeCommentModal();
        } else if (detailsRow) {
          closeDetails();
        } else if (confirmDeleteId !== null) {
          closeDelete();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [
    onClose,
    costsModalRow,
    infoModalRow,
    editingMap,
    commentModal,
    detailsRow,
    confirmDeleteId,
  ]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "id", label: "Id" },
    { value: "section", label: "Seção" },
    { value: "description", label: "Descrição" },
  ];

  const dataList = Array.isArray(data) ? data : [];
  const filteredData = dataList.filter((row) => {
    const term = searchTerm.toLowerCase();
    const hasCommentDescription = row.comments.some((c) =>
      c.comment?.toLowerCase().includes(term)
    );
    const hasCostJustification = row.costs.some((c) =>
      c.justification?.toLowerCase().includes(term)
    );
    switch (filterType) {
      case "id":
        return row.idBudgetMap.toString().includes(term);
      case "section":
        return row.currentSectionName?.toLowerCase().includes(term);
      case "description":
        return hasCommentDescription || hasCostJustification;
      default:
        return (
          row.idBudgetMap.toString().includes(term) ||
          row.currentSectionName?.toLowerCase().includes(term) ||
          hasCommentDescription ||
          hasCostJustification
        );
    }
  });

  const formatCurrency = (value: number): string => {
    try {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return "R$0,00";
    }
  };

  const formatDate = (date: string): string => {
    try {
      return new Date(date).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return date;
    }
  };

  const costCenterOptions = useMemo(() => {
    if (!costCenters || isCostCentersLoading)
      return [{ value: "", label: "Carregando centros de custo..." }];
    return [
      { value: "", label: "Selecione um centro de custo" },
      ...costCenters.map((center: CostCenter) => ({
        value: center.idCostCenter.toString(),
        label: center.name,
      })),
    ];
  }, [costCenters, isCostCentersLoading]);

  const openCreateCostModal = (idBudgetMap: number) => {
    setCreateCostModal({ idBudgetMap });
    setNewCost({ idCostCenter: 0, idBudgetMap: 0 });
    setErrors({});
    setStatusMessage(null);
    setOpenMenuId(null);
  };

  const closeCreateCostModal = () => {
    setCreateCostModal(null);
    setNewCost({ idCostCenter: 0, idBudgetMap: 0 });
    setErrors({});
    setStatusMessage(null);
  };

  const handleCreateCost = () => {
    if (!createCostModal) return;

    const parsed = costSchema.safeParse({
      idCostCenter: newCost.idCostCenter,
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof CreateCostShema, string>> = {};
      parsed.error.errors.forEach((e) => {
        if (e.path[0])
          fieldErrors[e.path[0] as keyof CreateCostShema] = e.message;
      });
      setCustErrors(fieldErrors);
      setStatusMessage({
        text: "Por favor, selecione um centro  de custo",
        type: "error",
      });
      return;
    }

    createCost(
      {
        idBudgetMap: createCostModal.idBudgetMap,
        idCostCenter: newCost.idCostCenter,
      },
      {
        onSuccess: (_response) => {
          setStatusMessage({
            text: "Custo criado com sucesso",
            type: "success",
          });
          setTimeout(closeCreateCostModal, 1000);
        },
        onError: (_error) => {
          setStatusMessage({
            text: "Erro ao criar custo.Tenta novamente",
            type: "error",
          });
        },
      }
    );
  };
  const openEditMap = (row: BudgetMap) => {
    if (isHistoryPage || userType !== "PLANNER") return;
    setEditingMap(row);
    setEditBudgetYear(row.budgetYear);
    setEditIdDepartment(row.idEntity);
    setEditIdTimeline(row.idTimeline);
    setErrors({});
    setStatusMessage(null);
    setOpenMenuId(null);
  };

  const closeEditMap = () => {
    setEditingMap(null);
    setEditBudgetYear("");
    setEditIdDepartment(0);
    setEditIdTimeline(0);
    setErrors({});
    setStatusMessage(null);
  };

  const handleSaveMap = () => {
    const parsed = editSchema.safeParse({
      budgetYear: editBudgetYear,
      idDepartment: editIdDepartment,
      idTimeline: editIdTimeline,
    });
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof EditData, string>> = {};
      parsed.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as keyof EditData] = e.message;
      });
      setErrors(fieldErrors);
      setStatusMessage({
        text: "Por favor, corrija os erros destacados em vermelho",
        type: "error",
      });
      return;
    }
    if (editingMap) {
      updateBudgetMap(
        {
          idBudgetMap: editingMap.idBudgetMap,
          budgetYear: editBudgetYear,
          idDepartment: editIdDepartment,
          idTimeline: editIdTimeline,
        },
        {
          onSuccess: (_response) => {
            setStatusMessage({
              text: "Actualizado com sucesso",
              type: "success",
            });
            onEdit({
              ...editingMap,
              budgetYear: editBudgetYear,
              idEntity: editIdDepartment,
              idTimeline: editIdTimeline,
              updatedIn: new Date().toISOString(),
            });
            setTimeout(closeEditMap, 1000);
          },
          onError: (error) => {
            setStatusMessage({
              text: error.message || "Erro ao atualizar o mapa de orçamento",
              type: "error",
            });
          },
        }
      );
    }
  };

  const openCommentModal = (
    type: "cost" | "map",
    id: number,
    isEdit: boolean,
    comment?: string,
    approval?: boolean
  ) => {
    if (isHistoryPage || (type === "map" && userType === "PLANNER")) return;
    setCommentModal({ type, id, isEdit, comment: comment || "", approval });
    setNewComment(comment || "");
    setApprovalStatus(approval !== undefined ? approval : true);
    setErrors({});
    setStatusMessage(null);
    setOpenMenuId(null);
  };

  const closeCommentModal = () => {
    setCommentModal(null);
    setNewComment("");
    setApprovalStatus(true);
    setErrors({});
    setStatusMessage(null);
  };

  const handleCommentSubmit = () => {
    if (!commentModal) return;

    const parsed = commentSchema.safeParse({ comment: newComment });
    if (!parsed.success) {
      setErrors({ comment: parsed.error.errors[0].message });
      setStatusMessage({
        text: "Verifique os campos destacados em vermelho",
        type: "error",
      });
      return;
    }

    const currentMap = dataList.find(
      (row) =>
        row.idBudgetMap ===
        (commentModal.type === "map"
          ? commentModal.id
          : row.costs.find((c) => c.idCost === commentModal.id)?.idBudgetMap)
    );
    const idBudgetManager = currentMap?.idEntity || 0;

    if (commentModal.type === "cost") {
      if (commentModal.isEdit) {
        updateCommentCost(
          {
            idCommentsCost: commentModal.id,
            approval: approvalStatus,
            comment: newComment,
            idCost: commentModal.id,
            idBudgetManager,
          },
          {
            onSuccess: (response) => {
              setStatusMessage({ text: response.message, type: "success" });
              setTimeout(closeCommentModal, 1000);
            },
            onError: (error) => {
              setStatusMessage({
                text: error.message || "Erro ao atualizar comentário",
                type: "error",
              });
            },
          }
        );
      } else {
        createCommentCost(
          {
            approval: approvalStatus,
            comment: newComment,
            idCost: commentModal.id,
            idBudgetManager,
          },
          {
            onSuccess: (response) => {
              setStatusMessage({ text: response.message, type: "success" });
              setTimeout(closeCommentModal, 1000);
            },
            onError: (error) => {
              setStatusMessage({
                text: error.message || "Erro ao criar comentário",
                type: "error",
              });
            },
          }
        );
      }
    } else if (commentModal.type === "map" && userType !== "PLANNER") {
      if (commentModal.isEdit) {
        updateCommentMap(
          {
            idCommentsMap: commentModal.id,
            approval: approvalStatus,
            comment: newComment,
            idBudgetMap: commentModal.id,
          },
          {
            onSuccess: (response) => {
              setStatusMessage({ text: response.message, type: "success" });
              setTimeout(closeCommentModal, 1000);
            },
            onError: (error) => {
              setStatusMessage({
                text: error.message || "Erro ao atualizar comentário",
                type: "error",
              });
            },
          }
        );
      } else {
        createCommentMap(
          {
            approval: approvalStatus,
            comment: newComment,
            idBudgetMap: commentModal.id,
          },
          {
            onSuccess: (response) => {
              setStatusMessage({ text: response.message, type: "success" });
              setTimeout(closeCommentModal, 1000);
            },
            onError: (error) => {
              setStatusMessage({
                text: error.message || "Erro ao criar comentário",
                type: "error",
              });
            },
          }
        );
      }
    }
  };

  const handleDeleteComment = (type: "cost" | "map", id: number) => {
    if (type === "cost") {
      deleteCommentCost(
        { idCommentsCost: id },
        {
          onSuccess: (response) => {
            setStatusMessage({ text: response.message, type: "success" });
          },
          onError: (error) => {
            setStatusMessage({
              text: error.message || "Erro ao excluir comentário",
              type: "error",
            });
          },
        }
      );
    } else if (type === "map" && userType !== "PLANNER") {
      deleteCommentMap(
        { idCommentsMap: id },
        {
          onSuccess: (response) => {
            setStatusMessage({ text: response.message, type: "success" });
          },
          onError: (error) => {
            setStatusMessage({
              text: error.message || "Erro ao excluir comentário",
              type: "error",
            });
          },
        }
      );
    }
  };

  const openDelete = (id: number) => {
    if (isHistoryPage || userType !== "PLANNER") return;
    setConfirmDeleteId(id);
    setOpenMenuId(null);
  };

  const closeDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleDelete = () => {
    if (confirmDeleteId !== null) {
      deleteBudgetMap(
        { idBudgetMap: confirmDeleteId },
        {
          onSuccess: (_response) => {
            onDelete(confirmDeleteId);
            closeDelete();
          },
          onError: (error) => {
            setStatusMessage({
              text: error.message || "Erro ao excluir mapa de orçamento",
              type: "error",
            });
          },
        }
      );
    }
  };

  const openDetails = (row: BudgetMap) => {
    setDetailsRow(row);
    setOpenMenuId(null);
  };

  const closeDetails = () => {
    setDetailsRow(null);
  };

  const openInfoModal = (row: BudgetMap) => {
    setInfoModalRow(row);
    setOpenMenuId(null);
  };

  const closeInfoModal = () => {
    setInfoModalRow(null);
  };

  const openCostsModal = (row: BudgetMap) => {
    setCostsModalRow(row);
    setOpenMenuId(null);
  };

  const closeCostsModal = () => {
    setCostsModalRow(null);
  };

  const downloadPDF = (row: BudgetMap) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Cost Control System", 20, 20);
    try {
      doc.addImage("/logo.png", "PNG", 160, 10, 30, 30);
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
    }
    doc.setFontSize(16);
    doc.text("Detalhes do Orçamento", 20, 40);
    doc.setFontSize(12);
    doc.text(`ID: #${row.idBudgetMap}`, 20, 50);
    doc.text(`Ano do Orçamento: ${formatDate(row.budgetYear)}`, 20, 60);
    doc.text(`Departamento: ${row.currentDepartmentName}`, 20, 70);
    doc.text(`Seção: ${row.currentSectionName}`, 20, 80);
    doc.text(`Direção: ${row.directionName}`, 20, 90);
    doc.text(`Entidade: ${row.currentEntity}`, 20, 100);
    doc.text(`Criado em: ${formatDate(row.createdIn)}`, 20, 110);
    doc.text(`Atualizado em: ${formatDate(row.updatedIn)}`, 20, 120);

    if (row.costs.length > 0) {
      doc.text("Custos Associados:", 20, 140);
      let y = 150;
      row.costs.forEach((cost, index) => {
        doc.text(`Custo ${index + 1}:`, 20, y);
        doc.text(`ID: #${cost.idCost}`, 30, y + 10);
        doc.text(`Valor: ${formatCurrency(cost.value)}`, 30, y + 20);
        doc.text(
          `Justificação: ${cost.justification || "Nenhuma"}`,
          30,
          y + 30
        );
        doc.text(`Conta: ${cost.accountName}`, 30, y + 40);
        doc.text(`Centro de Custo: ${cost.costCenterName}`, 30, y + 50);
        y += 60;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
    }

    doc.save(`orcamento_${row.idBudgetMap}.pdf`);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center  p-4 z-50"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-black/30 dark:bg-gray-900/80" />
      <div
        className="bg-white dark:bg-gray-900 py-6 px-2 rounded-lg shadow-lg w-full h-full mx-4 relative z-50 max-w-7xl"
        onClick={handleContentClick}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-800">
          <h3 id="modal-title" className="text-xl font-semibold">
            Gestão de Orçamentos
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="px-6 mt-4">
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
        <div className="my-6 overflow-auto px-3 w-full min-w-full md:h-[55vh] h-full">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Ano</th>
                <th className="py-2 px-4">Departamento</th>
                <th className="py-2 px-4">Seção</th>
                <th className="py-2 px-4">Direção</th>
                <th className="py-2 px-4">Entidade</th>
                <th className="py-2 px-4">Comentários</th>
                <th className="py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => {
                const mapComments =
                  commentsMap?.filter(
                    (comment: BudgetMapComment) =>
                      comment.idBudgetMap === row.idBudgetMap
                  ) || [];

                return (
                  <tr
                    key={row.idBudgetMap}
                    className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-2 px-4">#{row.idBudgetMap}</td>
                    <td className="py-2 px-4">{formatDate(row.budgetYear)}</td>
                    <td className="py-2 px-4">
                      {row.currentDepartmentName === "Not forwarded"
                        ? "Pendente"
                        : row.currentDepartmentName}
                    </td>
                    <td className="py-2 px-4">
                      {row.currentSectionName === "Not forwarded"
                        ? "Pendente"
                        : row.currentSectionName}
                    </td>
                    <td className="py-2 px-4">
                      {row.directionName === "Not forwarded"
                        ? "Pendente"
                        : row.directionName}
                    </td>
                    <td className="py-2 px-4">
                      {row.currentEntity === "Not forwarded"
                        ? "Pendente"
                        : row.currentEntity}
                    </td>
                    <td className="py-2 px-4">
                      {isLoadingCommentsMap ? (
                        <p>Carregando...</p>
                      ) : mapComments.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {mapComments.map((comment) => (
                            <li
                              key={comment.idCommentsMap}
                              className="flex items-center gap-2"
                            >
                              <span className="truncate max-w-[200px]">
                                {comment.comment}
                              </span>
                              {comment.approval ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  Aprovado
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  Reprovado
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Sem comentários</p>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {!isHistoryPage && (
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((prev) =>
                                prev === row.idBudgetMap
                                  ? null
                                  : row.idBudgetMap
                              );
                            }}
                            className="p-2 bg-gray-50  dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Mais ações"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {openMenuId === row.idBudgetMap && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded z-50">
                              <button
                                onClick={() => openDetails(row)}
                                className="flex items-center w-full px-3 cursor-pointer py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                <Info size={16} className="mr-2" />
                                Ver Detalhes
                              </button>
                              <button
                                onClick={() => openInfoModal(row)}
                                className="flex items-center w-full cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                <Info size={16} className="mr-2" />
                                Resumo Rápido
                              </button>
                              <button
                                onClick={() => openCostsModal(row)}
                                className="flex items-center w-full px-3 cursor-pointer py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                <Table2 size={16} className="mr-2" />
                                Ver Custos
                              </button>
                              {userType === "PLANNER" && (
                                <>
                                  <button
                                    onClick={() => openEditMap(row)}
                                    className="flex items-center w-full cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                                  >
                                    <CircleFadingPlus
                                      size={16}
                                      className="mr-2"
                                    />
                                    Editar Mapa
                                  </button>
                                  <button
                                    onClick={() => openDelete(row.idBudgetMap)}
                                    className="flex items-center w-full px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 size={16} className="mr-2" />
                                    Excluir Mapa
                                  </button>
                                </>
                              )}
                              {userType !== "PLANNER" && (
                                <button
                                  onClick={() =>
                                    openCommentModal(
                                      "map",
                                      row.idBudgetMap,
                                      false
                                    )
                                  }
                                  className="flex items-center w-full px-3 cursor-pointer py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  <MessageCircle size={16} className="mr-2" />
                                  Comentar Mapa
                                </button>
                              )}
                              {userType === "USER_MASTER" && (
                                <button
                                  onClick={() =>
                                    openCreateCostModal(row.idBudgetMap)
                                  }
                                  className="flex items-center w-full px-3 cursor-pointer py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  <DollarSign size={16} className="mr-2" />
                                  Adicionar Custo
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {createCostModal && (
          <DynamicModal
            title="Adicionar Novo Custo"
            isOpen
            onClose={closeCreateCostModal}
          >
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
              <SearchableSelect
                label="Centro de Custo"
                value={newCost.idCostCenter.toString()}
                onChange={(value) =>
                  setNewCost({ ...newCost, idCostCenter: Number(value) })
                }
                options={costCenterOptions}
                error={custerrors.idCostCenter}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <ComponentButton
                variant="secondary"
                onClick={closeCreateCostModal}
                className="px-5 py-2"
              >
                Cancelar
              </ComponentButton>
              <ComponentButton
                variant="primary"
                onClick={handleCreateCost}
                className="px-5 py-2"
              >
                Criar Custo
              </ComponentButton>
            </div>
          </DynamicModal>
        )}
        {editingMap && (
          <DynamicModal
            title="Editar Mapa de Orçamento"
            isOpen
            onClose={closeEditMap}
          >
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
              <ComponentInput
                label="Ano do Orçamento"
                name="budgetYear"
                type="date"
                value={editBudgetYear}
                onChange={(e) => setEditBudgetYear(e.target.value)}
                error={errors.budgetYear}
              />
              <SearchableSelect
                label="Departamento"
                value={editIdDepartment.toString()}
                onChange={(value) => setEditIdDepartment(Number(value))}
                options={departmentOptions}
                error={errors.idDepartment}
              />
              <SearchableSelect
                label="Cronograma"
                value={editIdTimeline.toString()}
                onChange={(value) => setEditIdTimeline(Number(value))}
                options={timelineOptions}
                error={errors.idTimeline}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <ComponentButton
                variant="secondary"
                onClick={closeEditMap}
                className="px-5 py-2"
              >
                Cancelar
              </ComponentButton>
              <ComponentButton
                variant="primary"
                onClick={handleSaveMap}
                className="px-5 py-2"
              >
                Salvar Alterações
              </ComponentButton>
            </div>
          </DynamicModal>
        )}

        {commentModal && (
          <DynamicModal
            title={
              commentModal.type === "cost"
                ? commentModal.isEdit
                  ? "Editar Comentário de Custo"
                  : "Novo Comentário de Custo"
                : commentModal.isEdit
                ? "Editar Comentário de Mapa"
                : "Novo Comentário de Mapa"
            }
            isOpen
            onClose={closeCommentModal}
          >
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
              <ComponentTextArea
                label="Comentário"
                name="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                error={errors.comment}
                placeholder="Digite seu comentário..."
              />
              {(commentModal.type === "map" || commentModal.type === "cost") &&
                userType !== "PLANNER" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status de Aprovação
                    </label>
                    <select
                      value={approvalStatus ? "true" : "false"}
                      onChange={(e) =>
                        setApprovalStatus(e.target.value === "true")
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="true">Aprovado</option>
                      <option value="false">Reprovado</option>
                    </select>
                  </div>
                )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <ComponentButton
                variant="secondary"
                onClick={closeCommentModal}
                className="px-5 py-2"
              >
                Cancelar
              </ComponentButton>
              <ComponentButton
                variant="primary"
                onClick={handleCommentSubmit}
                className="px-5 py-2"
                disabled={!newComment.trim()}
              >
                {commentModal.isEdit
                  ? "Atualizar Comentário"
                  : "Enviar Comentário"}
              </ComponentButton>
            </div>
          </DynamicModal>
        )}

        {infoModalRow && (
          <DynamicModal
            title="Resumo do Orçamento"
            isOpen
            onClose={closeInfoModal}
          >
            <div className="space-y-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl">
              <div className="">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-6 w-6 text-blue-500" />
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Resumo do Orçamento
                  </h4>
                </div>
                <div className="space-y-4 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Direção
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {infoModalRow.directionName}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ano do Orçamento
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatDate(infoModalRow.budgetYear)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Departamento
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {infoModalRow.currentDepartmentName}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total de Custos
                    </p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(
                        infoModalRow.costs.reduce(
                          (sum, cost) => sum + cost.value,
                          0
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 px-6">
              <ComponentButton
                variant="secondary"
                onClick={closeInfoModal}
                className="px-6 py-2 md:w-auto w-full"
              >
                Fechar
              </ComponentButton>
            </div>
          </DynamicModal>
        )}

        {costsModalRow && (
          <CostsModal
            isOpen={!!costsModalRow}
            onClose={closeCostsModal}
            costs={costsModalRow.costs || []}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            userType={userType}
            budgetMapId={costsModalRow.idBudgetMap}
          />
        )}

        {detailsRow && (
          <DynamicModal
            title="Detalhes do Orçamento"
            isOpen
            onClose={closeDetails}
          >
            <div className="space-y-6 overflow-y-auto max-h-[50vh]">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-6 w-6 text-blue-500" />
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Informações Gerais
                  </h4>
                </div>
                <div className="space-y-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Ano do Orçamento
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatDate(detailsRow.budgetYear)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Departamento
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {detailsRow.currentDepartmentName}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Seção
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {detailsRow.currentSectionName}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Direção
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {detailsRow.directionName}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Entidade
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {detailsRow.currentEntity}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Criado em
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatDate(detailsRow.createdIn)}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Atualizado em
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatDate(detailsRow.updatedIn)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-6 w-6 text-green-500" />
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Custos Associados
                  </h4>
                </div>
                {detailsRow.costs.length > 0 ? (
                  <div className="space-y-6">
                    {detailsRow.costs.map((cost) => {
                      const userCostComments =
                        commentsCost?.filter(
                          (comment: CommentCost) =>
                            comment.id_cost === cost.idCost &&
                            comment.pastEntityName === currentUserEntity
                        ) || [];

                      return (
                        <div
                          key={cost.idCost}
                          className="border-b dark:border-gray-700 pb-4 last:border-b-0"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                ID do Custo
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                #{cost.idCost}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Valor
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {formatCurrency(cost.value)}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Status
                              </p>
                              <p className="flex items-center gap-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {cost.approval ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                {cost.approval ? "Aprovado" : "Reprovado"}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                AnHORTmalidade
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {cost.abnormality ? "Sim" : "Não"}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Alerta
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {cost.alert || "Nenhum"}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Conta
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {cost.accountName}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Centro de Custo
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {cost.costCenterName}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Controle Orçamental
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {cost.budgetControlName}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Criado em
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {formatDate(cost.createdIn)}
                              </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Atualizado em
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {formatDate(cost.updatedIn)}
                              </p>
                            </div>
                            <div className="col-span-full bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Justificação
                              </p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {cost.justification || "Nenhuma"}
                              </p>
                            </div>
                          </div>
                          {userType !== "PLANNER" && (
                            <div className="mt-4">
                              <ComponentButton
                                variant="primary"
                                onClick={() =>
                                  openCommentModal("cost", cost.idCost, false)
                                }
                                className="px-4 py-2"
                              >
                                Adicionar Comentário
                              </ComponentButton>
                            </div>
                          )}
                          {cost.comments.length > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="h-5 w-5 text-blue-500" />
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  Comentários do Custo
                                </p>
                              </div>
                              <ul className="list-disc pl-5 space-y-1">
                                {cost.comments.map((comment) => (
                                  <li
                                    key={comment.idCommentsCost}
                                    className="text-gray-700 dark:text-gray-300"
                                  >
                                    {comment.comment} (por{" "}
                                    {comment.currentEntityName},{" "}
                                    {formatDate(comment.receivedIn)}) -{" "}
                                    {comment.approval ? (
                                      <span className="flex items-center gap-1">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        Aprovado
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        Reprovado
                                      </span>
                                    )}
                                    {userType !== "PLANNER" && (
                                      <>
                                        <button
                                          onClick={() =>
                                            openCommentModal(
                                              "cost",
                                              comment.idCommentsCost,
                                              true,
                                              comment.comment,
                                              comment.approval
                                            )
                                          }
                                          className="ml-2 text-blue-500 hover:underline"
                                        >
                                          Editar
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteComment(
                                              "cost",
                                              comment.idCommentsCost
                                            )
                                          }
                                          className="ml-2 text-red-500 hover:underline"
                                        >
                                          Excluir
                                        </button>
                                      </>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {userCostComments.length > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageCircle className="h-5 w-5 text-blue-500" />
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  Meus Comentários
                                </p>
                              </div>
                              <ul className="list-disc pl-5 space-y-1">
                                {userCostComments.map(
                                  (comment: CommentCost) => (
                                    <li
                                      key={comment.idCommentsCost}
                                      className="text-gray-700 dark:text-gray-300"
                                    >
                                      {comment.comment} (por{" "}
                                      {comment.pastEntityName}, ) -{" "}
                                      {comment.approval ? (
                                        <span className="flex items-center gap-1">
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                          Aprovado
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1">
                                          <XCircle className="h-4 w-4 text-red-500" />
                                          Reprovado
                                        </span>
                                      )}
                                      {userType !== "PLANNER" && (
                                        <>
                                          <button
                                            onClick={() =>
                                              openCommentModal(
                                                "cost",
                                                comment.idCommentsCost,
                                                true,
                                                comment.comment,
                                                comment.approval
                                              )
                                            }
                                            className="ml-2 text-blue-500 hover:underline"
                                          >
                                            Editar
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteComment(
                                                "cost",
                                                comment.idCommentsCost
                                              )
                                            }
                                            className="ml-2 text-red-500 hover:underline"
                                          >
                                            Excluir
                                          </button>
                                        </>
                                      )}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          {isLoadingCommentsCost && (
                            <div className="mt-4">
                              <p className="text-gray-500 dark:text-gray-400">
                                Carregando comentários...
                              </p>
                            </div>
                          )}
                          {!isLoadingCommentsCost &&
                            userCostComments.length === 0 &&
                            cost.comments.length === 0 && (
                              <div className="mt-4">
                                <p className="text-gray-500 dark:text-gray-400">
                                  Nenhum comentário encontrado para este custo.
                                </p>
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum custo associado.
                  </p>
                )}
              </div>
              {detailsRow.histories.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-6 w-6 text-yellow-500" />
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Histórico
                    </h4>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {detailsRow.histories.map((history) => (
                      <li
                        key={history.idBudgetMapHistory}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {history.description} - {formatDate(history.createdIn)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {detailsRow.comments.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-500" />
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Comentários do Mapa
                    </h4>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {detailsRow.comments.map((comment) => (
                      <li
                        key={comment.idCommentsMap}
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {comment.comment} (por {comment.currentEntity},{" "}
                        {formatDate(comment.receivedIn)}) -{" "}
                        {comment.approval ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Aprovado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <XCircle className="h-4 w-4 text-red-500" />
                            Reprovado
                          </span>
                        )}
                        {userType !== "PLANNER" && (
                          <>
                            <button
                              onClick={() =>
                                openCommentModal(
                                  "map",
                                  comment.idCommentsMap,
                                  true,
                                  comment.comment,
                                  comment.approval
                                )
                              }
                              className="ml-2 text-blue-500 hover:underline"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteComment(
                                  "map",
                                  comment.idCommentsMap
                                )
                              }
                              className="ml-2 text-red-500 hover:underline"
                            >
                              Excluir
                            </button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
              <ComponentButton
                variant="secondary"
                onClick={closeDetails}
                className="w-full md:w-auto"
              >
                Fechar
              </ComponentButton>
              <ComponentButton
                variant="primary"
                onClick={() => downloadPDF(detailsRow)}
                className="w-full md:w-auto flex justify-center items-center"
              >
                <Download className="h-5 w-5 mr-2" />
                Baixar PDF
              </ComponentButton>
            </div>
          </DynamicModal>
        )}

        {confirmDeleteId !== null && (
          <DeletePublicationModal
            isOpen={confirmDeleteId !== null}
            onClose={closeDelete}
            onConfirm={handleDelete}
            title="Excluir Mapa de Orçamento"
            message="Tem certeza que deseja excluir este mapa de orçamento?"
            confirmText="Confirmar"
            cancelText="Cancelar"
          />
        )}
      </div>
    </div>
  );
}
