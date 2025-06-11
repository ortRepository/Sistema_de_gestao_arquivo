import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Rotas que não devem ser afetadas pelo tema
    const unaffectedRoutes = [
      "/login",
      "/",
      "/register",
      "/recover-password/change-email",
      "/recover-password/reset-password",
      "/confirmation-code",
    ];
    if (!unaffectedRoutes.includes(location.pathname)) {
      if (darkMode) {
        document.documentElement.classList.add("dark");
        document.documentElement.style.backgroundColor = "#1e2939";
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.backgroundColor = "#ffffff";
        localStorage.setItem("theme", "light");
      }
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.backgroundColor = "#ffffff";
    }
  }, [darkMode, location.pathname]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
