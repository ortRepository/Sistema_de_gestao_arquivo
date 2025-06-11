import React, { useState } from "react";
import { Send, ChevronLeft, MoreHorizontal } from "lucide-react";
import dayjs from "dayjs";

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
}

interface ConversationInfo {
  name: string;
}

interface ChatWindowProps {
  messages: Message[];
  currentUserId: number;
  newMessageText: string;
  setNewMessageText: (text: string) => void;
  onSendMessage: () => void;
  selectedConversation: ConversationInfo | null;
  isMobile?: boolean;
  goBack?: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  refetchMessages?: () => void;
  onDeleteMessage: (id: number) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  currentUserId,
  newMessageText,
  setNewMessageText,
  onSendMessage,
  selectedConversation,
  isMobile,
  goBack,

  onDeleteMessage,
}) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  return (
    <div className="flex-1 bg-white rounded-lg dark:bg-gray-900 flex flex-col">
      {/* Cabeçalho da conversa */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
        {isMobile && goBack ? (
          <button
            onClick={goBack}
            className="text-[#FF9E01] font-medium text-sm hover:underline flex items-center"
          >
            <ChevronLeft size={20} className="mr-2" />
            Voltar
          </button>
        ) : (
          <>
            <h2 className="text-lg font-semibold dark:text-white">
              {selectedConversation?.name || "Selecione uma conversa"}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dayjs().format("DD/MM HH:mm")}
            </span>
          </>
        )}
      </div>

      {/* Histórico de mensagens */}
      <div
        className={`overflow-y-auto ${
          isMobile ? "h-[50vh]" : "h-[60vh]"
        } p-4 space-y-4`}
      >
        {messages.map((msg, idx) => {
          const isMe = msg.user.id === currentUserId;
          return (
            <div
              key={msg.id || idx}
              className={`relative flex items-start ${
                isMe ? "justify-end" : "justify-start"
              }`}
              onMouseEnter={() => isMe && setHoveredId(msg.id)}
              onMouseLeave={() => isMe && setHoveredId(null)}
            >
              {/* Menu lateral para próprias mensagens */}
              {isMe && hoveredId === msg.id && (
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === msg.id ? null : msg.id)
                  }
                  className="relative p-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                >
                  <MoreHorizontal
                    size={16}
                    className="text-gray-500 dark:text-gray-300"
                  />
                </button>
              )}

              {/* Submenu de opções */}
              {isMe && openMenuId === msg.id && (
                <div className="absolute right-2 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md rounded-md p-1 z-20 min-w-[120px]">
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0v4m4-4v4m-7 0h10"
                      />
                    </svg>
                    Excluir
                  </button>
                </div>
              )}

              {/* Avatar para mensagens de terceiros */}
              {!isMe && (
                <img
                  src={msg.user.avatar}
                  alt={msg.user.name}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
              )}

              {/* Balão de mensagem */}
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                  isMe ? "bg-[#FF9E01] text-white" : "bg-gray-100 text-gray-800"
                } shadow-sm`}
              >
                {msg.text && (
                  <p className="mb-1 whitespace-pre-wrap">{msg.text}</p>
                )}
                {msg.attachments.map((att, i) =>
                  att.type === "image" ? (
                    <div key={i} className="mt-2">
                      <img
                        src={att.url}
                        alt={att.name}
                        className="max-w-xs rounded-lg"
                      />
                    </div>
                  ) : (
                    <div key={i} className="mt-2">
                      <a
                        href={att.url}
                        download={att.name}
                        className={`underline ${
                          isMe ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {att.name}
                      </a>
                    </div>
                  )
                )}
                <div className="text-xs text-right opacity-75 mt-1">
                  {dayjs(msg.timestamp).format("DD/MM HH:mm")}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campo para enviar nova mensagem */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Escreva sua mensagem..."
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          className="flex-1 border dark:text-white border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#FF9E01]"
        />
        <button
          onClick={onSendMessage}
          className="bg-[#FF9E01] text-white p-2 rounded-lg hover:opacity-90 transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
