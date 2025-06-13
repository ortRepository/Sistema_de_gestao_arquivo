// src/context/AuthContext.tsx
import { clearCache, getCache, setCache } from "@/lib/Cache";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useAuthenticateUser } from "../hooks/DynamicApiHooks";

interface User {
  role: string;
  accessToken: string;
}

interface Path {
  path: string;
}

interface AuthResponse {
  code: number;
  message: string;
  accessToken: string;
  userRole: string;
}

export interface RegisterData {
  name: string;
  email: string;
  telephone: string;
  password: string;
  language: string;
  photo: string;
  code: string;
  gender: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  updateLastPath: (path: string) => Promise<Path>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  // getUserDetails: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => getCache("isAuthenticated") === "true"
  );
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = getCache("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const { mutateAsync: authenticate } = useAuthenticateUser();

  useEffect(() => {
    setCache("isAuthenticated", isAuthenticated ? "true" : "false");
    if (user) getCache("isAuthenticated");
  }, [isAuthenticated, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const storedAuth = getCache("isAuthenticated");
      const storedUser = getCache("user");
      if (storedAuth !== (isAuthenticated ? "true" : "false")) {
        setIsAuthenticated(storedAuth === "true");
      }
      if (storedUser && !user) {
        setUser(JSON.parse(storedUser));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const updateLastPath = async (path: string): Promise<Path> => {
    localStorage.setItem("lastPath", path);
    return { path };
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      // const data: AuthResponse = await authenticate({ email, password });

      // setCache("token", data.accessToken);
      const userData: User = {
        role: "type",
        accessToken: "d",
      };
      setIsAuthenticated(true);
      setUser(userData);
      return userData;
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    clearCache();
    localStorage.removeItem("hasSeenWelcome");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        updateLastPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
