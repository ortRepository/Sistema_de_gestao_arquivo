import { Lock, ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import ComponentInput from "./FormInput";
import { z } from "zod";
import { resetPasswordSchema } from "@/types/type";
import { useEditPassword } from "@/hooks/DynamicApiHooks";
import ComponetButton from "./button";
import { setCache } from "@/lib/Cache";

// Integração do schema de redefinição com um campo adicional para a senha atual
type ResetPasswordData = z.infer<typeof resetPasswordSchema> & {
  current: string;
};

export const SecuritySection = () => {
  const [passwords, setPasswords] = useState<ResetPasswordData>({
    current: "",
    password: "",
    confirmPassword: "",
  });
  const { mutateAsync: editPassword } = useEditPassword();
  const [isLoading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  // Estado de erros para cada campo e um erro geral
  const [errors, setErrors] = useState<{
    current: string;
    password: string;
    confirmPassword: string;
    general: string;
  }>({
    current: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);
  const handlePasswordChange = async () => {
    setErrors({ current: "", password: "", confirmPassword: "", general: "" });

    if (!passwords.current) {
      setErrors((prev) => ({ ...prev, current: "Informe sua senha atual!" }));
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "As senhas não coincidem!",
      }));
      return;
    }

    // Validação: nova senha deve ter pelo menos 8 caracteres
    if (passwords.password.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: "A senha deve ter pelo menos 6 caracteres!",
      }));
      return;
    }

    try {
      setLoading(true);
      // Simula chamada à API

      const response = await editPassword({
        newPassword: passwords.password,
        oldPassword: passwords.current,
      });
      if (response.message === "Password updated successfully") {
        setCache("token", response.result.token);
        setStatusMessage({
          text: "Senha actualizada com sucesso!",
          type: "success",
        });
      } else {
        setStatusMessage({
          text: "Erro ao salvar alterações. Tente novamente!",
          type: "error",
        });
      }
      setPasswords({ current: "", password: "", confirmPassword: "" });
    } catch {
      setErrors((prev) => ({
        ...prev,
        general: "Erro ao atualizar a senha!",
      }));
      setStatusMessage({
        text: "Erro Desconhecido. Tente novamente mais tarde",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8  md:p-8">
      {statusMessage && (
        <div
          className={`
                border-t-4 mb-4 p-4 rounded-lg shadow-md
                ${
                  statusMessage.type === "success"
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }
              `}
        >
          <p
            className={`
                  text-sm flex items-center gap-2
                  ${
                    statusMessage.type === "success"
                      ? "text-green-700"
                      : "text-red-700"
                  }
                `}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {statusMessage.text}
          </p>
        </div>
      )}

      {/* Formulário de Atualização de Senha */}
      <div className="md:p-6 p-2 rounded-xl  dark:bg-gray-900  space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <ShieldCheck className="w-8 h-8 text-[#E1B927]" />
          <h2 className="text-2xl font-medium">Segurança da Conta</h2>
        </div>
        {/* Campo: Senha Atual */}
        <form action="">
          <input
            type="email"
            name="hidden-email"
            autoComplete="username"
            className="hidden"
          />

          <div className="mb-6 space-y-2">
            <ComponentInput
              type="password"
              placeholder="Digite sua senha atual"
              value={passwords.current}
              onChange={(e) =>
                setPasswords({ ...passwords, current: e.target.value })
              }
              icon={Lock}
              label="Senha Atual"
              autoComplete="current-password"
              name="current"
              error={errors.current}
            />
          </div>

          {/* Campos: Nova Senha e Confirmação */}
          <div className="space-y-4">
            <div className="mb-6 space-y-2">
              <ComponentInput
                type="password"
                placeholder="Digite sua nova senha"
                value={passwords.password}
                onChange={(e) =>
                  setPasswords({ ...passwords, password: e.target.value })
                }
                icon={Lock}
                label="Nova Senha"
                autoComplete="current-password"
                name="password"
                error={errors.password}
              />
            </div>
            <div className="mb-6 space-y-2">
              <ComponentInput
                type="password"
                placeholder="Confirme a nova senha"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                icon={Lock}
                label="Confirme a nova senha"
                name="confirmPassword"
                autoComplete="current-password"
                error={errors.confirmPassword}
              />
            </div>

            {/* Mensagens de Feedback Gerais */}
            {errors.general && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg flex gap-2 items-center">
                <Lock className="w-5 h-5" />
                {errors.general}
              </div>
            )}
          </div>
        </form>
        {/* Botão de Atualização */}
        <ComponetButton
          variant="primary"
          className="w-full"
          onClick={handlePasswordChange}
          loading={isLoading}
        >
          Salvar Alterações
        </ComponetButton>
      </div>

      {/* Seção de Autenticação em Dois Fatores */}
      <div className="md:p-6 p-2 rounded-xl bg-gray-50 dark:bg-gray-800  space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-[#E1B927]" />
            <div>
              <h3 className="font-medium">Autenticação em Dois Fatores</h3>
              <p className="text-sm text-gray-600">
                Proteção adicional para seu login
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-[#E1B927]/10 text-[#E1B927] rounded-lg hover:bg-[#E1B927]/20 transition-colors">
            Ativar
          </button>
        </div>
      </div>
    </div>
  );
};
