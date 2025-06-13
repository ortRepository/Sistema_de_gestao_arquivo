import Select from "react-select";
import { useEffect, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  error?: string;
}

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  error,
}: SearchableSelectProps) {
  const selectedOption =
    options.find((option) => option.value === value) || null;

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detecta se o tema é escuro (com base na classe "dark" no <html>)
  useEffect(() => {
    const checkDarkMode = () =>
      document.documentElement.classList.contains("dark");
    setIsDarkMode(checkDarkMode());

    const observer = new MutationObserver(() => {
      setIsDarkMode(checkDarkMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: isDarkMode ? "#1f2937" : "#fff",
      borderColor: error ? "#f87171" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #4D6BFE" : undefined,
      padding: "0.375rem",
      borderRadius: "0.375rem",
      "&:hover": {
        borderColor: "#4D6BFE",
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDarkMode ? "#1f2937" : "#fff",
      color: isDarkMode ? "#fff" : "#000",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: isDarkMode ? "#fff" : "#000",
    }),
    input: (base: any) => ({
      ...base,
      color: isDarkMode ? "#fff" : "#000",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "#4D6BFE"
        : isDarkMode
        ? "#1f2937"
        : "#fff",
      color: isDarkMode ? "#fff" : "#000",
      cursor: "pointer",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: isDarkMode ? "#9ca3af" : "#6b7280", // gray-400 ou gray-500
    }),
  };

  return (
    <div className="mb-4">
      {label && (
        <label
          className={`block mb-2 ${isDarkMode ? "text-white" : "text-black"}`}
        >
          {label}
        </label>
      )}
      <Select
        options={options}
        value={selectedOption}
        onChange={(selectedOption) =>
          onChange(selectedOption ? selectedOption.value : "")
        }
        isSearchable
        styles={customStyles}
        classNamePrefix="react-select"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
