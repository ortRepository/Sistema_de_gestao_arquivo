import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";

import ModalManageDisciplinas from "@/components/modals/modalEmployee/ModalManageDisciplinas";
import ModalManageCourse from "@/components/modals/modalEmployee/ModalManageCourse";
import { Course } from "@/types/interfaces";




export default function PageManageCourse() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDisciplinasModalOpen, setIsDisciplinasModalOpen] =
    useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [confirmCourseId, setConfirmCourseId] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "id", label: "Id" },
    { value: "nome", label: "Nome" },
    { value: "coordenadorDoCurso", label: "Coordenador do Curso" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return courses.filter((course) => {
      switch (filterType) {
        case "id":
          return course.id.toString().includes(term);
        case "nome":
          return course.nome.toLowerCase().includes(term);
        case "coordenadorDoCurso":
          return course.coordenadorDoCurso.toLowerCase().includes(term);
        default:
          return (
            course.id.toString().includes(term) ||
            course.nome.toLowerCase().includes(term) ||
            course.coordenadorDoCurso.toLowerCase().includes(term)
          );
      }
    });
  }, [courses, searchTerm, filterType]);

  const openCreate = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const openEdit = (course: CourseData) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const openConfirm = (id: number) => setConfirmCourseId(id);
  const closeConfirm = () => setConfirmCourseId(null);

  const openDisciplinasModal = (course: CourseData) => {
    setSelectedCourse(course);
    setIsDisciplinasModalOpen(true);
  };

  const handleDelete = () => {
    if (confirmCourseId !== null) {
      setCourses((prev) => prev.filter((c) => c.id !== confirmCourseId));
      closeConfirm();
    }
  };

  const handleSave = (course: CourseData) => {
    if (selectedCourse) {
      setCourses((prev) => prev.map((c) => (c.id === course.id ? course : c)));
    } else {
      setCourses((prev) => [...prev, { ...course, id: prev.length + 1 }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
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
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Coordenador do Curso
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((course: CourseData) => (
                  <tr
                    key={course.id}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {course.id}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {course.nome}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(course.coordenadorDoCurso, 25, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openEdit(course)}
                        className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => openConfirm(course.id)}
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
