import { truncateText } from "@/lib/utils";
import { User } from "lucide-react";
import React, { useState } from "react";

export interface Conversation {
  id: number;
  name: string;
  preview: string;
  avatar: string;
}

interface ConversationListProps {
  conversations: Conversation[];
}
interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lg:w-auto w-full bg-white border-r rounded dark:bg-gray-900 dark:border-gray-800 border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <input
          type="text"
          placeholder="Pesquisar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:text-white rounded focus:outline-none focus:border-none focus:ring-1 focus:ring-[#FF9E01]"
        />
      </div>
      <div className="overflow-y-auto md:h-[70vh] h-[50vh]">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv)}
            className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:dark:bg-gray-800 hover:bg-gray-100 cursor-pointer flex items-center gap-3 ${
              selectedConversation?.id === conv.id
                ? "bg-gray-200 dark:bg-gray-700"
                : ""
            }`}
          >
            {conv.avatar ? (
              <img
                src={conv.avatar}
                alt={conv.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-gray-300 rounded-full">
                <User className="w-5 h-5 " />
              </div>
            )}

            <div>
              <h2 className="font-medium text-sm mb-1 dark:text-white">
                {/* truncateText   {conv.name} */}
                {truncateText(conv.name, 25, "end")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-white">
                {truncateText(conv.preview, 25, "end")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
