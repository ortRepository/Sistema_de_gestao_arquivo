import { JSX, useState } from "react";
import {
  PieChart,
  Clock,
  Settings,
  Mail,
  LogOut,
  Menu,
  CalendarClock,
  Map,
  FileText,
  UserCog,
  ClipboardMinus,
  Layers,
  Network,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo/logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import "@/style/style.css";
import React from "react";

type SidebarProps = {
  role: "planner" | "admin" | "approver" | "reviewer" | "master";
  availableRoutes?: string[];
};

interface MenuItem {
  name: string;
  icon: JSX.Element;
  path: string;
}

const Sidebar = ({ role, availableRoutes }: SidebarProps) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Define menu items based on role   "/approver/budget-map",

  let menuItems: MenuItem[] = [];

  if (role === "planner") {
    menuItems = [
      {
        name: "Mapa Orçamentário",
        icon: <Map size={22} />,
        path: "/planner/budget-map",
      },
      {
        name: "Estátisca",
        icon: <PieChart size={22} />,
        path: "/planner/statistic",
      },
      {
        name: "Histórico",
        icon: <Clock size={22} />,
        path: "/planner/budget-history",
      },
      { name: "Correio", icon: <Mail size={22} />, path: "/planner/mail" },
      {
        name: "Configurações",
        icon: <Settings size={22} />,
        path: "/planner/settings",
      },
    ];
  }

  if (role === "approver") {
    menuItems = [
      {
        name: "Mapa Orçamentário",
        icon: <Map size={22} />,
        path: "/approver/budget-map",
      },
      {
        name: "Histórico",
        icon: <Clock size={22} />,
        path: "/approver/budget-history",
      },
      {
        name: "Configurações",
        icon: <Settings size={22} />,
        path: "/approver/settings",
      },
    ];
  }

  if (role === "reviewer") {
    menuItems = [
      {
        name: "Mapa Orçamentário",
        icon: <Map size={22} />,
        path: "/reviewer/budget-map",
      },
      {
        name: "Histórico",
        icon: <Clock size={22} />,
        path: "/reviewer/budget-history",
      },
      {
        name: "Configurações",
        icon: <Settings size={22} />,
        path: "/reviewer/settings",
      },
    ];
  }
  if (role === "master") {
    menuItems = [
      {
        name: "Mapa Orçamentário",
        icon: <Map size={22} />,
        path: "/master/budget-map",
      },
      {
        name: "Visualizar Gráfico",
        icon: <PieChart size={22} />,
        path: "/master/view-graph",
      },
      {
        name: "Revisar Orçamento",
        icon: <Clock size={22} />,
        path: "/master/review-budget",
      },
      {
        name: "Configurações",
        icon: <Settings size={22} />,
        path: "/master/settings",
      },
    ];
  }
  if (role === "admin") {
    menuItems = [
      {
        name: "Estatística",
        icon: <PieChart size={22} />,
        path: "/admin/statistics",
      },
      {
        name: "Estrutura Organizacional",
        icon: <Network size={22} />,
        path: "/admin/organizational-structure",
      },

      // {
      //   name: "Gerir Direções",
      //   icon: <Building size={22} />,
      //   path: "/admin/directions",
      // },
      // {
      //   name: "Gerir Seções",
      //   icon: <BellElectric size={22} />,
      //   path: "/admin/sections",
      // },
      // {
      //   name: "Gerir Departamentos",
      //   icon: <Users size={22} />,
      //   path: "/admin/departments",
      // },
      // {
      //   name: "Gerir Entidades",
      //   icon: <Server size={22} />,
      //   path: "/admin/entities",
      // },
      {
        name: "Centros de Custo",
        icon: <Layers size={22} />,
        path: "/admin/cost-center-management",
      },
      {
        name: "Control Orçamental",
        icon: <FileText size={22} />,
        path: "/admin/budget-controls",
      },
      {
        name: "Gerir Conta",
        icon: <UserCog size={22} />,
        path: "/admin/manage-account",
      },
      {
        name: "Gerir Classe",
        icon: <ClipboardMinus size={22} />,
        path: "/admin/manage-class",
      },
      {
        name: "Gerir Cronogramas",
        icon: <CalendarClock size={22} />,
        path: "/admin/schedules",
      },
      {
        name: "Configurações",
        icon: <Settings size={22} />,
        path: "/admin/settings",
      },
    ];
  }

  // Filter out items if routes are not available
  if (availableRoutes && availableRoutes.length > 0) {
    menuItems = menuItems.filter((item) => availableRoutes.includes(item.path));
  }

  const handleLogout = () => {
    logout();
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="flex flex-col z-50">
      {/* Menu lateral para desktop */}
      <div
        className={`fixed transition-all duration-300 md:relative md:translate-x-0 bg-[#E1B927] dark:bg-gray-900 rounded-r-3xl h-screen p-4 flex-col justify-between hidden md:flex shadow-xl dark:shadow-2xl ${
          isExpanded ? "w-64" : "w-20"
        } ${isExpanded ? "relative" : ""}`}
        aria-expanded={isExpanded}
      >
        {/* Curvatura no fundo quando expandido */}
        {isExpanded && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-r-[3rem] -z-10" />
        )}

        <div className="h-full flex flex-col justify-between">
          <div>
            <div
              className={` my-4 ${
                isExpanded
                  ? "flex items-center justify-between"
                  : "flex flex-col-reverse items-center justify-center"
              }`}
            >
              <div
                className={`relative flex items-center ${
                  isExpanded ? "justify-start" : "justify-center"
                } ${isExpanded ? "w-28 h-28" : "w-12 h-12"}`}
              >
                <span
                  className={`text-xl font-bold transition-transform duration-300 hover:scale-105 ${
                    isExpanded
                      ? "text-3xl bg-clip-text text-transparent bg-gradient-to-r from-[#E1B927] to-[#F59E0B] "
                      : "text-white"
                  }`}
                >
                  Logo
                </span>
              </div>
              <button
                onClick={toggleExpand}
                className="text-gray-800 dark:text-gray-200 cursor-pointer"
                aria-label={isExpanded ? "Contrair menu" : "Expandir menu"}
              >
                <Menu size={22} />
              </button>
            </div>
            <ul className="space-y-4">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li
                    key={item.name}
                    className={`flex items-center py-3 px-4 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-[#d6b643] dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        : "text-gray-800 dark:text-gray-200  hover:bg-[#F59E0B]/20 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-[#dac889]"
                    } ${isExpanded ? "justify-start" : "justify-center"}`}
                  >
                    <Link
                      to={item.path}
                      className="flex items-center gap-3"
                      aria-label={item.name}
                    >
                      <span
                        className={`transition-colors duration-300 ${
                          isActive
                            ? "text-gray-800 dark:text-gray-200"
                            : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`${
                          isExpanded ? "block" : "hidden"
                        } text-base font-medium`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-8">
            <button
              onClick={handleLogout}
              className={`flex items-center cursor-pointer py-3 px-4 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-[#F59E0B]/20 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-[#E1B927] transition-all duration-300 w-full ${
                isExpanded ? "justify-start" : "justify-center"
              }`}
              aria-label="Terminar Sessão"
            >
              <LogOut size={22} />
              <span
                className={`${
                  isExpanded ? "block ml-3" : "hidden"
                } text-base font-medium`}
              >
                Terminar Sessão
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu bottom para telas menores */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 p-4 shadow-t-lg dark:shadow-t-gray-800 flex justify-around items-center md:hidden border-t border-gray-200 dark:border-gray-700">
        {menuItems
          .filter((item) => item.name !== "Configurações")
          .map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex flex-col items-center gap-2 relative transition-all duration-300 ${
                  isActive
                    ? "text-[#E1B927]"
                    : "text-gray-600 dark:text-gray-300 hover:text-[#E1B927] hover:scale-110"
                }`}
                aria-label={item.name}
              >
                <span
                  className={`${
                    isActive
                      ? "text-[#E1B927]"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {React.cloneElement(item.icon, { size: 18 })}
                </span>

                {isActive && (
                  <span className="absolute -bottom-2 w-6 h-1 bg-[#E1B927] rounded-full"></span>
                )}
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default Sidebar;
