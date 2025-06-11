import { useState } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";
import ComponetButton from "@/components/common/button";
import Modal from "@/components/common/DeletePublicationModal";
import { Department } from "@/types/interfaces";
import DepartmentsModal from "@/components/modals/admin/DepartmentsModal";
import DynamicImportModal from "@/components/modals/admin/DynamicImportModal";
import {
  useGetDepartments,
  useDeleteDepartment,
  useGetSections,
} from "@/hooks/DynamicApiHooks";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";

export default function DepartmentsScreen() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Department | null>(
    null
  );
  const [confirmCategoryId, setConfirmCategoryId] = useState<number | null>(
    null
  );

  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useGetDepartments();
  const {
    data: apiSections = [],
    isLoading: loadingSections,
    error: errorSections,
    refetch: refetchSections,
  } = useGetSections();
  const { mutate: deleteDepartment } = useDeleteDepartment();

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "idDepartment", label: "Id" },
    { value: "name", label: "Nome do departamento" },
    { value: "departmentNumber", label: "Número do departamento" },
  ];

  const getSectionName = (id: number) => {
    const section = apiSections.find((s) => s.idSection === id);
    return section ? section.name : String(id);
  };

  const filtered = categories.filter((cat, idx) => {
    const term = searchTerm.toLowerCase();
    switch (filterType) {
      case "idDepartment":
        return (idx + 1).toString().includes(term);
      case "name":
        return cat.name.toLowerCase().includes(term);
      case "departmentNumber":
        return cat.departmentNumber.toString().includes(term);
      default:
        return (
          cat.idDepartment.toString().includes(term) ||
          cat.name.toLowerCase().includes(term) ||
          cat.description.toLowerCase().includes(term) ||
          cat.departmentNumber.toString().includes(term)
        );
    }
  });

  const openCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };
  const openEdit = (cat: Department) => {
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
      deleteDepartment(
        { idDepartment: confirmCategoryId },
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

  const handleSave = (_updated: Department) => {
    refetch();
    setIsModalOpen(false);
  };

  const parseDepartmentFile = (
    text: string,
    fileType: string,
    csvType?: string
  ): Department[] => {
    let delimiter = ",";
    if (fileType === "text/csv" && csvType) {
      if (csvType === "comma") delimiter = ",";
      if (csvType === "macintosh") delimiter = ",";
      if (csvType === "ms-dos") delimiter = ",";
      if (csvType === "utf-8") delimiter = ",";
    }
    let importedData: Department[] = [];

    if (fileType === "text/csv") {
      const rows = text
        .split("\n")
        .slice(1)
        .filter((row) => row.trim());
      importedData = rows
        .map((row) => {
          const [
            departmentNumber,
            name,
            description,
            idSection,
            createdIn,
            updatedIn,
          ] = row.split(delimiter);
          if (!departmentNumber || !name || !description || !idSection)
            return null;
          return {
            idDepartment: 0,
            departmentNumber: Number(departmentNumber.trim()),
            name: name.trim(),
            description: description.trim(),
            idSection: Number(idSection.trim()),
            createdIn:
              createdIn?.trim() || new Date().toLocaleDateString("pt-PT"),
            updatedIn:
              updatedIn?.trim() || new Date().toLocaleDateString("pt-PT"),
          };
        })
        .filter((item): item is Department => item !== null);
    } else if (fileType === "application/xml") {
      const parsed = JSON.parse(text); // Note: XML parsing may need a proper library
      if (Array.isArray(parsed)) {
        importedData = parsed
          .map((item) => {
            if (
              !item.departmentNumber ||
              !item.name ||
              !item.description ||
              !item.idSection
            )
              return null;
            return {
              idDepartment: 0,
              departmentNumber: item.departmentNumber,
              name: item.name,
              description: item.description,
              idSection: item.idSection,
              createdIn:
                item.createdIn || new Date().toLocaleDateString("pt-PT"),
              updatedIn:
                item.updatedIn || new Date().toLocaleDateString("pt-PT"),
            };
          })
          .filter((item): item is Department => item !== null);
      }
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      // Note: XLSX parsing not implemented
    }
    return importedData;
  };

  const handleImport = (newCategories: Department[]) => {
    setIsImportModalOpen(false);
    console.log("Imported departments:", newCategories); // Should call API (e.g., useCreateDepartment)
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir departamentos"
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
          className="px-4  md:w-auto w-full flex items-center justify-center gap-2 bg-[#E1B927] hover:bg-[#F0B90B] focus:ring-[#E1B927]"
        >
          <Plus size={16} /> Cadastrar
        </ComponetButton>
      </div>

      <div className="bg-white dark:bg-gray-900 px-3 md:px-0  rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler
          isLoading={loadingSections || isLoading}
          error={errorSections || error}
          onRetry={() => {
            refetch();
            refetchSections();
          }}
        >
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Nº do departamento
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Descrição
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Seção</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Data de criação
                </th>

                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat, idx) => (
                <tr
                  key={cat.idDepartment}
                  className="border-b dark:border-gray-800  border-gray-100 dark:text-gray-400"
                >
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {cat.name}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {cat.departmentNumber}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {truncateText(cat.description, 25, "end")}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {getSectionName(cat.idSection)}
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
                      onClick={() => openConfirm(cat.idDepartment)}
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
                    colSpan={8}
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    Nenhum departamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <DepartmentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSave={handleSave}
      />

      <DynamicImportModal<Department>
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Importar departamentos"
        accept=".csv,.xml,.xlsx"
        parseFile={parseDepartmentFile}
      />

      <Modal
        isOpen={confirmCategoryId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir departamento"
        message="Tem certeza que deseja excluir este departamento?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
