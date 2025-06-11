import { useState, useRef, useEffect, useMemo, useCallback } from "react";

import ChatWindow from "@/components/common/ChatWindow";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import ConversationList from "@/components/common/ConversationList";
import ErrorModal from "@/components/common/ErrorModal";
import {
  useCreateMail,
  useDeleteMail,
  useReceivedMails,
  useSentMails,
  useGetAll,
  useGetUser,
} from "@/hooks/DynamicApiHooks";

interface Attachment {
  url: string;
  name: string;
  type: string;
}

interface User {
  id: number;
  name: string;
  avatar: string;
}

export interface Message {
  id: number;
  user: User;
  text: string;
  attachments: Attachment[];
  timestamp: string;
  conversationPartnerId: number;
}

export interface Conversation {
  id: number;
  name: string;
  preview: string;
  avatar: string;
}

export default function MailScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] =
    useState("Ocorreu um erro.");
  const [isMobile, setIsMobile] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Responsividade
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: receivedData, refetch: refetchReceived } = useReceivedMails();
  const { data: sentData, refetch: refetchSent } = useSentMails();
  const {
    data: usersData,
    isLoading: loadingUsers,
    error: errorUsers,
  } = useGetAll();
  const {
    data: currentUserData,
    isLoading: loadingCurrentUser,
    error: errorCurrentUser,
  } = useGetUser();
  const { mutate: createMail } = useCreateMail();
  const { mutate: deleteMail } = useDeleteMail();

  const isLoading = loadingUsers || loadingCurrentUser;
  const error = errorUsers || errorCurrentUser;

  // Obter o ID do usuário atual
  const currentUserId = currentUserData?.idUser || 0;

  // Filtrar usuários, excluindo os com role "ADMIN" e o usuário atual
  const filteredUsers = useMemo(() => {
    if (!usersData || !currentUserId) return [];
    return usersData
      .filter((user) => user.role !== "ADMIN" && user.idUser !== currentUserId)
      .map((user) => ({
        id: user.idUser,
        name: user.name,
        avatar: user.photo || "",
      }));
  }, [usersData, currentUserId]);

  // Transform API mail objects to Message
  function mapMailToMessage(mail: any, isSender: boolean): Message {
    const partnerId = isSender ? mail.idReceptor : mail.user.idUser;
    const userId = isSender ? currentUserId : mail.user.idUser;
    const userName = isSender
      ? "Você"
      : mail.senderName || mail.receptorName || "Desconhecido";
    const userAvatar = isSender
      ? currentUserData?.photo || ""
      : filteredUsers.find((u) => u.id === partnerId)?.avatar || "";
    return {
      id: mail.idMail,
      user: {
        id: userId,
        name: userName,
        avatar: userAvatar,
      },
      text: mail.message,
      attachments: [],
      timestamp: mail.createdIn,
      conversationPartnerId: partnerId,
    };
  }

  // Combine incoming/outgoing messages
  useEffect(() => {
    if (!receivedData?.result && !sentData?.result) return;

    const incoming = (receivedData?.result || []).map((m: any) => ({
      ...m,
      sent: false,
    }));
    const outgoing = (sentData?.result || []).map((m: any) => ({
      ...m,
      sent: true,
    }));
    const combined = [...incoming, ...outgoing];

    const mapped = combined.map((mail) => mapMailToMessage(mail, mail.sent));

    setMessages((prev) => {
      const all = [...prev, ...mapped];
      const unique = Array.from(new Map(all.map((m) => [m.id, m])).values());
      return unique.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });
  }, [receivedData, sentData, currentUserId, currentUserData, filteredUsers]);

  // Build conversations list, including all non-admin users (except current user)
  const conversations = useMemo(() => {
    const map = new Map<number, Conversation>();

    // Adicionar usuários filtrados como conversas, mesmo sem mensagens
    filteredUsers.forEach((user) => {
      const lastText = messages
        .filter((m) => m.conversationPartnerId === user.id)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0]?.text;

      map.set(user.id, {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        preview: lastText || "Sem mensagens ainda",
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [messages, filteredUsers]);

  const filteredMessages = useMemo(
    () =>
      messages.filter(
        (m) => m.conversationPartnerId === selectedConversation?.id
      ),
    [messages, selectedConversation]
  );

  const handleSendMessage = useCallback(() => {
    if (isSending) return;
    if (!newMessageText.trim() || !selectedConversation) {
      setModalErrorMessage("Escreva uma mensagem e selecione uma conversa.");
      setIsModalOpen(true);
      return;
    }

    setIsSending(true);
    const tempId = -Date.now();
    const tempMsg: Message = {
      id: tempId,
      user: {
        id: currentUserId,
        name: "Você",
        avatar: currentUserData?.photo || "",
      },
      text: newMessageText,
      attachments: [],
      timestamp: new Date().toISOString(),
      conversationPartnerId: selectedConversation.id,
    };
    setMessages((prev) => [...prev, tempMsg]);
    console.log("Id users :", usersData);
    console.log("Id user selecionado :", selectedConversation.id);
    createMail(
      { idReceptor: selectedConversation.id, message: newMessageText },
      {
        onSuccess: () => {
          setNewMessageText("");
          refetchReceived();
          refetchSent();
          setIsSending(false);
        },
        onError: (err: { message: any }) => {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          setModalErrorMessage(err.message || "Erro ao enviar a mensagem.");
          setIsModalOpen(true);
          setIsSending(false);
        },
      }
    );
  }, [
    isSending,
    newMessageText,
    selectedConversation,
    currentUserId,
    currentUserData,
    createMail,
    refetchReceived,
    refetchSent,
  ]);

  const handleDelete = (id: number) => {
    deleteMail(
      { idMail: id },
      {
        onSuccess: () => {
          refetchReceived();
          refetchSent();
        },
        onError: () => {
          setModalErrorMessage("Erro ao excluir a mensagem.");
          setIsModalOpen(true);
        },
      }
    );
  };

  const refetchMessages = () => {
    refetchReceived();
    refetchSent();
  };

  return (
    <DataStatusHandler
      isLoading={isLoading}
      error={error}
      onRetry={refetchMessages}
    >
      <div className="p-6 dark:bg-gray-800 text-gray-800">
        <div className="flex w-full h-full overflow-y-hidden mb-16 md:mb-0 xl:h-[80vh] flex-wrap">
          {isMobile ? (
            !selectedConversation ? (
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
              />
            ) : (
              <ChatWindow
                isMobile
                messages={filteredMessages}
                currentUserId={currentUserId}
                newMessageText={newMessageText}
                setNewMessageText={setNewMessageText}
                onSendMessage={handleSendMessage}
                fileInputRef={fileInputRef}
                handleFileChange={() => {}}
                selectedConversation={selectedConversation}
                goBack={() => setSelectedConversation(null)}
                onDeleteMessage={handleDelete}
              />
            )
          ) : (
            <>
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
              />
              <ChatWindow
                messages={filteredMessages}
                currentUserId={currentUserId}
                newMessageText={newMessageText}
                setNewMessageText={setNewMessageText}
                onSendMessage={handleSendMessage}
                fileInputRef={fileInputRef}
                handleFileChange={() => {}}
                selectedConversation={selectedConversation}
                refetchMessages={refetchMessages}
                onDeleteMessage={handleDelete}
              />
            </>
          )}
        </div>
      </div>
      <ErrorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Erro"
      >
        <p>{modalErrorMessage}</p>
      </ErrorModal>
    </DataStatusHandler>
  );
}
