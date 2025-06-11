export type InstitutionType = "All" | "Hospital" | "UBS" | "Samu" | "Farmacia";
export type HistoryType = "All" | "Aberto" | "Fechado" | "Aguardando";

// Defina a interface das opções
export interface FilterOption {
  value: string;
  label: string;
}

export interface HistoryItem {
  id: number;
  nomeInstituicao: string;
  tipoAtividade: HistoryType;
  dataHora: string;
  status: "Aberto" | "Fechado" | "Aguardando";
}
