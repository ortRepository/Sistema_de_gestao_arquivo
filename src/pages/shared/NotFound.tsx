// src/pages/shared/NotFound.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFoundScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 dark:bg-gray-800 bg-gray-50">
      <div className="max-w-3xl text-center flex flex-col items-center">
        {/* Ilustração */}
        <div className="relative w-64 h-64 mb-8 animate-float">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#E1B927"
              strokeWidth="8"
              strokeDasharray="4 8"
              className="animate-pulse"
            />
            <path
              d="M60 60L140 140M60 140L140 60"
              stroke="#E1B927"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle
              cx="100"
              cy="100"
              r="30"
              fill="#FF9E01"
              className="dark:fill-[#E1B927]"
            />
            <path
              d="M85 85L115 115M85 115L115 85"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Conteúdo */}
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-3xl font-semibold text-gray-600 dark:text-gray-300 mb-6">
          Página Não Encontrada
        </h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          Oops! Parece que você seguiu um link incorreto ou a página foi removida.
        </p>

        {/* Botão de Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="bg-[#FF9E01] text-white px-6 py-3 rounded-lg font-medium
          hover:bg-[#e1b927b9] transition-colors flex items-center gap-2
          dark:bg-[#E1B927] dark:hover:bg-[#e1b927c9] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar à Página Anterior
        </button>
      </div>
    </div>
  );
}