import { useState, useEffect } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, MoreHorizontal, Eye } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { Section } from "@/types/interfaces";

import {
  useGetSections,
  useDeleteSection,
  useGetDirections, // import hook
} from "@/hooks/DynamicApiHooks";
import SectionModal from "@/components/modals/admin/SessionModal";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import ViewSectionModal from "@/components/modals/admin/ViewSessionModal";

export default function ManageSectionsScreen() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [viewSection, setViewSection] = useState<Section | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isViewOpen, setIsViewOpen] = useState<boolean>(false);

  const {
    data: apiSections,
    isLoading: loadingSections,
    error: errorSections,
    refetch: refetchSections,
  } = useGetSections();
  const {
    data: directions = [],
    isLoading: loadingDirections,
    error: errorDirections,
    refetch: refetchDirections,
  } = useGetDirections();

  const { mutate: deleteSection } = useDeleteSection();

  useEffect(() => {
    if (apiSections) setSections(apiSections);
  }, [apiSections]);

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "idSection", label: "ID" },
    { value: "name", label: "Nome" },
    { value: "sectionNumber", label: "Número" },
    { value: "description", label: "Descrição" },
  ];

  const filtered = sections.filter((sec, idx) => {
    const term = searchTerm.toLowerCase();
    switch (filterType) {
      case "idSection":
        return (idx + 1).toString().includes(term);
      case "name":
        return sec.name.toLowerCase().includes(term);
      case "sectionNumber":
        return sec.sectionNumber.toString().includes(term);
      case "description":
        return sec.description.toLowerCase().includes(term);
      default:
        return (
          sec.idSection.toString().includes(term) ||
          sec.name.toLowerCase().includes(term) ||
          sec.sectionNumber.toString().includes(term) ||
          sec.description.toLowerCase().includes(term)
        );
    }
  });

  const toggleMenu = (id: number) =>
    setOpenMenuId((prev) => (prev === id ? null : id));
  const openCreate = () => {
    setSelectedSection(null);
    setIsModalOpen(true);
  };
  const openEdit = (sec: Section) => {
    setSelectedSection(sec);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };
  const handleView = (sec: Section) => {
    setViewSection(sec);
    setIsViewOpen(true);
    setOpenMenuId(null);
  };
  const openConfirm = (id: number) => setConfirmId(id);
  const closeConfirm = () => setConfirmId(null);

  const handleDelete = () => {
    if (confirmId !== null) {
      deleteSection(
        { idSection: confirmId },
        {
          onSuccess: () => {
            refetchSections();
            closeConfirm();
          },
        }
      );
    }
  };

  const handleSave = (_sec: Section) => {
    // if (sec.idSection && sections.some((s) => s.idSection === sec.idSection)) {
    //   updateSection(sec, {
    //     onSuccess: () => {
    //       refetchSections();
    //       setIsModalOpen(false);
    //     },
    //   });
    // } else {
    //   createSection(sec, {
    //     onSuccess: () => {
    //       refetchSections();
    //       setIsModalOpen(false);
    //     },
    //   });
    // }
  };

  // Helper to get direction name
  const getDirectionName = (id: number) => {
    const dir = directions.find((d) => d.idDirection === id);
    return dir ? dir.name : String(id);
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir Seções"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterOptions={filterOptions}
        isFilterOpen={isFilterOpen}
        toggleFilterDropdown={() => setIsFilterOpen((o) => !o)}
        closeFilterDropdown={() => setIsFilterOpen(false)}
      />

      <div className="flex justify-end mb-4">
        <ComponetButton
          variant="primary"
          onClick={openCreate}
          className="px-4 py-2 flex items-center gap-2 bg-[#E1B927] hover:bg-[#F0B90B]"
        >
          <Plus size={16} /> Cadastrar
        </ComponetButton>
      </div>

      <div className="bg-white dark:bg-gray-900 px-3 md:px-0  rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler
          isLoading={loadingSections || loadingDirections}
          error={errorSections || errorDirections}
          onRetry={() => {
            refetchSections();
            refetchDirections();
          }}
        >
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">ID</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Número</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Descrição
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Direção</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Criado em
                </th>

                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sec, idx) => (
                <tr
                  key={sec.idSection}
                  className="border-b dark:border-gray-800  border-gray-100"
                >
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {sec.name}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {sec.sectionNumber}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {sec.description}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {getDirectionName(sec.idDirection)}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {new Date(sec.createdIn).toLocaleString()}
                  </td>

                  <td className="py-2 px-4">
                    <div className="relative inline-block">
                      <button
                        onClick={() => toggleMenu(sec.idSection)}
                        className="p-2 bg-gray-50 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenuId === sec.idSection && (
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 shadow-lg rounded z-50">
                          <button
                            onClick={() => handleView(sec)}
                            className="flex items-center w-full px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Eye size={16} className="mr-2" /> Ver Detalhes
                          </button>
                          <button
                            onClick={() => openEdit(sec)}
                            className="flex items-center w-full px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Pencil size={16} className="mr-2" /> Editar
                          </button>
                          <button
                            onClick={() => openConfirm(sec.idSection)}
                            className="flex items-center w-full px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            <Trash2 size={16} className="mr-2" /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <ViewSectionModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        section={viewSection}
      />
      <SectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section={selectedSection}
        onSave={handleSave}
      />
      <DeletePublicationModal
        isOpen={confirmId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir seção"
        message="Tem certeza que deseja excluir esta seção?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
