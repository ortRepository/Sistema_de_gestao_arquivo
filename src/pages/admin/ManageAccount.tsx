import { useState } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";
import ComponetButton from "@/components/common/button";
import Modal from "@/components/common/DeletePublicationModal";
import { Account } from "@/types/interfaces";
import ManageAccountModal from "@/components/modals/admin/ManageAccounttypeModal";
import DynamicImportModal from "@/components/modals/admin/DynamicImportModal";
import {
  useGetAccounts,
  useDeleteAccount,
  useGetClasses,
} from "@/hooks/DynamicApiHooks";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";

export default function ManageAccountScreen() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Account | null>(
    null
  );
  const [confirmCategoryId, setConfirmCategoryId] = useState<number | null>(
    null
  );

  const { data: categories = [], isLoading, error, refetch } = useGetAccounts();
  const { mutate: deleteAccount } = useDeleteAccount();
  const {
    data: apiClasses = [],
    isLoading: loadingClasses,
    error: errorClasses,
    refetch: refetchClasses,
  } = useGetClasses();

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "idAccount", label: "Id" },
    { value: "name", label: "Nome da conta" },
    { value: "number", label: "Número" },
    { value: "idClass", label: "Classe" },
  ];

  const filtered = categories.filter((cat, idx) => {
    const term = searchTerm.toLowerCase();
    switch (filterType) {
      case "idAccount":
        return (idx + 1).toString().includes(term);
      case "name":
        return cat.name.toLowerCase().includes(term);
      case "number":
        return cat.number.toString().includes(term);
      case "idClass":
        return cat.idClass.toString().includes(term);
      default:
        return (
          cat.idAccount.toString().includes(term) ||
          cat.name.toLowerCase().includes(term) ||
          cat.description.toLowerCase().includes(term) ||
          cat.number.toString().includes(term) ||
          cat.idClass.toString().includes(term)
        );
    }
  });

  const openCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };
  const openEdit = (cat: Account) => {
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
      deleteAccount(
        { idAccount: confirmCategoryId },
        {
          onSuccess: () => {
            refetch();
            closeConfirm();
          },
          onError: (error) => console.error("Error deleting account:", error),
        }
      );
    }
  };

  const handleSave = (_updated: Account) => {
    refetch();
    setIsModalOpen(false);
  };

  const parseCategoryFile = (
    text: string,
    fileType: string,
    csvType?: string
  ): Account[] => {
    let delimiter = ",";
    if (fileType === "text/csv" && csvType) {
      if (csvType === "comma") delimiter = ",";
      if (csvType === "macintosh") delimiter = ",";
      if (csvType === "ms-dos") delimiter = ",";
      if (csvType === "utf-8") delimiter = ",";
    }
    let importedData: Account[] = [];

    if (fileType === "text/csv") {
      const rows = text
        .split("\n")
        .slice(1)
        .filter((row) => row.trim());
      importedData = rows
        .map((row) => {
          const [number, name, description, idClass, createdIn, updatedIn] =
            row.split(delimiter);
          if (!number || !name || !description || !idClass) return null;
          return {
            idAccount: 0,
            number: Number(number.trim()),
            name: name.trim(),
            description: description.trim(),
            idClass: Number(idClass.trim()),
            createdIn: createdIn?.trim() || new Date().toISOString(),
            updatedIn: updatedIn?.trim() || new Date().toISOString(),
          };
        })
        .filter((item): item is Account => item !== null);
    } else if (fileType === "application/xml") {
      const parsed = JSON.parse(text); // Note: XML parsing needs a proper library
      if (Array.isArray(parsed)) {
        importedData = parsed
          .map((item) => {
            if (
              !item.number ||
              !item.name ||
              !item.description ||
              !item.idClass
            )
              return null;
            return {
              idAccount: 0,
              number: Number(item.number),
              name: item.name,
              description: item.description,
              idClass: Number(item.idClass),
              createdIn: item.createdIn || new Date().toISOString(),
              updatedIn: item.updatedIn || new Date().toISOString(),
            };
          })
          .filter((item): item is Account => item !== null);
      }
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      // Note: XLSX parsing not implemented
    }

    return importedData;
  };

  const handleImport = (newCategories: Account[]) => {
    setIsImportModalOpen(false);
    console.log("Imported accounts:", newCategories); // Should call useCreateAccount if needed
  };
  const getSectionName = (id: number) => {
    const section = apiClasses.find((s) => s.idClass === id);
    return section ? section.name : String(id);
  };
  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir contas"
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
          isLoading={loadingClasses || isLoading}
          error={errorClasses || error}
          onRetry={() => {
            refetch();
            refetchClasses();
          }}
        >
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Número</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Nome da conta
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Descrição
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Classe</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Data de criação
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat, idx) => (
                <tr
                  key={cat.idAccount}
                  className="border-b dark:border-gray-800  border-gray-100 dark:text-gray-400"
                >
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {cat.number}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {cat.name}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {truncateText(cat.description, 25, "end")}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {getSectionName(cat.idClass)}
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
                      onClick={() => openConfirm(cat.idAccount)}
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
                    Nenhuma conta encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <ManageAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSave={handleSave}
      />

      <DynamicImportModal<Account>
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Importar contas"
        accept=".csv,.xml,.xlsx"
        parseFile={parseCategoryFile}
      />

      <Modal
        isOpen={confirmCategoryId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir conta"
        message="Tem certeza que deseja excluir esta conta?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
