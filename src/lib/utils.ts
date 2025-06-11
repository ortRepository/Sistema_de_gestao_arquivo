//Função para formatação de datas
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

// Função para extrair a data válida do campo publishedAt
export const parseDate = (dateString: string): string => {
  const match = dateString.match(/(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return new Date(match[1]).toLocaleDateString();
  }
  return dateString;
};
export const truncateText = (
  text: string,
  maxLength: number = 25,
  position: "start" | "middle" | "end" = "middle"
) => {
  if (text.length <= maxLength) return text;

  if (position === "start") {
    return `...${text.slice(-maxLength)}`;
  } else if (position === "end") {
    return `${text.slice(0, maxLength)}...`;
  } else {
    const halfLength = Math.floor(maxLength / 2);
    return `${text.slice(0, halfLength)}...${text.slice(-halfLength)}`;
  }
};

export const getBase64ImageFromUrl = (url: string): Promise<string> => {
  return fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
};

// Por exemplo, em um arquivo utils/roles.ts ou diretamente no componente
export function getEntityName(type: string): string {
  switch (type.toLowerCase()) {
    case "admin":
      return "Administrador Central";
    case "user_master":
      return "Master User";
    case "reviewer":
      return "Revisor";
    case "approver":
      return "Aprovador";
    case "planner":
      return "Planeador";
    default:
      return "Planeador";
  }
}
