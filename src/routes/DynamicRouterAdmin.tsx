import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "@/components/common/Sidebar";
import TopBar from "@/components/common/TopBar";
import NotFoundScreen from "@/pages/shared/NotFound";
import Settings from "@/pages/shared/Settings";
import PageRegisterStudent from "@/pages/AdministrativeEmployee/registerStudent";
import PageDocumentManagement from "@/pages/AdministrativeEmployee/documentManagement";
import PageRegisTerteacher from "@/pages/AdministrativeEmployee/registerTeacher";
import PageManageClass from "@/pages/AdministrativeEmployee/manageClass";
import PageManageRoom from "@/pages/AdministrativeEmployee/manageRoom";
import PageManageSubject from "@/pages/AdministrativeEmployee/manageSubject";
import PageManageCourse from "@/pages/AdministrativeEmployee/manageCourse";
import Statistics from "@/pages/admin/Statistics";

// import Statistics from "@/pages/admin/Statistics";

const DynamicRouterAdmin: React.FC = () => {
  const location = useLocation();

  // rotas válidas sob /admin/*
  const validRoutes = [
    "/admin/statistics",
    "/admin/document-management",
    "/admin/register-teacher",
    "/admin/register-student",
    "/admin/manage-class",
    "/admin/manage-subject",
    "/admin/manage-room",
    "/admin/manage-course",
    "/admin/settings",
  ];

  // se path não bater em nenhuma rota admin, cai no NotFound
  if (!validRoutes.includes(location.pathname)) {
    return <NotFoundScreen />;
  }

  return (
    <div className="flex h-screen dark:bg-gray-800">
      {/* Sidebar passa role="admin" */}
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col">
        <TopBar />

        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="statistics" element={<Statistics />} />
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

export default DynamicRouterAdmin;
