import React from "react";

interface FormTextAreaProps {
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

const ComponentextArea: React.FC<FormTextAreaProps> = ({
  label,
  name,
  value,
  error,
  onChange,
  placeholder,
  required = false,
  rows = 5,
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-gray-700 dark:text-white font-medium mb-2">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className={`w-full border border-gray-300 p-3 focus-within:border-none rounded focus:outline-none focus:ring-1 focus:ring-[#4D6BFE]  ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ComponentextArea;
