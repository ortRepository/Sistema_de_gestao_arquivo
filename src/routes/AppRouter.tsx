// import React from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import NotFoundScreen from "@/pages/shared/NotFound.tsx";

// function getRoleFromUserType(
//   type: number
// ): "institution" | "callcenter" | "marketing" {
//   switch (type) {
//     case 2:
//       return "institution";
//     case 3:
//       return "callcenter";
//     case 4:
//       return "marketing";
//     default:
//       return "institution"; // Valor padrão ou tratar erro
//   }
// }

// const AppRouter: React.FC = () => {
//   const { user } = useAuth();

//   if (!user) {
//     return <div>Carregando...</div>;
//   }

//   const role = getRoleFromUserType(user.type);

//   // Renderiza o roteador de acordo com o papel
//   switch (role) {
//     case "institution":
//       return <DynamicRouterAdminInstitution role={role} />;
//     case "callcenter":
//       return <DynamicRouterCallCenter role={role} />;
//     case "marketing":
//       return <DynamicRouterMarketing role={role} />;
//     default:
//       return <NotFoundScreen />;
//   }
// };

// export default AppRouter;
