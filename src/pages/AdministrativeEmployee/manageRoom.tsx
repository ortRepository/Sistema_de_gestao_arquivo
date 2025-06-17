import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import ModalManageRoom from "@/components/modals/modalEmployee/ModalManageRoom";



interface Room {
  id: number;
  sala: number;
}

const initialRooms: Room[] = [
  { id: 1, sala: 101 },
  { id: 2, sala: 102 },
  { id: 3, sala: 103 },
];

export default function PageManageRoom() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [confirmRoomId, setConfirmRoomId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "id", label: "Id" },
    { value: "sala", label: "Sala" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return rooms.filter((room) => {
      switch (filterType) {
        case "id":
          return room.id.toString().includes(term);
        case "sala":
          return room.sala.toString().includes(term);
        default:
          return (
            room.id.toString().includes(term) ||
            room.sala.toString().includes(term)
          );
      }
    });
  }, [rooms, searchTerm, filterType]);

  const openCreate = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const openEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const openConfirm = (id: number) => setConfirmRoomId(id);
  const closeConfirm = () => setConfirmRoomId(null);

  const handleDelete = () => {
    if (confirmRoomId !== null) {
      setRooms((prev) => prev.filter((r) => r.id !== confirmRoomId));
      closeConfirm();
    }
  };

  const handleSave = (room: Room) => {
    if (selectedRoom) {
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? room : r))
      );
    } else {
      setRooms((prev) => [...prev, { ...room, id: prev.length + 1 }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 w-full h-full dark:bg-gray-800 mb-16 md:mb-0 dark:text-white text-gray-800">
      <SearchFilterBar
        title="Gerir Salas"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterOptions={filterOptions}
        isFilterOpen={isFilterOpen}
        toggleFilterDropdown={() => setIsFilterOpen((o) => !o)}
        closeFilterDropdown={() => setIsFilterOpen(false)}
      />

      <div className="md:flex md:justify-end mb-4">
        <ComponetButton
          variant="primary"
          className="flex items-center gap-2"
          onClick={openCreate}
        >
          <Plus size={16} /> Cadastrar
        </ComponetButton>
      </div>

      <div className="bg-white dark:bg-gray-900 px-3 md:px-0 rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler isLoading={false} error={null} onRetry={() => {}}>
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Sala</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((room: Room) => (
                  <tr
                    key={room.id}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {room.id}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {room.sala}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openEdit(room)}
                        className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => openConfirm(room.id)}
                        className="p-2 cursor-pointer bg-red-50 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    Nenhuma sala encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DataStatusHandler>
      </div>

      <ModalManageRoom
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={selectedRoom}
        onSave={handleSave}
      />

      <DeletePublicationModal
        isOpen={confirmRoomId !== null}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Excluir sala"
        message="Tem certeza que deseja excluir esta sala?"
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}