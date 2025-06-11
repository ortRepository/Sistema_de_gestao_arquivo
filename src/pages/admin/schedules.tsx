import { useState } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { Timeline } from "@/types/interfaces";
import DynamicImportModal from "@/components/modals/admin/DynamicImportModal";
import { useListTimelines, useDeleteTimeline } from "@/hooks/DynamicApiHooks";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import ScheduleModal from "@/components/modals/admin/ScheduleModal";

export default function ManageTimelinesScreen() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedTimeline, setSelectedTimeline] = useState<Timeline | null>(
    null
  );
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // Data hooks
  const {
    data: timelines = [],
    isLoading,
    refetch,
    error,
  } = useListTimelines();
  const { mutate: deleteTimeline } = useDeleteTimeline();
  console.log(timelines)
  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "idTimeline", label: "Id" },
    { value: "yearOfApplication", label: "Ano de Aplicação" },
    { value: "developer", label: "Desenvolvedor" },
    { value: "mapPreparation", label: "Preparação do Mapa" },
  ];

 // Helpers no topo do seu component
const safeStr = (v: any): string =>
  v != null ? String(v).toLowerCase() : "";

const safeNumStr = (v: any): string =>
  v != null ? String(v) : "";

// …

// Dentro do seu component, no lugar do filter antigo:
const filtered = timelines.filter((timeline) => {
  const term = searchTerm.toLowerCase();

  switch (filterType) {
    case "idTimeline":
      return safeNumStr(timeline.idTimeline).includes(term);

    case "yearOfApplication":
      return safeStr(timeline.yearOfApplication).includes(term);

    case "developer":
      return safeStr(timeline.developer).includes(term);

    case "mapPreparation":
      return safeNumStr(timeline.mapPreparation).includes(term);

    default:
      return [
        safeNumStr(timeline.idTimeline),
        safeStr(timeline.yearOfApplication),
        safeStr(timeline.developer),
        safeNumStr(timeline.mapPreparation),
        safeStr(timeline.mapCreationDate),
        safeStr(timeline.mapCompletionDate),
        safeStr(timeline.mapCostAdditionDate),
        safeStr(timeline.completionDateAdditionOfMapCost),
        safeStr(timeline.mapCorrectionStartDate),
        safeStr(timeline.endDateOfMapCorrection),
        safeStr(timeline.mapExecutionStartDate),
        safeStr(timeline.mapExecutionEndDate),
      ].some((f) => f.includes(term));
  }
});


  const openCreate = () => {
    setSelectedTimeline(null);
    setIsModalOpen(true);
  };

  const openEdit = (timeline: Timeline) => {
    setSelectedTimeline(timeline);
    setIsModalOpen(true);
  };

  const openImport = () => {
    setIsImportModalOpen(true);
  };

  const openConfirm = (id: number) => setConfirmId(id);
  const closeConfirm = () => setConfirmId(null);

  const handleDelete = () => {
    if (confirmId !== null) {
      deleteTimeline({ idTimeline: confirmId }, { onSuccess: () => refetch() });
      closeConfirm();
    }
  };

  const handleSave = (_updated: Timeline) => {};

  const parseTimelineFile = (
    text: string,
    fileType: string,
    csvType?: string
  ): Timeline[] => {
    let delimiter = ",";
    if (fileType === "text/csv" && csvType) {
      if (csvType === "comma") delimiter = ",";
      if (csvType === "macintosh") delimiter = ",";
      if (csvType === "ms-dos") delimiter = ",";
      if (csvType === "utf-8") delimiter = ",";
    }
    let importedData: Timeline[] = [];

    if (fileType === "text/csv") {
      const rows = text
        .split("\n")
        .slice(1)
        .filter((row) => row.trim());
      importedData = rows
        .map((row) => {
          const [
            yearOfApplication,
            developer,
            mapPreparation,
            mapCreationDate,
            mapCompletionDate,
            mapCostAdditionDate,
            completionDateAdditionOfMapCost,
            mapCorrectionStartDate,
            endDateOfMapCorrection,
            mapExecutionStartDate,
            mapExecutionEndDate,
          ] = row.split(delimiter);
          if (!yearOfApplication) return null;
          return {
            idTimeline: 0,
            yearOfApplication: yearOfApplication.trim(),
            developer: developer?.trim(),
            mapPreparation: mapPreparation
              ? Number(mapPreparation.trim())
              : undefined,
            mapCreationDate: mapCreationDate?.trim() || "",
            mapCompletionDate: mapCompletionDate?.trim() || "",
            mapCostAdditionDate: mapCostAdditionDate?.trim() || "",
            completionDateAdditionOfMapCost:
              completionDateAdditionOfMapCost?.trim() || "",
            mapCorrectionStartDate: mapCorrectionStartDate?.trim() || "",
            endDateOfMapCorrection: endDateOfMapCorrection?.trim() || "",
            mapExecutionStartDate: mapExecutionStartDate?.trim() || "",
            mapExecutionEndDate: mapExecutionEndDate?.trim() || "",
            createdIn: undefined,
            updatedIn: undefined,
            additionOfCosts: undefined,
            mapCorrection: undefined,
            mapExecution: undefined,
          } as Timeline; // Explicit cast to Timeline
        })
        .filter((item) => item !== null);
    } else if (fileType === "application/xml") {
      try {
        const parsed = JSON.parse(text); // Simplified; assumes JSON-like XML parsing
        if (Array.isArray(parsed)) {
          importedData = parsed
            .map((item) => {
              if (!item.yearOfApplication) return null;
              return {
                idTimeline: 0,
                yearOfApplication: item.yearOfApplication,
                developer: item.developer,
                mapPreparation: item.mapPreparation
                  ? Number(item.mapPreparation)
                  : undefined,
                mapCreationDate: item.mapCreationDate || "",
                mapCompletionDate: item.mapCompletionDate || "",
                mapCostAdditionDate: item.mapCostAdditionDate || "",
                completionDateAdditionOfMapCost:
                  item.completionDateAdditionOfMapCost || "",
                mapCorrectionStartDate: item.mapCorrectionStartDate || "",
                endDateOfMapCorrection: item.endDateOfMapCorrection || "",
                mapExecutionStartDate: item.mapExecutionStartDate || "",
                mapExecutionEndDate: item.mapExecutionEndDate || "",
                createdIn: undefined,
                updatedIn: undefined,
                additionOfCosts: undefined,
                mapCorrection: undefined,
                mapExecution: undefined,
              } as Timeline; // Explicit cast to Timeline
            })
            .filter((item) => item !== null);
        }
      } catch (error) {
        console.error("Error parsing XML:", error);
      }
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      console.warn("XLSX parsing not implemented");
    }
    return importedData;
  };

  const handleImport = (_newTimelines: Timeline[]) => {};

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir Cronogramas"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterOptions={filterOptions}
        isFilterOpen={isFilterOpen}
        toggleFilterDropdown={() => setIsFilterOpen((o) => !o)}
        closeFilterDropdown={() => setIsFilterOpen(false)}
      />

      <div className="md:flex md:justify-end space-y-2 md:space-y-0 mb-4 gap-2">
        <ComponetButton
          variant="primary"
          onClick={openImport}
          className="px-4 py-2 md:w-auto w-full flex items-center justify-center gap-2"
        >
          <Upload size={16} /> Importar
        </ComponetButton>
        <ComponetButton
          variant="primary"
          onClick={openCreate}
          className="px-4 py-2 md:w-auto w-full flex items-center justify-center gap-2 bg-[#E1B927] hover:bg-[#F0B90B] focus:ring-[#E1B927]"
        >
          <Plus size={16} /> Cadastrar
        </ComponetButton>
      </div>

      <div className="bg-white dark:bg-gray-900 px-3 md:px-0  rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        >
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Ano de Aplicação
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Desenvolvedor
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Preparação do Mapa
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Data de Criação
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Data de Conclusão
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((timeline) => (
                <tr
                  key={timeline.idTimeline}
                  className="border-b dark:border-gray-800  border-gray-100"
                >
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {timeline.idTimeline}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {timeline.yearOfApplication}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {timeline.developer || "N/A"}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {timeline.mapPreparation || "N/A"}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {timeline.mapCreationDate
                      ? new Date(timeline.mapCreationDate).toLocaleString()
                      : "N/A"}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400">
                    {timeline.mapCompletionDate
                      ? new Date(
                          timeline.mapCompletionDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap dark:text-gray-400 flex gap-2">
                    <button
                      onClick={() => openEdit(timeline)}
                      className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                    >
                      <Pencil size={16} className="text-green-600" />
                    </button>
                    <button
                      onClick={() => openConfirm(timeline.idTimeline)}
                      className="p-2 cursor-pointer bg-red-50 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    Nenhum cronograma encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        timeline={selectedTimeline}
        onSave={handleSave}
      />
      <DynamicImportModal<Timeline>
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Importar cronogramas"
        accept=".csv,.xml,.xlsx"
        parseFile={parseTimelineFile}
      />

      <DeletePublicationModal
        isOpen={confirmId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir cronograma"
        message="Tem certeza que deseja excluir este cronograma?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}
