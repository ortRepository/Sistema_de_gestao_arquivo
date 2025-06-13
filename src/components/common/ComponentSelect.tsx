import React, { useState } from "react";

interface ComponentSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
}

const ComponentSelect: React.FC<ComponentSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
}) => {
  const [, setIsFocused] = useState(false);

  const containerClasses = `w-full dark:bg-gray-800 border border-gray-300 rounded p-3 focus-within:outline-none focus-within:ring-1 focus-within:ring-[#4D6BFE] ${
    error ? "border-red-500" : ""
  }`;

  return (
    <div>
      <label htmlFor={name} className="block  mb-2">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={containerClasses}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ComponentSelect;
