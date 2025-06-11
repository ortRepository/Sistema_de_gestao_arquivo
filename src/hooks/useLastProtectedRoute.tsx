// src/hooks/useLastProtectedRoute.ts
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useLastProtectedRoute() {
  const location = useLocation();

  useEffect(() => {
    const publicRoutes = ["/login", "/register", "/confirmation-code", "/recover-password"];
    if (!publicRoutes.includes(location.pathname)) {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location]);
}
