import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFoundScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 dark:bg-gray-800 bg-gray-50">
      <div className="max-w-3xl text-center flex flex-col items-center">
        {/* Illustration: School-themed chalkboard */}
        <div className="relative w-64 h-64 mb-8 animate-float">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Chalkboard background */}
            <rect
              x="20"
              y="20"
              width="160"
              height="120"
              rx="10"
              fill="#1A3C34"
              className="dark:fill-[#2A4A44]"
            />
            {/* Wooden frame */}
            <rect
              x="10"
              y="10"
              width="180"
              height="140"
              rx="15"
              fill="none"
              stroke="#4D6BFE"
              strokeWidth="10"
              className="dark:stroke-[#4D6BFE]"
            />
            {/* 404 text on chalkboard */}
            <text
              x="100"
              y="90"
              fontSize="60"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
              className="dark:fill-gray-200"
            >
              404
            </text>
            {/* Chalk-like scribble */}
            <path
              d="M30 145L40 147M160 145L170 147"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-pulse dark:stroke-gray-200"
            />
          </svg>
        </div>

        {/* Content */}
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-3xl font-semibold text-gray-600 dark:text-gray-300 mb-6">
          Página Não Encontrada
        </h2>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          Oops! Parece que você seguiu um link incorreto ou a página foi
          removida.
        </p>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="bg-[#4D6BFE] text-white px-6 py-3 rounded-lg font-medium
          hover:bg-[#3b55e6] transition-colors flex items-center gap-2
          dark:bg-[#4D6BFE] dark:hover:bg-[#3b55e6] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar à Página Anterior
        </button>
      </div>
    </div>
  );
}
