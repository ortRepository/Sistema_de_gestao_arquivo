import { useState } from "react";
import { User as UserIcon } from "lucide-react";
import SearchFilterBar from "@/components/common/SearchBar";
import ComponentButton from "@/components/common/button";
import { Entities } from "@/types/interfaces"; // Updated to import Entities
import DynamicModal from "@/components/common/DynamicModal";

// Updated ForwardModalProps to use Entities
interface ForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: Entities[];
  onSend: (selected: Entities[]) => void;
}

export default function ForwardModal({
  isOpen,
  onClose,
  users,
  onSend,
}: ForwardModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selected, setSelected] = useState<Entities[]>([]);

  // Updated filter options to remove "section"
  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "name", label: "Nome" },
  ];

  // Updated filtering logic to remove section
  const filtered = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    switch (filterType) {
      case "name":
        return u.name.toLowerCase().includes(term);
      default:
        return u.name.toLowerCase().includes(term);
    }
  });

  const toggleSelect = (user: Entities) => {
    setSelected((prev) =>
      prev.some((u) => u.idUser === user.idUser)
        ? prev.filter((u) => u.idUser !== user.idUser)
        : [...prev, user]
    );
  };

  const handleSend = () => {
    onSend(selected);
    setSelected([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <DynamicModal
      title=""
      isOpen={isOpen}
      onClose={() => {
        onClose(), setSelected([]);
      }}
    >
      <h2 className="text-xl my-2">Encaminhar</h2>
      <p>Encaminha o conteúdo ou documentos para novos destinátarios</p>
      {/* Search & Filter */}
      <SearchFilterBar
        title=""
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterOptions={filterOptions}
        isFilterOpen={isFilterOpen}
        toggleFilterDropdown={() => setIsFilterOpen((o) => !o)}
        closeFilterDropdown={() => setIsFilterOpen(false)}
      />
      <p className="p-3">({selected.length}) Selecionados</p>
      {/* User List */}
      <ul className="max-h-64 overflow-auto space-y-2">
        {filtered.map((u) => {
          const isSel = selected.some((s) => s.idUser === u.idUser);
          return (
            <li
              key={u.idUser} // Updated to use idUser
              onClick={() => toggleSelect(u)}
              className={`
                flex items-center gap-3 p-2 rounded cursor-pointer
                transition-colors
                ${
                  isSel
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
            >
              {u.photo ? ( // Updated to use photo instead of avatarUrl
                <img
                  src={u.photo}
                  alt={u.name}
                  className="w-14 h-14 rounded-full object-cover bg-[#E1B927]"
                />
              ) : (
                <UserIcon className="w-14 h-14 p-2 text-white bg-[#E1B927] rounded-full object-cover" />
              )}
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {u.name}
                </span>
                {/* Removed section display */}
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
            Nenhum usuário encontrado.
          </li>
        )}
      </ul>
      {/* Actions */}
      <div className="flex flex-wrap-reverse justify-end mt-4 gap-2">
        <ComponentButton
          variant="secondary"
          onClick={() => {
            onClose(), setSelected([]);
          }}
          className="w-full md:w-auto"
        >
          Cancelar
        </ComponentButton>
        <ComponentButton
          variant="primary"
          onClick={handleSend}
          className="w-full md:w-auto"
          disabled={selected.length === 0}
        >
          Enviar
        </ComponentButton>
      </div>
    </DynamicModal>
  );
}
