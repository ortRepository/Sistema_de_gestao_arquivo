import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponentButton from "@/components/common/button";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";
import ModalManageClass from "@/components/modals/modalEmployee/ModalManageClass";
import {
  useListClasses,
  useDeleteClass,
  useListRooms,
  useListCourses,
} from "@/hooks/DynamicApiHooks";
import { Class } from "@/types/interfaces";

export default function PageManageClass() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [confirmClassId, setConfirmClassId] = useState<number | null>(null);

  const { data: classes, isLoading, error, refetch } = useListClasses();
  const { data: rooms } = useListRooms();
  const { data: courses } = useListCourses();
  const { mutate: deleteClass } = useDeleteClass();

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "id", label: "Id" },
    { value: "name", label: "Turma" },
    { value: "room", label: "Sala" },
    { value: "course", label: "Curso" },
    { value: "status", label: "Status" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (classes || []).filter((cls: Class, idx) => {
      const room = rooms?.find((r) => r.idRoom === cls.idRoom);
      const courseName =
        courses?.find((c) => c.idCourse === room?.idCourse)?.name || "N/A";
      const roomName = room?.name || "N/A";
      switch (filterType) {
        case "id":
          return String(idx + 1).includes(searchTerm);
        case "name":
          return cls.name.toLowerCase().includes(term);
        case "room":
          return roomName.toLowerCase().includes(term);
        case "course":
          return courseName.toLowerCase().includes(term);
        case "status":
          return (cls.status ? "ativo" : "inativo").includes(term);
        default:
          return (
            String(idx + 1).includes(searchTerm) ||
            cls.name.toLowerCase().includes(term) ||
            roomName.toLowerCase().includes(term) ||
            courseName.toLowerCase().includes(term) ||
            (cls.status ? "ativo" : "inativo").includes(term)
          );
      }
    });
  }, [classes, rooms, courses, searchTerm, filterType]);

  const openCreate = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const openEdit = (cls: Class) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const openConfirm = (id: number) => setConfirmClassId(id);
  const closeConfirm = () => setConfirmClassId(null);

  const handleDelete = () => {
    if (confirmClassId !== null) {
      deleteClass({ idClass: confirmClassId });
    }
  };

  const handleSave = () => {
    refetch();
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
        <ComponentButton
          variant="primary"
          className="flex items-center justify-center gap-2 md:w-auto w-full"
          onClick={openCreate}
        >
          <Plus size={16} /> Cadastrar
        </ComponentButton>
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
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Turma</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Sala</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Curso</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((cls: Class, idx) => {
                  const room = rooms?.find((r) => r.idRoom === cls.idRoom);
                  const courseName =
                    courses?.find((c) => c.idCourse === room?.idCourse)?.name ||
                    "N/A";
                  return (
                    <tr
                      key={cls.idClass}
                      className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                    >
                      <td className="py-2 px-2 md:px-4 md:y-3 whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2 md:px-4 md:y-3 whitespace-nowrap">
                        {truncateText(cls.name, 25, "end")}
                      </td>
                      <td className="py-2 px-2 md:px-4 md:y-3 whitespace-nowrap">
                        {truncateText(room?.name || "N/A", 25, "end")}
                      </td>
                      <td className="py-2 px-2 md:px-4 md:y-3 whitespace-nowrap">
                        {truncateText(courseName, 25, "end")}
                      </td>
                      <td className="py-2 px-2 md:px-4 md:y-3 whitespace-nowrap">
                        {cls.status ? "Ativo" : "Inativo"}
                      </td>
                      <td className="py-2 px-2 md:px-4 md:y-3 whitespace-nowrap flex gap-2">
                        <button
                          onClick={() => openEdit(cls)}
                          className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                        >
                          <Pencil size={16} className="text-green-600" />
                        </button>
                        <button
                          onClick={() => openConfirm(cls.idClass)}
                          className="p-2 cursor-pointer bg-red-50 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={9}
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
