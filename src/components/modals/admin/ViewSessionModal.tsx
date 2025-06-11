import React from "react";
import DynamicModal from "@/components/common/DynamicModal";
import ComponetButton from "@/components/common/button";
import { Section } from "@/types/interfaces";
import { useGetDirections } from "@/hooks/DynamicApiHooks";
import {
  Hash,
  MessageSquare,
  Landmark,
  CalendarClock,
  User,
} from "lucide-react";

interface ViewSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section | null;
}

const ViewSectionModal: React.FC<ViewSectionModalProps> = ({
  isOpen,
  onClose,
  section,
}) => {
  const { data: directions = [] } = useGetDirections();

  if (!section) return null;

  const direction = directions.find(
    (dir) => dir.idDirection === section.idDirection
  );

  const InfoBlock = ({
    icon: Icon,
    label,
    value,
    isComment,
  }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    isComment?: boolean;
  }) => (
    <div
      className={`space-y-1 p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
        isComment
          ? "bg-gray-50 dark:bg-gray-700 border-l-4 border-blue-200 dark:border-blue-600"
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
      }`}
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {label}
        </span>
      </div>
      <div
        className={`mt-1 text-gray-900 dark:text-gray-100 ${
          isComment ? "italic font-normal" : "font-medium"
        }`}
      >
        {value}
      </div>
    </div>
  );

  return (
    <DynamicModal title="Detalhes da Seção" isOpen={isOpen} onClose={onClose}>
      <div className="overflow-y-auto px-4 h-auto max-h-[50vh] space-y-4 my-4">
        <InfoBlock icon={User} label="Nome" value={section.name} />
        <InfoBlock icon={Hash} label="Número" value={section.sectionNumber} />
        <InfoBlock
          icon={MessageSquare}
          label="Descrição"
          value={section.description}
          isComment
        />
        <InfoBlock
          icon={Landmark}
          label="Direção"
          value={direction ? direction.name : section.idDirection}
        />
        <InfoBlock
          icon={CalendarClock}
          label="Criado em"
          value={new Date(section.createdIn).toLocaleString("pt-BR", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        />
      </div>
      <div className="flex justify-end">
        <ComponetButton
          variant="secondary"
          onClick={onClose}
          className="w-full md:w-auto"
        >
          Fechar
        </ComponetButton>
      </div>
    </DynamicModal>
  );
};

export default ViewSectionModal;
