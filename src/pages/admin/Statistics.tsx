import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
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
  useDeleteRoom, // Added
} from "@/hooks/DynamicApiHooks";
import { Teacher, Student, Subject, Room } from "@/types/interfaces";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";

// Truncate and filter utility functions remain unchanged
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

  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]); // Added for rooms
  const [roomSearchTerm, setRoomSearchTerm] = useState(""); // Added for rooms
  const [isRoomFilterOpen, setIsRoomFilterOpen] = useState(false); // Added for rooms

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"teacher" | "room" | null>(null); // Added to differentiate
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: teachers,
    isLoading: teachersLoading,
    error: teachersError,
    refetch: refetchTeachers, // Added for retry
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
    refetch: refetchRooms, // Added for retry
  } = useListRooms();
  const { mutate: deleteTeacher } = useDeleteTeacher();
  const { mutate: deleteRoom } = useDeleteRoom(); // Added

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

  // Handle all errors and teacher filtering
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
      // Teacher filtering
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
      // Room filtering
      if (rooms) {
        let updatedRooms = rooms; // No month/year filter for rooms (adjust if needed)
        if (roomSearchTerm) {
          updatedRooms = updatedRooms.filter((room) =>
            room.name.toLowerCase().includes(roomSearchTerm.toLowerCase())
          );
        }
        setFilteredRooms(updatedRooms);
      }
    }
  }, [
    teachers,
    rooms,
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
    roomSearchTerm,
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
            setFilteredRooms((prev) =>
              prev.filter((r) => r.idRoom !== confirmId)
            );
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
    // Add other refetch functions if needed
  };

  return (
    <div className="flex flex-col min-h-screen p-4 gap-6 dark:bg-gray-800">
      <div className="flex gap-4 mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="p-2 border dark:border-white rounded dark:bg-gray-800 dark:text-gray-200"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {new Date(0, month - 1).toLocaleString("pt-BR", {
                month: "long",
              })}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="p-2 border dark:border-white rounded dark:bg-gray-800 dark:text-gray-200"
        >
          {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map(
            (year) => (
              <option key={year} value={year}>
                {year}
              </option>
            )
          )}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow flex flex-col items-center">
          <h3 className="text-md font-semibold">Estudantes por Turma</h3>
          <p className="text-2xl font-bold">
            {studentsPerClass.reduce((sum, cls) => sum + cls.studentCount, 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow flex flex-col items-center">
          <h3 className="text-md font-semibold">Disciplinas por Curso</h3>
          <p className="text-2xl font-bold">
            {subjectsPerCourse.reduce(
              (sum, course) => sum + course.subjectCount,
              0
            )}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow flex flex-col items-center">
          <h3 className="text-md font-semibold">Quantidade de Cursos</h3>
          <p className="text-2xl font-bold">{courses?.length || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow flex flex-col items-center">
          <h3 className="text-md font-semibold">Quantidade de Professores</h3>
          <p className="text-2xl font-bold">{filteredTeachers.length}</p>
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
      <div className="bg-white dark:bg-gray-900 px-3 md:px-0 rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler
          isLoading={isLoading}
          error={error}
          onRetry={refetchData}
        >
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Email</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.idTeacher}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {teacher.idTeacher}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(teacher.name, 25)}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(teacher.email, 25)}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openDelete(teacher.idTeacher, "teacher")}
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
                    colSpan={4}
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

      {/* Rooms Table */}
      <SearchFilterBar
        title="Salas"
        searchTerm={roomSearchTerm}
        setSearchTerm={setRoomSearchTerm}
        filterType=""
        setFilterType={() => {}} // No filter for rooms (adjust if needed)
        filterOptions={[]}
        isFilterOpen={isRoomFilterOpen}
        toggleFilterDropdown={() => setIsRoomFilterOpen((o) => !o)}
        closeFilterDropdown={() => setIsRoomFilterOpen(false)}
      />
      <div className="bg-white dark:bg-gray-900 px-3 md:px-0 rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler
          isLoading={isLoading}
          error={error}
          onRetry={refetchData}
        >
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
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <tr
                    key={room.idRoom}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {room.idRoom}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(room.name, 25, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {room.status ? "Ativo" : "Inativo"}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openDelete(room.idRoom, "room")}
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
                    colSpan={4}
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    Nenhuma sala encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

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
