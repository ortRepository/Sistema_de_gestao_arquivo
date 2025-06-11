import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import {
  Download,
  Wallet,
  Users,
  CreditCard,
  BarChart3,
  PieChart,
  Building,
  Layers,
  Calendar,
  Settings,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Activity,
  List,
  BookOpen,
  User,
} from "lucide-react";
import ComponentSelect from "@/components/common/ComponentSelect";
import {
  useGetAccounts,
  useGetBudgetControls,
  useGetClasses,
  useGetDepartments,
  useGetDirections,
  useGetSections,
  useListBudgetManagers,
  useListCostCenters,
  useListTimelines,
  useListBudgetMaps,
} from "@/hooks/DynamicApiHooks";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Statistics: React.FC = () => {
  const [period, setPeriod] = useState("all");
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    overview: true,
    managers: true,
    controls: true,
    timelines: true,
    structure: true,
  });
  const [showAll, setShowAll] = useState<{
    timelines: boolean;
    directions: boolean;
    sections: boolean;
    departments: boolean;
  }>({
    timelines: false,
    directions: false,
    sections: false,
    departments: false,
  });
  const [expandedDetails, setExpandedDetails] = useState<{
    [key: string]: boolean;
  }>({});

  // Refs for exporting charts
  const budgetOverviewRef = useRef<any>(null);
  const categoryDistributionRef = useRef<any>(null);

  // Custom API Hooks
  const {
    data: budgetManagers,
    isLoading: loadingManagers,
    error: errorManagers,
    refetch: refetchManagers,
  } = useListBudgetManagers();
  const {
    data: classes,
    isLoading: loadingClasses,
    error: errorClasses,
    refetch: refetchClasses,
  } = useGetClasses();
  const {
    data: budgetControls,
    isLoading: loadingControls,
    error: errorControls,
    refetch: refetchControls,
  } = useGetBudgetControls();
  const {
    data: accounts,
    isLoading: loadingAccounts,
    error: errorAccounts,
    refetch: refetchAccounts,
  } = useGetAccounts();
  const {
    data: timelines,
    isLoading: loadingTimelines,
    error: errorTimelines,
    refetch: refetchTimelines,
  } = useListTimelines();
  const {
    data: departments,
    isLoading: loadingDepartments,
    error: errorDepartments,
    refetch: refetchDepartments,
  } = useGetDepartments();
  const {
    data: sections,
    isLoading: loadingSections,
    error: errorSections,
    refetch: refetchSections,
  } = useGetSections();
  const {
    data: directions,
    isLoading: loadingDirections,
    error: errorDirections,
    refetch: refetchDirections,
  } = useGetDirections();
  const {
    data: costCenters,
    isLoading: loadingCostCenters,
    error: errorCostCenters,
    refetch: refetchCostCenters,
  } = useListCostCenters();
  const {
    data: budgetMaps,
    isLoading: loadingBudgetMaps,
    error: errorBudgetMaps,
    refetch: refetchBudgetMaps,
  } = useListBudgetMaps();

  // Aggregate error states
  const error = useMemo(
    () =>
      errorManagers ||
      errorClasses ||
      errorControls ||
      errorAccounts ||
      errorTimelines ||
      errorDepartments ||
      errorSections ||
      errorDirections ||
      errorCostCenters ||
      errorBudgetMaps ||
      null,
    [
      errorManagers,
      errorClasses,
      errorControls,
      errorAccounts,
      errorTimelines,
      errorDepartments,
      errorSections,
      errorDirections,
      errorCostCenters,
      errorBudgetMaps,
    ]
  );

  // Aggregate refetch functions
  const refetch = async () => {
    try {
      await Promise.all([
        refetchManagers?.(),
        refetchClasses?.(),
        refetchControls?.(),
        refetchAccounts?.(),
        refetchTimelines?.(),
        refetchDepartments?.(),
        refetchSections?.(),
        refetchDirections?.(),
        refetchCostCenters?.(),
        refetchBudgetMaps?.(),
      ]);
    } catch (err) {
      console.error("Error during refetch:", err);
    }
  };

  const isLoading =
    loadingManagers ||
    loadingClasses ||
    loadingControls ||
    loadingAccounts ||
    loadingTimelines ||
    loadingDepartments ||
    loadingSections ||
    loadingDirections ||
    loadingCostCenters ||
    loadingBudgetMaps;

  // Theme detection
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Calculate total budget from BudgetMaps
  const totalBudget = useMemo(() => {
    return (
      budgetMaps?.reduce((sum, map) => {
        const mapTotal = map.costs.reduce(
          (costSum, cost) => costSum + cost.value,
          0
        );
        return sum + mapTotal;
      }, 0) || 0
    );
  }, [budgetMaps]);

  const totalManagers = budgetManagers?.length || 0;
  const totalCostCenters = costCenters?.length || 0;
  const totalControls = budgetControls?.length || 0;
  const totalDepartments = departments?.length || 0;
  const totalTimelines = timelines?.length || 0;
  const totalSections = sections?.length || 0;
  const totalDirections = directions?.length || 0;

  // Budget overview chart data from BudgetMaps
  const budgetOverview = useMemo(() => {
    const years =
      budgetMaps?.map((map) =>
        new Date(map.budgetYear).getFullYear().toString()
      ) || [];
    const uniqueYears = Array.from(new Set(years)).sort();
    const budgetData: number[] = [];
    const expenseData: number[] = [];

    uniqueYears.forEach((year) => {
      const yearMaps = budgetMaps?.filter(
        (map) => new Date(map.budgetYear).getFullYear().toString() === year
      );
      const yearBudget =
        yearMaps?.reduce((sum, map) => {
          const mapTotal = map.costs.reduce(
            (costSum, cost) => costSum + cost.value,
            0
          );
          return sum + mapTotal;
        }, 0) || 0;
      budgetData.push(yearBudget);

      // For expenses, we can assume approved costs as expenses
      const yearExpense =
        yearMaps?.reduce((sum, map) => {
          const mapExpense = map.costs.reduce(
            (costSum, cost) => (cost.approval ? costSum + cost.value : costSum),
            0
          );
          return sum + mapExpense;
        }, 0) || 0;
      expenseData.push(yearExpense);
    });

    return {
      labels: uniqueYears,
      datasets: [
        {
          label: "Mapa Orçamental (R$)",
          data: budgetData,
          backgroundColor: "#E1B927",
        },
        {
          label: "Despesas (R$)",
          data: expenseData,
          backgroundColor: "#F59E0B",
        },
      ],
    };
  }, [budgetMaps]);

  // Category distribution chart data (remains unchanged)
  const categoryDistribution = useMemo(() => {
    const classAmounts: { [key: number]: number } = {};
    classes?.forEach((cls) => {
      const classAccounts = accounts?.filter(
        (acc) => acc.idClass === cls.idClass
      );
      const total =
        classAccounts?.reduce((sum, acc) => sum + acc.number, 0) || 0;
      classAmounts[cls.idClass] = total;
    });

    return {
      labels: classes?.map((c) => c.name) || [],
      datasets: [
        {
          label: "Valor (R$)",
          data: classes?.map((c) => classAmounts[c.idClass]) || [],
          backgroundColor: [
            "#E1B927",
            "#F59E0B",
            "#D97706",
            "#FBBF24",
            "#FCD34D",
            "#FDE68A",
            "#FEF3C7",
          ],
        },
      ],
    };
  }, [classes, accounts]);

  // Chart options with responsive adjustments
  const chartOptionsBar: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDarkMode ? "#E5E7EB" : "#1F2937",
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value: number = Number(context.raw);
            return `${context.dataset.label}: R$ ${value.toLocaleString(
              "pt-BR"
            )}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "R$ " + value;
          },
          color: isDarkMode ? "#E5E7EB" : "#1F2937",
          font: { size: 10 },
        },
        grid: {
          color: isDarkMode
            ? "rgba(229, 231, 235, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        ticks: {
          color: isDarkMode ? "#E5E7EB" : "#1F2937",
          font: { size: 10 },
        },
        grid: {
          color: isDarkMode
            ? "rgba(229, 231, 235, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  const chartOptionsPie: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: window.innerWidth < 640 ? "bottom" : "right",
        labels: {
          color: isDarkMode ? "#E5E7EB" : "#1F2937",
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value: number = Number(context.raw);
            return `${context.dataset.label}: R$ ${value.toLocaleString(
              "pt-BR"
            )}`;
          },
        },
      },
    },
  };

  if (isLoading || error) {
    return (
      <div className="flex justify-center h-full items-center">
        <DataStatusHandler
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          children={undefined}
        />
      </div>
    );
  }

  // Export chart as PNG
  const exportChartAsPNG = (
    chartRef: React.RefObject<any>,
    fileName: string
  ) => {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas;
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${fileName}.png`;
      link.click();
    }
  };

  // Toggle section visibility
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Toggle show all items for a section
  const toggleShowAll = (section: keyof typeof showAll) => {
    setShowAll((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Toggle details for a budget control
  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="p-4 sm:p-6 w-full h-full dark:bg-gray-800 dark:text-white text-gray-800 overflow-x-hidden">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#E1B927]/10 to-[#F59E0B]/10 dark:from-[#1F2937] dark:to-[#111827] p-4 rounded-xl shadow-lg border border-[#E1B927]/20 dark:border-gray-700 flex items-center transform hover:scale-[1.02] transition-transform duration-200">
          <div className="mr-4 p-3 bg-[#E1B927]/20 rounded-lg">
            <Wallet className="text-[#E1B927]" size={20} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Mapa Orçamental
            </h3>
            <p className="text-lg sm:text-xl font-bold text-[#E1B927]">
              {totalBudget.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/10 dark:from-[#1F2937] dark:to-[#111827] p-4 rounded-xl shadow-lg border border-[#F59E0B]/20 dark:border-gray-700 flex items-center transform hover:scale-[1.02] transition-transform duration-200">
          <div className="mr-4 p-3 bg-[#F59E0B]/20 rounded-lg">
            <Users className="text-[#F59E0B]" size={20} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Entidades
            </h3>
            <p className="text-lg sm:text-xl font-bold text-[#E1B927]">
              {totalManagers}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#D97706]/10 to-[#B45309]/10 dark:from-[#1F2937] dark:to-[#111827] p-4 rounded-xl shadow-lg border border-[#D97706]/20 dark:border-gray-700 flex items-center transform hover:scale-[1.02] transition-transform duration-200">
          <div className="mr-4 p-3 bg-[#D97706]/20 rounded-lg">
            <CreditCard className="text-[#D97706]" size={20} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Centros de Custo
            </h3>
            <p className="text-lg sm:text-xl font-bold text-[#E1B927]">
              {totalCostCenters}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FBBF24]/10 to-[#F59E0B]/10 dark:from-[#1F2937] dark:to-[#111827] p-4 rounded-xl shadow-lg border border-[#FBBF24]/20 dark:border-gray-700 flex items-center transform hover:scale-[1.02] transition-transform duration-200">
          <div className="mr-4 p-3 bg-[#FBBF24]/20 rounded-lg">
            <Settings className="text-[#FBBF24]" size={20} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Controles
            </h3>
            <p className="text-lg sm:text-xl font-bold text-[#E1B927]">
              {totalControls}
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-6">
        {/* Budget Overview Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div
            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer"
            onClick={() => toggleSection("overview")}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="text-[#E1B927]" size={18} />
              <h2 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                Visão Geral do Mapa Orçamental
              </h2>
            </div>
            <button>
              {expandedSections.overview ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>

          {expandedSections.overview && (
            <div className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <ComponentSelect
                    label=""
                    name="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    options={[
                      { value: "all", label: "Todos os Anos" },
                      ...(budgetMaps?.map((map) => ({
                        value: new Date(map.budgetYear)
                          .getFullYear()
                          .toString(),
                        label: new Date(map.budgetYear)
                          .getFullYear()
                          .toString(),
                      })) || []),
                    ]}
                  />
                </div>
                <button
                  onClick={() =>
                    exportChartAsPNG(
                      budgetOverviewRef,
                      "visao-geral-mapa-orcamental"
                    )
                  }
                  className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base bg-gradient-to-r from-[#E1B927] to-[#F59E0B] text-white rounded-md hover:opacity-90 transition-opacity w-full sm:w-auto"
                >
                  <Download size={14} />
                  Exportar Gráfico
                </button>
              </div>
              <div className="h-64 sm:h-80 lg:h-96">
                <Bar
                  ref={budgetOverviewRef}
                  data={budgetOverview}
                  options={chartOptionsBar}
                />
              </div>
            </div>
          )}
        </div>

        {/* Category Distribution Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div
            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer"
            onClick={() => toggleSection("managers")}
          >
            <div className="flex items-center gap-2">
              <PieChart className="text-[#F59E0B]" size={18} />
              <h2 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                Distribuição por Classe
              </h2>
            </div>
            <button>
              {expandedSections.managers ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>

          {expandedSections.managers && (
            <div className="p-4">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() =>
                    exportChartAsPNG(
                      categoryDistributionRef,
                      "distribuicao-classe"
                    )
                  }
                  className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base bg-gradient-to-r from-[#E1B927] to-[#F59E0B] text-white rounded-md hover:opacity-90 transition-opacity w-full sm:w-auto"
                >
                  <Download size={14} />
                  Exportar Gráfico
                </button>
              </div>
              <div className="h-64 sm:h-80 lg:h-96">
                <Pie
                  ref={categoryDistributionRef}
                  data={categoryDistribution}
                  options={chartOptionsPie}
                />
              </div>
            </div>
          )}
        </div>

        {/* Budget Managers Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div
            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer"
            onClick={() => toggleSection("controls")}
          >
            <div className="flex items-center gap-2">
              <Users className="text-[#D97706]" size={18} />
              <h2 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                Entidades
              </h2>
            </div>
            <button>
              {expandedSections.controls ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>

          {expandedSections.controls && (
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300">
                        Foto
                      </th>
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300">
                        Nome
                      </th>
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                        Departamento
                      </th>
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300 hidden md:table-cell">
                        Email
                      </th>
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300 hidden lg:table-cell">
                        Data de expiração
                      </th>
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetManagers?.map((manager) => (
                      <tr
                        key={manager.idBudgetManager}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-2 px-2 sm:px-4 whitespace-nowrap">
                          {manager.photo ? (
                            <img
                              src={manager.photo}
                              alt={manager.name}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) =>
                                (e.currentTarget.src = "/placeholder.png")
                              }
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <User
                                size={16}
                                className="text-gray-500 dark:text-gray-400"
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2 sm:px-4 whitespace-nowrap">
                          {manager.name}
                        </td>
                        <td className="py-2 px-2 sm:px-4 whitespace-nowrap hidden sm:table-cell">
                          {manager.departmentName}
                        </td>
                        <td className="py-2 px-2 sm:px-4 whitespace-nowrap hidden md:table-cell text-blue-500 dark:text-blue-400">
                          {manager.email}
                        </td>
                        <td className="py-2 px-2 sm:px-4 whitespace-nowrap hidden lg:table-cell">
                          {new Date(
                            manager.licenseExpirationDate
                          ).toLocaleString()}
                        </td>
                        <td className="py-2 px-2 sm:px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              manager.blocked
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                          >
                            {manager.blocked ? "Bloqueado" : "Ativo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Budget Controls Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div
            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer"
            onClick={() => toggleSection("timelines")}
          >
            <div className="flex items-center gap-2">
              <Settings className="text-[#FBBF24]" size={18} />
              <h2 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                Controles Orçamentários
              </h2>
            </div>
            <button>
              {expandedSections.timelines ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>

          {expandedSections.timelines && (
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetControls?.map((control) => (
                  <div
                    key={control.idBudgetControl}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-[#FBBF24]/20 rounded-lg">
                        <BookOpen className="text-[#FBBF24]" size={18} />
                      </div>
                      <h3 className="font-semibold text-base sm:text-lg">
                        {control.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-4">
                      {control.description}
                    </p>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        Criado em:{" "}
                        {new Date(control.createdIn).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() =>
                          toggleDetails(control.idBudgetControl.toString())
                        }
                        className="text-[#E1B927] hover:text-[#F59E0B] flex items-center cursor-pointer"
                        aria-expanded={expandedDetails[control.idBudgetControl]}
                      >
                        {expandedDetails[control.idBudgetControl]
                          ? "Ocultar"
                          : "Detalhes"}{" "}
                        <ChevronRight
                          size={14}
                          className={
                            expandedDetails[control.idBudgetControl]
                              ? "rotate-90"
                              : ""
                          }
                        />
                      </button>
                    </div>
                    {expandedDetails[control.idBudgetControl] && (
                      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-2">
                          Detalhes do Controle
                        </h4>

                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <strong>Nome:</strong> {control.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <strong>Descrição:</strong> {control.description}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <strong>Criado em:</strong>{" "}
                          {new Date(control.createdIn).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Organizational Structure Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div
            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer"
            onClick={() => toggleSection("structure")}
          >
            <div className="flex items-center gap-2">
              <Building className="text-[#E1B927]" size={18} />
              <h2 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                Estrutura Organizacional
              </h2>
            </div>
            <button>
              {expandedSections.structure ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>

          {expandedSections.structure && (
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Directions Card */}
                <div className="bg-gradient-to-br from-[#E1B927]/10 to-[#F59E0B]/10 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-5 rounded-xl border border-[#E1B927]/20 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Building className="text-[#E1B927]" size={20} />
                    <h3 className="text-base sm:text-lg font-bold">
                      Direções ({totalDirections})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {(showAll.directions
                      ? directions
                      : directions?.slice(0, 3)
                    )?.map((direction) => (
                      <div
                        key={direction.idDirection}
                        className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <p className="font-medium text-sm sm:text-base">
                          {direction.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                          {direction.description}
                        </p>
                      </div>
                    ))}
                    {totalDirections > 3 && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => toggleShowAll("directions")}
                          className="text-xs sm:text-sm text-[#E1B927] hover:text-[#F59E0B] cursor-pointer"
                          aria-expanded={showAll.directions}
                        >
                          {showAll.directions
                            ? "Ver menos"
                            : `Ver todas as direções (${totalDirections})`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sections Card */}
                <div className="bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/10 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-5 rounded-xl border border-[#F59E0B]/20 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Layers className="text-[#F59E0B]" size={20} />
                    <h3 className="text-base sm:text-lg font-bold">
                      Seções ({totalSections})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {(showAll.sections ? sections : sections?.slice(0, 3))?.map(
                      (section) => (
                        <div
                          key={section.idSection}
                          className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <p className="font-medium text-sm sm:text-base">
                            {section.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Diretoria:{" "}
                            {directions?.find(
                              (d) => d.idDirection === section.idDirection
                            )?.name || "N/A"}
                          </p>
                        </div>
                      )
                    )}
                    {totalSections > 3 && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => toggleShowAll("sections")}
                          className="text-xs sm:text-sm text-[#F59E0B] hover:text-[#D97706] cursor-pointer"
                          aria-expanded={showAll.sections}
                        >
                          {showAll.sections
                            ? "Ver menos"
                            : `Ver todas as seções (${totalSections})`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Departments Card */}
                <div className="bg-gradient-to-br from-[#D97706]/10 to-[#B45309]/10 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-5 rounded-xl border border-[#D97706]/20 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="text-[#D97706]" size={20} />
                    <h3 className="text-base sm:text-lg font-bold">
                      Departamentos ({totalDepartments})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {(showAll.departments
                      ? departments
                      : departments?.slice(0, 3)
                    )?.map((department) => (
                      <div
                        key={department.idDepartment}
                        className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <p className="font-medium text-sm sm:text-base">
                          {department.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Seção:{" "}
                          {sections?.find(
                            (s) => s.idSection === department.idSection
                          )?.name || "N/A"}
                        </p>
                      </div>
                    ))}
                    {totalDepartments > 3 && (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => toggleShowAll("departments")}
                          className="text-xs sm:text-sm text-[#D97706] hover:text-[#B45309] cursor-pointer"
                          aria-expanded={showAll.departments}
                        >
                          {showAll.departments
                            ? "Ver menos"
                            : `Ver todos os departamentos (${totalDepartments})`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timelines Section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div
            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer"
            onClick={() => toggleSection("timelines")}
          >
            <div className="flex items-center gap-2">
              <Calendar className="text-[#FBBF24]" size={18} />
              <h2 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                Cronogramas ({totalTimelines})
              </h2>
            </div>
            <button>
              {expandedSections.timelines ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>

          {expandedSections.timelines && (
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm border-collapse">
                  <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300">
                        Ano
                      </th>
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                        Preparação
                      </th>
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300 hidden md:table-cell">
                        Adição de Custos
                      </th>
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300 hidden lg:table-cell">
                        Correção
                      </th>
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300 hidden xl:table-cell">
                        Execução
                      </th>
                      <th className="py-2 px-2 sm:px-4 text-left text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAll.timelines
                      ? timelines
                      : timelines?.slice(0, 3)
                    )?.map((timeline) => (
                      <tr
                        key={timeline.idTimeline}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-2 px-2 sm:px-4 font-medium">
                          {timeline.yearOfApplication}
                        </td>
                        <td className="py-2 px-2 sm:px-4 hidden sm:table-cell">
                          <p>
                            {new Date(
                              timeline.mapCreationDate
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              timeline.mapCompletionDate
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            R${" "}
                            {timeline.mapPreparation?.toLocaleString("pt-BR") ||
                              "0"}
                          </p>
                        </td>
                        <td className="py-2 px-2 sm:px-4 hidden md:table-cell">
                          <p>
                            {new Date(
                              timeline.mapCostAdditionDate
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              timeline.completionDateAdditionOfMapCost
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            R${" "}
                            {timeline.additionOfCosts?.toLocaleString(
                              "pt-BR"
                            ) || "0"}
                          </p>
                        </td>
                        <td className="py-2 px-2 sm:px-4 hidden lg:table-cell">
                          <p>
                            {new Date(
                              timeline.mapCorrectionStartDate
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              timeline.endDateOfMapCorrection
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            R${" "}
                            {timeline.mapCorrection?.toLocaleString("pt-BR") ||
                              "0"}
                          </p>
                        </td>
                        <td className="py-2 px-2 sm:px-4 hidden xl:table-cell">
                          <p>
                            {new Date(
                              timeline.mapExecutionStartDate
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              timeline.mapExecutionEndDate
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            R${" "}
                            {timeline.mapExecution?.toLocaleString("pt-BR") ||
                              "0"}
                          </p>
                        </td>
                        <td className="py-2 px-2 sm:px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Em Andamento
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalTimelines > 3 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => toggleShowAll("timelines")}
                    className="flex items-center justify-center gap-2 mx-auto px-3 py-2 text-sm sm:text-base bg-gradient-to-r from-[#E1B927] to-[#F59E0B] text-white rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                    aria-expanded={showAll.timelines}
                  >
                    <List size={14} />
                    {showAll.timelines
                      ? "Ver menos"
                      : `Ver todos os cronogramas (${totalTimelines})`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
