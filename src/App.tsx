// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";

// Componentes de rotas
import { ProtectedRoutes } from "./contexts/ProtectedRoutes";

// Páginas da área privada

// Páginas da área public
import { PublicRoute } from "./contexts/PublicRouteProps";
// Páginas compartilhadas e públicas
import LoginScreen from "./pages/shared/Login";
import SettingsScreen from "./pages/shared/Settings";
// import RegisterScreen from "./pages/shared/Register";
import { WelcomeScreen } from "./pages/shared/Welcome";
import NotFoundScreen from "./pages/shared/NotFound";

// Layout e rotas dinâmicas
import Layout from "./templates/Layout";
import DynamicRouter from "./routes/DynamicRouter";
import { ConfirmationCodeScreen } from "./pages/shared/ConfirmationCode";

import { ThemeProvider } from "./contexts/ThemeProvider";

import { LocationProvider } from "./contexts/LocationContext";
import DynamicRouterUser from "./routes/DynamicRouterUser";
import DynamicRouterAdmin from "./routes/DynamicRouterAdmin";
import DynamicRouterApprover from "./routes/DynamicRouterApprover";
import DynamicRouterReviewer from "./routes/DynamicRouterReviewer";
import DynamicRouterMaster from "./routes/DynamicRouterMaster";

// Configurar o Query Client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ThemeProvider>
            <LocationProvider>
              <Routes>
                {/* Rotas públicas */}
                <Route element={<PublicRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<LoginScreen />} />
                    <Route path="/login" element={<LoginScreen />} />
                  </Route>

                  {/* <Route path="/register" element={<RegisterScreen />} /> */}
                  <Route
                    path="/confirmation-code"
                    element={<ConfirmationCodeScreen />}
                  />
                  <Route
                    path="recover-password/:step"
                    element={<DynamicRouter />}
                  />
                </Route>

                {/* Rotas protegidas */}
                <Route element={<ProtectedRoutes />}>
                  <Route path="admin/*" element={<DynamicRouterAdmin />} />
                  <Route
                    path="approver/*"
                    element={<DynamicRouterApprover />}
                  />
                  <Route
                    path="reviewer/*"
                    element={<DynamicRouterReviewer />}
                  />
                  <Route path="master/*" element={<DynamicRouterMaster />} />
                  <Route path="welcome" element={<WelcomeScreen />} />
                  <Route path="/settings" element={<SettingsScreen />} />
                  <Route path="/welcome" element={<WelcomeScreen />} />
                  <Route path="planner/*" element={<DynamicRouterUser />} />
                </Route>
                <Route path="*" element={<NotFoundScreen />} />
              </Routes>
            </LocationProvider>
          </ThemeProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
