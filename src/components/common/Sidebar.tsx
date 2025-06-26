import { JSX, useState } from "react";
import {
  PieChart,
  Settings,
  LogOut,
  Menu,
  FileText,
  Layers,
  BookOpen,
  User,
  Users,
  ClipboardList,
  GitCompareIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo/logo.png";
import logobrnco from "@/assets/logo/logo-branco.png";
import { useAuth } from "@/contexts/AuthContext";
import "@/style/style.css";
import React from "react";
import { useTheme } from "@/contexts/ThemeProvider";

type SidebarProps = {
  role: "teacher" | "admin" | "admin-employee";
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
  const { darkMode } = useTheme();
  let menuItems: MenuItem[] = [];

  if (role === "admin-employee") {
    menuItems = [
      {
        name: "Gerir Documento",
        icon: <FileText size={22} />,
        path: "/admin-employee/document-management",
      },
      {
        name: "Gerir Aluno",
        icon: <User size={22} />,
        path: "/admin-employee/register-student",
      },
      {
        name: "Gerir Professor",
        icon: <Users size={22} />,
        path: "/admin-employee/register-teacher",
      },
      {
        name: "Gerir Turma",
        icon: <ClipboardList size={22} />,
        path: "/admin-employee/manage-class",
      },
      {
        name: "Gerir Sala",
        icon: <GitCompareIcon size={22} />,
        path: "/admin-employee/manage-room",
      },
      {
        name: "Gerir Disciplina",
        icon: <BookOpen size={22} />,
        path: "/admin-employee/manage-subject",
      },
      {
        name: "Gerir Curso",
        icon: <Layers size={22} />, // layers icon
        path: "/admin-employee/manage-course",
      },
      {
        name: "Configurações",
        icon: <Settings size={22} />, // settings icon
        path: "/admin-employee/settings",
      },
    ];
  }

  if (role === "teacher") {
    menuItems = [
      {
        name: "Gerir Documento",
        icon: <FileText size={22} />,
        path: "/teacher/documents",
      },
      {
        name: "Configurações",
        icon: <Settings size={22} />,
        path: "/teacher/settings",
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
        name: "Gerir Documento",
        icon: <FileText size={22} />,
        path: "/admin/document-management",
      },
      {
        name: "Gerir Aluno",
        icon: <User size={22} />,
        path: "/admin/register-student",
      },
      {
        name: "Gerir Professor",
        icon: <Users size={22} />,
        path: "/admin/register-teacher",
      },
      {
        name: "Gerir Turma",
        icon: <ClipboardList size={22} />,
        path: "/admin/manage-class",
      },
      {
        name: "Gerir Sala",
        icon: <GitCompareIcon size={22} />,
        path: "/admin/manage-room",
      },
      {
        name: "Gerir Disciplina",
        icon: <BookOpen size={22} />,
        path: "/admin/manage-subject",
      },
      {
        name: "Gerir Curso",
        icon: <Layers size={22} />, // layers icon
        path: "/admin/manage-course",
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
    <div className="flex  flex-col z-50">
      {/* Menu lateral para desktop */}
      <div
        className={`fixed transition-all duration-300  md:relative md:translate-x-0 bg-[#4D6BFE] dark:bg-gray-900 rounded-r-3xl p-4 flex-col justify-between hidden md:flex shadow-xl dark:shadow-2xl ${
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
                <img
                  src={darkMode ? logobrnco : logo}
                  alt="Logo"
                  className="w-auto"
                />{" "}
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
                        ? "bg-[#465dd1] dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        : "text-gray-800 dark:text-gray-200  hover:bg-[#4D6BFE]/20 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-[#e0e5ffad]"
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
              className={`flex items-center cursor-pointer py-3 px-4 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-[#F59E0B]/20 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-[#4D6BFE] transition-all duration-300 w-full ${
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
                    ? "text-[#4D6BFE]"
                    : "text-gray-600 dark:text-gray-300 hover:text-[#4D6BFE] hover:scale-110"
                }`}
                aria-label={item.name}
              >
                <span
                  className={`${
                    isActive
                      ? "text-[#4D6BFE]"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {React.cloneElement(item.icon, { size: 18 })}
                </span>

                {isActive && (
                  <span className="absolute -bottom-2 w-6 h-1 bg-[#4D6BFE] rounded-full"></span>
                )}
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default Sidebar;
