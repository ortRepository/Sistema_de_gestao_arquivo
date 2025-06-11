import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean; // prop opcional para loading
}

const ComponetButton: React.FC<ButtonProps> = ({
  children,
  variant = "outline",
  className,
  loading = false,
  ...rest
}) => {
  const baseClasses =
    "cursor-pointer px-8 py-3 rounded transition-colors duration-200";

  let variantClasses = "";
  if (variant === "outline") {
    variantClasses =
      "border border-[#404040] text-[#404040] hover:border-[#181A20] hover:text-[#181A20] focus:bg-[#404040] focus:text-white";
  } else if (variant === "primary") {
    variantClasses =
      "bg-[#404040] text-white hover:bg-[#181A20] focus:ring-2 focus:ring-[#404040]";
  } else if (variant === "secondary") {
    variantClasses =
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-300";
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className || ""}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin w-5 h-5" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default ComponetButton;
