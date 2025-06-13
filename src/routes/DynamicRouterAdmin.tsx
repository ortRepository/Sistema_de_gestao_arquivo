import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "@/components/common/Sidebar";
import TopBar from "@/components/common/TopBar";
import NotFoundScreen from "@/pages/shared/NotFound";
import Settings from "@/pages/shared/Settings";
// import Statistics from "@/pages/admin/Statistics";

const DynamicRouterAdmin: React.FC = () => {
  const location = useLocation();

  // rotas válidas sob /admin/*
  const validRoutes = [
    "/admin/statistics",
    "/admin/manage-account",
    "/admin/manage-class",
    "/admin/schedules",
    "/admin/cost-center-management",
    "/admin/budget-controls",
    "/admin/settings",
    "/admin/organizational-structure",
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
            {/* <Route path="statistics" element={<Statistics />} /> */}
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DynamicRouterAdmin;
