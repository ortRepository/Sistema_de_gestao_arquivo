import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, User } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import ModalStudent from "@/components/modals/modalEmployee/ModalStudent";
import {
  useDeleteStudent,
  useListStudents,
  useListClasses,
  useListRooms,
} from "@/hooks/DynamicApiHooks";
import { Student } from "@/types/interfaces";
interface DisplayStudent {
  id: number;
  name: string;
  biNumber: string;
  room: string;
  classGroup: string;
  course: string;
  birthDate: string;
  photo: string;
  createdIn: string;
  updatedIn: string; // Comma added
  status: boolean;
}

export default function PageRegisterStudent() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [confirmStudentId, setConfirmStudentId] = useState<number | null>(null);

  // Fetch data
  const { data: apiStudents, isLoading, error, refetch } = useListStudents();
  const { data: classes } = useListClasses();
  const { data: rooms } = useListRooms();

  // Delete student hook
  const { mutate: deleteStudent } = useDeleteStudent();

  // Course mapping (placeholder, replace with actual course data)
  const courseMap: { [key: number]: string } = {
    1: "Informática",
    2: "Gestão",
    3: "Eletrónica",
  };

  // Map API students to display format
  const students: DisplayStudent[] = useMemo(() => {
    if (!apiStudents) return [];
    return apiStudents.map((student: Student) => {
      const cls = classes?.find((c) => c.idClass === student.idClass);
      const room = rooms?.find((r) => r.name === student.room);
      return {
        id: student.idStudent,
        name: student.name,
        biNumber: student.biNumber,
        room: student.room,
        classGroup: student.plainToClassFromExist || cls?.name || "N/A",
        course: courseMap[room?.idCourse || 0] || "N/A",
        birthDate: student.dateOfBirth,
        photo: student.photo,
        createdIn: student.createdIn,
        updatedIn: student.updatedIn,
        status: student.status,
      };
    });
  }, [apiStudents, classes, rooms]);

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "id", label: "Id" },
    { value: "name", label: "Nome" },
    { value: "biNumber", label: "Número do BI" },
    { value: "room", label: "Sala" },
    { value: "classGroup", label: "Turma" },
    { value: "course", label: "Curso" },
    { value: "birthDate", label: "Data de Nascimento" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return students.filter((student, idx) => {
      switch (filterType) {
        case "id":
          return String(idx + 1).includes(searchTerm);
        case "name":
          return student.name.toLowerCase().includes(term);
        case "biNumber":
          return student.biNumber.toLowerCase().includes(term);
        case "room":
          return student.room.toLowerCase().includes(term);
        case "classGroup":
          return student.classGroup.toLowerCase().includes(term);
        case "course":
          return student.course.toLowerCase().includes(term);
        case "birthDate":
          return student.birthDate.toLowerCase().includes(term);
        default:
          return (
            String(idx + 1).includes(searchTerm) ||
            student.name.toLowerCase().includes(term) ||
            student.biNumber.toLowerCase().includes(term) ||
            student.room.toLowerCase().includes(term) ||
            student.classGroup.toLowerCase().includes(term) ||
            student.course.toLowerCase().includes(term) ||
            student.birthDate.toLowerCase().includes(term)
          );
      }
    });
  }, [students, searchTerm, filterType]);

  const openCreate = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const openEdit = (student: DisplayStudent) => {
    const apiStudent: Student = {
      idStudent: student.id,
      name: student.name,
      biNumber: student.biNumber,
      room: student.room,
      plainToClassFromExist: student.classGroup,
      dateOfBirth: student.birthDate,
      photo: student.photo,
      createdIn: "", // Placeholder, typically from API
      updatedIn: "", // Placeholder, typically from API
      status: student.status, // Assume active unless API provides
      idClass:
        classes?.find((c) => c.name === student.classGroup)?.idClass || 0,
    };
    setSelectedStudent(apiStudent);
    setIsModalOpen(true);
  };

  const openConfirm = (id: number) => setConfirmStudentId(id);

  const closeConfirm = () => setConfirmStudentId(null);

  const handleDelete = () => {
    if (confirmStudentId !== null) {
      deleteStudent({ idStudent: confirmStudentId });
      closeConfirm();
    }
  };

  const handleSave = (_student: Student) => {
    // const displayStudent: DisplayStudent = {
    //   id: student.idStudent,
    //   name: student.name,
    //   biNumber: student.biNumber,
    //   room: student.room,
    //   classGroup:
    //     student.plainToClassFromExist ||
    //     classes?.find((c) => c.idClass === student.idClass)?.name ||
    //     "N/A",
    //   course:
    //     courseMap[rooms?.find((r) => r.name === student.room)?.idCourse || 0] ||
    //     "N/A",
    //   birthDate: student.dateOfBirth,
    //   photo: student.photo,
    //   createdIn: student.createdIn,
    //   updatedIn: student.updatedIn,
    //   status: student.status,
    // };
    refetch();
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Cadastrar alunos"
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
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Foto</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Nome Completo
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Número do BI
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Sala</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Turma</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Curso</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Data de Nascimento
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((student: DisplayStudent, idx) => (
                  <tr
                    key={student.id}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={20} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {student.biNumber}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {student.room}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {student.classGroup}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {student.course}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {new Date(student.birthDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openEdit(student)}
                        className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => openConfirm(student.id)}
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
                    colSpan={9}
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <ModalStudent
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        onSave={handleSave}
      />

      <DeletePublicationModal
        isOpen={confirmStudentId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir aluno"
        message="Tem certeza que deseja excluir este aluno?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
