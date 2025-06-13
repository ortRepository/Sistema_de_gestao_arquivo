import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const ComponentInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = "text",
  value,
  error,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  icon: Icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  // Define o valor padrão do autocomplete se não for informado:
  const defaultAutoComplete =
    type === "password"
      ? "current-password"
      : type === "email"
      ? "email"
      : "on";

  // Botão de toggle para senha, que muda de cor conforme o foco do container
  const renderPasswordToggle = () => {
    if (type !== "password") return null;
    return (
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className={`p-2 focus:outline-none ${
          isFocused ? "text-[#4D6BFE]" : "text-gray-500"
        }`}
      >
        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>
    );
  };

  // Classes do container que recebe o foco do input (usando focus-within)
  const containerClasses = `flex items-center w-full border border-gray-300 focus-within:border-none rounded focus-within:outline-none focus-within:ring-1 focus-within:ring-[#4D6BFE]
    ${error ? "border-red-500" : ""}
    `;

  if (type === "password") {
    return (
      <div>
        <label htmlFor={name} className="block mb-2">
          {label}
        </label>
        <div
          className={containerClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {Icon && (
            <span className="pl-3">
              <Icon
                className={isFocused ? "text-[#4D6BFE]" : "text-gray-500"}
              />
            </span>
          )}
          <input
            id={name}
            name={name}
            type={inputType}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete={autoComplete || defaultAutoComplete}
            className="w-full p-3 outline-none"
          />
          {renderPasswordToggle()}
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  if (Icon) {
    return (
      <div>
        <label htmlFor={name} className="block mb-2">
          {label}
        </label>
        <div
          className={containerClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <span className="pl-3">
            <Icon className={isFocused ? "text-[#4D6BFE]" : "text-gray-500"} />
          </span>
          <input
            id={name}
            name={name}
            type={inputType}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete={autoComplete || defaultAutoComplete}
            className="w-full p-3 outline-none"
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={name} className="block mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={inputType}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete || defaultAutoComplete}
        placeholder={placeholder}
        className={`w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-1 focus:ring-[#4D6BFE] ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ComponentInput;
