import { useState, useEffect, useMemo } from "react";
import {
  MoreHorizontal,
  FileText,
  Download,
  Eye,
  Trash,
  Plus,
} from "lucide-react";
import { jsPDF } from "jspdf";
import SearchFilterBar from "@/components/common/SearchBar";

import ComponentButton from "@/components/common/button";
import { AddDocumentModal } from "@/components/modals/teacher/AddDocumentModa";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ViewDocumentModal from "@/components/modals/teacher/ViewDocumentModal";
import { useListDocuments, useDeleteDocument } from "@/hooks/DynamicApiHooks";
import { Document } from "@/types/interfaces";
import logo from "../../assets/logo/Logo.png";
import { truncateText } from "@/lib/utils";

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
  title: string;
  entityName: string;
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

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [confirmDocumentId, setConfirmDocumentId] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const {
    data: apiDocuments,
    isLoading: documentsLoading,
    error: documentsError,
  } = useListDocuments();
  const { mutateAsync: deleteDocument } = useDeleteDocument();

  useEffect(() => {
    console.log("apiDocuments:", apiDocuments);
    console.log("documentsLoading:", documentsLoading);
    console.log("documentsError:", documentsError);
  }, [apiDocuments, documentsLoading, documentsError]);

  const mappedDocuments: DocumentItem[] = useMemo(() => {
    if (!apiDocuments) return [];

    return apiDocuments.map((doc: Document) => {
      let title = "Documento Geral";
      let entityName = "N/A";
      let className = "N/A";
      let studentName = "N/A";
      let teacherName = "N/A";
      let roomName = "N/A";
      let courseName = "N/A";
      let subjectName = "N/A";
      let category = "Documento Geral";

      if (doc.idSubject && doc.subject) {
        title = `Documento da Disciplina - ${
          doc.subject.name || "Disciplina Geral"
        }`;
        entityName = doc.subject.name || "N/A";
        subjectName = doc.subject.name || "N/A";
        category = doc.subject.name || "Documento Geral";
      } else if (doc.idCourse && doc.course) {
        title = `Documento do Curso - ${doc.course.name || "Curso Geral"}`;
        entityName = doc.course.name || "N/A";
        courseName = doc.course.name || "N/A";
      } else if (doc.idClass && doc.class) {
        title = `Documento da Turma - ${doc.class.name || "Turma Geral"}`;
        entityName = doc.class.name || "N/A";
        className = doc.class.name || "N/A";
      } else if (doc.idStudent && doc.student) {
        title = `Documento do Estudante - ${
          doc.student.name || "Estudante Geral"
        }`;
        entityName = doc.student.name || "N/A";
        studentName = doc.student.name || "N/A";
      } else if (doc.idTeacher && doc.teacher) {
        title = `Documento do Professor - ${
          doc.teacher.name || "Professor Geral"
        }`;
        entityName = doc.teacher.name || "N/A";
        teacherName = doc.teacher.name || "N/A";
      } else if (doc.idRoom && doc.room) {
        title = `Documento da Sala - ${doc.room.name || "Sala Geral"}`;
        entityName = doc.room.name || "N/A";
        roomName = doc.room.name || "N/A";
      }

      return {
        id: doc.idDocument,
        description: doc.description,
        urlLink: doc.urlLink,
        path: doc.path,
        status: doc.status,
        createdIn: new Date(doc.createdIn).toLocaleDateString("pt-BR"),
        updatedIn: doc.updatedIn
          ? new Date(doc.updatedIn).toLocaleDateString("pt-BR")
          : "N/A",
        className,
        subjectName,
        courseName,
        studentName,
        teacherName,
        roomName,
        category,
        title,
        entityName,
      };
    });
  }, [apiDocuments]);

  useEffect(() => {
    setDocuments(mappedDocuments);
  }, [mappedDocuments]);

  const filterOptions = [
    { value: "description", label: "Descrição" },
    { value: "subjectName", label: "Disciplina" },
    { value: "courseName", label: "Curso" },
    { value: "className", label: "Turma" },
    { value: "teacherName", label: "Professor" },
    { value: "studentName", label: "Estudante" },
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
        case "studentName":
          return doc.studentName.toLowerCase().includes(term);
        case "createdIn":
          return doc.createdIn.toLowerCase().includes(term);
        default:
          return (
            doc.description.toLowerCase().includes(term) ||
            doc.subjectName.toLowerCase().includes(term) ||
            doc.courseName.toLowerCase().includes(term) ||
            doc.className.toLowerCase().includes(term) ||
            doc.teacherName.toLowerCase().includes(term) ||
            doc.studentName.toLowerCase().includes(term) ||
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

    const primaryColor: [number, number, number] = [0, 51, 102];
    const secondaryColor: [number, number, number] = [255, 204, 0];
    const textColor: [number, number, number] = [0, 0, 0];
    const accentColor: [number, number, number] = [200, 0, 0];

    // Header
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 50, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("GOVERNO DE ANGOLA", 105, 15, { align: "center" });
    pdf.setFontSize(16);
    pdf.text("MINISTÉRIO DA EDUCAÇÃO", 105, 25, { align: "center" });
    pdf.setFontSize(14);
    pdf.text("INSTITUTO POLITÉCNICO 30 DE SETEMBRO", 105, 35, {
      align: "center",
    });

    // Add Logo
    pdf.addImage(logo, "PNG", 90, 60, 30, 30);

    // Title
    pdf.setTextColor(...textColor);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(doc.title.toUpperCase(), 180);
    pdf.text(titleLines, 105, 95, { align: "center" });

    // Document Details Section
    const startY = 115;
    pdf.setDrawColor(...accentColor);
    pdf.setLineWidth(0.5);
    pdf.rect(15, startY, 180, 150, "S");
    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, startY, 180, 25, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(...primaryColor);
    pdf.text("DETALHES DO DOCUMENTO", 20, startY + 15);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(...textColor);
    const details = [
      { label: "Descrição:", value: doc.description },
      { label: "Categoria:", value: doc.category },
      {
        label: "Disciplina:",
        value: doc.subjectName !== "N/A" ? doc.subjectName : "-",
      },
      {
        label: "Curso:",
        value: doc.courseName !== "N/A" ? doc.courseName : "-",
      },
      { label: "Turma:", value: doc.className !== "N/A" ? doc.className : "-" },
      {
        label: "Professor:",
        value: doc.teacherName !== "N/A" ? doc.teacherName : "-",
      },
      {
        label: "Estudante:",
        value: doc.studentName !== "N/A" ? doc.studentName : "-",
      },
      { label: "Sala:", value: doc.roomName !== "N/A" ? doc.roomName : "-" },
      { label: "Status:", value: doc.status ? "Ativo" : "Inativo" },
      { label: "Data de Criação:", value: doc.createdIn },
    ];

    let currentY = startY + 30;
    details.forEach((item) => {
      const valueLines = pdf.splitTextToSize(item.value, 120); // Limit value width to 120mm
      pdf.setFont("helvetica", "bold");
      pdf.text(item.label, 20, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(valueLines, 60, currentY);
      currentY += valueLines.length * 7 + 5; // Adjust Y based on number of lines
    });

    // Footer
    pdf.setDrawColor(...secondaryColor);
    pdf.setLineWidth(0.3);
    pdf.line(15, 270, 195, 270);
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("helvetica", "italic");
    pdf.text(
      `Gerado em: ${new Date().toLocaleDateString(
        "pt-BR"
      )} às ${new Date().toLocaleTimeString("pt-BR")}`,
      15,
      280
    );
    pdf.addImage(logo, "PNG", 175, 273, 20, 10);
    pdf.text("Instituto Politécnico 30 de Setembro", 170, 280, {
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
        {documentsLoading && (
          <div className="p-8 text-center">Carregando dados...</div>
        )}
        {documentsError && (
          <div className="p-8 text-center text-red-500">
            Erro ao carregar documentos: {documentsError.message}
          </div>
        )}
        {!documentsLoading && !documentsError && (
          <>
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
                className="flex items-center justify-center gap-2 md:w-auto w-full"
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
                    <h3 className="font-semibold">
                      {truncateText(doc.title || "N/A", 35, "end")}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Categoria: {doc.category}
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
          </>
        )}
      </div>
    </div>
  );
}
