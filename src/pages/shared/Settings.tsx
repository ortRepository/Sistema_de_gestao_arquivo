import { JSX, useEffect, useState } from "react";
import {
  User,
  Bell,
  Lock,
  Paintbrush,
  Trash2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import ProfileSection from "@/components/common/ProfileSection";
import { SecuritySection } from "@/components/common/SecuritySection";
import { AppearanceSection } from "@/components/common/AppearanceSection";
import { NotificationsSection } from "@/components/common/Notification";
import ComponetButton from "@/components/common/button";
import { useDeleteUser, useGetUser } from "@/hooks/DynamicApiHooks";
import { useAuth } from "@/contexts/AuthContext";
import { Entities } from "@/types/interfaces";

interface DeleteAccountSectionProps {
  userData: Entities | undefined;
}

// Componente para a seção de exclusão de conta
function DeleteAccountSection({ userData }: DeleteAccountSectionProps) {
  // Componente para a seção de exclusão de conta
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { logout } = useAuth();
  const { mutate: deleteUser } = useDeleteUser();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleDeleteAccount = () => {
    if (!userData) return;
    setIsConfirmed(false);
    setIsLoading(true);
    deleteUser(
      { idUser: String(userData.idUser) }, // Adjusted to match Entities interface
      {
        onSuccess: () => {
          setStatusMessage({
            text: "Excluido com sucesso!",
            type: "success",
          });
          logout();
        },
        onError: () => {
          setIsLoading(false);
          setStatusMessage({
            text: "Erro ao excluir usúario. Tente novamente!",
            type: "error",
          });
        },
      }
    );
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 inline-block pb-2">
            Excluir Conta Permanentemente
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Ação irreversível - leia atentamente as consequências
          </p>
        </div>
      </div>

      <div className="space-y-4 p-6 bg-red-50/50 border border-red-100 rounded-xl dark:bg-red-900/20 dark:border-red-800/80">
        <div className="flex gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1 dark:text-red-400" />
          <div className="space-y-3">
            <p className="font-semibold text-lg text-red-700 dark:text-red-200">
              Antes de continuar, esteja ciente que:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-red-600 dark:text-red-300">
              <li>Todos os seus dados serão permanentemente removidos</li>
              <li>Não será possível recuperar nenhuma informação</li>
              <li>Qualquer assinatura ativa será cancelada imediatamente</li>
              <li>Esta ação não pode ser desfeita</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="checkbox"
            id="confirmDelete"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
            className="w-4 h-4 border-red-300 rounded text-red-600 focus:ring-red-500 dark:bg-red-900/50"
          />
          <label
            htmlFor="confirmDelete"
            className="text-sm text-red-600 dark:text-red-300"
          >
            Eu compreendo todas as consequências e desejo excluir minha conta
            permanentemente
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <ComponetButton
          disabled={!isConfirmed}
          loading={isLoading}
          variant="secondary"
          className="bg-red-600 md:w-auto w-full text-white hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 dark:bg-red-700 dark:hover:bg-red-800"
          onClick={handleDeleteAccount}
        >
          Confirmar Exclusão da Conta
        </ComponetButton>
        <ComponetButton
          variant="secondary"
          className="md:w-auto w-full bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-all duration-300"
          onClick={() => setIsConfirmed(false)}
        >
          Cancelar
        </ComponetButton>
      </div>
    </div>
  );
}

// Seção para o Guia do Sistema
function SystemGuideSection() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 inline-block pb-2">
            Guia do Sistema
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Aprenda a usar o sistema com nosso guia oficial
          </p>
        </div>
      </div>

      <div className="space-y-4 p-6 bg-gray-50 border border-gray-100 rounded-xl dark:bg-gray-800 dark:border-gray-700">
        <div className="flex gap-3">
          <BookOpen className="w-6 h-6 text-[#4D6BFE] flex-shrink-0 mt-1 dark:text-[#F59E0B]" />
          <div className="space-y-3">
            <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
              Baixe o Guia do Sistema
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nosso guia em PDF contém todas as informações que você precisa
              para começar a usar o sistema de forma eficiente.
            </p>
            <a
              href="/path/to/system-guide.pdf"
              download
              className="inline-block"
            >
              <ComponetButton
                variant="primary"
                className="bg-[#4D6BFE] text-white hover:bg-[#F59E0B] transition-all duration-300 flex items-center gap-2 dark:bg-[#F59E0B] dark:hover:bg-[#4D6BFE]"
              >
                Baixar Guia (PDF)
              </ComponetButton>
            </a>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Primeiros Passos
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-gray-600 dark:text-gray-400 mt-2">
            <li>Faça login com suas credenciais.</li>
            <li>Configure seu perfil na seção "Perfil".</li>
            <li>Personalize as notificações na seção "Notificações".</li>
            <li>
              Explore as funcionalidades do sistema navegando pelo menu lateral.
            </li>
            <li>Entre em contato com o suporte em caso de dúvidas.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

interface MenuItem {
  id: string;
  icon: JSX.Element;
  label: string;
}

export default function Settings() {
  const [activeMenu, setActiveMenu] = useState("profile");
  const { data: userData } = useGetUser();

  const menuItems: MenuItem[] = [
    { id: "profile", icon: <User size={24} />, label: "Perfil" },
    { id: "security", icon: <Lock size={24} />, label: "Segurança" },
    { id: "appearance", icon: <Paintbrush size={24} />, label: "Aparência" },
    { id: "notifications", icon: <Bell size={24} />, label: "Notificações" },
    { id: "guide", icon: <BookOpen size={24} />, label: "Guia do Sistema" },
    ...(userData?.role !== "ADMIN" && activeMenu !== "delete"
      ? [{ id: "delete", icon: <Trash2 size={24} />, label: "Excluir Conta" }]
      : []),
  ];

  return (
    <div className="w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <div className="max-w-9xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 md:p-8 p-4">
        {/* Side Navigation */}
        <div className="space-y-2 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-lg md:h-[50vh] overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-300 ${
                activeMenu === item.id
                  ? "bg-[#4D6BFE]/40 text-[#4D6BFE] font-semibold border-l-4 border-[#4D6BFE]"
                  : "text-gray-800 dark:text-gray-200 hover:bg-[#4D6BFE]/20 dark:hover:bg-gray-700"
              }`}
            >
              <span className="transition-transform duration-300 hover:scale-110">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-10 border border-gray-100 mb-16 md:mb-0 dark:border-gray-800">
          {activeMenu === "profile" && <ProfileSection userData={userData} />}
          {activeMenu === "security" && <SecuritySection />}
          {activeMenu === "appearance" && <AppearanceSection />}
          {activeMenu === "notifications" && <NotificationsSection />}
          {activeMenu === "guide" && <SystemGuideSection />}
          {activeMenu === "delete" && (
            <DeleteAccountSection userData={userData} />
          )}
        </div>
      </div>
    </div>
  );
}
