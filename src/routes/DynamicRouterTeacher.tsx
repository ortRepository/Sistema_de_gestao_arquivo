import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "@/components/common/Sidebar";
import TopBar from "@/components/common/TopBar";
import Settings from "@/pages/shared/Settings";
import NotFoundScreen from "@/pages/shared/NotFound";
import PageDocuments from "@/pages/teacher/documents";

const DynamicRouterTeacher: React.FC = () => {
  const location = useLocation();

  const validRoutes = ["/teacher/documents", "/teacher/settings"];

  if (!validRoutes.includes(location.pathname)) {
    return <NotFoundScreen />;
  }

  return (
    <div className="flex h-screen dark:bg-gray-800">
      {/* Sidebar fixo */}
      <Sidebar role="teacher" />

      {/* Área de conteúdo com TopBar */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        {/* Conteúdo com rolagem */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="documents" element={<PageDocuments />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DynamicRouterTeacher;
