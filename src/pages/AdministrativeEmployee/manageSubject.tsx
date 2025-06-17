import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import { truncateText } from "@/lib/utils";
import ModalManageSubject from "@/components/modals/modalEmployee/ModalManageSubject";


interface Subject {
  id: number;
  name: string;
  course: string;
}

const staticSubjects: Subject[] = [
  { id: 1, name: "Matemática", course: "Informática" },
  { id: 2, name: "Programação", course: "Informática" },
  { id: 3, name: "Física", course: "Engenharia" },
  { id: 4, name: "Química", course: "Engenharia" },
  { id: 5, name: "Banco de Dados", course: "Informática" },
  { id: 6, name: "Literatura", course: "Letras" },
  { id: 7, name: "História", course: "História" },
  { id: 8, name: "Redes de Computadores", course: "Informática" },
];

export default function PageManageSubject() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [confirmSubjectId, setConfirmSubjectId] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>(staticSubjects);

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "id", label: "Id" },
    { value: "name", label: "Nome da Disciplina" },
    { value: "course", label: "Curso" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return subjects.filter((subject) => {
      switch (filterType) {
        case "id":
          return subject.id.toString().includes(term);
        case "name":
          return subject.name.toLowerCase().includes(term);
        case "course":
          return subject.course.toLowerCase().includes(term);
        default:
          return (
            subject.id.toString().includes(term) ||
            subject.name.toLowerCase().includes(term) ||
            subject.course.toLowerCase().includes(term)
          );
      }
    });
  }, [subjects, searchTerm, filterType]);

  const openCreate = () => {
    setSelectedSubject(null);
    setIsModalOpen(true);
  };

  const openEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const openConfirm = (id: number) => setConfirmSubjectId(id);

  const closeConfirm = () => setConfirmSubjectId(null);

  const handleDelete = () => {
    if (confirmSubjectId !== null) {
      setSubjects((prev) => prev.filter((s) => s.id !== confirmSubjectId));
      closeConfirm();
    }
  };

  const handleSave = (subject: Subject) => {
    if (selectedSubject) {
      // Update existing subject
      setSubjects((prev) =>
        prev.map((s) => (s.id === subject.id ? subject : s))
      );
    } else {
      // Add new subject
      setSubjects((prev) => [...prev, { ...subject, id: prev.length + 1 }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir Disciplinas"
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
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome da Disciplina</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Curso</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((subject: Subject) => (
                  <tr
                    key={subject.id}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {subject.id}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(subject.name, 25, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {truncateText(subject.course, 25, "end")}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openEdit(subject)}
                        className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => openConfirm(subject.id)}
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
                    Nenhuma disciplina encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <ModalManageSubject
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subjectData={selectedSubject}
        onSave={handleSave}
      />

      <DeletePublicationModal
        isOpen={confirmSubjectId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir disciplina"
        message="Tem certeza que deseja excluir esta disciplina?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}