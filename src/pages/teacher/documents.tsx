import { useState, useEffect, useMemo } from "react";
import {
  MoreHorizontal,
  FileText,
  Download,
  Eye,
  Send as SendIcon,
  Trash,
  Plus,
} from "lucide-react";
import { jsPDF } from "jspdf";
import SearchFilterBar from "@/components/common/SearchBar";
import { SendDocumentModal } from "@/components/modals/teacher/SendDocumentsModaalTeste";
import ComponentButton from "@/components/common/button";
import { AddDocumentModal } from "@/components/modals/teacher/AddDocumentModa";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ViewDocumentModal from "@/components/modals/teacher/ViewDocumentModal";
import {
  useListDocuments,
  useListClasses,
  useListCourses,
  useListSubjects,
  useListStudents,
  useListTeachers,
  useListRooms,
  useDeleteDocument,
} from "@/hooks/DynamicApiHooks";
import {
  Document,
  Class,
  Course,
  Subject,
  Student,
  Teacher,
  Room,
} from "@/types/interfaces";

interface DocumentItem {
  id: number;
  description: string;
  urlLink: string;
  path: string;
  status: boolean;
  createdIn: string;
  updatedIn: string;
  className: string;
  subjectName: string;
  courseName: string;
  studentName: string;
  teacherName: string;
  roomName: string;
  category: string;
}

export default function AcademicDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("description");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedViewDocument, setSelectedViewDocument] =
    useState<DocumentItem | null>(null);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(
    null
  );
  const [confirmDocumentId, setConfirmDocumentId] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const { data: apiDocuments } = useListDocuments();
  const { data: classes } = useListClasses();
  const { data: courses } = useListCourses();
  const { data: subjects } = useListSubjects();
  const { data: students } = useListStudents();
  const { data: teachers } = useListTeachers();
  const { data: rooms } = useListRooms();
  const { mutateAsync: deleteDocument } = useDeleteDocument();

  const mappedDocuments: DocumentItem[] = useMemo(() => {
    if (!apiDocuments) return [];
    return apiDocuments.map((doc: Document) => ({
      id: doc.idDocument,
      description: doc.description,
      urlLink: doc.urlLink,
      path: doc.path,
      status: doc.status,
      createdIn: new Date(doc.createdIn).toLocaleDateString("pt-BR"),
      updatedIn: new Date(doc.updatedIn).toLocaleDateString("pt-BR"),
      className:
        classes?.find((c: Class) => c.idClass === doc.idClass)?.name || "N/A",
      subjectName:
        subjects?.find((s: Subject) => s.idSubject === doc.idSubject)?.name ||
        "N/A",
      courseName:
        courses?.find((c: Course) => c.idCourse === doc.idCourse)?.name ||
        "N/A",
      studentName:
        students?.find((s: Student) => s.idStudent === doc.idStudent)?.name ||
        "N/A",
      teacherName:
        teachers?.find((t: Teacher) => t.idTeacher === doc.idTeacher)?.name ||
        "N/A",
      roomName:
        rooms?.find((r: Room) => r.idRoom === doc.idRoom)?.name || "N/A",
      category:
        subjects?.find((s: Subject) => s.idSubject === doc.idSubject)?.name ||
        "Documento Geral",
    }));
  }, [apiDocuments, classes, courses, subjects, students, teachers, rooms]);

  useEffect(() => {
    setDocuments(mappedDocuments);
  }, [mappedDocuments]);

  const filterOptions = [
    { value: "description", label: "Descrição" },
    { value: "subjectName", label: "Disciplina" },
    { value: "courseName", label: "Curso" },
    { value: "className", label: "Turma" },
    { value: "teacherName", label: "Professor" },
    { value: "createdIn", label: "Data de Criação" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return documents.filter((doc) => {
      switch (filterType) {
        case "description":
          return doc.description.toLowerCase().includes(term);
        case "subjectName":
          return doc.subjectName.toLowerCase().includes(term);
        case "courseName":
          return doc.courseName.toLowerCase().includes(term);
        case "className":
          return doc.className.toLowerCase().includes(term);
        case "teacherName":
          return doc.teacherName.toLowerCase().includes(term);
        case "createdIn":
          return doc.createdIn.toLowerCase().includes(term);
        default:
          return (
            doc.description.toLowerCase().includes(term) ||
            doc.subjectName.toLowerCase().includes(term) ||
            doc.courseName.toLowerCase().includes(term) ||
            doc.className.toLowerCase().includes(term) ||
            doc.teacherName.toLowerCase().includes(term) ||
            doc.createdIn.toLowerCase().includes(term)
          );
      }
    });
  }, [documents, searchTerm, filterType]);

  const handleDownload = (id: number) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const red: [number, number, number] = [200, 0, 0];
    const black: [number, number, number] = [0, 0, 0];
    const yellow: [number, number, number] = [255, 204, 0];

    pdf.setFillColor(...black);
    pdf.rect(0, 0, 210, 50, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("times", "bold");
    pdf.setFontSize(16);
    pdf.text("GOVERNO DE ANGOLA", 105, 15, { align: "center" });
    pdf.setFontSize(14);
    pdf.text("MINISTÉRIO DA EDUCAÇÃO", 105, 25, { align: "center" });
    pdf.setFontSize(12);
    pdf.text("INSTITUTO POLITÉCNICO 30 DE SETEMBRO", 105, 35, {
      align: "center",
    });

    pdf.setFillColor(...yellow);
    pdf.setDrawColor(...red);
    pdf.setLineWidth(1);
    pdf.circle(105, 70, 20, "FD");
    pdf.setTextColor(...black);
    pdf.setFontSize(18);
    pdf.setFont("times", "bold");
    pdf.text("IP30S", 105, 73, { align: "center" });

    pdf.setTextColor(...black);
    pdf.setFontSize(16);
    pdf.setFont("times", "bold");
    pdf.text(doc.description.toUpperCase(), 105, 100, { align: "center" });

    pdf.setDrawColor(...red);
    pdf.setLineWidth(0.5);
    pdf.rect(20, 110, 170, 120, "S");

    pdf.setFont("times", "bold");
    pdf.setFontSize(14);
    pdf.text("DETALHES DO DOCUMENTO", 25, 120);

    pdf.setFont("times", "normal");
    pdf.setFontSize(12);
    const details = [
      { label: "Descrição:", value: doc.description },
      { label: "Categoria:", value: doc.category },
      { label: "Disciplina:", value: doc.subjectName },
      { label: "Curso:", value: doc.courseName },
      { label: "Turma:", value: doc.className },
      { label: "Professor:", value: doc.teacherName },
      { label: "Estudante:", value: doc.studentName },
      { label: "Sala:", value: doc.roomName },
      { label: "Status:", value: doc.status ? "Ativo" : "Inativo" },
      { label: "Data de Criação:", value: doc.createdIn },
      { label: "Data de Atualização:", value: doc.updatedIn },
    ];

    details.forEach((item, index) => {
      pdf.setFont("times", "bold");
      pdf.text(item.label, 25, 130 + index * 10);
      pdf.setFont("times", "normal");
      pdf.text(item.value, 60, 130 + index * 10);
    });

    pdf.setDrawColor(...yellow);
    pdf.setLineWidth(0.3);
    pdf.line(20, 235, 190, 235);

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("times", "italic");
    pdf.text(
      `Gerado em: ${new Date().toLocaleDateString(
        "pt-BR"
      )} às ${new Date().toLocaleTimeString("pt-BR")}`,
      20,
      280
    );
    pdf.text("Instituto Politécnico 30 de Setembro", 190, 280, {
      align: "right",
    });

    pdf.save(`${doc.description}.pdf`);
    setOpenMenuId(null);
  };

  const handleView = (id: number) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      setSelectedViewDocument(doc);
      setViewModalOpen(true);
      setOpenMenuId(null);
    }
  };

  const openConfirm = (id: number) => {
    setConfirmDocumentId(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (confirmDocumentId === null) return;

    deleteDocument(
      { idDocument: confirmDocumentId },
      {
        onSuccess: () => {
          setDocuments((prev) =>
            prev.filter((d) => d.id !== confirmDocumentId)
          );
          setOpenMenuId(null);
          setDeleteModalOpen(false);
          setError(null);
        },
        onError: (error: any) => {
          setError(error.message || "Erro ao excluir documento");
          setDeleteModalOpen(false);
        },
      }
    );
  };

  const handleSend = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setSendModalOpen(true);
    setOpenMenuId(null);
  };

  const onSendSuccess = () => {
    console.log(`Documento ${selectedDocument?.id} enviado!`);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setConfirmDocumentId(null);
    setError(null);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8 dark:bg-gray-800">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <SearchFilterBar
          title="Documentos acadêmicos"
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
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={16} /> Adicionar Documento
          </ComponentButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.length > 0 ? (
            filtered.map((doc) => (
              <div
                key={doc.id}
                className="relative bg-white dark:bg-gray-900 p-4 rounded-lg shadow hover:shadow-md"
              >
                <FileText size={48} className="text-[#4D6BFE] mb-2" />
                <h3 className="font-semibold">{doc.description}</h3>
                <p className="text-sm text-gray-500">
                  Categoria: {doc.category}
                </p>
                <p className="text-sm text-gray-500">
                  Professor: {doc.teacherName}
                </p>
                <p className="text-xs text-gray-400">{doc.createdIn}</p>

                <div className="absolute top-2 right-2">
                  <MoreHorizontal
                    size={16}
                    className="text-gray-400 cursor-pointer"
                    onClick={() =>
                      setOpenMenuId(openMenuId === doc.id ? null : doc.id)
                    }
                  />
                  {openMenuId === doc.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded shadow-lg z-10">
                      <button
                        onClick={() => {
                          handleDownload(doc.id);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center cursor-pointer gap-2 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Download size={16} /> Baixar
                      </button>
                      <button
                        onClick={() => {
                          handleView(doc.id);
                          setOpenMenuId(null);
                        }}
                        className="flex items-center cursor-pointer gap-2 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Eye size={16} /> Visualizar
                      </button>
                      <button
                        onClick={() => handleSend(doc)}
                        className="flex items-center gap-2 cursor-pointer w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <SendIcon size={16} /> Enviar
                      </button>
                      <button
                        onClick={() => openConfirm(doc.id)}
                        className="flex items-center gap-2 w-full cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                      >
                        <Trash size={16} /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
         <div className="col-span-full flex justify-center items-center min-h-[200px]">
              <p className="py-6 px-4 text-center text-gray-500">
                Nenhum documento encontrado.
              </p>
            </div>
          )}
        </div>

        <SendDocumentModal
          isOpen={sendModalOpen}
          onClose={() => setSendModalOpen(false)}
          document={selectedDocument}
          onSendSuccess={onSendSuccess}
        />
        <AddDocumentModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
        />
        <ViewDocumentModal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedViewDocument(null);
          }}
          document={selectedViewDocument}
        />
        <DeletePublicationModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          title="Excluir Documento"
          message="Tem certeza que deseja excluir este documento?"
          confirmText="Excluir"
          cancelText="Cancelar"
        />
      </div>
    </div>
  );
}
