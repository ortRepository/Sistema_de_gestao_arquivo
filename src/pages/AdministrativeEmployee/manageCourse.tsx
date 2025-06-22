import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponentButton from "@/components/common/button";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";
import ModalManageCourse from "@/components/modals/modalEmployee/ModalManageCourse";
import ModalManageDisciplinas from "@/components/modals/modalEmployee/ModalManageDisciplinas";
import { useListCourses, useDeleteCourse } from "@/hooks/DynamicApiHooks";
import { Course } from "@/types/interfaces";
import { AlertTriangle, CheckCircle } from "lucide-react";


export default function PageManageCourse() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDisciplinasModalOpen, setIsDisciplinasModalOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [confirmCourseId, setConfirmCourseId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const { data: courses, isLoading, error, refetch } = useListCourses();
  const { mutate: deleteCourse } = useDeleteCourse();

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "idCourse", label: "Id" },
    { value: "name", label: "Nome" },
    { value: "status", label: "Status" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (courses || []).filter((course: Course) => {
      switch (filterType) {
        case "idCourse":
          return course.idCourse.toString().includes(term);
        case "name":
          return course.name.toLowerCase().includes(term);
        case "status":
          return (course.status ? "ativo" : "inativo").includes(term);
        default:
          return (
            course.idCourse.toString().includes(term) ||
            course.name.toLowerCase().includes(term) ||
            (course.status ? "ativo" : "inativo").includes(term)
          );
      }
    });
  }, [courses, searchTerm, filterType]);

  const openCreate = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const openConfirm = (id: number) => setConfirmCourseId(id);
  const closeConfirm = () => setConfirmCourseId(null);

  const openDisciplinasModal = (course: Course) => {
    setSelectedCourse(course);
    setIsDisciplinasModalOpen(true);
  };

  const handleDelete = () => {
    if (confirmCourseId !== null) {
      deleteCourse(
        { idCourse: confirmCourseId },
        {
          onSuccess: () => {
            refetch();
            closeConfirm();
            setStatusMessage({
              text: "Curso excluído com sucesso!",
              type: "success",
            });
          },
          onError: (error: any) => {
            setStatusMessage({
              text: error.message || "Erro ao excluir curso.",
              type: "error",
            });
            closeConfirm();
          },
        }
      );
    }
  };

  const handleSave = (course: Course) => {
    refetch();
    setIsModalOpen(false);
    setStatusMessage({
      text: course.idCourse ? "Curso atualizado com sucesso!" : "Curso cadastrado com sucesso!",
      type: "success",
    });
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      {statusMessage && (
        <div
          className={`${
            statusMessage.type === "success"
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50"
          } border-t-4 mb-4 p-4 rounded-lg shadow-md`}
        >
          <p
            className={`${
              statusMessage.type === "success"
                ? "text-green-700"
                : "text-red-700"
            } text-sm flex items-center gap-2`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {statusMessage.text}
          </p>
        </div>
      )}
      <SearchFilterBar
        title="Gerir Cursos"
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
          className="flex items-center gap-2"
          onClick={openCreate}
        >
          <Plus size={16} /> Cadastrar
        </ComponentButton>
      </div>

      <div className="bg-white dark:bg-gray-900 px-3 md:px-0 rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler isLoading={isLoading} error={error} onRetry={refetch}>
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((course: Course) => (
                  <tr
                    key={course.idCourse}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:y-3 whitespace-nowrap">
                      {course.idCourse}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:y-3 whitespace-nowrap">
                      {truncateText(course.name, 25, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:y-3 whitespace-nowrap">
                      {course.status ? "Ativo" : "Inativo"}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:y-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openEdit(course)}
                        className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => openConfirm(course.idCourse)}
                        className="p-2 cursor-pointer bg-red-50 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                      <button
                        onClick={() => openDisciplinasModal(course)}
                        className="p-2 cursor-pointer bg-blue-50 hover:bg-blue-100 rounded"
                      >
                        <Eye size={16} className="text-blue-600" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    Nenhum curso encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <ModalManageCourse
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={selectedCourse}
        onSave={handleSave}
      />

      <ModalManageDisciplinas
        isOpen={isDisciplinasModalOpen}
        onClose={() => setIsDisciplinasModalOpen(false)}
        course={selectedCourse}
      />

      <DeletePublicationModal
        isOpen={confirmCourseId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir curso"
        message="Tem certeza que deseja excluir este curso?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}