import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";
import DirectionModal from "@/components/modals/admin/DirectionModal";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { Direction } from "@/types/interfaces";
import DynamicImportModal from "@/components/modals/admin/DynamicImportModal";
import { useGetDirections, useDeleteDirection } from "@/hooks/DynamicApiHooks";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";

export default function ManageDirectionsScreen() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(
    null
  );
  const [confirmDirectionId, setConfirmDirectionId] = useState<number | null>(
    null
  );
  // Data hooks
  const {
    data: directions = [],
    isLoading,
    refetch,
    error,
  } = useGetDirections();
  const { mutate: deleteDirection } = useDeleteDirection();

  // Filters
  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "idDirection", label: "Id" },
    { value: "name", label: "Nome" },
    { value: "description", label: "Descrição" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return directions.filter((dir, idx) => {
      switch (filterType) {
        case "idDirection":
          return (idx + 1).toString().includes(term);
        case "name":
          return dir.name.toLowerCase().includes(term);
        case "description":
          return dir.description.toLowerCase().includes(term);
        default:
          return (
            dir.idDirection.toString().includes(term) ||
            dir.name.toLowerCase().includes(term) ||
            dir.description.toLowerCase().includes(term)
          );
      }
    });
  }, [directions, searchTerm, filterType]);

  const openCreate = () => {
    setSelectedDirection(null);
    setIsModalOpen(true);
  };
  const openEdit = (dir: Direction) => {
    setSelectedDirection(dir);
    setIsModalOpen(true);
  };
  const openImport = () => setIsImportModalOpen(true);
  const openConfirm = (id: number) => setConfirmDirectionId(id);
  const closeConfirm = () => setConfirmDirectionId(null);

  const handleDelete = () => {
    if (confirmDirectionId !== null) {
      deleteDirection({ idDirection: confirmDirectionId });
      closeConfirm();
    }
  };

  const handleSave = (_dir: Direction) => {};

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir Direções"
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

      <div className="bg-white dark:bg-gray-900 px-3 md:px-0  rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
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
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Criado Em
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((dir: Direction, idx) => (
                  <tr
                    key={dir.idDirection}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {dir.name}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(dir.description, 25, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {new Date(dir.createdIn).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openEdit(dir)}
                        className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => openConfirm(dir.idDirection)}
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
                    colSpan={6}
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    Nenhuma direção encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <DirectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        direction={selectedDirection}
        onSave={handleSave}
      />

      <DynamicImportModal<Direction>
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={() => {}}
        title="Importar Direções"
        accept=".csv,.xml,.xlsx"
        parseFile={() => []}
      />

      <DeletePublicationModal
        isOpen={confirmDirectionId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir direção"
        message="Tem certeza que deseja excluir esta direção?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
