import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { UserSectionProps } from "@/types/services";

export default function LanguageSection({ userData }: UserSectionProps) {
  const [region, setRegion] = useState("BR");
  const [language, setLanguage] = useState("pt");

  const regions = [
    { code: "BR", name: "Brasil" },
    { code: "AO", name: "Angola" },
    { code: "US", name: "Estados Unidos" },
    { code: "PT", name: "Portugal" },
    { code: "ES", name: "Espanha" },
    { code: "FR", name: "França" },
  ];

  const languages = [
    { code: "pt", name: "Português" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
  ];

  return (
    <div className="md:mb-0 mb-14">
      <h2 className="text-2xl font-medium my-4">Configurações Regionais</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Seletor de Região */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-600 dark:text-white uppercase tracking-wide">
            País/Região
          </label>
          <div className="relative group">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="flex items-center w-full pl-14 pr-6  appearance-none py-3 border border-gray-300 focus-within:border-none rounded focus-within:outline-none focus-within:ring-1 dark:bg-gray-800 focus-within:ring-[#E1B927]"
            >
              {regions.map((reg) => (
                <option key={reg.code} value={reg.code}>
                  {reg.name}
                </option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
              <ReactCountryFlag
                countryCode={region}
                svg
                style={{
                  width: "28px",
                  height: "20px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                className="rounded-md"
              />
            </div>
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors"
              size={22}
            />
          </div>
        </div>

        {/* Seletor de Idioma */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-600 dark:text-white uppercase tracking-wide">
            Idioma
          </label>
          <div className="relative group">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="flex items-center w-full pl-6 pr-10 appearance-none py-3 border border-gray-300 focus-within:border-none rounded focus-within:outline-none focus-within:ring-1 dark:bg-gray-800 focus-within:ring-[#E1B927]"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors"
              size={22}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 p-5 rounded flex items-center gap-4  bg-gray-50 dark:bg-gray-800 ">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <ReactCountryFlag
              countryCode={region}
              svg
              style={{
                width: "28px",
                height: "20px",
                display: "block",
              }}
            />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-white font-medium">
              Configuração atual
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-semibold text-gray-800 dark:text-gray-600 ">
                {regions.find((r) => r.code === region)?.name}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-[#E1B927] font-medium">
                {languages.find((l) => l.code === language)?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
