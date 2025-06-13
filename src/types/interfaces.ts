
//----------------------------- response ---------------------------------
export interface responseapi {
  code: number;
  message: string;
  data: string;
}
//----------------------------- View Budget ---------------------------------




export interface User {
  id: number;
  name: string;
  avatarUrl?: string;
  section: string;
}
export interface FormUser {
  idUser: number;
  email: string;
  name: string;
  password: string;
  photo: string;
  role: string;
  createdIn: string;
  updatedIn: string;
  accessToken: string;
}

// Props para o modal de reenvio
export interface ForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: Entities[];
  onSend: (recipients: Entities[]) => void;
}

//-------------------------Direction------------------------
export interface Direction {
  idDirection: number;
  name: string;
  description: string;
  createdIn: string;
  updatedIn: string;
}

//-------------------------Entities------------------------
export interface Entities {
  idUser: number;
  email: string;
  name: string;
  password: string;
  role: string;
  createdIn: string;
  updatedIn: string;
  location: string;
  language: string;
  theme: number;
  subscriber: boolean;
  photo: string;
}
//-------------------------Departments------------------------
export interface Department {
  idDepartment: number;
  name: string;
  description: string;
  departmentNumber: number;
  idSection: number;
  updatedIn: string;
  createdIn: string;
}

export interface CreateDepartmentDto {
  name: string;
  description: string;
  departmentNumber: number;
  idSection: number;
}

export interface UpdateDepartmentDto extends CreateDepartmentDto {
  idDepartment: number;
}

export interface DeleteDepartmentDto {
  idDepartment: number;
}


//-------------------------Entities------------------------

export interface BudgetManager {
  idBudgetManager: number;
  license: string;
  licenseDate: string;
  licenseExpirationDate: string;
  licenseNumber: string;
  idUser: number;
  blocked: boolean;
  idDepartment: number;
  sectionName: string;
  departmentName: string;
  directionName: string;
  createdIn: string;
  updatedIn: string;
  name: string;
  role: string;
  email: string;
  location: string;
  language: string;
  theme: number;
  subscriber: boolean;
  photo: string;
}

//-------------------------Notification ------------------------
export interface Notification {
  idNotification: number;
  title: string;
  description: string;
  read: boolean;
  idUser: number;
  createdIn: string;
}




export interface CommentCost {
  idCommentsCost: number;
  pastEntityName: string;    // note que no GET vem “pastEntityName” no lugar de “currentEntityName”
  approval: boolean;
  comment: string;
  id_cost: number;
  idBudgetManager: number;
}

export interface CreateCommentMapRequest {
  approval: boolean;
  comment: string;
  idBudgetMap: number;
}
//-------------------------Comment Budget Map------------------------
/**
 * Request para atualizar um comentário de Budget Map:
 */
export interface UpdateCommentMapRequest {
  idCommentsMap: number;
  approval: boolean;
  comment: string;
  idBudgetMap: number;
}
//-------------------------Document------------------------
export interface DocumentItem {
  id: number;
  title: string;
}

