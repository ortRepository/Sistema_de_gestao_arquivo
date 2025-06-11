export interface ApiResponses {
  code: number;
  message: string;
}
// Primeiro, defina a interface para o Worker, conforme o schema retornado pela API
export interface FilterOption {
  value: string;
  label: string;
}
export interface FormWorker {
  id_sector: number;
  id_institution: number;
  id_worker: number;
  license_number: string;
  license_expiration_date: string; // data em formato ISO string
  license_issuance_date: string;
  id_user: number;
  type: number;
  created_in: string;
  blocked: number;
  users: {
    name: string;
    email: string;
    telephone: string;
    password: string;
    photo: string;
    gender: string;
    path: string;
    type: number;
    id_user: number;
    latitude: string;
    longitude: string;
    created_in: string;
    access_token: string;
    language?: string;
  };
}

/* ------------------------------------------------------------------
   1) DEFINIÇÃO DE TIPO PARA O ADMIN DE SETOR
   ------------------------------------------------------------------ */
export type SectorAdminStatus = "Ativo" | "Inativo";

// Agora não temos mais 'status' estático; vamos calcular dinamicamente
export interface SectorAdmin {
  id: number;
  adminName: string; // Nome do Administrador
  sectorResponsavel: string; // Setor Responsável
  email: string;
  isBlocked: boolean;
  license: string; // Código da licença
  expirationDate: string; // Data de expiração (formato dd-mm-yyyy)
}



export interface SupportRequest {
  id: number;
  name: string;
  email: string;
  dateTime: string;
  subject: string;
  // removemos a propriedade status para evitar exibição e conflito no layout
}
// Defina o tipo User com todas as propriedades necessárias
export interface User {
  id_user?: number;
  name: string;
  email: string;
  telephone: string;
  password: string;
  photo: string | null;
  gender: string;
  type: number;
  token?: string;
  latitude?: string | null;
  longitude?: string | null;
  created_in?: string;
  access_token?: string;
  Settings?: {
    language: string;
    id_user: number;
    location: string;
    id_setting: number;
    theme: number;
  };
}

