import { useState, useEffect } from "react";
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
import ComponetButton from "@/components/common/button";
import { AddDocumentModal } from "@/components/modals/teacher/AddDocumentModa";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ViewDocumentModal from "@/components/modals/teacher/ViewDocumentModal";

interface DocumentItem {
  id: number;
  title: string;
  category: string;
  author: string;
  date: string;
}

const dummyData: DocumentItem[] = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  title: "Plano de Aula - Ciências",
  category: "Plano de Aula",
  author: "Prof. Ana Marta",
  date: new Date().toLocaleDateString("pt-BR"),
}));

export default function AcademicDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Categoria");
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

  useEffect(() => {
    setDocuments(dummyData);
  }, []);

  const filtered = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (id: number) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Colors as tuples
    const red: [number, number, number] = [200, 0, 0];
    const black: [number, number, number] = [0, 0, 0];
    const yellow: [number, number, number] = [255, 204, 0];

    // Header Background
    pdf.setFillColor(...black);
    pdf.rect(0, 0, 210, 50, "F");

    // Header Text
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("times", "bold");
    pdf.setFontSize(16);
    pdf.text("GOVERNO DE ANGOLA", 105, 15, { align: "center" });
    pdf.setFontSize(14);
    pdf.text("MINISTÉRIO DA EDUCAÇÃO", 105, 25, { align: "center" });
    pdf.setFontSize(12);
    pdf.text("INSTITUTO POLITÉCNICO 30 DE SETEMBRO", 105, 35, { align: "center" });

    // Logo Placeholder (Text-based Monogram)
    pdf.setFillColor(...yellow);
    pdf.setDrawColor(...red);
    pdf.setLineWidth(1);
    pdf.circle(105, 70, 20, "FD"); // Circle for logo
    pdf.setTextColor(...black);
    pdf.setFontSize(18);
    pdf.setFont("times", "bold");
    pdf.text("IP30S", 105, 73, { align: "center" }); // Monogram for Instituto Politécnico 30 de Setembro

    // Note: To use a real logo, convert it to base64 or host it online and use:
    // pdf.addImage(logoBase64, "PNG", 85, 50, 40, 40);

    // Document Title
    pdf.setTextColor(...black);
    pdf.setFontSize(16);
    pdf.setFont("times", "bold");
    pdf.text(doc.title.toUpperCase(), 105, 100, { align: "center" });

    // Content Section
    pdf.setDrawColor(...red);
    pdf.setLineWidth(0.5);
    pdf.rect(20, 110, 170, 80, "S"); // Border around details

    pdf.setFont("times", "bold");
    pdf.setFontSize(14);
    pdf.text("DETALHES DO DOCUMENTO", 25, 120);

    pdf.setFont("times", "normal");
    pdf.setFontSize(12);
    const details = [
      { label: "Título:", value: doc.title },
      { label: "Categoria:", value: doc.category },
      { label: "Autor:", value: doc.author },
      { label: "Data:", value: doc.date },
    ];

    details.forEach((item, index) => {
      pdf.setFont("times", "bold");
      pdf.text(item.label, 25, 130 + index * 15);
      pdf.setFont("times", "normal");
      pdf.text(item.value, 50, 130 + index * 15);
    });

    // Decorative Line
    pdf.setDrawColor(...yellow);
    pdf.setLineWidth(0.3);
    pdf.line(20, 195, 190, 195);

    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("times", "italic");
    pdf.text(
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      20,
      280
    );
    pdf.text("Instituto Politécnico 30 de Setembro", 190, 280, { align: "right" });

    // Save the PDF
    pdf.save(`${doc.title}.pdf`);
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
    if (confirmDocumentId !== null) {
      setDocuments((prev) => prev.filter((d) => d.id !== confirmDocumentId));
      setOpenMenuId(null);
      setDeleteModalOpen(false);
    }
  };

  const handleSend = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setSendModalOpen(true);
    setOpenMenuId(null);
  };

  const onSendSuccess = () => {
    console.log(`Documento ${selectedDocument?.id} enviado!`);
  };

  const onAddSuccess = (newDoc: {
    name: string;
    file: File;
    category: string;
    classDest: string;
    year: Date;
  }) => {
    const nextId = documents.length
      ? Math.max(...documents.map((d) => d.id)) + 1
      : 1;
    setDocuments((prev) => [
      {
        id: nextId,
        title: newDoc.name,
        category: newDoc.category,
        author: "Você",
        date: newDoc.year.toLocaleDateString("pt-BR"),
      },
      ...prev,
    ]);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8  dark:bg-gray-800">
        <SearchFilterBar
          title="Documentos acadêmicos"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterOptions={[
            { value: "Categoria", label: "Categoria" },
            { value: "Ano Letivo", label: "Ano Letivo" },
            { value: "Turma", label: "Turma" },
            { value: "Disciplina", label: "Disciplina" },
            { value: "Data de envio", label: "Data de envio" },
          ]}
          isFilterOpen={isFilterOpen}
          toggleFilterDropdown={() => setIsFilterOpen((o) => !o)}
          closeFilterDropdown={() => setIsFilterOpen(false)}
        />

        <div className="md:flex md:justify-end mb-4">
          <ComponetButton
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={16} /> Adicionar Documento
          </ComponetButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="relative bg-white dark:bg-gray-900 p-4 rounded-lg shadow hover:shadow-md"
            >
              <FileText size={48} className="text-[#4D6BFE] mb-2" />
              <h3 className="font-semibold">{doc.title}</h3>
              <p className="text-sm text-gray-500">Categoria: {doc.category}</p>
              <p className="text-sm text-gray-500">Autor: {doc.author}</p>
              <p className="text-xs text-gray-400">{doc.date}</p>

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
          ))}
        </div>

        {/* Modais */}
        <SendDocumentModal
          isOpen={sendModalOpen}
          onClose={() => setSendModalOpen(false)}
          document={selectedDocument}
          onSendSuccess={onSendSuccess}
        />
        <AddDocumentModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onAddSuccess={onAddSuccess}
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