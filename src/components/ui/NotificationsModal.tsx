import { X, Trash2, Clock, MoreVertical } from "lucide-react";
import { useState } from "react";

type Notification = {
  id: number;
  text: string;
  time: string;
  unread: boolean;
};

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onClearAll: () => void;
  onClearOld: () => void;
}

const NotificationsModal = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onClearOld,
}: NotificationsModalProps) => {
  const [showSubmenu, setShowSubmenu] = useState(false);

  if (!isOpen) return null;

  // Ordena notificações não lidas primeiro
  const sortedNotifications = [...notifications].sort(
    (a, b) => Number(b.unread) - Number(a.unread)
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-[999]" onClick={onClose}>
      <div
        className="absolute inset-0 bg-black/30 dark:bg-gray-900/80 transition-opacity"
        onClick={onClose}
      />
      <div
        className="absolute  right-0  top-0 h-full w-full md:max-w-sm bg-white dark:bg-gray-900 shadow-lg p-6 transform transition-transform duration-300 ease-in-out "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Notificações</h2>

          <div className="flex items-center gap-4">
            {/* Menu de Opções */}
            <div className="relative">
              <button
                onClick={() => setShowSubmenu(!showSubmenu)}
                className="p-1 rounded-full hover:bg-gray-100 hover:dark:bg-gray-800 cursor-pointer"
              >
                <MoreVertical
                  className="text-gray-600 dark:text-white"
                  size={20}
                />
              </button>

              {/* Submenu */}
              {showSubmenu && (
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-48 py-2 z-50">
                  <button
                    onClick={() => {
                      onClearAll();
                      setShowSubmenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 hover:dark:bg-gray-900"
                  >
                    <Trash2 size={16} className="" />
                    <span>Limpar todas</span>
                  </button>

                  <button
                    onClick={() => {
                      onClearOld();
                      setShowSubmenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 hover:dark:bg-gray-900"
                  >
                    <Clock size={16} className="" />
                    <span>Limpar antigas</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 hover:dark:bg-gray-800 cursor-pointer"
            >
              <X className="text-gray-600" size={20} />
            </button>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-4  h-full overflow-y-auto">
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 hover:dark:bg-gray-800 cursor-pointer border-b dark:border-b-white"
              >
                {/* Indicador de não lida */}
                {notification.unread && (
                  <span className="mt-1.5 w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-white">
                    {notification.text}
                  </p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {notification.time}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma nova notificação
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
