
import { useTheme } from "@/contexts/ThemeProvider";

export const ThemeIllustration = ({ dark = false }: { dark?: boolean }) => (
  <div className={`p-4 rounded-2xl ${dark ? "bg-gray-900" : "bg-gray-100"}`}>
    <div className="flex gap-2 mb-4">
      <div className="w-4 h-4 rounded-full bg-[#4D6BFE]" />
      <div className="w-4 h-4 rounded-full bg-gray-600" />
      <div className="w-4 h-4 rounded-full bg-gray-400" />
    </div>
    <div className={`h-16 rounded-lg ${dark ? "bg-gray-800" : "bg-white"}`}>
      <div className="p-2">
        <div className={`h-1 w-8 mb-1 ${dark ? "bg-gray-600" : "bg-gray-300"}`} />
        <div className={`h-1 w-16 ${dark ? "bg-gray-600" : "bg-gray-300"}`} />
      </div>
    </div>
  </div>
);

export const AppearanceSection = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start dark:bg-gray-900 p-8">
      {/* Seção de Configurações */}
      <div className="space-y-8">
        {/* Toggle de Temas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Opção Claro: se estiver em dark mode, ao clicar ativa o modo claro */}
          <div
            onClick={() => darkMode && toggleDarkMode()}
            className={`cursor-pointer p-4 rounded-xl transition-all ${
              !darkMode
                ? "ring-4 ring-[#4D6BFE] bg-white shadow-xl"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <ThemeIllustration />
            <div
              className={`mt-4 text-center font-bold ${
                !darkMode ? "text-gray-900" : "text-gray-100"
              }`}
            >
              Claro
            </div>
          </div>
          {/* Opção Escuro: se estiver em modo claro, ao clicar ativa o dark mode */}
          <div
            onClick={() => !darkMode && toggleDarkMode()}
            className={`cursor-pointer p-4 rounded-xl transition-all ${
              darkMode
                ? "ring-4 ring-[#4D6BFE] bg-gray-900 shadow-xl"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <ThemeIllustration dark />
            <div
              className={`mt-4 text-center font-bold ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Escuro
            </div>
          </div>
        </div>
        {/* Seletor de cores */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
          <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
            Cor de Destaque
          </h4>
          <div className="flex flex-wrap gap-4">
            {["#4D6BFE", "#4F46E5", "#10B981", "#EF4444"].map((color) => (
              <button
                key={color}
                style={{ backgroundColor: color }}
                className="w-12 h-12 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-110"
              />
            ))}
          </div>
        </div>
      </div>
      {/* Preview do Tema */}
      <div className="flex justify-center">
        <div className="relative w-48 h-48 sm:w-64 sm:h-64">
          <div className="absolute inset-0 bg-[#4D6BFE]/10 rounded-full blur-3xl" />
          <div className="relative p-4 sm:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 mb-4">
              <div className="w-4 h-4 rounded-full bg-[#4D6BFE]" />
              <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="w-4 h-4 rounded-full bg-gray-400 dark:bg-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-8 bg-[#4D6BFE] rounded-lg mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
