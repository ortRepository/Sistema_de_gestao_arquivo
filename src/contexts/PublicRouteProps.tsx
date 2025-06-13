import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function PublicRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Verifica se a rota atual é a tela de confirmação (ou outra que não deva redirecionar)
  if (location.pathname.includes("confirmation-code")) {
    return <Outlet />;
  }

  const lastPath = localStorage.getItem("lastPath") || "/teacher/documents";
  return isAuthenticated ? (
    <Navigate to={lastPath} replace state={{ from: location }} />
  ) : (
    <Outlet />
  );
}
