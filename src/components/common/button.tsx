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
      "border border-[#4D6BFE] text-[#4D6BFE] hover:border-[#465dd1] hover:text-[#465dd1] focus:bg-[#4D6BFE] focus:text-white";
  } else if (variant === "primary") {
    variantClasses =
      "bg-[#4D6BFE] text-white hover:bg-[#465dd1] focus:ring-2 focus:ring-[#4D6BFE]";
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
