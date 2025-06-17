import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "@/components/common/Sidebar";
import TopBar from "@/components/common/TopBar";
import Settings from "@/pages/shared/Settings";
import NotFoundScreen from "@/pages/shared/NotFound";
import PageDocumentManagement from "@/pages/AdministrativeEmployee/documentManagement";
import PageRegisterStudent from "@/pages/AdministrativeEmployee/registerStudent";
import PageRegisTerteacher from "@/pages/AdministrativeEmployee/registerTeacher";
import PageManageClass from "@/pages/AdministrativeEmployee/manageClass";
import PageManageRoom from "@/pages/AdministrativeEmployee/manageRoom";
import PageManageSubject from "@/pages/AdministrativeEmployee/manageSubject";
import PageManageCourse from "@/pages/AdministrativeEmployee/manageCourse";


const DynamicRouterAdmEmployee: React.FC = () => {
  const location = useLocation(); // Obtém a URL atual

  // Lista das rotas válidas dentro de /user/
  const validRoutes = [
    "/admin-employee/document-management",
    "/admin-employee/register-teacher",
    "/admin-employee/register-student",
    "/admin-employee/manage-class",
    "/admin-employee/manage-subject",
    "/admin-employee/manage-room",
    "/admin-employee/manage-course",
    "/admin-employee/settings",
  ];

  // Se a rota não estiver na lista, renderiza apenas o NotFoundScreen
  if (!validRoutes.includes(location.pathname)) {
    return <NotFoundScreen />;
  }

  return (
    <div className="flex h-screen dark:bg-gray-800">
      {/* Sidebar fixo */}
      <Sidebar role="admin-employee" />

      {/* Área de conteúdo com TopBar */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        {/* Conteúdo com rolagem */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="register-student" element={<PageRegisterStudent />} />
            <Route
              path="document-management"
              element={<PageDocumentManagement />}
            />
            <Route path="register-teacher" element={<PageRegisTerteacher />} />
            <Route path="manage-class" element={<PageManageClass />} />
            <Route path="manage-room" element={<PageManageRoom />} />
            <Route path="manage-subject" element={<PageManageSubject />} />
            <Route path="manage-course" element={<PageManageCourse />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DynamicRouterAdmEmployee;
