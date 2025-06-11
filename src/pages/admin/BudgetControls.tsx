import { useMemo, useState } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, Eye, Upload } from "lucide-react";
import ComponetButton from "@/components/common/button";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import { BudgetControl } from "@/types/interfaces";
import CreateBudgetControlsModal from "@/components/modals/admin/CreateBudgetControlsModal";
import EditBudgetControlsModal from "@/components/modals/admin/EditBudgetControlsModal";
import ViewBudgetControlsModal from "@/components/modals/admin/ViewBudgetControlsModal";
import DynamicImportModal from "@/components/modals/admin/DynamicImportModal";
import {
  useDeleteBudgetControl,
  useGetBudgetControls,
} from "@/hooks/DynamicApiHooks";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";

export default function ManageBudgetControlsScreen() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const {
    data: apiBudget = [],
    isLoading,
    error,
    refetch,
  } = useGetBudgetControls();
  const { mutate: deleteBudget } = useDeleteBudgetControl();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedBudgetControl, setSelectedBudgetControl] =
    useState<BudgetControl | null>(null);
  const [confirmBudgetControlId, setConfirmBudgetControlId] = useState<
    number | null
  >(null);

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "idBudgetControl", label: "ID do Orçamento" },
    { value: "name", label: "Nome" },
    { value: "description", label: "Descrição" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return apiBudget.filter((dir, idx) => {
      switch (filterType) {
        case "idBudgetControl":
          return (idx + 1).toString().includes(term);
        case "name":
          return dir.name.toLowerCase().includes(term);
        case "description":
          return dir.description.toLowerCase().includes(term);
        default:
          return (
            dir.idBudgetControl.toString().includes(term) ||
            dir.name.toLowerCase().includes(term) ||
            dir.description.toLowerCase().includes(term)
          );
      }
    });
  }, [apiBudget, searchTerm, filterType]);

  const openCreate = () => {
    setSelectedBudgetControl(null);
    setIsCreateModalOpen(true);
  };

  const openEdit = (budgetControl: BudgetControl) => {
    setSelectedBudgetControl(budgetControl);
    setIsEditModalOpen(true);
  };

  const openView = (budgetControl: BudgetControl) => {
    setSelectedBudgetControl(budgetControl);
    setIsViewModalOpen(true);
  };

  const openImport = () => {
    setIsImportModalOpen(true);
  };

  const openConfirm = (id: number) => setConfirmBudgetControlId(id);
  const closeConfirm = () => setConfirmBudgetControlId(null);

  const handleDelete = () => {
    if (confirmBudgetControlId !== null) {
      deleteBudget(
        { idBudgetControl: confirmBudgetControlId },
        {
          onSuccess: () => {
            refetch();
            closeConfirm();
          },
          onError: (error) =>
            console.error("Error deleting department:", error),
        }
      );
    }
  };

  const handleSave = (_updated: BudgetControl) => {
    refetch();
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
  };

  const parseDepartmentFile = (
    text: string,
    fileType: string,
    csvType?: string
  ): BudgetControl[] => {
    let delimiter = ",";
    if (fileType === "text/csv" && csvType) {
      if (csvType === "comma") delimiter = ",";
      if (csvType === "macintosh") delimiter = ",";
      if (csvType === "ms-dos") delimiter = ",";
      if (csvType === "utf-8") delimiter = ",";
    }
    let importedData: BudgetControl[] = [];

    if (fileType === "text/csv") {
      const rows = text
        .split("\n")
        .slice(1)
        .filter((row) => row.trim());
      importedData = rows
        .map((row) => {
          const [idBudgetControl, name, description, createdIn, updatedIn] =
            row.split(delimiter);
          if (!idBudgetControl || !name || !description) return null;
          return {
            idBudgetControl: Number(idBudgetControl.trim()),
            name: name.trim(),
            description: description.trim(),

            createdIn:
              createdIn?.trim() || new Date().toISOString().split("T")[0],
            updatedIn: updatedIn?.trim() || "Desconhecido",
          };
        })
        .filter((item): item is BudgetControl => item !== null);
    } else if (fileType === "application/xml") {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        importedData = parsed
          .map((item) => {
            if (!item.idBudgetControl || !item.name || !item.description)
              return null;
            return {
              idBudgetControl: item.idBudgetControl,
              name: item.name,
              description: item.description,
              createdIn:
                item.createdIn || new Date().toISOString().split("T")[0],
              updatedIn: item.updatedIn || "Desconhecido",
            };
          })
          .filter((item): item is BudgetControl => item !== null);
      }
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      // Placeholder para .xlsx (necessita de biblioteca como xlsx)
      console.warn("Importação de .xlsx não implementada.");
    }
    return importedData;
  };

  const handleImport = (newBudgets: BudgetControl[]) => {
    setIsImportModalOpen(false);
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerenciar Controles de Orçamento"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterOptions={filterOptions}
        isFilterOpen={isFilterOpen}
        toggleFilterDropdown={() => setIsFilterOpen((o) => !o)}
        closeFilterDropdown={() => setIsFilterOpen(false)}
      />

      <div className="md:flex md:justify-end space-y-2 md:space-y-0 mb-4 gap-2">
        <ComponetButton
          variant="primary"
          onClick={openImport}
          className="px-4 py-2 md:w-auto w-full flex items-center justify-center gap-2"
        >
          <Upload size={16} /> Importar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={openCreate}
          className="px-4 py-2 md:w-auto w-full flex  items-center justify-center gap-2 bg-[#E1B927] hover:bg-[#F0B90B] focus:ring-[#E1B927]"
        >
          <Plus size={16} /> Cadastrar
        </ComponetButton>
      </div>

      <div className="bg-white dark:bg-gray-900 px-3 md:px-0  rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler
          isLoading={isLoading}
          error={error}
          onRetry={() => {
            refetch();
          }}
        >
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  ID do Orçamento
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Descrição
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Criado Em
                </th>

                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((budgetControl, idx) => (
                <tr
                  key={budgetControl.idBudgetControl}
                  className="border-b dark:border-gray-800  border-gray-100 dark:text-gray-400"
                >
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {budgetControl.name}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {truncateText(budgetControl.description, 25, "end")}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {new Date(budgetControl.createdIn).toLocaleString()}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => openView(budgetControl)}
                      className="p-2 cursor-pointer bg-blue-50 hover:bg-blue-100 rounded"
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => openEdit(budgetControl)}
                      className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                    >
                      <Pencil size={16} className="text-green-600" />
                    </button>
                    <button
                      onClick={() => openConfirm(budgetControl.idBudgetControl)}
                      className="p-2 cursor-pointer bg-red-50 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    Nenhum controle de orçamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <CreateBudgetControlsModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSave}
      />

      <EditBudgetControlsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        budgetControl={selectedBudgetControl}
        onSave={handleSave}
      />

      <ViewBudgetControlsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        budgetControl={selectedBudgetControl}
      />

      <DynamicImportModal<BudgetControl>
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Importar Orçamentos"
        accept=".csv,.xml,.xlsx"
        parseFile={parseDepartmentFile}
      />

      <DeletePublicationModal
        isOpen={confirmBudgetControlId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir Controle de Orçamento"
        message="Tem certeza que deseja excluir este controle de orçamento?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
