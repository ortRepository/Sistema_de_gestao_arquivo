import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { CostCenter } from "@/types/interfaces";
import DynamicImportModal from "@/components/modals/admin/DynamicImportModal";
import {
  useListCostCenters, // Updated to use cost center hook
  useDeleteCostCenter, // Updated to use cost center hook
} from "@/hooks/DynamicApiHooks";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";
import CostCenterManagementModal from "@/components/modals/admin/CostCenterManagementModal";

export default function CostCenterManagementScreen() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedCostCenter, setSelectedCostCenter] =
    useState<CostCenter | null>(null);
  const [confirmCostCenterId, setConfirmCostCenterId] = useState<number | null>(
    null
  );

  // Data hooks
  const {
    data: costCenters = [], // Updated to costCenters
    isLoading,
    refetch,
    error,
  } = useListCostCenters();
  const { mutate: deleteCostCenter } = useDeleteCostCenter();

  // Filters
  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "idCostCenter", label: "Id" },
    { value: "name", label: "Nome" },
    { value: "description", label: "Descrição" },
    { value: "idAccount", label: "Conta" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return costCenters.filter((costCenter, _idx) => {
      switch (filterType) {
        case "idCostCenter":
          return costCenter.idCostCenter.toString().includes(term);
        case "name":
          return costCenter.name.toLowerCase().includes(term);
        case "description":
          return costCenter.description.toLowerCase().includes(term);
        case "idAccount":
          return costCenter.idAccount.toString().includes(term);
        default:
          return (
            costCenter.idCostCenter.toString().includes(term) ||
            costCenter.name.toLowerCase().includes(term) ||
            costCenter.description.toLowerCase().includes(term) ||
            costCenter.idAccount.toString().includes(term)
          );
      }
    });
  }, [costCenters, searchTerm, filterType]);

  const openCreate = () => {
    setSelectedCostCenter(null);
    setIsModalOpen(true);
  };

  const openEdit = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
    setIsModalOpen(true);
  };

  const openImport = () => setIsImportModalOpen(true);

  const openConfirm = (id: number) => setConfirmCostCenterId(id);

  const closeConfirm = () => setConfirmCostCenterId(null);

  const handleDelete = () => {
    if (confirmCostCenterId !== null) {
      deleteCostCenter({ idCostCenter: confirmCostCenterId });
      closeConfirm();
    }
  };

  const handleSave = (_costCenter: CostCenter) => {};

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir Centros de Custo"
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
          className="px-4 py-2 md:w-auto w-full flex items-center justify-center gap-2 bg-[#E1B927] hover:bg-[#F0B90B] focus:ring-[#E1B927]"
        >
          <Plus size={16} /> Cadastrar
        </ComponetButton>
      </div>

      <div className="bg-white dark:bg-gray-900 px-3 md:px-0 rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        >
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Descrição
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Conta</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Criado Em
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Atualizado Em
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((costCenter: CostCenter) => (
                  <tr
                    key={costCenter.idCostCenter}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {costCenter.idCostCenter}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {costCenter.name}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(costCenter.description, 25, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {costCenter.idAccount}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {costCenter.createdIn
                        ? new Date(costCenter.createdIn).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {costCenter.updatedIn
                        ? new Date(costCenter.updatedIn).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openEdit(costCenter)}
                        className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => openConfirm(costCenter.idCostCenter)}
                        className="p-2 cursor-pointer bg-red-50 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    Nenhum centro de custo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <CostCenterManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        costCenter={selectedCostCenter} // Updated prop name
        onSave={handleSave}
      />

      <DynamicImportModal<CostCenter>
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={() => {}}
        title="Importar Centros de Custo"
        accept=".csv,.xml,.xlsx"
        parseFile={() => []}
      />

      <DeletePublicationModal
        isOpen={confirmCostCenterId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir centro de custo"
        message="Tem certeza que deseja excluir este centro de custo?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
