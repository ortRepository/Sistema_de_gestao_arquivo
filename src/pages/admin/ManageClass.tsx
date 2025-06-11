import { useState } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";
import ComponetButton from "@/components/common/button";
import Modal from "@/components/common/DeletePublicationModal";
import ManageClassModal from "@/components/modals/admin/ManageClassModal";
import DynamicImportModal from "@/components/modals/admin/DynamicImportModal";
import { useDeleteClass, useGetClasses } from "@/hooks/DynamicApiHooks";
import { Class } from "@/types/interfaces";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";

export default function ManageClassScreen() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Class | null>(null);
  const [confirmCategoryId, setConfirmCategoryId] = useState<number | null>(
    null
  );

  const {
    data: classes = [],
    isLoading: loadingClasses,
    error: errorClasses,
    refetch: refetchClasses,
  } = useGetClasses();
  const { mutate: deleteClass } = useDeleteClass();

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "idClass", label: "Id" },
    { value: "name", label: "Nome da classe" },
    { value: "description", label: "Descrição" },
    { value: "idBudgetControl", label: "Controle de Orçamento" },
  ];

  const filtered = classes.filter((cat, idx) => {
    const term = searchTerm.toLowerCase();
    switch (filterType) {
      case "idClass":
        return (idx + 1).toString().includes(term);
      case "name":
        return cat.name.toLowerCase().includes(term);
      case "description":
        return cat.description.toLowerCase().includes(term);
      case "idBudgetControl":
        return cat.idBudgetControl.toString().includes(term);
      default:
        return (
          cat.idClass.toString().includes(term) ||
          cat.name.toLowerCase().includes(term) ||
          cat.description.toLowerCase().includes(term) ||
          cat.idBudgetControl.toString().includes(term)
        );
    }
  });

  const openCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };
  const openEdit = (cat: Class) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };
  const openImport = () => {
    setIsImportModalOpen(true);
  };
  const openConfirm = (id: number) => setConfirmCategoryId(id);
  const closeConfirm = () => setConfirmCategoryId(null);

  const handleDelete = () => {
    if (confirmCategoryId !== null) {
      deleteClass(
        { idClass: confirmCategoryId },
        {
          onSuccess: () => {
            refetchClasses();
            closeConfirm();
          },
          onError: (error) => console.error("Error deleting class:", error),
        }
      );
    }
  };

  const handleSave = (_updated: Class) => {
    refetchClasses();
    setIsModalOpen(false);
  };

  const parseClassFile = (
    text: string,
    fileType: string,
    csvType?: string
  ): Class[] => {
    let delimiter = ",";
    if (fileType === "text/csv" && csvType) {
      if (csvType === "comma") delimiter = ",";
      if (csvType === "macintosh") delimiter = ",";
      if (csvType === "ms-dos") delimiter = ",";
      if (csvType === "utf-8") delimiter = ",";
    }
    let importedData: Class[] = [];

    if (fileType === "text/csv") {
      const rows = text
        .split("\n")
        .slice(1)
        .filter((row) => row.trim());
      importedData = rows
        .map((row) => {
          const [
            idClass,
            name,
            description,
            idBudgetControl,
            createdIn,
            updatedIn,
          ] = row.split(delimiter);
          if (!idClass || !name || !description || !idBudgetControl)
            return null;
          return {
            idClass: Number(idClass.trim()),
            name: name.trim(),
            description: description.trim(),
            idBudgetControl: Number(idBudgetControl.trim()),
            createdIn: createdIn?.trim() || new Date().toISOString(),
            updatedIn: updatedIn?.trim() || new Date().toISOString(),
          };
        })
        .filter((item): item is Class => item !== null);
    } else if (fileType === "application/xml") {
      const parsed = JSON.parse(text); // Note: XML parsing needs a proper library
      if (Array.isArray(parsed)) {
        importedData = parsed
          .map((item) => {
            if (
              !item.idClass ||
              !item.name ||
              !item.description ||
              !item.idBudgetControl
            )
              return null;
            return {
              idClass: Number(item.idClass),
              name: item.name,
              description: item.description,
              idBudgetControl: Number(item.idBudgetControl),
              createdIn: item.createdIn || new Date().toISOString(),
              updatedIn: item.updatedIn || new Date().toISOString(),
            };
          })
          .filter((item): item is Class => item !== null);
      }
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      // Note: XLSX parsing not implemented
    }

    return importedData;
  };

  const handleImport = (newClasses: Class[]) => {
    setIsImportModalOpen(false);
    console.log("Imported classes:", newClasses);
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir classes"
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
          isLoading={loadingClasses}
          error={errorClasses}
          onRetry={() => {
            refetchClasses();
          }}
        >
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Nome da classe
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Descrição
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Controle de Orçamento
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Data de criação
                </th>

                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat, idx) => (
                <tr
                  key={cat.idClass}
                  className="border-b dark:border-gray-800  border-gray-100 dark:text-gray-400"
                >
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {cat.name}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {truncateText(cat.description, 25, "end")}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {cat.idBudgetControl}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {new Date(cat.createdIn).toLocaleString()}
                  </td>

                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                    >
                      <Pencil size={16} className="text-green-600" />
                    </button>
                    <button
                      onClick={() => openConfirm(cat.idClass)}
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
                    Nenhuma classe encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <ManageClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSave={handleSave}
      />

      <DynamicImportModal<Class>
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Importar classes"
        accept=".csv,.xml,.xlsx"
        parseFile={parseClassFile}
      />

      <Modal
        isOpen={confirmCategoryId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir classe"
        message="Tem certeza que deseja excluir esta classe?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
