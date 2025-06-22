import { useState, useEffect } from "react";
import { Trash2, Users, BookOpen, School, User, DoorOpen } from "lucide-react";
import SearchFilterBar from "@/components/common/SearchBar";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import {
  useListTeachers,
  useListClasses,
  useListCourses,
  useListSubjects,
  useListStudents,
  useListRooms,
  useDeleteTeacher,
  useDeleteRoom,
} from "@/hooks/DynamicApiHooks";
import { Teacher, Student, Subject } from "@/types/interfaces";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";

// Truncate and filter utility functions
const truncateText = (
  text: string,
  maxLength: number,
  position: "end" | "middle" = "end"
) => {
  if (text.length <= maxLength) return text;
  if (position === "middle") {
    const half = Math.floor(maxLength / 2);
    return `${text.slice(0, half)}...${text.slice(-half)}`;
  }
  return `${text.slice(0, maxLength)}...`;
};

const filterByMonthYear = <T extends { createdIn: string }>(
  data: T[],
  month: number,
  year: number
): T[] => {
  return data.filter((item) => {
    const date = new Date(item.createdIn);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
};

export default function Statistics() {
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [teacherFilterType, setTeacherFilterType] = useState("");
  const [isTeacherFilterOpen, setIsTeacherFilterOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"teacher" | "room" | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: teachers,
    isLoading: teachersLoading,
    error: teachersError,
    refetch: refetchTeachers,
  } = useListTeachers();
  const {
    data: classes,
    isLoading: classesLoading,
    error: classesError,
  } = useListClasses();
  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useListCourses();
  const {
    data: subjects,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useListSubjects();
  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useListStudents();
  const {
    data: rooms,
    isLoading: roomsLoading,
    error: roomsError,
    refetch: refetchRooms,
  } = useListRooms();
  const { mutate: deleteTeacher } = useDeleteTeacher();
  const { mutate: deleteRoom } = useDeleteRoom();

  const isLoading =
    teachersLoading ||
    classesLoading ||
    coursesLoading ||
    subjectsLoading ||
    studentsLoading ||
    roomsLoading;

  const teacherFilterOptions = [
    { value: "", label: "Todos" },
    { value: "Professor", label: "Professor" },
    { value: "Coordenador", label: "Coordenador" },
  ];

  useEffect(() => {
    const errors = [
      teachersError,
      classesError,
      coursesError,
      subjectsError,
      studentsError,
      roomsError,
    ].filter(Boolean);
    if (errors.length) {
      setError(errors[0]?.message || "Erro ao carregar dados");
    } else {
      if (teachers) {
        let updatedTeachers = filterByMonthYear(
          teachers,
          selectedMonth,
          selectedYear
        );
        if (teacherSearchTerm) {
          updatedTeachers = updatedTeachers.filter(
            (teacher) =>
              teacher.name
                .toLowerCase()
                .includes(teacherSearchTerm.toLowerCase()) ||
              teacher.email
                .toLowerCase()
                .includes(teacherSearchTerm.toLowerCase())
          );
        }
        if (teacherFilterType) {
          updatedTeachers = updatedTeachers.filter(
            (teacher) => teacher.function === teacherFilterType
          );
        }
        setFilteredTeachers(updatedTeachers);
      }
    }
  }, [
    teachers,
    teachersError,
    classesError,
    coursesError,
    subjectsError,
    studentsError,
    roomsError,
    selectedMonth,
    selectedYear,
    teacherSearchTerm,
    teacherFilterType,
  ]);

  const studentsPerClass = (classes || []).map((cls) => ({
    ...cls,
    studentCount:
      students?.filter((s: Student) => s.idClass === cls.idClass).length || 0,
  }));

  const subjectsPerCourse = (courses || []).map((course) => ({
    ...course,
    subjectCount:
      subjects?.filter((s: Subject) => s.idCourse === course.idCourse).length ||
      0,
  }));

  const openDelete = (id: number, type: "teacher" | "room") => {
    setConfirmId(id);
    setDeleteType(type);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (confirmId === null || deleteType === null) return;
    if (deleteType === "teacher") {
      deleteTeacher(
        { idTeacher: confirmId },
        {
          onSuccess: () => {
            setFilteredTeachers((prev) =>
              prev.filter((t) => t.idTeacher !== confirmId)
            );
            setDeleteModalOpen(false);
            setConfirmId(null);
            setDeleteType(null);
            setError(null);
          },
          onError: (err: any) => {
            setError(err.message || "Erro ao excluir professor");
            setDeleteModalOpen(false);
          },
        }
      );
    } else if (deleteType === "room") {
      deleteRoom(
        { idRoom: confirmId },
        {
          onSuccess: () => {
            setDeleteModalOpen(false);
            setConfirmId(null);
            setDeleteType(null);
            setError(null);
          },
          onError: (err: any) => {
            setError(err.message || "Erro ao excluir sala");
            setDeleteModalOpen(false);
          },
        }
      );
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setConfirmId(null);
    setDeleteType(null);
    setError(null);
  };

  const refetchData = () => {
    refetchTeachers();
    refetchRooms();
  };

  return (
    <div className="min-h-screen p-6  transition-colors duration-300">
      {/* Date Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="p-3 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-200 transition-all duration-200"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(0, month - 1).toLocaleString("pt-BR", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
          <BookOpen
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="p-3 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-200 transition-all duration-200"
          >
            {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
          <BookOpen
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
          <Users size={24} className="mb-2" />
          <h3 className="text-lg font-semibold">Estudantes por Turma</h3>
          <p className="text-3xl font-bold">
            {studentsPerClass.reduce((sum, cls) => sum + cls.studentCount, 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-700 dark:to-green-800 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
          <BookOpen size={24} className="mb-2" />
          <h3 className="text-lg font-semibold">Disciplinas por Curso</h3>
          <p className="text-3xl font-bold">
            {subjectsPerCourse.reduce(
              (sum, course) => sum + course.subjectCount,
              0
            )}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-700 dark:to-purple-800 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
          <School size={24} className="mb-2" />
          <h3 className="text-lg font-semibold">Quantidade de Cursos</h3>
          <p className="text-3xl font-bold">{courses?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 dark:from-red-700 dark:to-red-800 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
          <User size={24} className="mb-2" />
          <h3 className="text-lg font-semibold">Quantidade de Professores</h3>
          <p className="text-3xl font-bold">{filteredTeachers.length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-700 dark:to-yellow-800 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
          <DoorOpen size={24} className="mb-2" />
          <h3 className="text-lg font-semibold">Quantidade de Salas</h3>
          <p className="text-3xl font-bold">{rooms?.length || 0}</p>
        </div>
      </div>

      {/* Teachers Table */}
      <SearchFilterBar
        title="Professores"
        searchTerm={teacherSearchTerm}
        setSearchTerm={setTeacherSearchTerm}
        filterType={teacherFilterType}
        setFilterType={setTeacherFilterType}
        filterOptions={teacherFilterOptions}
        isFilterOpen={isTeacherFilterOpen}
        toggleFilterDropdown={() => setIsTeacherFilterOpen((o) => !o)}
        closeFilterDropdown={() => setIsTeacherFilterOpen(false)}
      />
      <DataStatusHandler
        isLoading={isLoading}
        error={error}
        onRetry={refetchData}
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="py-4 px-6 font-semibold">Id</th>
                  <th className="py-4 px-6 font-semibold">Nome</th>
                  <th className="py-4 px-6 font-semibold">Email</th>
                  <th className="py-4 px-6 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher, index) => (
                    <tr
                      key={teacher.idTeacher}
                      className={`border-b dark:border-gray-700 ${
                        index % 2 === 0
                          ? "bg-gray-50 dark:bg-gray-800"
                          : "bg-white dark:bg-gray-900"
                      } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200`}
                    >
                      <td className="py-4 px-6">{teacher.idTeacher}</td>
                      <td className="py-4 px-6">
                        {truncateText(teacher.name, 25)}
                      </td>
                      <td className="py-4 px-6">
                        {truncateText(teacher.email, 25)}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() =>
                            openDelete(teacher.idTeacher, "teacher")
                          }
                          className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                          title="Excluir Professor"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 px-6 text-center text-gray-500 dark:text-gray-400"
                    >
                      Nenhum professor encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DataStatusHandler>

      {/* Delete Modal */}
      <DeletePublicationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title={deleteType === "teacher" ? "Excluir Professor" : "Excluir Sala"}
        message={`Tem certeza que deseja excluir este ${
          deleteType === "teacher" ? "professor" : "sala"
        }?`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
