import React from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponetButton from "@/components/common/button";
import {
  User,
  Mail,
  Phone,
  Users,
  Lock,
  Unlock,
  Key,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { BudgetManager, Department } from "@/types/interfaces";
import { useGetDepartments } from "@/hooks/DynamicApiHooks";

const roleDisplayMap: { [key: string]: string } = {
  ADMIN: "Administrador",
  USER_MASTER: "Usuário Master",
  APPROVER: "Aprovador",
  REVIEWER: "Revisor",
  PLANNER: "Planejador",
};

interface ViewEntitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: BudgetManager | null;
}

const ViewEntitiesModal: React.FC<ViewEntitiesModalProps> = ({
  isOpen,
  onClose,
  worker,
}) => {
  const { data: departments = [], isLoading: isLoadingDepartments } =
    useGetDepartments();

  if (!worker) return null;

  // Get department name
  const departmentName =
    departments.find(
      (dep: Department) => dep.idDepartment === worker.idDepartment
    )?.name || `Desconhecido (${worker.idDepartment})`;

  // Get role display name
  const roleDisplayName = worker.role
    ? roleDisplayMap[worker.role.toUpperCase()] || worker.role
    : "N/A";

  // Format dates (assuming YYYY-MM-DD format)
  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const fields = [
    { label: "Nome", value: worker.name || "N/A", icon: User },
    { label: "Email", value: worker.email || "N/A", icon: Mail },
    { label: "Telefone", value: "N/A", icon: Phone }, // No telephone in BudgetManager
    { label: "Gênero", value: "N/A", icon: Users }, // No gender in BudgetManager
    {
      label: "Departamento",
      value: isLoadingDepartments ? "Carregando..." : departmentName,
      icon: Users,
    },
    {
      label: "Bloqueado",
      value: worker.blocked ? (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
          <Lock className="w-4 h-4 mr-1" /> Sim
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          <Unlock className="w-4 h-4 mr-1" /> Não
        </span>
      ),
      icon: worker.blocked ? Lock : Unlock,
    },
    { label: "Função", value: roleDisplayName, icon: Users },
    {
      label: "Licença",
      value: worker.license ? (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
          {worker.license}
        </span>
      ) : (
        "N/A"
      ),
      icon: Key,
    },
    {
      label: "Número da Licença",
      value: worker.licenseNumber || "N/A",
      icon: Key,
    },
    {
      label: "Data de Emissão",
      value: formatDate(worker.licenseDate),
      icon: Calendar,
    },
    {
      label: "Data de Expiração",
      value: formatDate(worker.licenseExpirationDate),
      icon: Calendar,
    },
    { label: "Localização", value: worker.location || "N/A", icon: MapPin },
    {
      label: "Assinante",
      value: worker.subscriber ? (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          <CheckCircle className="w-4 h-4 mr-1" /> Sim
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
          <XCircle className="w-4 h-4 mr-1" /> Não
        </span>
      ),
      icon: worker.subscriber ? CheckCircle : XCircle,
    },
  ];

  return (
    <DynamicModal title="Visualizar Entidade" isOpen={isOpen} onClose={onClose}>
      <div className="px-6 py-4 overflow-y-auto max-h-[50vh] space-y-6">
        {/* Header with Photo and Name */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm">
          <div className="flex-shrink-0">
            {worker.photo && worker.photo.startsWith("http") ? (
              <img
                src={worker.photo}
                alt={worker.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-md"
                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-md">
                <span className="text-2xl font-bold">
                  {worker.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {worker.name || "N/A"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Mail className="w-4 h-4" /> {worker.email || "N/A"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
              <Users className="w-4 h-4" /> {roleDisplayName}
            </p>
          </div>
        </div>

        {/* Worker Details */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detalhes
          </h4>
          <div className="grid gap-4">
            {fields.map((field) => (
              <div
                key={field.label}
                className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <field.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                    {field.label}
                  </span>
                </div>
                <div className="text-gray-900 dark:text-gray-100 text-sm">
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="flex justify-end mt-6">
        <ComponetButton
          variant="secondary"
          onClick={onClose}
          className="w-full md:w-auto"
        >
          Fechar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ViewEntitiesModal;
