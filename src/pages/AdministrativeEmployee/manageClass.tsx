import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";
import ModalManageClass from "@/components/modals/modalEmployee/ModalManageClass";
import { Class } from "@/types/interfaces";





export default function PageManageClass() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [confirmClassId, setConfirmClassId] = useState<number | null>(null);
  const [classes, setClasses] = useState<Class[]>(initialClasses);

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "id", label: "Id" },
    { value: "turma", label: "Turma" },
    { value: "diretorDeTurma", label: "Diretor de Turma" },
    { value: "sala", label: "Sala" }, // New filter option
  ];

const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return classes.filter((cls) => {
      switch (filterType) {
        case "id":
          return cls.id.toString().includes(term);
        case "turma":
          return cls.turma.toLowerCase().includes(term);
        case "diretorDeTurma":
          return cls.diretorDeTurma.toLowerCase().includes(term);
        case "sala":
          return cls.sala.toString().includes(term); // Convert number to string for search
        default:
          return (
            cls.id.toString().includes(term) ||
            cls.turma.toLowerCase().includes(term) ||
            cls.diretorDeTurma.toLowerCase().includes(term) ||
            cls.sala.toString().includes(term)
          );
      }
    });
  }, [classes, searchTerm, filterType]);

  const openCreate = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const openEdit = (cls: ClassData) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const openConfirm = (id: number) => setConfirmClassId(id);
  const closeConfirm = () => setConfirmClassId(null);

  const handleDelete = () => {
    if (confirmClassId !== null) {
      setClasses((prev) => prev.filter((c) => c.id !== confirmClassId));
      closeConfirm();
    }
  };

  const handleSave = (cls: ClassData) => {
    if (selectedClass) {
      // Update existing class
      setClasses((prev) =>
        prev.map((c) => (c.id === cls.id ? cls : c))
      );
    } else {
      // Add new class
      setClasses((prev) => [...prev, { ...cls, id: prev.length + 1 }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir Turmas"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterOptions={filterOptions}
        isFilterOpen={isFilterOpen}
        toggleFilterDropdown={() => setIsFilterOpen((o) => !o)}
        closeFilterDropdown={() => setIsFilterOpen(false)}
      />

      <div className="md:flex md:justify-end mb-4">
        <ComponetButton
          variant="primary"
          className="flex items-center gap-2"
          onClick={openCreate}
        >
          <Plus size={16} /> Cadastrar
        </ComponetButton>
      </div>

      <div className="bg-white dark:bg-gray-900 px-3 md:px-0 rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler isLoading={false} error={null} onRetry={() => {}}>
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Turma</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Diretor de Turma
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Sala</th> {/* New column */}
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((cls: ClassData) => (
                  <tr
                    key={cls.id}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {cls.id}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {cls.turma}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(cls.diretorDeTurma, 25, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {cls.sala}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openEdit(cls)}
                        className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => openConfirm(cls.id)}
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
                    colSpan={5} 
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    Nenhuma turma encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <ModalManageClass
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classData={selectedClass}
        onSave={handleSave}
      />

      <DeletePublicationModal
        isOpen={confirmClassId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir turma"
        message="Tem certeza que deseja excluir esta turma?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}