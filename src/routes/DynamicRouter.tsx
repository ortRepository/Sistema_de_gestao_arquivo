// src/routes/DynamicRouter.tsx
import { ChangeEmailScreen } from "@/pages/shared/ChangeEmail";
import NotFoundScreen from "@/pages/shared/NotFound";
import { ResetPasswordScreen } from "@/pages/shared/ResetPassword";
import { useParams } from "react-router-dom";

const DynamicRouter: React.FC = () => {
  const { step } = useParams<{ step: string }>();

  switch (step) {
    case "change-email":
      return <ChangeEmailScreen />;
    case "reset-password":
      return <ResetPasswordScreen />;
    default:
      return <NotFoundScreen />;
  }
};

export default DynamicRouter;
