import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, Eye, User } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";
import ModalRegisterTeacher from "@/components/modals/modalEmployee/ModalRegisterTeacher";
import ModalViewTeacher from "@/components/modals/modalEmployee/ModalViewTeacher";

import { Teacher } from "@/types/interfaces";
import { useListTeachers } from "@/hooks/DynamicApiHooks";

export default function PageRegisTerteacher() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [confirmTeacherId, setConfirmTeacherId] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]); // Local state as fallback

  // Fetch teachers using the API hook
  const { data, isLoading, error, refetch } = useListTeachers();

  // Use fetched data if available, otherwise fallback to local state
  const teachersList = data || teachers;

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "idTeacher", label: "Id" },
    { value: "function", label: "Função" },
    { value: "path", label: "Caminho" },
    { value: "idUser", label: "Id do Usuário" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return teachersList.filter((teacher: Teacher) => {
      switch (filterType) {
        case "idTeacher":
          return teacher.idTeacher.toString().includes(term);
        case "function":
          return teacher.function.toLowerCase().includes(term);
        case "path":
          return teacher.path.toLowerCase().includes(term);
        case "idUser":
          return teacher.idUser.toString().includes(term);
        default:
          return (
            teacher.idTeacher.toString().includes(term) ||
            teacher.function.toLowerCase().includes(term) ||
            teacher.path.toLowerCase().includes(term) ||
            teacher.idUser.toString().includes(term)
          );
      }
    });
  }, [teachersList, searchTerm, filterType]);

  const openCreate = () => {
    setSelectedTeacher(null);
    setIsModalOpen(true);
  };

  const openEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  const openView = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const openConfirm = (id: number) => setConfirmTeacherId(id);
  const closeConfirm = () => setConfirmTeacherId(null);

  const handleDelete = () => {
    if (confirmTeacherId !== null) {
      // Placeholder: Replace with actual API call to delete teacher
      setTeachers((prev) =>
        prev.filter((t) => t.idTeacher !== confirmTeacherId)
      );
      closeConfirm();
    }
  };

  const handleSave = (teacher: Teacher) => {
    if (selectedTeacher) {
      // Update existing teacher (Placeholder: Replace with API call)
      setTeachers((prev) =>
        prev.map((t) => (t.idTeacher === teacher.idTeacher ? teacher : t))
      );
    } else {
      // Add new teacher (Placeholder: Replace with API call)
      setTeachers((prev) => [
        ...prev,
        { ...teacher, idTeacher: prev.length + 1 },
      ]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir Professores"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterOptions={filterOptions}
        isFilterOpen={isFilterOpen}
        toggleFilterDropdown={() => setIsFilterOpen((o) => !o)}
        closeFilterDropdown={() => setIsFilterOpen(false)}
      />

      <div className="md:flex md:justify-end mb-4 gap-2">
        <ComponetButton
          variant="primary"
          className="flex items-center justify-center gap-2 md:w-auto w-full"
          onClick={openCreate}
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
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Foto</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Função</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Caminho</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Id do Usuário
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Criado em
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((teacher: Teacher) => (
                  <tr
                    key={teacher.idTeacher}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {teacher.photo ? (
                        <img
                          src={teacher.photo} // Fixed: Removed extra quotation mark
                          alt="Teacher photo"
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={20} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {teacher.idTeacher}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(teacher.function, 15, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(teacher.path, 15, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {teacher.idUser}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {new Date(teacher.createdIn).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openView(teacher)}
                        className="p-2 cursor-pointer bg-blue-50 hover:bg-blue-100 rounded"
                      >
                        <Eye size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => openEdit(teacher)}
                        className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => openConfirm(teacher.idTeacher)}
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
                    Nenhum professor encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <ModalRegisterTeacher
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teacherData={selectedTeacher}
        onSave={handleSave}
      />

      <ModalViewTeacher
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        teacherData={selectedTeacher}
      />

      <DeletePublicationModal
        isOpen={confirmTeacherId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir Professor"
        message="Tem certeza que deseja excluir este professor?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
