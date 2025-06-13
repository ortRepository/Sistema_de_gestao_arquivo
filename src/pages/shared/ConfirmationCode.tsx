import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmationCodeInput } from "@/components/common/ConfirmationCodeInput";
import { confirmationCodeSchema } from "@/types/type";
import logo from "../../assets/logo/logo_login.svg";
import SliderComponent from "@/components/SliderComponent";
import ComponetButton from "@/components/common/button";
import { truncateText } from "@/lib/utils";
import { Loader2, AlertTriangle } from "lucide-react";
import { getCache } from "@/lib/Cache";

import { useReceiveCode, useRecoverPassworde } from "@/hooks/DynamicApiHooks";
import Modal from "@/components/ui/ModalResponse";
import image from "../../assets/image/Subtração 10.png";
export function ConfirmationCodeScreen() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [userEmail, setUserEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [confirmationError, setConfirmationError] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { mutateAsync: receiveCode } = useReceiveCode();
  const { mutateAsync: recoverpassworde } = useRecoverPassworde();

  useEffect(() => {
    const handleEmail = async () => {
      const userData = await getCache("Change_Email_Register");
      const passwordData = await getCache("Change_Email_Resert_Password");
      if (userData) {
        setUserEmail(userData);
      } else if (passwordData) {
        setUserEmail(passwordData);
      }
    };
    handleEmail();
  }, []);

  const handleBack = async () => {
    const userData = await getCache("Change_Email_Register");
    const passwordData = await getCache("Change_Email_Resert_Password");
    if (userData) {
      navigate("/register");
    } else if (passwordData) {
      navigate("/recover-password/reset-password");
    }
  };

  const handleSubmit = async () => {
    setConfirmationError("");

    if (code.length !== 4) {
      setError("O código deve ter exatamente 6 dígitos");
      setConfirmationError("O código deve ter exatamente 4 dígitos");
      return;
    }

    const result = confirmationCodeSchema.safeParse({ code });
    if (!result.success) {
      const formatted = result.error.format();
      setError(formatted.code?._errors[0] || "Código inválido");
      setConfirmationError(formatted.code?._errors[0] || "Código inválido");
      return;
    }

    setIsLoading(true);
    try {
      // const userData = await getCache("Change_Email_Register");
      const passwordData = await getCache("Change_Email_Resert_Password");

      // if (userData) {
      //   const storedData = await getCache("FormDados");

      //   const dummyData =
      //     typeof storedData === "string" ? JSON.parse(storedData) : storedData;
      //   if (!dummyData) {
      //     setConfirmationError(
      //       "Dados do formulário não encontrados. Por favor, tente novamente."
      //     );
      //     setIsLoading(false);
      //     return;
      //   }

      //   dummyData.code = code;
      //   dummyData.language = "Não disponivel";
      //   dummyData.telephone = "Não disponivel";
      //   await register(dummyData);

      //   setIsLoading(false);
      //   setModalMessage("Conta confirmada com sucesso.");
      //   setModalVisible(true);
      //   setTimeout(() => {
      //     setModalVisible(false);
      //     setTimeout(() => {
      //       navigate("/welcome");
      //     }, 500);
      //   }, 3000);
      // }

      if (passwordData) {
        const ResertDados = await getCache("Change_Resert_Password");
        setIsLoading(false);
        if (ResertDados) {
          const response = await recoverpassworde({
            email: userEmail,
            code: code,
            newPassword: ResertDados.password,
          });
          console.log(response.message);
          if (response.message) {
            setModalMessage("Senha redefinida com sucesso.");
            setModalVisible(true);
            setTimeout(() => {
              setModalVisible(false);
              setTimeout(() => {
                navigate("/login");
              }, 500);
            }, 3000);
          } else {
            setConfirmationError("Erro ao redefinir a senha");
          }
        } else {
          setConfirmationError(
            "Dados para redefinição de senha não encontrados"
          );
        }
      }
    } catch (error: any) {
      setIsLoading(false);
      let errorMsg = "Erro ao confirmar o código";
      try {
        if (error?.message && typeof error.message === "string") {
          // Tenta fazer o parse se possível
          try {
            const parsed = JSON.parse(error.message);
            if (parsed && parsed.message) {
              errorMsg = parsed.message;
            } else {
              errorMsg = "Erro ao confirmar o código";
            }
          } catch {
            // Se o parse falhar, use a mensagem diretamente
            errorMsg = error.message;
          }
        }
      } catch {
        errorMsg = error?.message || errorMsg;
      }

      setConfirmationError(errorMsg);
      setTimeout(() => {
        setConfirmationError("");
      }, 2000);
    }
  };

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    setResendCountdown(59);
    await receiveCode({ email: userEmail });
  };

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCountdown]);

  return (
    <div className="flex min-h-screen">
      <SliderComponent img={image} />
      <div className="w-full lg:w-1/2 flex items-center relative justify-center px-4 md:px-8">
        <div className="px-4 md:px-8 w-full">
          <div className="flex justify-center my-8">
            {/* <img src={logo} alt="Logo" className="w-20 h-20" /> */}
            <p className="text-3xl">Logo</p>
          </div>
          <h2 className="text-2xl mb-2">Código de Confirmação</h2>
          <p className="mb-6">
            Enviamos um código para seu email. Verifique seu{" "}
            <span className="text-[#4D6BFE]">
              {truncateText(userEmail, 20, "end")}
            </span>
          </p>
          {/* Exibe mensagem de erro inline */}
          {confirmationError && (
            <div className="mb-4 p-4 flex items-center gap-2 border border-red-500 text-red-600 rounded bg-red-50">
              <AlertTriangle className="w-6 h-6" />
              <span>Erro ao confirmar o código: {confirmationError}</span>
            </div>
          )}
          <div className="mb-4">
            <ConfirmationCodeInput
              length={4}
              onComplete={setCode}
              error={error}
            />
          </div>
          <ComponetButton
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading || code.length !== 4}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-5 h-5 text-white" />
                Processando...
              </span>
            ) : (
              "Confirmar Código"
            )}
          </ComponetButton>
          <div className="flex my-6 flex-col-reverse md:flex-row space-y-3 md:space-y-0 md:items-center md:justify-between">
            <div>
              <a href="#" className="transition-colors" onClick={handleBack}>
                Voltar para página{" "}
                <span className="text-[#4D6BFE]">anterior</span>
              </a>
            </div>
            <div className="mb-3 md:mb-0">
              {resendCountdown > 0 ? (
                <span className="text-gray-500">
                  Reenviar código em {resendCountdown}s
                </span>
              ) : (
                <a
                  href="#"
                  className="hover:text-[#4D6BFE]"
                  onClick={handleResend}
                >
                  Reenviar código
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de sucesso */}
      {modalVisible && (
        <Modal
          message={modalMessage}
          type="success"
          onClose={() => setModalVisible(false)}
        />
      )}
    </div>
  );
}
