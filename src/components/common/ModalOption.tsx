import { Delete, Edit,} from "lucide-react";
import { useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelet: () => void;
  onEdite: () => void;
  onComment: () => void;
}

const ShowSubmenu = ({
  isOpen,
  onClose,
  onDelet,
  onEdite,
  onComment,
}: ModalProps) => {
  const [isCommentActive, setIsCommentActive] = useState(false);

  if (!isOpen) return null;

  const toggleComment = () => {
    setIsCommentActive((prev) => !prev);
    onComment();
  };

  const handleDelete = () => {
    onDelet();
    onClose(); 
  };

  const handleEdit = () => {
    onEdite();
    onClose(); 
  };

  return (
    <div className="absolute right-18 top-8 bg-white dark:bg-gray-800 shadow-lg rounded w-auto max-w-80 p-2 z-50">
      <div>
        <button
          onClick={handleDelete}
          className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 hover:bg-gray-100 hover:dark:bg-gray-900"
        >
          <Delete size={16} />
          <span>Eliminar publicação</span>
        </button>
        <div className="w-full flex items-center justify-between gap-3 px-4 py-2 hover:bg-gray-100 hover:dark:bg-gray-900 cursor-pointer">
          <span>Comentário ativo</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isCommentActive}
              className="sr-only peer"
              readOnly
            />
            <div
              onClick={toggleComment}
              className={`w-11 h-6 ${
                isCommentActive ? "bg-[#E1B927]" : "bg-gray-200"
              } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#E1B927] dark:peer-focus:ring-[#E1B927] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all`}
            ></div>
          </label>
        </div>
        <button
          onClick={handleEdit}
          className="w-full flex items-center cursor-pointer gap-3 px-4 py-2 hover:bg-gray-100 hover:dark:bg-gray-900"
        >
          <Edit size={16} />
          <span>Editar publicação</span>
        </button>
      </div>
    </div>
  );
};

export default ShowSubmenu;
