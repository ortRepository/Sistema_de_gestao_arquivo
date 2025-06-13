import React from "react";
import { Building, Layers, Briefcase,  UserIcon } from "lucide-react";

interface TabMenuProps {
  selectedTab: "Directions" | "Sections" | "Departments" | "Entities";
  setSelectedTab: (
    tab: "Directions" | "Sections" | "Departments" | "Entities"
  ) => void;
}

const tabs = [
  { key: "Directions", icon: Building, label: "Direções" },
  { key: "Sections", icon: Layers, label: "Seções" },
  { key: "Departments", icon: Briefcase, label: "Departamentos" },
  { key: "Entities", icon: UserIcon, label: "Entidades" },
] as const;

const ManageMenuBar: React.FC<TabMenuProps> = ({
  selectedTab,
  setSelectedTab,
}) => {
  return (
    <div className="px-4 my-6">
      <div className="border-b dark:border-gray-700">
        {/* full width até max-sm, scroll invisível no mobile, visível md+ */}
        <div className="w-50 md:w-99 min-w-full overflow-x-auto md:overflow-x-visible scrollbar-hide -mx-4 px-4">
          <div className="flex flex-nowrap whitespace-nowrap space-x-6 py-1">
            {tabs.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key)}
                className="flex-shrink-0 relative py-3 px-1 cursor-pointer"
              >
                <span
                  className={`flex items-center gap-2 text-lg font-medium transition-colors ${
                    selectedTab === key
                      ? "text-[#4D6BFE] dark:text-[#465dd1]"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </span>
                {selectedTab === key && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#4D6BFE] dark:bg-[#465dd1] animate-slide-in" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMenuBar;
