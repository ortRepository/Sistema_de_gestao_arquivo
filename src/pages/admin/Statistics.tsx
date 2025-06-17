import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import SearchFilterBar from "@/components/common/SearchBar";
import { ClassData, CourseData, Teacher } from "@/types/interfaces";

const fetchData = async () => {
  // Mock data - replace with actual API calls
  const teachers: Teacher[] = [
    {
      id: 1,
      name: "João Silva",
      email: "joao@school.com",
      gender: "Masculino",
      phoneNumber: "123456789",
      createdIn: "2025-06-01",
      licenseExpirationDate: "2026-01-01",
      subjects: [{ id: 1, name: "Matemática", course: "Ciências Exatas" }],
      role: "Professor",
      curso: "Ciências Exatas",
      photo: "",
    },
  ];

  const classes: ClassData[] = [
    { id: 1, turma: "Turma A", diretorDeTurma: "João Silva", sala: 101 },
  ];

  const courses: CourseData[] = [
    {
      id: 1,
      nome: "Ciências Exatas",
      coordenadorDoCurso: "Ana Costa",
      disciplinas: ["Matemática", "Física"],
    },
  ];

  return { teachers, classes, courses };
};

// Utility function to truncate text
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

// Utility function to filter data by month and year
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
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Search and filter states for Teachers table
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [teacherFilterType, setTeacherFilterType] = useState("");
  const [isTeacherFilterOpen, setIsTeacherFilterOpen] = useState(false);

  // Filter options for Teachers
  const teacherFilterOptions = [
    { value: "", label: "Todos" },
    { value: "Professor", label: "Professor" },
    { value: "Coordenador", label: "Coordenador" },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchData();
        setTeachers(data.teachers);
        setClasses(data.classes);
        setCourses(data.courses);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load data"));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Apply month/year filter and search/filter for Teachers
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
          teacher.email.toLowerCase().includes(teacherSearchTerm.toLowerCase())
      );
    }
    if (teacherFilterType) {
      updatedTeachers = updatedTeachers.filter(
        (teacher) => teacher.role === teacherFilterType
      );
    }
    setFilteredTeachers(updatedTeachers);
  }, [
    teachers,
    selectedMonth,
    selectedYear,
    teacherSearchTerm,
    teacherFilterType,
  ]);

  // Calculate statistics
  const studentsPerClass = classes.map((cls) => ({
    ...cls,
    studentCount: 0, // Set to 0 since student data is removed
  }));

  const subjectsPerCourse = courses.map((course) => ({
    ...course,
    subjectCount: course.disciplinas.length,
  }));

  const openEditTeacher = (teacher: Teacher) => {
    console.log("Edit teacher:", teacher);
  };

  const openDeleteTeacher = (id: number) => {
    console.log("Delete teacher:", id);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 gap-6">
      {/* Month/Year Filter */}
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

      {/* Statistics Cards */}
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
          <p className="text-2xl font-bold">{courses.length}</p>
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
        <table className="w-full text-left text-xs md:text-sm border-collapse">
          <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
            <tr>
              <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
              <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome</th>
              <th className="py-3 px-2 md:px-4 whitespace-nowrap">Email</th>
              <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                Disciplinas
              </th>
              <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-center">
                  Carregando...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-center text-red-500">
                  Erro: {error.message}
                </td>
              </tr>
            ) : filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                >
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {teacher.id}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {truncateText(teacher.name, 25)}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {truncateText(teacher.email, 25)}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {teacher.subjects.map((s) => s.name).join(", ")}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => openEditTeacher(teacher)}
                      className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                    >
                      <Pencil size={16} className="text-green-600" />
                    </button>
                    <button
                      onClick={() => openDeleteTeacher(teacher.id)}
                      className="p-2 cursor-pointer bg-red-50 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-center text-gray-500">
                  Nenhum professor encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
