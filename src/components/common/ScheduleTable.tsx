import { useState, useMemo } from "react";
import { Eye, CheckCircle, AlertTriangle } from "lucide-react";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import {
  useListTimelines,
  useGetDepartments,
  useGetSections,
  useGetDirections,
  useListBudgetMaps,
} from "@/hooks/DynamicApiHooks";
import { Timeline, BudgetMap } from "@/types/interfaces";
import SearchFilterBar from "./SearchBar";
import DynamicModal from "./DynamicModal";
import ComponetButton from "./button";

interface TableRow {
  id: number;
  year: string;
  mapCreation: string;
  mapCompletion: string;
  costAddition: string;
  costCompletion: string;
  correctionStart: string;
  correctionEnd: string;
  executionStart: string;
  executionEnd: string;
  preparationStatus: string;
  costStatus: string;
  correctionStatus: string;
  executionStatus: string;
  relatedDepartments: string;
  relatedSections: string;
  relatedDirections: string;
  budgetMapCount: number;
}

interface ScheduleTableProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  selectedSection: string;
  setSelectedSection: (section: string) => void;
  selectedDirection: string;
  setSelectedDirection: (direction: string) => void;
  refetchMaps: () => void;
}

export default function ScheduleTable({
  selectedYear,
  selectedDepartment,
  selectedSection,
  selectedDirection,
  refetchMaps,
}: ScheduleTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("year");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  const {
    data: timelines,
    isLoading: timelinesLoading,
    error: timelinesError,
    refetch: refetchTimelines,
  } = useListTimelines();
  const {
    data: departments,
    isLoading: departmentsLoading,
    error: departmentsError,
    refetch: refetchDepartments,
  } = useGetDepartments();
  const {
    data: sections,
    isLoading: sectionsLoading,
    error: sectionsError,
    refetch: refetchSections,
  } = useGetSections();
  const {
    data: directions,
    isLoading: directionsLoading,
    error: directionsError,
    refetch: refetchDirections,
  } = useGetDirections();
  const {
    data: budgetMaps,
    isLoading: mapsLoading,
    error: mapsError,
    refetch: refetchMapsInternal,
  } = useListBudgetMaps();

  // Filter options for SearchFilterBar
  const filterOptions = [
    { value: "year", label: "Ano" },
    { value: "relatedDepartments", label: "Departamentos" },
    { value: "relatedSections", label: "Seções" },
    { value: "relatedDirections", label: "Direções" },
  ];

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  };

  // Process table data
  const tableData = useMemo<TableRow[]>(() => {
    if (!timelines || !budgetMaps || !sections || !directions || !departments) {
      return [];
    }

    return timelines
      .filter((timeline: Timeline) => {
        const matchesYear =
          timeline.yearOfApplication === selectedYear.toString();
        const relatedMaps = budgetMaps.filter(
          (map: BudgetMap) => map.idTimeline === timeline.idTimeline
        );
        const matchesDepartment = !selectedDepartment
          ? true
          : relatedMaps.some((map) =>
              map.costs.some(
                (cost) => cost.departmentName === selectedDepartment
              )
            );
        const matchesSection = !selectedSection
          ? true
          : relatedMaps.some((map) =>
              map.costs.some((cost) => cost.sectionName === selectedSection)
            );
        const matchesDirection = !selectedDirection
          ? true
          : relatedMaps.some((map) =>
              map.costs.some((cost) => cost.directionName === selectedDirection)
            );
        return (
          matchesYear && matchesDepartment && matchesSection && matchesDirection
        );
      })
      .map((timeline: Timeline) => {
        const relatedMaps = budgetMaps.filter(
          (map: BudgetMap) => map.idTimeline === timeline.idTimeline
        );
        const departmentNames = [
          ...new Set(
            relatedMaps
              .flatMap((map: BudgetMap) =>
                map.costs.map((cost) => cost.departmentName)
              )
              .filter((name): name is string => !!name)
          ),
        ].join(", ");
        const sectionNames = [
          ...new Set(
            relatedMaps
              .flatMap((map: BudgetMap) =>
                map.costs.map((cost) => cost.sectionName)
              )
              .filter((name): name is string => !!name)
          ),
        ].join(", ");
        const directionNames = [
          ...new Set(
            relatedMaps
              .flatMap((map: BudgetMap) =>
                map.costs.map((cost) => cost.directionName)
              )
              .filter((name): name is string => !!name)
          ),
        ].join(", ");

        return {
          id: timeline.idTimeline,
          year: timeline.yearOfApplication || "N/A",
          mapCreation: formatDate(timeline.mapCreationDate),
          mapCompletion: formatDate(timeline.mapCompletionDate),
          costAddition: formatDate(timeline.mapCostAdditionDate),
          costCompletion: formatDate(timeline.completionDateAdditionOfMapCost),
          correctionStart: formatDate(timeline.mapCorrectionStartDate),
          correctionEnd: formatDate(timeline.endDateOfMapCorrection),
          executionStart: formatDate(timeline.mapExecutionStartDate),
          executionEnd: formatDate(timeline.mapExecutionEndDate),
          preparationStatus: timeline.mapPreparation ? "Concluído" : "Pendente",
          costStatus: timeline.additionOfCosts ? "Concluído" : "Pendente",
          correctionStatus: timeline.mapCorrection ? "Concluído" : "Pendente",
          executionStatus: timeline.mapExecution ? "Concluído" : "Pendente",
          relatedDepartments: departmentNames || "N/A",
          relatedSections: sectionNames || "N/A",
          relatedDirections: directionNames || "N/A",
          budgetMapCount: relatedMaps.length,
        };
      });
  }, [
    timelines,
    budgetMaps,
    sections,
    directions,
    departments,
    selectedYear,
    selectedDepartment,
    selectedSection,
    selectedDirection,
  ]);

  // Filter table data based on search term
  const filteredTableData = useMemo(() => {
    return tableData.filter((row) => {
      const value =
        row[filterType as keyof TableRow]?.toString().toLowerCase() || "";
      return value.includes(searchTerm.toLowerCase());
    });
  }, [tableData, searchTerm, filterType]);

  // Handle opening the modal
  const openDetailsModal = (row: TableRow) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  // Combined loading or error state
  const isLoading =
    timelinesLoading ||
    departmentsLoading ||
    sectionsLoading ||
    directionsLoading ||
    mapsLoading;
  const error =
    timelinesError ||
    departmentsError ||
    sectionsError ||
    directionsError ||
    mapsError;

  return (
    <div className="w-full dark:bg-gray-800  dark:text-white mb-16 md:mb-0">
      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow">
        {/* Search Filter Bar */}
        <SearchFilterBar
          title="Cronograma"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterOptions={filterOptions}
          isFilterOpen={isFilterOpen}
          toggleFilterDropdown={() => setIsFilterOpen((o) => !o)}
          closeFilterDropdown={() => setIsFilterOpen(false)}
        />

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 px-3 md:px-0 rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
          <DataStatusHandler
            isLoading={isLoading}
            error={error}
            onRetry={() => {
              refetchTimelines();
              refetchDepartments();
              refetchSections();
              refetchDirections();
              refetchMapsInternal();
              refetchMaps();
            }}
          >
            <table className="w-full text-left text-xs md:text-sm border-collapse">
              <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-2 md:px-4 whitespace-nowrap">ID</th>
                  <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ano</th>
                  <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                    Status Preparação
                  </th>
                  <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                    Departamentos
                  </th>
                  <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                    Mapas Orçamentários
                  </th>
                  <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTableData.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b dark:border-gray-800 border-gray-100 dark:text-gray-400"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {row.id}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {row.year}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {row.preparationStatus}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {row.relatedDepartments}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {row.budgetMapCount}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      <button
                        onClick={() => openDetailsModal(row)}
                        className="p-2 cursor-pointer bg-blue-50 hover:bg-blue-100 rounded"
                      >
                        <Eye size={16} className="text-blue-600" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTableData.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
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
      </div>

      {/* Details Modal */}
      {selectedRow && (
        <DynamicModal
          title="Detalhes do Cronograma"
          isOpen={isModalOpen}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ID
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ano
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.year}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Criação do Mapa
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.mapCreation}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conclusão do Mapa
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.mapCompletion}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adição de Custos
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.costAddition}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conclusão de Custos
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.costCompletion}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Início da Correção
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.correctionStart}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fim da Correção
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.correctionEnd}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Início da Execução
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.executionStart}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fim da Execução
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.executionEnd}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status Preparação
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {selectedRow.preparationStatus === "Concluído" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  {selectedRow.preparationStatus}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status Custos
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {selectedRow.costStatus === "Concluído" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  {selectedRow.costStatus}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status Correção
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {selectedRow.correctionStatus === "Concluído" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  {selectedRow.correctionStatus}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status Execução
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {selectedRow.executionStatus === "Concluído" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  )}
                  {selectedRow.executionStatus}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Departamentos Relacionados
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.relatedDepartments}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Seções Relacionadas
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.relatedSections}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Direções Relacionadas
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.relatedDirections}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mapas Orçamentários
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {selectedRow.budgetMapCount}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <ComponetButton
                variant="secondary"
                onClick={closeModal}
                className="w-full md:w-auto"
              >
                Fechar
              </ComponetButton>
            </div>
          </div>
        </DynamicModal>
      )}
    </div>
  );
}
