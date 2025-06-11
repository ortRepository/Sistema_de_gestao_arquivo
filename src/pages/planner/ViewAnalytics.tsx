import { useState, useMemo } from "react";
import { Sliders, Calendar } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  useGetUser,
  useListBudgetMaps,
  useListBudgetMapsReceived,
  useListTimelines,
  useGetDepartments,
  useGetSections,
  useGetDirections,
} from "@/hooks/DynamicApiHooks";
import {
  BudgetMap,
  Timeline,
  Department,
  Section,
  Direction,
  BudgetCost,
} from "@/types/interfaces";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import ScheduleTable from "@/components/common/ScheduleTable";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  ChartTooltip,
  ChartLegend
);

// Define months
const months = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

interface ChartData {
  barData: any;
  gaugeDataSession: any;
  departmentGaugeData: any;
  lineData: any;
}

export default function ViewAnalysis() {
  const [filter, setFilter] = useState<{ type: string; enabled: boolean }>({
    type: "Sessão",
    enabled: false,
  });
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedDirection, setSelectedDirection] = useState<string>("");
  const { data: userData } = useGetUser();
  const {
    data: budgetMaps,
    isLoading: mapsLoading,
    error: mapsError,
    refetch: refetchMaps,
  } = userData?.role === "APPROVER" || userData?.role === "REVIEWER"
    ? useListBudgetMapsReceived()
    : useListBudgetMaps();
  const {
    data: timelines,
    isLoading: timelinesLoading,
    error: timelinesError,
  } = useListTimelines();
  const {
    data: departments,
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useGetDepartments();
  const {
    data: sections,
    isLoading: sectionsLoading,
    error: sectionsError,
  } = useGetSections();
  const {
    data: directions,
    isLoading: directionsLoading,
    error: directionsError,
  } = useGetDirections();

  // Dynamically generate years from timelines
  const years = useMemo(() => {
    if (!timelines) return [2023, 2024, 2025];
    const uniqueYears = [
      ...new Set(
        timelines
          .map((timeline: Timeline) => {
            const year = parseInt(timeline.yearOfApplication, 10);
            return isNaN(year) ? null : year;
          })
          .filter((year): year is number => year !== null)
      ),
    ].sort((a: number, b: number) => a - b);
    return uniqueYears.length > 0 ? uniqueYears : [2025];
  }, [timelines]);

  // Process chart data
  const processChartData = useMemo<ChartData>(() => {
    if (
      !budgetMaps ||
      !departments ||
      mapsLoading ||
      departmentsLoading ||
      sectionsLoading ||
      directionsLoading
    ) {
      return {
        barData: null,
        gaugeDataSession: null,
        departmentGaugeData: null,
        lineData: null,
      };
    }

    // Flatten costs from budget maps
    const enrichedCosts = budgetMaps.flatMap((map: BudgetMap) => map.costs);

    // Filter costs by selected year, month, department, section, and direction
    const filteredCosts = enrichedCosts.filter((cost: BudgetCost) => {
      const costDate = new Date(cost.createdIn);
      return (
        costDate.getFullYear() === selectedYear &&
        costDate.getMonth() === selectedMonth &&
        (!selectedDepartment || cost.departmentName === selectedDepartment) &&
        (!selectedSection || cost.sectionName === selectedSection) &&
        (!selectedDirection || cost.directionName === selectedDirection)
      );
    });

    // Bar Chart: Planned vs Actual Costs
    const barData = {
      labels: months,
      datasets: [
        {
          label: "Previsto",
          data: months.map((_, idx) => {
            const monthCosts = enrichedCosts.filter(
              (cost: BudgetCost) =>
                new Date(cost.createdIn).getFullYear() === selectedYear &&
                new Date(cost.createdIn).getMonth() === idx &&
                !cost.approval &&
                (!selectedDepartment ||
                  cost.departmentName === selectedDepartment) &&
                (!selectedSection || cost.sectionName === selectedSection) &&
                (!selectedDirection || cost.directionName === selectedDirection)
            );
            return monthCosts.reduce(
              (sum: number, cost: BudgetCost) => sum + cost.value,
              0
            );
          }),
          backgroundColor: "#D4AF37",
          borderColor: "#D4AF37",
          borderWidth: 1,
        },
        {
          label: "Realizado",
          data: months.map((_, idx) => {
            const monthCosts = enrichedCosts.filter(
              (cost: BudgetCost) =>
                new Date(cost.createdIn).getFullYear() === selectedYear &&
                new Date(cost.createdIn).getMonth() === idx &&
                cost.approval &&
                (!selectedDepartment ||
                  cost.departmentName === selectedDepartment) &&
                (!selectedSection || cost.sectionName === selectedSection) &&
                (!selectedDirection || cost.directionName === selectedDirection)
            );
            return monthCosts.reduce(
              (sum: number, cost: BudgetCost) => sum + cost.value,
              0
            );
          }),
          backgroundColor: "#4A4A4A",
          borderColor: "#4A4A4A",
          borderWidth: 1,
        },
      ],
    };

    // Session Gauge: Proportion of approved costs
    const sessionCosts = filteredCosts.filter(
      (cost: BudgetCost) =>
        filter.type !== "Sessão" ||
        (selectedSection ? cost.sectionName === selectedSection : true)
    );
    const totalSessionValue = sessionCosts.reduce(
      (sum: number, cost: BudgetCost) => sum + cost.value,
      0
    );
    const approvedSessionValue = sessionCosts
      .filter((cost: BudgetCost) => cost.approval)
      .reduce((sum: number, cost: BudgetCost) => sum + cost.value, 0);
    const sessionGaugeValue = totalSessionValue
      ? (approvedSessionValue / totalSessionValue) * 100
      : 0;

    const gaugeDataSession = {
      labels: ["Restante", "Aprovado"],
      datasets: [
        {
          data: [100 - sessionGaugeValue, sessionGaugeValue],
          backgroundColor: ["#E5E5E5", "#0F7A3F"],
          borderWidth: 0,
        },
      ],
    };

    // Department Gauge: Cost distribution by department
    const departmentNames = departments.map((dept: Department) => dept.name);
    const departmentGaugeData = {
      labels: departmentNames.length > 0 ? departmentNames : ["Sem Dados"],
      datasets: [
        {
          data:
            departmentNames.length > 0
              ? departmentNames.map((name) =>
                  filteredCosts
                    .filter((cost: BudgetCost) => cost.departmentName === name)
                    .reduce(
                      (sum: number, cost: BudgetCost) => sum + cost.value,
                      0
                    )
                )
              : [1],
          backgroundColor:
            departmentNames.length > 0
              ? ["#E5E5E5", "#4A4A4A", "#D4AF37", "#0F7A3F"]
              : ["#E5E5E5"],
          hoverOffset: 0,
        },
      ],
    };

    // Line Chart: Trend of planned vs actual costs
    const lineData = {
      labels: months,
      datasets: [
        {
          label: "Realizado",
          data: months.map((_, idx) => {
            const monthCosts = enrichedCosts.filter(
              (cost: BudgetCost) =>
                new Date(cost.createdIn).getFullYear() === selectedYear &&
                new Date(cost.createdIn).getMonth() === idx &&
                cost.approval &&
                (filter.type === "Sessão"
                  ? selectedSection
                    ? cost.sectionName === selectedSection
                    : true
                  : filter.type === "Departamento"
                  ? selectedDepartment
                    ? cost.departmentName === selectedDepartment
                    : true
                  : selectedDirection
                  ? cost.directionName === selectedDirection
                  : true)
            );
            return monthCosts.reduce(
              (sum: number, cost: BudgetCost) => sum + cost.value,
              0
            );
          }),
          borderColor: "#4A4A4A",
          backgroundColor: "#4A4A4A",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Previsto",
          data: months.map((_, idx) => {
            const monthCosts = enrichedCosts.filter(
              (cost: BudgetCost) =>
                new Date(cost.createdIn).getFullYear() === selectedYear &&
                new Date(cost.createdIn).getMonth() === idx &&
                !cost.approval &&
                (filter.type === "Sessão"
                  ? selectedSection
                    ? cost.sectionName === selectedSection
                    : true
                  : filter.type === "Departamento"
                  ? selectedDepartment
                    ? cost.departmentName === selectedDepartment
                    : true
                  : selectedDirection
                  ? cost.directionName === selectedDirection
                  : true)
            );
            return monthCosts.reduce(
              (sum: number, cost: BudgetCost) => sum + cost.value,
              0
            );
          }),
          borderColor: "#D4AF37",
          backgroundColor: "#D4AF37",
          tension: 0.4,
          fill: false,
        },
      ],
    };

    return { barData, gaugeDataSession, departmentGaugeData, lineData };
  }, [
    budgetMaps,
    departments,
    mapsLoading,
    departmentsLoading,
    sectionsLoading,
    directionsLoading,
    selectedYear,
    selectedMonth,
    filter.type,
    selectedDepartment,
    selectedSection,
    selectedDirection,
  ]);

  // Gauge chart options
  const gaugeOptions = (cutout = "80%") => ({
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90 * (Math.PI / 180),
    circumference: 180 * (Math.PI / 180),
    cutout,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  });

  // Apply filter action
  const applyFilter = () => {
    setFilter({ ...filter, enabled: false });
    refetchMaps();
  };

  // Combined loading or error state
  const isLoading =
    mapsLoading ||
    timelinesLoading ||
    departmentsLoading ||
    sectionsLoading ||
    directionsLoading;
  const error =
    mapsError ||
    timelinesError ||
    departmentsError ||
    sectionsError ||
    directionsError;

  if (isLoading || error) {
    return (
      <div className="flex justify-center h-full items-center">
        <DataStatusHandler
          isLoading={isLoading}
          error={error}
          onRetry={refetchMaps}
          children={undefined}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full dark:bg-gray-800 p-4 sm:p-8 dark:text-white mb-16 md:mb-0">
      {/* Global Year/Month/Department/Section/Direction Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-6 space-y-4 sm:space-y-0">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="w-full sm:w-40 px-2 py-3 rounded bg-gray-700 dark:bg-gray-900 text-white border border-gray-600 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 text-sm sm:text-base"
        >
          {years.map((y) => (
            <option
              key={y}
              value={y}
              className="bg-gray-700 dark:bg-gray-900 text-white"
            >
              {y}
            </option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="w-full sm:w-40 px-2 py-3 rounded bg-gray-700 dark:bg-gray-900 text-white border border-gray-600 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 text-sm sm:text-base"
        >
          {months.map((m, idx) => (
            <option
              key={m}
              value={idx}
              className="bg-gray-700 dark:bg-gray-900 text-white"
            >
              {m}
            </option>
          ))}
        </select>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="w-full sm:w-40 px-2 py-3 rounded bg-gray-700 dark:bg-gray-900 text-white border border-gray-600 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 text-sm sm:text-base"
        >
          <option value="" className="bg-gray-700 dark:bg-gray-900 text-white">
            Todos os Departamentos
          </option>
          {departments?.map((department: Department) => (
            <option
              key={department.idDepartment}
              value={department.name}
              className="bg-gray-700 dark:bg-gray-900 text-white"
            >
              {department.name}
            </option>
          ))}
        </select>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="w-full sm:w-40 px-2 py-3 rounded bg-gray-700 dark:bg-gray-900 text-white border border-gray-600 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 text-sm sm:text-base"
        >
          <option value="" className="bg-gray-700 dark:bg-gray-900 text-white">
            Todas as Seções
          </option>
          {sections?.map((section: Section) => (
            <option
              key={section.idSection}
              value={section.name}
              className="bg-gray-700 dark:bg-gray-900 text-white"
            >
              {section.name}
            </option>
          ))}
        </select>
        <select
          value={selectedDirection}
          onChange={(e) => setSelectedDirection(e.target.value)}
          className="w-full sm:w-40 px-2 py-3 rounded bg-gray-700 dark:bg-gray-900 text-white border border-gray-600 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all duration-200 text-sm sm:text-base"
        >
          <option value="" className="bg-gray-700 dark:bg-gray-900 text-white">
            Todas as Direções
          </option>
          {directions?.map((direction: Direction) => (
            <option
              key={direction.idDirection}
              value={direction.name}
              className="bg-gray-700 dark:bg-gray-900 text-white"
            >
              {direction.name}
            </option>
          ))}
        </select>
        <button
          className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded transition-colors duration-200 text-sm sm:text-base"
          onClick={applyFilter}
        >
          Filtrar
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow h-80">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium">Direção</h2>
            <button className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition-colors duration-200">
              <Calendar className="w-4 h-4 mr-1" /> Mês
            </button>
          </div>
          <div className="h-full">
            {processChartData.barData && (
              <Bar
                data={processChartData.barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Valor (R$)" },
                    },
                    x: {
                      grid: { display: false },
                      title: { display: true, text: "Mês" },
                    },
                  },
                  plugins: {
                    legend: { position: "top" },
                    tooltip: { enabled: true },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Session Gauge */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow h-80 flex flex-col items-center justify-center">
          <div className="w-full flex justify-between items-center mb-2">
            <h2 className="font-medium">Sessão</h2>
            <button className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition-colors duration-200">
              <Calendar className="w-4 h-4 mr-1" /> Mês
            </button>
          </div>
          <div className="relative w-full max-w-xs flex-1">
            {processChartData.gaugeDataSession && (
              <>
                <Doughnut
                  data={processChartData.gaugeDataSession}
                  options={gaugeOptions("80%")}
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-semibold">
                    {Math.round(
                      processChartData.gaugeDataSession.datasets[0].data[1]
                    )}
                    %
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Department Gauge */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow h-80 flex flex-col items-center justify-center">
          <div className="w-full flex justify-between items-center mb-2">
            <h2 className="font-medium">Departamento</h2>
            <button className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition-colors duration-200">
              <Calendar className="w-4 h-4 mr-1" /> Mês
            </button>
          </div>
          <div className="relative w-full max-w-xs flex-1">
            {processChartData.departmentGaugeData && (
              <>
                <Doughnut
                  data={processChartData.departmentGaugeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "70%",
                    plugins: {
                      legend: { display: true, position: "bottom" },
                      tooltip: { enabled: true },
                    },
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-semibold">
                    {processChartData.departmentGaugeData.datasets[0].data.reduce(
                      (sum: number, val: number) => sum + val,
                      0
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Line Chart with Filter Panel */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded shadow relative h-96 mt-6">
        <h2 className="font-medium mb-2">Dados gerais</h2>
        <div className="h-full">
          {processChartData.lineData && (
            <Line
              data={processChartData.lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: "Valor (R$)" },
                  },
                  x: {
                    grid: { display: false },
                    title: { display: true, text: "Mês" },
                  },
                },
                plugins: {
                  legend: { position: "top" },
                  tooltip: { enabled: true },
                },
              }}
            />
          )}
        </div>

        {/* Filter Panel */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setFilter({ ...filter, enabled: !filter.enabled })}
            className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors duration-200"
          >
            <Sliders className="w-4 h-4 mr-1" /> Filtrar Tipo
          </button>
          {filter.enabled && (
            <div className="mt-2 bg-white dark:bg-gray-600 p-4 rounded shadow">
              <div className="space-y-2">
                {["Sessão", "Departamento", "Direção"].map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="filterType"
                      value={type}
                      checked={filter.type === type}
                      onChange={() => setFilter({ ...filter, type })}
                      className="text-yellow-500 focus:ring-yellow-500"
                    />
                    <span>{type}</span>
                  </label>
                ))}
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() =>
                      setFilter({ type: "Sessão", enabled: false })
                    }
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  >
                    Limpar
                  </button>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition-colors duration-200"
                    onClick={applyFilter}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Table */}
      <div className="mt-6">
        <ScheduleTable
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          selectedDirection={selectedDirection}
          setSelectedDirection={setSelectedDirection}
          refetchMaps={refetchMaps}
        />
      </div>
    </div>
  );
}
