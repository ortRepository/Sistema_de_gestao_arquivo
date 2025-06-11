import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import {
  Pencil,
  Trash2,
  Plus,
  Eye,
  User,
  Lock,
  Unlock,
  Key,
} from "lucide-react";
import ComponetButton from "@/components/common/button";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ViewEntitiesModal from "@/components/modals/admin/ViewEntitiesModal";
import LicenseModal from "@/components/modals/admin/LicenseModal";
import LicenseActionSelectionModal from "@/components/modals/admin/LicenseActionSelectionModal";
import { BudgetManager, Department } from "@/types/interfaces";
import {
  useListBudgetManagers,
  useDeleteBudgetManager,
  useGetDepartments,
  useUpdateBudgetManager,
} from "@/hooks/DynamicApiHooks";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import CreateEntitiesModal from "@/components/modals/admin/EntitiesModal";

const roleDisplayMap: { [key: string]: string } = {
  ADMIN: "Administrador",
  USER_MASTER: "Usuário Master",
  APPROVER: "Aprovador",
  REVIEWER: "Revisor",
  PLANNER: "Planejador",
};

const isLicenseManageable = (expirationDate: string): boolean => {
  try {
    const today = new Date();
    const expiration = new Date(expirationDate);
    if (isNaN(expiration.getTime())) return false;
    const timeDiff = expiration.getTime() - today.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    return daysDiff <= 10;
  } catch {
    return false;
  }
};

export default function ManageEntitiesScreen() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState<boolean>(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] =
    useState<boolean>(false);
  const [selectedEntities, setSelectedEntities] =
    useState<BudgetManager | null>(null);
  const [confirmEntitiesId, setConfirmEntitiesId] = useState<number | null>(
    null
  );
  const [licenseMode, setLicenseMode] = useState<"generate" | "update">(
    "update"
  );
  const [isBlocking, setIsBlocking] = useState(false);
  const {
    data: entities = [],
    isLoading: isLoadingEntities,
    refetch,
    error,
  } = useListBudgetManagers();
  const { mutate: deleteBudgetManager } = useDeleteBudgetManager();
  const { data: departments = [], isLoading: isLoadingDepartments } =
    useGetDepartments();
  const { mutate: updateBudgetManager } = useUpdateBudgetManager();
   console.log(entities)
  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "name", label: "Nome" },
    { value: "email", label: "Email" },
    { value: "departmentName", label: "Departamento" },
    { value: "idBudgetManager", label: "ID Orçamento" },
    { value: "role", label: "Função" },
  ];

  const getDepartmentName = (idDepartment: number): string => {
    if (isLoadingDepartments) return "Carregando...";
    const department = departments.find(
      (dep: Department) => dep.idDepartment === idDepartment
    );
    return department?.name || `Desconhecido (${idDepartment})`;
  };

  const getRoleDisplayName = (role: string | undefined): string => {
    if (!role) return "N/A";
    return roleDisplayMap[role] || role;
  };

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return entities.filter((entity: BudgetManager, idx) => {
      const departmentName = getDepartmentName(
        entity.idDepartment
      ).toLowerCase();
      const role = entity.role
        ? getRoleDisplayName(entity.role).toLowerCase()
        : "";
      switch (filterType) {
        case "name":
          return entity.name.toLowerCase().includes(term);
        case "email":
          return entity.email.toLowerCase().includes(term);
        case "departmentName":
          return departmentName.includes(term);
        case "idBudgetManager":
          return (idx + 1).toString().includes(term);

        case "role":
          return role.toLowerCase().includes(term);
        default:
          return (
            entity.name.toLowerCase().includes(term) ||
            entity.email.toLowerCase().includes(term) ||
            departmentName.includes(term) ||
            entity.idBudgetManager.toString().includes(term) ||
            role.toLowerCase().includes(term)
          );
      }
    });
  }, [entities, searchTerm, filterType, departments, isLoadingDepartments]);

  const openCreate = () => {
    setSelectedEntities(null);
    setIsCreateModalOpen(true);
  };

  const openEdit = (entity: BudgetManager) => {
    setSelectedEntities(entity);
    setIsCreateModalOpen(true);
  };

  const openView = (entity: BudgetManager) => {
    setSelectedEntities(entity);
    setIsViewModalOpen(true);
  };

  const openSelectionModal = (entity: BudgetManager) => {
    setSelectedEntities(entity);
    setIsSelectionModalOpen(true);
  };

  const handleSelectAction = (action: "generate" | "update") => {
    setLicenseMode(action);
    setIsSelectionModalOpen(false);
    setIsLicenseModalOpen(true);
  };

  const handleBackToSelection = () => {
    setIsLicenseModalOpen(false);
    setIsSelectionModalOpen(true);
  };

  const openConfirm = (id: number) => {
    setConfirmEntitiesId(id);
  };

  const closeConfirm = () => {
    setConfirmEntitiesId(null);
  };

  const handleDelete = async () => {
    if (confirmEntitiesId !== null) {
      deleteBudgetManager({
        idBudgetManager: confirmEntitiesId,
      });
      closeConfirm();
    }
  };

  const toggleBlock = (entity: BudgetManager) => {
    console.log(
      "Toggling block for entity:",
      entity.idBudgetManager,
      entity.name
    );
    setIsBlocking(true);

    try {
      updateBudgetManager({
        idBudgetManager: entity.idBudgetManager,
        name: entity.name,
        idDepartment: entity.idDepartment,
        blocked: !entity.blocked,
      });
      refetch();
    } catch (error) {
      setIsBlocking(false);
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir Entidades"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterOptions={filterOptions}
        isFilterOpen={isFilterOpen}
        toggleFilterDropdown={() => setIsFilterOpen((o) => !o)}
        closeFilterDropdown={() => setIsFilterOpen(false)}
      />

      <div className="flex justify-end mb-4 gap-2">
        <ComponetButton
          variant="primary"
          onClick={openCreate}
          className="px-4 py-2 flex items-center gap-2 bg-[#E1B927] hover:bg-[#F0B90B] focus:ring-[#E1B927]"
        >
          <Plus size={16} /> Cadastrar
        </ComponetButton>
      </div>

      <div className="bg-white dark:bg-gray-900 px-3 md:px-0 rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler
          isLoading={isLoadingEntities}
          error={error}
          onRetry={refetch}
        >
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Foto</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  ID Orçamento
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Email</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Departamento
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Função</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Bloqueado
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">
                  Data de expiração da Licença
                </th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entity: BudgetManager, idx) => (
                <tr
                  key={entity.idBudgetManager}
                  className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                >
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {entity.photo ? (
                      <img
                        src={entity.photo}
                        alt={entity.name}
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
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {entity.name}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {entity.email}
                  </td>
                  <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                    {getDepartmentName(entity.idDepartment)}
                  </td>
                  <td className="py-2 md:px-4 md:py-3 whitespace">
                    {getRoleDisplayName(entity.role)}
                  </td>
                  <td className="py-2 md:px-4 md:py-3 whitespace-nowrap">
                    {entity.blocked === true ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">
                        Sim
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                        Não
                      </span>
                    )}
                  </td>
                  <td className="py-2 md:px-4 md:py-3 whitespace-nowrap">
                    {new Date(entity.licenseExpirationDate).toLocaleString()}
                  </td>
                  <td className="py-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => openView(entity)}
                      className="p-2 cursor-pointer bg-blue-50 hover:bg-blue-100 rounded"
                      aria-label="Visualizar"
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => openEdit(entity)}
                      className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                      aria-label="Editar"
                    >
                      <Pencil size={16} className="text-green-600" />
                    </button>

                    <button
                      onClick={() => toggleBlock(entity)}
                      className="p-2 cursor-pointer bg-yellow-50 hover:bg-yellow-100 rounded"
                      aria-label={
                        entity.blocked === true ? "Desbloqueado" : "Bloqueado"
                      }
                      disabled={isBlocking}
                    >
                      {entity.blocked === true ? (
                        <Unlock size={16} className="text-yellow-600" />
                      ) : (
                        <Lock size={16} className="text-yellow-600" />
                      )}
                    </button>
                    {entity.licenseExpirationDate &&
                      isLicenseManageable(entity.licenseExpirationDate) && (
                        <button
                          onClick={() => openSelectionModal(entity)}
                          className="p-2 cursor-pointer bg-purple-50 hover:bg-purple-100 rounded"
                          aria-label="Gerenciar Licença"
                        >
                          <Key size={16} className="text-purple-600" />
                        </button>
                      )}
                    <button
                      onClick={() => openConfirm(entity.idBudgetManager)}
                      className="p-2 cursor-pointer bg-red-50 hover:bg-red-100 rounded"
                      aria-label="Excluir"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-gray-500">
                    Nenhuma entidade encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <CreateEntitiesModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedEntities(null);
        }}
        worker={selectedEntities}
      />

      <ViewEntitiesModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedEntities(null);
        }}
        worker={selectedEntities}
      />

      <DeletePublicationModal
        isOpen={confirmEntitiesId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir entidade"
        message="Tem certeza que deseja excluir esta entidade?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />

      <LicenseActionSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => {
          setIsSelectionModalOpen(false);
          setSelectedEntities(null);
        }}
        onSelect={handleSelectAction}
      />

      <LicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => {
          setIsLicenseModalOpen(false);
          setSelectedEntities(null);
        }}
        budgetManager={selectedEntities}
        onSave={() => {
          refetch();
        }}
        mode={licenseMode}
        onBack={handleBackToSelection}
      />
    </div>
  );
}
