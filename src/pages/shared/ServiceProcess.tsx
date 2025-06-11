import React from "react";
import { Clock, UserPlus, CheckCircle, MapPin, Check } from "lucide-react";
import SearchFilterBar from "@/components/common/SearchBar";
import { useAuth } from "@/context/AuthContext";

const steps = [
  {
    id: 1,
    name: "Em espera",
    icon: <Clock className="w-6 h-6" />,
  },
  {
    id: 2,
    name: "Inscrito",
    icon: <UserPlus className="w-6 h-6" />,
  },
  {
    id: 3,
    name: "Confirmado",
    icon: <CheckCircle className="w-6 h-6" />,
  },
  {
    id: 4,
    name: "Direcionado",
    icon: <MapPin className="w-6 h-6" />,
  },
  {
    id: 5,
    name: "Atendido",
    icon: <Check className="w-6 h-6" />,
  },
];

type FilterStatus =
  | "all"
  | "pending"
  | "enrolled"
  | "confirmed"
  | "directed"
  | "attended";

const statusMapping: Record<Exclude<FilterStatus, "all">, number> = {
  pending: 1,
  enrolled: 2,
  confirmed: 3,
  directed: 4,
  attended: 5,
};

export default function ServiceProcess() {
  const { user } = useAuth();
  const [filterType, setFilterType] = React.useState<FilterStatus>("all");

  const initialProcesses = [
    { id: 1, name: "Processo 1", currentStep: 1 },
    { id: 2, name: "Processo 2", currentStep: 1 },
  ];
  const [processes, setProcesses] = React.useState(initialProcesses);

  const [searchTerm, setSearchTerm] = React.useState("");
  const filterOptions = [
    { value: "all", label: "Todos" },
    { value: "pending", label: "Em espera" },
    { value: "enrolled", label: "Inscrito" },
    { value: "confirmed", label: "Confirmado" },
    { value: "directed", label: "Direcionado" },
    { value: "attended", label: "Atendido" },
  ];
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const toggleFilterDropdown = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const closeFilterDropdown = () => {
    setIsFilterOpen(false);
  };

  const handleNext = (id: number) => {
    setProcesses((prev) =>
      prev.map((p) =>
        p.id === id && p.currentStep < steps.length
          ? { ...p, currentStep: p.currentStep + 1 }
          : p
      )
    );
  };

  const handlePrevious = (id: number) => {
    setProcesses((prev) =>
      prev.map((p) =>
        p.id === id && p.currentStep > 1
          ? { ...p, currentStep: p.currentStep - 1 }
          : p
      )
    );
  };

  const filteredProcesses = processes.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    if (filterType !== "all") {
      matchesFilter = p.currentStep === statusMapping[filterType];
    }
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 w-full h-screen dark:bg-gray-800 dark:text-white text-gray-800 ">
      <SearchFilterBar
        title="Lista de processo"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterOptions={filterOptions}
        isFilterOpen={isFilterOpen}
        toggleFilterDropdown={toggleFilterDropdown}
        closeFilterDropdown={closeFilterDropdown}
      />
      <div className="overflow-auto max-h-[50vh] ">
        <div className="max-w-4xl mx-auto space-y-8  ">
          {filteredProcesses.length === 0 ? (
            <p className="text-center">Nenhum processo encontrado.</p>
          ) : (
            filteredProcesses.map((process) => (
              <div
                key={process.id}
                className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-900"
              >
                <h2 className="text-lg font-bold mb-4">{process.name}</h2>

                {/* Barra de progresso horizontal para desktop */}
                <div className="hidden md:flex items-center justify-between mb-8">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
                          ${
                            index < process.currentStep - 1
                              ? "bg-[#FF9E01] text-white"
                              : index === process.currentStep - 1
                              ? "bg-white border-2 border-[#FF9E01] text-[#FF9E01] ring-4 ring-[#FF9E01]/20"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {index < process.currentStep - 1 ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        <span
                          className={`mt-2 text-sm font-medium ${
                            index === process.currentStep - 1
                              ? "text-[#FF9E01]"
                              : "text-gray-500"
                          }`}
                        >
                          {step.name}
                        </span>
                      </div>
                      {index !== steps.length - 1 && (
                        <div
                          className={`flex-1 h-1 ${
                            index < process.currentStep
                              ? "bg-[#FF9E01]"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Barra de progresso vertical para mobile */}
                <div className="flex md:hidden relative mb-8">
                  <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-200"></div>
                  <div className="flex flex-col space-y-8 w-full">
                    {steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors z-10
                          ${
                            index < process.currentStep - 1
                              ? "bg-[#FF9E01] text-white"
                              : index === process.currentStep - 1
                              ? "bg-white border-2 border-[#FF9E01] text-[#FF9E01] ring-4 ring-[#FF9E01]/20"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {index < process.currentStep - 1 ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            step.icon
                          )}
                        </div>
                        <div className="ml-4">
                          <span
                            className={`text-sm font-medium ${
                              index === process.currentStep - 1
                                ? "text-[#FF9E01]"
                                : "text-gray-500"
                            }`}
                          >
                            {step.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conteúdo da etapa atual */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Etapa {process.currentStep}:{" "}
                      {steps[process.currentStep - 1].name}
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      {process.currentStep === 1 && "Aguarde na fila."}
                      {process.currentStep === 2 && "Você está inscrito."}
                      {process.currentStep === 3 &&
                        "Chegou no estabelecimento e está confirmado."}
                      {process.currentStep === 4 &&
                        "Você foi direcionado para o atendimento."}
                      {process.currentStep === 5 &&
                        "Confirme que foi atendido."}
                    </p>
                  </div>

                  {/* Exibe controles de navegação somente se o usuário logado for do tipo 5 */}
                  {user?.type === 2 && (
                    <div className="flex flex-col md:flex-row justify-between mt-8 gap-4">
                      <button
                        onClick={() => handlePrevious(process.id)}
                        disabled={process.currentStep === 1}
                        className={`px-8 py-3 rounded transition-colors ${
                          process.currentStep === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                        }`}
                      >
                        Voltar
                      </button>
                      <button
                        onClick={() => handleNext(process.id)}
                        className="px-8 py-3 bg-[#FF9E01] cursor-pointer text-white hover:bg-orange-500 focus:ring-2 focus:ring-orange-300 rounded transition-colors"
                      >
                        {process.currentStep === steps.length
                          ? "Confirmar Atendimento"
                          : "Próximo"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
