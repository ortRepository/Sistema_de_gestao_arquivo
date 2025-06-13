import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, Eye, RefreshCw, User } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";
import { Teacher, Subject } from "@/types/interfaces";
import ModalRegisterTeacher from "@/components/modals/modalEmployee/ModalRegisterTeacher";
import ModalViewTeacher from "@/components/modals/modalEmployee/ModalViewTeacher";
import ModalRenewLicense from "@/components/modals/modalEmployee/ModalRenewLicense";

// Local static subjects
const localSubjects: Subject[] = [
  { id: 1, name: "Matemática", course: "Ciências Exatas" },
  { id: 2, name: "Programação", course: "Tecnologia" },
  { id: 3, name: "Física", course: "Ciências Exatas" },
  { id: 4, name: "Química", course: "Ciências Exatas" },
  { id: 5, name: "Literatura", course: "Humanidades" },
  { id: 6, name: "História", course: "Humanidades" },
];

// Local static teachers (updated with photo URLs)
const initialTeachers: Teacher[] = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana.silva@email.com",
    gender: "Feminino",
    phoneNumber: "+244912345678",
    createdIn: new Date("2024-01-01").toISOString(),
    subjects: [localSubjects[0], localSubjects[2]],
    role: "Professor",
    curso: "Ciências Exatas",
    licenseExpirationDate: new Date("2025-12-31").toISOString(),
    photo:"",
  },
  {
    id: 2,
    name: "João Pedro",
    email: "joao.pedro@email.com",
    gender: "Masculino",
    phoneNumber: "+244923456789",
    createdIn: new Date("2024-02-01").toISOString(),
    subjects: [localSubjects[1]],
    role: "Coordenador",
    curso: "Tecnologia",
    licenseExpirationDate: new Date("2025-06-30").toISOString(),
    photo: "",
  },
];

export default function PageRegisTerteacher() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState<boolean>(false);

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [confirmTeacherId, setConfirmTeacherId] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);

  // Mock API hooks
  const isLoading = false;
  const error = null;
  const refetch = () => {};
  const deleteTeacher = ({ id }: { id: number }) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "id", label: "Id" },
    { value: "name", label: "Nome" },
    { value: "email", label: "Email" },
    { value: "curso", label: "Curso" },
    { value: "role", label: "Função" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return teachers.filter((teacher) => {
      switch (filterType) {
        case "id":
          return teacher.id.toString().includes(term);
        case "name":
          return teacher.name.toLowerCase().includes(term);
        case "email":
          return teacher.email.toLowerCase().includes(term);
        case "curso":
          return teacher.curso.toLowerCase().includes(term);
        case "role":
          return teacher.role.toLowerCase().includes(term);
        default:
          return (
            teacher.id.toString().includes(term) ||
            teacher.name.toLowerCase().includes(term) ||
            teacher.email.toLowerCase().includes(term) ||
            teacher.curso.toLowerCase().includes(term) ||
            teacher.role.toLowerCase().includes(term)
          );
      }
    });
  }, [teachers, searchTerm, filterType]);

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

  const openRenew = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsRenewModalOpen(true);
  };

  const openConfirm = (id: number) => setConfirmTeacherId(id);
  const closeConfirm = () => setConfirmTeacherId(null);

  const handleDelete = () => {
    if (confirmTeacherId !== null) {
      deleteTeacher({ id: confirmTeacherId });
      closeConfirm();
    }
  };

  const handleSave = (teacher: Teacher) => {
    if (selectedTeacher) {
      // Update existing teacher
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacher.id ? teacher : t))
      );
    } else {
      // Add new teacher
      setTeachers((prev) => [...prev, { ...teacher, id: prev.length + 1 }]);
    }
    setIsModalOpen(false);
    setIsRenewModalOpen(false);
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
          className="flex items-center gap-2"
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
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Email</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Curso</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Função</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Expiração da Licença
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((teacher: Teacher) => (
                  <tr
                    key={teacher.id}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {teacher.photo ? (
                        <img
                          src={teacher.photo}
                          alt={teacher.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            // se der erro no carregamento, remove src pra cair no fallback do ícone
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
                      {teacher.id}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(teacher.name, 20, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(teacher.email, 20, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(teacher.curso, 20, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {teacher.role}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {new Date(
                        teacher.licenseExpirationDate
                      ).toLocaleDateString()}
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
                        onClick={() => openRenew(teacher)}
                        className="p-2 cursor-pointer bg-yellow-50 hover:bg-yellow-100 rounded"
                      >
                        <RefreshCw size={16} className="text-yellow-600" />
                      </button>
                      <button
                        onClick={() => openConfirm(teacher.id)}
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
                    colSpan={8}
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
        subjects={localSubjects}
      />

      <ModalViewTeacher
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        teacherData={selectedTeacher}
      />

      <ModalRenewLicense
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        teacherData={selectedTeacher}
        onSave={handleSave}
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
