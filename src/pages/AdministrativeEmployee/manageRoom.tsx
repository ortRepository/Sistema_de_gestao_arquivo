import { useState, useMemo } from "react";
import SearchFilterBar from "@/components/common/SearchBar";
import { Pencil, Trash2, Plus } from "lucide-react";
import DeletePublicationModal from "@/components/common/DeletePublicationModal";
import ComponetButton from "@/components/common/button";
import { DataStatusHandler } from "@/components/ui/DataStatusHandler";
import ModalManageRoom from "@/components/modals/modalEmployee/ModalManageRoom";
import { useDeleteRoom, useListRooms } from "@/hooks/DynamicApiHooks";
import { Room } from "@/types/interfaces";

// Room interface from API
export default function PageManageRoom() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [confirmRoomId, setConfirmRoomId] = useState<number | null>(null);

  // API hooks
  const { data: rooms = [], isLoading, error, refetch } = useListRooms();
  const { mutateAsync: deleteRoom } = useDeleteRoom();

  const filterOptions = [
    { value: "", label: "Todos" },
    { value: "idRoom", label: "Id" },
    { value: "name", label: "Nome" },
  ];

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return rooms.filter((room) => {
      switch (filterType) {
        case "idRoom":
          return room.idRoom.toString().includes(term);
        case "name":
          return room.name.toLowerCase().includes(term);
        default:
          return (
            room.idRoom.toString().includes(term) ||
            room.name.toLowerCase().includes(term)
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
      deleteRoom(
        { idRoom: confirmRoomId },
        {
          onSuccess: () => {
            refetch(); // Refresh the room list after deletion
            closeConfirm();
          },
          onError: (err) => {
            console.error("Failed to delete room:", err);
            closeConfirm();
          },
        }
      );
    }
  };

  const handleSave = (_room: Room) => {
    // Note: Assuming ModalManageRoom handles API calls for create/update
    // If not, you'll need to add API hooks for create/update here
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
          className="flex items-center justify-center gap-2 md:w-auto w-full"
          onClick={openCreate}
        >
          <Plus size={16} /> Cadastrar
        </ComponetButton>
      </div>

      <div className="bg-white dark:bg-gray-900 px-3 md:px-0 rounded-lg shadow overflow-auto w-60 md:w-99 min-w-full md:h-[55vh] h-auto">
        <DataStatusHandler
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
        >
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead className="bg-gray-100 border-b dark:bg-gray-900 dark:border-gray-800">
              <tr>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Id</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Nome</th>
                <th className="py-3 px-2 md:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((room: Room) => (
                  <tr
                    key={room.idRoom}
                    className="border-b dark:border-gray-800 dark:text-gray-400 border-gray-100"
                  >
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {room.idRoom}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap">
                      {room.name}
                    </td>
                    <td className="py-2 px-2 md:px-4 md:py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => openEdit(room)}
                        className="p-2 cursor-pointer bg-green-50 hover:bg-green-100 rounded"
                      >
                        <Pencil size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => openConfirm(room.idRoom)}
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
