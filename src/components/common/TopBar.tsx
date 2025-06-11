import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, LogOut, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { pageTitles } from "@/types/topBar";
import NotificationsModal from "../ui/NotificationsModal";
import { useAuth } from "@/contexts/AuthContext";
import { getEntityName } from "@/lib/utils";
import {
  useGetUser,
  useListNotifications,
  useReadNotification,
  useDeleteNotification,
  useListBudgetManagers,
} from "@/hooks/DynamicApiHooks";
import { Notification, BudgetManager } from "@/types/interfaces";

type LocalNotification = {
  id: number;
  text: string;
  time: string;
  timestamp: number;
  unread: boolean;
  isLicense?: boolean;
};

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: userData } = useGetUser();
  const { data: apiNotificationsData = [] } = useListNotifications(); // Default to empty array
  const { data: budgetManagersData = [] } = useListBudgetManagers(); // Default to empty array
  const { mutateAsync: readNotification } = useReadNotification();
  const { mutateAsync: deleteNotification } = useDeleteNotification();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const currentPage = pageTitles[location.pathname] || {
    title: "Dados Não Encontrados",
    description: "Aguarde os teus dados carregar!",
  };

  const settingsRoute = location.pathname.includes("admin")
    ? "/admin/settings"
    : location.pathname.includes("master")
    ? "/master/settings"
    : location.pathname.includes("reviewer")
    ? "/reviewer/settings"
    : location.pathname.includes("approver")
    ? "/approver/settings"
    : "/planner/settings";

  // Helper to check if license is expiring soon or expired
  const isLicenseManageable = (expirationDate: string | undefined): boolean => {
    if (!expirationDate) return false;
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

  useEffect(() => {
    const converted: LocalNotification[] = [];
    if (Array.isArray(apiNotificationsData)) {
      converted.push(
        ...apiNotificationsData.map((notif: Notification) => {
          const date = new Date(notif.createdIn);
          return {
            id: notif.idNotification,
            text: `${notif.title}: ${notif.description}`,
            time: date.toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            timestamp: date.getTime(),
            unread: !notif.read,
          };
        })
      );
    }

    // Add license expiration notifications
    if (Array.isArray(budgetManagersData)) {
      budgetManagersData.forEach((manager: BudgetManager, index: number) => {
        if (isLicenseManageable(manager.licenseExpirationDate)) {
          const date = new Date();
          const isExpired = manager.licenseExpirationDate
            ? new Date(manager.licenseExpirationDate) < date
            : false;
          converted.push({
            id: -(index + 1), // Negative IDs for license notifications
            text: `Licença de ${manager.name || "Desconhecido"} ${
              isExpired ? "expirou" : "expirará"
            } em ${
              manager.licenseExpirationDate
                ? new Date(manager.licenseExpirationDate).toLocaleDateString(
                    "pt-BR"
                  )
                : "N/A"
            }`,
            time: date.toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            timestamp: date.getTime(),
            unread: true,
            isLicense: true,
          });
        }
      });
    }

    setNotifications(converted);
  }, [apiNotificationsData, budgetManagersData]);

  // Mark notifications as read when modal opens
  useEffect(() => {
    if (isNotificationOpen) {
      notifications.forEach((notif) => {
        if (notif.unread) {
          if (!notif.isLicense) {
            readNotification({ idNotification: String(notif.id) }).catch(
              (error) =>
                console.error("Erro ao marcar notificação como lida", error)
            );
          }
          setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
          );
        }
      });
    }
  }, [isNotificationOpen, notifications, readNotification]);

  // Clear notifications older than 24 hours
  const handleClearOld = () => {
    const filtered = notifications.filter((n) => {
      const difference = Date.now() - n.timestamp;
      return difference < 86400000; // Less than 24 hours
    });
    setNotifications(filtered);
  };

  // Delete all notifications
  const handleClearAll = async () => {
    try {
      const apiNotifications = notifications.filter((n) => !n.isLicense);
      for (const notif of apiNotifications) {
        await deleteNotification({ idNotification: String(notif.id) });
      }
      setNotifications([]);
    } catch (error) {
      console.error("Erro ao deletar notificações", error);
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const entityName = userData?.role ? getEntityName(userData.role) : "";
  const handleLogout = () => {
    logout();
  };
  return (
    <header className="flex flex-col-reverse md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 p-6 py-6 w-full">
      {/* Título da Página */}
      <div className="mt-4 md:mt-0">
        <h1 className="text-2xl font-bold">{currentPage.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {currentPage.description}
        </p>
      </div>

      {/* Área do Usuário */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsNotificationOpen(true)}
          className="relative p-2 rounded-full hover:bg-gray-100 hover:dark:bg-gray-800 cursor-pointer"
        >
          <Bell className="text-gray-600 dark:text-white" size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="z-[990]">
          <NotificationsModal
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            notifications={notifications}
            onClearAll={handleClearAll}
            onClearOld={handleClearOld}
          />
        </div>

        <div className="relative" ref={profileMenuRef}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F9FAFB] dark:bg-gray-700">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="bg-white dark:bg-gray-700 rounded"
            >
              <Avatar src={userData?.photo || undefined} />
            </button>
            <div>
              <span className="hidden md:block text-gray-700 dark:text-white font-medium text-sm truncate">
                {userData?.name || "Não disponível"}
              </span>
              <span className="hidden md:block text-gray-500 dark:text-gray-400 text-xs">
                {entityName || "Não disponível"}
              </span>
            </div>
            <ChevronDown
              size={22}
              className="cursor-pointer"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            ></ChevronDown>
          </div>

          {isProfileMenuOpen && (
            <div className="absolute top-14 right-0 w-55 md:w-51 bg-white dark:bg-gray-900 shadow-lg rounded-md border border-gray-200 dark:border-gray-800 z-[99]">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  navigate(settingsRoute);
                }}
                className="w-full text-left cursor-pointer px-4 py-2 hover:bg-gray-100 hover:dark:bg-gray-800 flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                Configurações
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 hover:dark:bg-gray-800 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Terminar Sessão
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
