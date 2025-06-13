import { ChangeEvent, useEffect, useState } from "react";

type ConfirmationCodeInputProps = {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
  value?: string;
};

export function ConfirmationCodeInput({
  length = 4,
  onComplete,
  error,
  value = "",
}: ConfirmationCodeInputProps) {
  const [code, setCode] = useState(
    new Array(length).fill("").map((_, i) => value[i] || "")
  );

  useEffect(() => {
    if (value) {
      setCode(value.split("").slice(0, length));
    }
  }, [value, length]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const inputVal = e.target.value;
    if (!/^[0-9]?$/.test(inputVal)) return;

    const newCode = [...code];
    newCode[index] = inputVal;
    setCode(newCode);

    if (inputVal && index < length - 1) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }

    if (newCode.join("").length === length) {
      onComplete(newCode.join(""));
    }
  };

  return (
    <div>
      <div className="flex justify-center gap-2 mb-6">
        {code.map((digit, index) => (
          <input
            key={index}
            id={`code-${index}`}
            placeholder="0"
            type="text"
            maxLength={1}
            className={`
              border p-2 w-full h-16 text-center text-lg rounded 
              focus:outline-none focus:ring-1 transition-all duration-200
              ${
                error
                  ? "border-red-500 focus:ring-red-200"
                  : "focus:border-[#4D6BFE] focus:ring-[#4D6BFE]"
              }
              ${digit && !error ? "border-green-500" : "border-gray-300"}
              shadow-sm
            `}
            value={digit}
            onChange={(e) => handleChange(e, index)}
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
