import { useState, useRef, useEffect } from "react";
import {
  User,
  Mail,
  Loader2,
  Camera,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import ComponetButton from "./button";
import {
  useChangeEmail,
  useReceiveCode,
  useUpdateUser,
  useUploadPhoto,
} from "@/hooks/DynamicApiHooks";
import { confirmationCodeSchema } from "@/types/type";
import LocationSelect from "./LocationSelectComponent";
import { Entities } from "@/types/interfaces";
interface EntitiesSectionProps {
  userData: Entities | undefined;
}

export default function ProfileSection({ userData }: EntitiesSectionProps) {
  // Estado para atualização dos dados básicos (nome, telefone, localização)
  const [updateData, setUpdateData] = useState({
    name: userData?.name || "",
    location: userData?.location ? userData?.location : "",
  });

  // Hooks
  const { mutateAsync: updateUser } = useUpdateUser();
  const { mutateAsync: receiveCode } = useReceiveCode();
  const { mutateAsync: changeEmail } = useChangeEmail();
  const { mutateAsync: uploadPhoto } = useUploadPhoto();

  // Estados para gerenciamento de mudança de e-mail e upload de avatar
  const [loading, setLoading] = useState({
    email: false,
    avatar: false,
    code: false,
  });
  const [emailEdit, setEmailEdit] = useState({
    newEmail: "",
    code: "",
    password: "",
    step: 1, // 1 = edição, 2 = verificação do código
  });
  const [codeError, setCodeError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const emailIsSame = emailEdit.newEmail === userData?.email;

  // Efeito para limpar mensagens de status após 3 segundos
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Efeito para contagem regressiva de reenvio de código
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Função para envio do código de verificação para o novo e-mail
  const sendVerificationCode = async () => {
    if (!emailEdit.newEmail || !emailEdit.password) {
      setCodeError("Preencha o novo e-mail e a senha para continuar.");
      return;
    }
    if (emailIsSame) {
      setCodeError(
        "Você não pode usar o mesmo e-mail. Informe um novo e-mail."
      );
      return;
    }
    if (resendCountdown > 0) return;
    setLoading((prev) => ({ ...prev, email: true }));
    try {
      const response = await receiveCode({ email: emailEdit.newEmail });
      if (response.message === "Verification email sent successfully") {
        setEmailEdit((prev) => ({ ...prev, step: 2 }));
        setResendCountdown(60);
        setCodeError("");
      } else if (response.message.includes("already in use")) {
        setCodeError("Esse e-mail já está em uso.");
      } else {
        setCodeError(response.message || "Erro inesperado.");
      }
    } catch (error) {
      setCodeError("Erro ao enviar o código.");
      console.error("Erro ao enviar o código:", error);
    } finally {
      setLoading((prev) => ({ ...prev, email: false }));
    }
  };

  // Função para verificar o código de verificação
  const verifyCode = async () => {
    setLoading((prev) => ({ ...prev, code: true }));
    const result = confirmationCodeSchema.safeParse({ code: emailEdit.code });
    if (!result.success) {
      const message =
        result.error.format().code?._errors[0] || "Código inválido";
      setCodeError(message);
      setLoading((prev) => ({ ...prev, code: false }));
      return;
    }
    try {
      const response = await changeEmail({
        newEmail: emailEdit.newEmail,
        code: emailEdit.code,
        password: emailEdit.password,
      });
      if (response.message === "Email updated successfully") {
        setCodeError("");
        setEmailEdit({ newEmail: "", code: "", password: "", step: 1 });
        setStatusMessage({
          text: "E-mail atualizado com sucesso!",
          type: "success",
        });
      } else if (response.message.includes("incorrect code")) {
        setCodeError("Código incorreto. Verifique e tente novamente.");
      } else if (response.message.includes("already in use")) {
        setCodeError("Esse e-mail já está em uso.");
      } else {
        setCodeError(response.message || "Erro ao alterar o e-mail.");
      }
    } catch (error: any) {
      setCodeError(error.message || "Erro ao verificar o código");
    } finally {
      setLoading((prev) => ({ ...prev, code: false }));
    }
  };

  // Função para upload de imagem
  const handleImageUpload = async (file: File) => {
    const MAX_SIZE = 6 * 1024 * 1024; // 6 MB em bytes
    if (file.size > MAX_SIZE) {
      setStatusMessage({
        text: "Arquivo muito grande! O limite é 6 MB.",
        type: "error",
      });
      return;
    }

    setLoading((prev) => ({ ...prev, avatar: true }));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await uploadPhoto(formData);

      if (response.message === "Photo updated successfully") {
        setStatusMessage({
          text: "Foto carregada com sucesso!",
          type: "success",
        });
      } else {
        setStatusMessage({
          text: "Erro ao salvar alterações. Tente novamente!",
          type: "error",
        });
      }
    } catch (error) {
      setStatusMessage({
        text: "Erro Desconhecido. Tente novamente mais tarde.",
        type: "error",
      });
    }

    // Atualiza o preview da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setLoading((prev) => ({ ...prev, avatar: false }));
    };
    reader.readAsDataURL(file);
  };

  // Função para salvar atualizações do perfil
  const handleSaveUpdate = async () => {
    setIsLoading(true);
    const locationValue =
      updateData.location?.trim() ||
      userData?.location?.trim() ||
      "não disponível";

    if (!locationValue) {
      setIsLoading(false);
      setStatusMessage({
        text: "O campo 'Localização' é obrigatório.",
        type: "error",
      });
      return;
    }

    if (!userData?.idUser) {
      setIsLoading(false);
      setStatusMessage({
        text: "ID do usuário não encontrado. Tente novamente mais tarde.",
        type: "error",
      });
      return;
    }

    try {
      const response = await updateUser({
        idUser: String(userData?.idUser),
        name: updateData.name
          ? String(updateData.name)
          : String(userData?.name || ""),
        language: String(userData?.language || "pt"),
        theme: 0,
        location: locationValue,
        subscriber: true,
      });

      if (response.message === "User updated successfully") {
        setIsLoading(false);
        setStatusMessage({
          text: "Actualizado com sucesso",
          type: "success",
        });
      } else {
        setIsLoading(false);
        setStatusMessage({
          text: "Erro ao salvar alterações. Tente novamente!",
          type: "error",
        });
      }
    } catch (error) {
      setIsLoading(false);
      setStatusMessage({
        text: "Erro Desconhecido. Tente novamente mais tarde.",
        type: "error",
      });
    }
  };

  return (
    <div className="w-full md:p-8">
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
      {/* Bloco de foto e informações */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
        <div className="relative group">
          {imagePreview || userData?.photo ? (
            <img
              src={imagePreview ?? userData?.photo ?? undefined}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gray-200 flex items-center justify-center">
              <User className="w-12 h-12 text-gray-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white/10 rounded-full backdrop-blur-sm"
            >
              {loading.avatar ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && handleImageUpload(e.target.files[0])
            }
          />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-medium">{userData?.name}</h2>
          <p className="text-gray-600">{userData?.email}</p>
        </div>
      </div>

      {/* Formulário de Edição */}
      <div className="space-y-6 w-full">
        <form action="">
          {/* Campo para Nome */}
          <div className="space-y-4 my-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              Nome Completo
            </label>
            <div className="flex items-center gap-3 p-3 rounded border border-gray-200 focus-within:border-[#E1B927]">
              <User className="text-gray-400" />
              <input
                type="text"
                value={updateData.name || String(userData?.name)}
                onChange={(e) =>
                  setUpdateData({ ...updateData, name: e.target.value })
                }
                className="flex-1 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Campo para Localização com LocationSelect */}
          <div className="space-y-4 my-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              Localização
            </label>
            <LocationSelect
              value={String(updateData.location)}
              onChange={(value) => {
                setUpdateData((prev) => ({
                  ...prev,
                  location: value,
                }));
              }}
            />
          </div>

          {/* Campo para E-mail e verificação */}
          <div className="space-y-3 my-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              Endereço de E-mail
            </label>
            <div className="flex flex-col md:w-auto w-full md:flex-row items-center gap-2 p-2 rounded border border-gray-200 focus-within:border-[#E1B927]">
              <Mail className="text-gray-400" />
              <input
                placeholder={userData?.email || String(userData?.email)}
                type="email"
                value={
                  emailEdit.step === 2 ? userData?.email : emailEdit.newEmail
                }
                onChange={(e) => {
                  if (emailEdit.step === 1) {
                    setEmailEdit({ ...emailEdit, newEmail: e.target.value });
                  }
                }}
                disabled={emailEdit.step === 2}
                className="flex-1 dark:bg-gray-900 py-2 focus:outline-none disabled:opacity-50 md:w-auto w-full"
                autoComplete="email"
              />
              {emailEdit.step === 1 &&
                emailEdit.newEmail !== userData?.email &&
                emailEdit.newEmail && (
                  <button
                    onClick={sendVerificationCode}
                    disabled={loading.email || resendCountdown > 0}
                    className="ml-auto px-4 py-2 bg-[#E1B927] text-white rounded cursor-pointer hover:bg-[#FF8E00] disabled:opacity-50"
                  >
                    {loading.email ? (
                      <Loader2 className="animate-spin" />
                    ) : resendCountdown > 0 ? (
                      `Reenviar em ${resendCountdown}s`
                    ) : (
                      "Alterar E-mail"
                    )}
                  </button>
                )}
            </div>
            {emailEdit.step === 1 &&
              emailEdit.newEmail === userData?.email &&
              emailEdit.newEmail && (
                <p className="text-sm text-red-500">
                  Você não pode usar o mesmo e-mail. Informe um novo e-mail.
                </p>
              )}
          </div>

          {/* Campo para Senha (apenas na etapa 1) */}
          {emailEdit.step === 1 && (
            <div className="space-y-3">
              <label className="text-gray-700 dark:text-white text-sm w-32">
                Senha Atual:
              </label>
              <div className="flex flex-col md:flex-row items-center gap-2 p-2 rounded border border-gray-200 focus-within:border-[#E1B927] mt-4">
                <input
                  type="password"
                  value={emailEdit.password}
                  onChange={(e) =>
                    setEmailEdit({ ...emailEdit, password: e.target.value })
                  }
                  autoComplete="current-password"
                  placeholder="Informe sua senha"
                  className="flex-1 dark:bg-gray-900 py-2 focus:outline-none md:w-auto w-full"
                />
              </div>
            </div>
          )}

          {!emailEdit.password && emailEdit.newEmail && (
            <p className="text-sm text-red-500 my-3">
              Informe sua senha para continuar.
            </p>
          )}

          {/* Verificação de Código */}
          {emailEdit.step === 2 && (
            <div className="space-y-4 mt-4 pl-4 border-l-4 border-[#E1B927]">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <input
                  type="text"
                  value={emailEdit.code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 4) {
                      setEmailEdit({ ...emailEdit, code: value });
                      if (codeError) setCodeError("");
                    }
                  }}
                  placeholder="Código de verificação"
                  className={`flex-1 p-2 border-b-2 outline-none ${
                    codeError
                      ? "border-red-500"
                      : "border-gray-200 focus:border-[#E1B927]"
                  }`}
                />
                <button
                  onClick={verifyCode}
                  disabled={loading.code || emailEdit.code.length !== 4}
                  className="px-4 py-2 bg-[#E1B927] text-white rounded cursor-pointer hover:bg-[#FF8E00] disabled:opacity-50"
                >
                  {loading.code ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Verificar Código"
                  )}
                </button>
              </div>
              {codeError && (
                <p className="text-sm text-red-500">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  {codeError}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-white">
                Enviamos um código de verificação para{" "}
                <strong className="text-[#FF8E00]">{emailEdit.newEmail}</strong>
              </p>
              <button
                onClick={() =>
                  setEmailEdit({
                    ...emailEdit,
                    step: 1,
                    code: "",
                    password: "",
                  })
                }
                className="text-sm text-blue-600 hover:underline mt-2 cursor-pointer"
              >
                Alterar novo e-mail
              </button>
            </div>
          )}
        </form>

        {/* Botão para salvar alterações */}
        <ComponetButton
          variant="primary"
          className="w-full"
          onClick={handleSaveUpdate}
          loading={isLoading}
        >
          Salvar Alterações
        </ComponetButton>
      </div>
    </div>
  );
}
