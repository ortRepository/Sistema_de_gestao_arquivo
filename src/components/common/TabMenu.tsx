import React from "react";
import { BookOpen, BarChart } from "lucide-react";

interface TabMenuProps {
  selectedTab: "publicacoes" | "estatisticas";
  setSelectedTab: (tab: "publicacoes" | "estatisticas") => void;
}

const TabMenu: React.FC<TabMenuProps> = ({ selectedTab, setSelectedTab }) => {
  return (
    <div className="relative px-3 h-auto my-6">
      <div className="relative border-b dark:border-gray-700">
        <div className="flex flex-wrap gap-4 md:gap-6">
          <button
            onClick={() => setSelectedTab("publicacoes")}
            className="relative py-4 cursor-pointer"
          >
            <span
              className={`flex items-center gap-2 text-lg font-medium transition-colors ${
                selectedTab === "publicacoes"
                  ? "text-[#E1B927] dark:text-[#F0B90B]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <BookOpen className="h-5 w-5" />
              Publicações
            </span>
            {selectedTab === "publicacoes" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E1B927] dark:bg-[#F0B90B] animate-slide-in" />
            )}
          </button>

          <button
            onClick={() => setSelectedTab("estatisticas")}
            className="relative py-4 cursor-pointer"
          >
            <span
              className={`flex items-center gap-2 text-lg font-medium transition-colors ${
                selectedTab === "estatisticas"
                  ? "text-[#E1B927] dark:text-[#F0B90B]"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <BarChart className="h-5 w-5" />
              Estatísticas
            </span>
            {selectedTab === "estatisticas" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E1B927] dark:bg-[#F0B90B] animate-slide-in" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabMenu;
