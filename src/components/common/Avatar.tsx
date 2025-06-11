import { User } from "lucide-react"; // Ícone de usuário
import React from "react";

interface AvatarProps {
  src?: string; // Foto opcional
  alt?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = "Avatar" }) => {
  return (
    <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-gray-200 overflow-hidden">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <User className="w-6 h-6 text-gray-600" /> // Ícone Lucide se não tiver foto
      )}
    </div>
  );
};

export default Avatar;
