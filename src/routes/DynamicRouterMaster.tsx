import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "@/components/common/Sidebar";
import TopBar from "@/components/common/TopBar";
import Settings from "@/pages/shared/Settings";
import NotFoundScreen from "@/pages/shared/NotFound";
import ChangBudget from "@/pages/planner/budget";
import ViewGraph from "@/pages/masterUser/Viewgraph";

const DynamicRouterMaster: React.FC = () => {
  const location = useLocation(); // Obtém a URL atual

  // Lista das rotas válidas dentro de /approver/
  const validRoutes = [
    "/master/budget-map",
    "/master/review-budget",
    "/master/view-graph",
    "/master/settings",
    "/master/mail",
  ];

  // Se a rota não estiver na lista, renderiza apenas o NotFoundScreen
  if (!validRoutes.includes(location.pathname)) {
    return <NotFoundScreen />;
  }

  return (
    <div className="flex h-screen dark:bg-gray-800">
      {/* Sidebar fixo */}
      <Sidebar role="master" />
      {/* Área de conteúdo com TopBar */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="budget-map" element={<ChangBudget />} />

            <Route path="view-graph" element={<ViewGraph />} />
            <Route path="review-budget" element={<ChangBudget />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DynamicRouterMaster;
