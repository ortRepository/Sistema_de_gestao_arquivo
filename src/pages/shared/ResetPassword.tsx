import { useState, useEffect } from "react";
import { AlertTriangle, Lock } from "lucide-react";
import ComponentInput from "@/components/common/FormInput";
import ComponetButton from "@/components/common/button";
import logo from "../../assets/logo/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { resetPasswordSchema } from "@/types/type";
import SliderComponent from "@/components/SliderComponent";
import { useReceiveCode } from "@/hooks/DynamicApiHooks";
import { getCache, setCache } from "@/lib/Cache";
import image from "../../assets/image/img-1.png";
export function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { mutateAsync: receiveCode } = useReceiveCode();
  const [isLoading, setIsLoading] = useState(false);
  const handleResetPassword = async () => {
    setIsLoading(true);
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    setError("");

    const passwordData = await getCache("Change_Email_Resert_Password");

    if (!result.success) {
      setIsLoading(false);
      const newErrors = result.error.format();
      setErrors({
        password: newErrors.password?._errors[0] || "",
        confirmPassword: newErrors.confirmPassword?._errors[0] || "",
      });
    } else {
      setErrors({ password: "", confirmPassword: "" });
      try {
        const response = await receiveCode({ email: passwordData });

        if (response.message === "Verification email sent successfully") {
          setIsLoading(false);
          const formdados = {
            newEmail: passwordData,
            password: confirmPassword,
          };
          setCache("Change_Resert_Password", formdados);
          navigate("/confirmation-code");
        } else {
          // Se não houver message, trata o erro genérico
          setError("Erro ao solicitar código de redefinição.");
          setTimeout(() => {
            setError("");
          }, 2000);
        }
      } catch (error: any) {
        let errorMessage = "Erro ao redefinir a senha";
        try {
          if (
            error?.message &&
            typeof error.message === "string" &&
            error.message.trim().startsWith("{")
          ) {
            const parsed = JSON.parse(error.message);
            if (parsed.message) {
              errorMessage = parsed.message;
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }
        } catch {
          errorMessage = error?.message || errorMessage;
        }
        setError(errorMessage);
        setTimeout(() => {
          setError("");
        }, 2000);
      }
    }
  };

  useEffect(() => {
    setErrors((prev) => ({ ...prev, password: "" }));
  }, [password]);

  useEffect(() => {
    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
  }, [confirmPassword]);

  return (
    <div className="flex min-h-screen">
      <SliderComponent img={image} />
      <div className="w-full lg:w-1/2 flex items-center relative justify-center px-4 md:px-8">
        <div className="px-4 md:px-8 w-full">
          <div className="flex justify-center my-4">
            <img src={logo} alt="Logo" className="w-auto h-20" />{" "}
          </div>
          <div className="mb-8 my-8">
            <h2 className="text-2xl mb-2 ">Redefinir Senha</h2>
            <p>Digite sua nova senha e confirme para atualizar.</p>
          </div>
          {/* Exibe o alerta de erro, se houver */}
          {error && (
            <div className="mb-4 p-4 flex items-center gap-2 border border-red-500 text-red-600 rounded bg-red-50">
              <AlertTriangle className="w-6 h-6" />
              <span>Erro ao efetuar login: {error}</span>
            </div>
          )}
          <form>
            <div className="mb-4">
              <ComponentInput
                type="password"
                placeholder="Nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                label="Nova Senha"
                name="password"
                error={errors.password}
              />
            </div>
            <div className="mb-6">
              <ComponentInput
                type="password"
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={Lock}
                label="Confirmar Senha"
                name="confirmPassword"
                error={errors.confirmPassword}
              />
            </div>
          </form>
          <ComponetButton
            variant="primary"
            className="w-full"
            onClick={handleResetPassword}
            loading={isLoading}
          >
            Avançar
          </ComponetButton>
          <div className="my-6 flex justify-start">
            <Link
              to="/recover-password/change-email"
              className="transition-colors"
            >
              Voltar para página{" "}
              <span className="text-[#4D6BFE]">anterior</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordScreen;
