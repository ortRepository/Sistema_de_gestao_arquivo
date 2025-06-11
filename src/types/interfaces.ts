import { JSX } from "react";
//----------------------------- response ---------------------------------
export interface responseapi {
  code: number;
  message: string;
  data: string;
}
//----------------------------- View Budget ---------------------------------
export interface MenuItem {
  label: string;
  icon: JSX.Element;
  action: (budget: BudgetMap) => void;
}

export interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: BudgetMap[];
  isHistoryPage: boolean;
  onDelete: (id: number) => void;
  onEdit: (updated: BudgetMap) => void;
}

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
//-------------------------BudgetControl-----------------------
export interface BudgetControl {
  idBudgetControl: number;
  name: string;
  description: string;
  createdIn: string;
  updatedIn: string;
}
// Budget Control types

export interface CreateBudgetControlDto {
  name: string;
  description: string;
}

export interface UpdateBudgetControlDto extends CreateBudgetControlDto {
  idBudgetControl: number;
}

export interface DeleteBudgetControlDto {
  idBudgetControl: number;
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

//-------------------------ManageClass------------------------
// types/interfaces.ts

export interface Class {
  idClass: number;
  name: string;
  description: string;
  idBudgetControl: number;
  createdIn: string;
  updatedIn: string;
}

export interface CreateClassDto {
  name: string;
  description: string;
  idBudgetControl: number;
}

export interface UpdateClassDto extends CreateClassDto {
  idClass: number;
}

//-------------------------ManageAccount------------------------

export interface ManageAccounttype {
  id: number;
  name: string;
  code: string;
  value: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}
//-------------------------CostCenter ------------------------
export interface CostCenter {
  idCostCenter: number;
  name: string;
  description: string;
  idAccount: number;
  createdIn?: string;
  updatedIn?: string;
}
//-------------------------Timeline ------------------------
// Interface for Timeline
export interface Timeline {
  idTimeline: number;
  mapCreationDate: string;
  mapCompletionDate: string;
  mapCostAdditionDate: string;
  completionDateAdditionOfMapCost: string;
  mapCorrectionStartDate: string;
  endDateOfMapCorrection: string;
  mapExecutionStartDate: string;
  mapExecutionEndDate: string;
  createdIn?: string;
  updatedIn?: string;
  yearOfApplication: string;
  developer?: string;
  mapPreparation?: number;
  additionOfCosts?: number;
  mapCorrection?: number;
  mapExecution?: number;
}
//-------------------------Session------------------------
// Section entity interface
export interface Section {
  idSection: number;
  name: string;
  sectionNumber: number;
  description: string;
  idDirection: number;
  createdIn: string;
  updatedIn: string;
}

// DTO for creating a section
export interface CreateSectionDto {
  name: string;
  sectionNumber: number;
  description: string;
  idDirection: number;
}

// DTO for updating a section
export interface UpdateSectionDto {
  idSection: number;
  name: string;
  sectionNumber: number;
  description: string;
  idDirection: number;
}

//-------------------------Account------------------------

// Account types
export interface Account {
  idAccount: number;
  name: string;
  number: number;
  description: string;
  idClass: number;
  createdIn: string;
  updatedIn: string;
}

export interface CreateAccountDto {
  name: string;
  number: number;
  description: string;
  idClass: number;
}

export interface UpdateAccountDto extends CreateAccountDto {
  idAccount: number;
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

//-------------------------Budget Map management------------------------
export interface CostHistory {
  idCostHistories: number;
  description: string;
  createdIn: string; // ISO 8601
  idCost: number;
}

export interface CostComment {
  idCommentsCost: number;
  currentEntityName: string;
  receivedIn: string; // ISO 8601
  idCost: number;
  approval: boolean;
  comment: string;
  idBudgetManager: number;
}

export interface BudgetCost {
  idCost: number;
  value: number;
  justification: string;
  comment: string;
  approval: boolean;
  abnormality: boolean;
  alert: string;
  idBudgetMap: number;
  idCostCenter: number;
  accountDescription: string;
  accountName: string;
  costCenterName: string;
  costCenterDescription: string;
  directionName: string;
  directionDescription: string;
  departmentName: string;
  departmentDescription: string;
  sectionName: string;
  sectionDescription: string;
  budgetControlName: string;
  budgetControlDescription: string;
  updatedIn: string; // ISO 8601
  createdIn: string; // ISO 8601
  histories: CostHistory[];
  comments: CostComment[];
}

export interface BudgetMapHistory {
  idBudgetMapHistory: number;
  description: string;
  createdIn: string; // ISO 8601
  idBudgetMap: number;
}

export interface BudgetMapComment {
  idCommentsMap: number;
  idEntity: number;
  currentEntity: string;
  receivedIn: string; // ISO 8601
  approval: boolean;
  comment: string;
  idBudgetMap: number;
  idBudgetManager: number;
}

export interface BudgetMap {
  idBudgetMap: number;
  budgetYear: string; // ISO 8601
  createdIn: string; // string
  updatedIn: string; // string
  idTimeline: number;
  currentDepartmentName: string;
  currentDepartmentDescription: string;
  currentSectionName: string;
  currentSectionDescription: string;
  directionName: string;
  directionDescription: string;
  currentEntity: string;
  idEntity: number;
  costs: BudgetCost[];
  histories: BudgetMapHistory[];
  comments: BudgetMapComment[];
}

// Para requisições de criação/atualização, crie um tipo simplificado:
export interface CreateBudgetMapDto {
  budgetYear: string; // ex: "2025-05-31T10:17:17.108Z"
  idDepartment: number;
  idTimeline: number;
}

export interface UpdateBudgetMapDto {
  idBudgetMap: number;
  budgetYear: string; // ex: "2025-05-31T10:17:04.092Z"
  idDepartment: number;
  idTimeline: number;
}

export interface DeleteBudgetMapDto {
  idBudgetMap: number;
}

export interface ForwardBudgetMapDto {
  idBudgetMap: number;
  idEntity: number;
}

//-------------------------CommentCost------------------------
/**
 * Request para criar um comentário de custo:
 */
export interface CreateCommentCostRequest {
  approval: boolean;
  comment: string;
  idCost: number;
  idBudgetManager: number;
}

/**
 * Request para atualizar um comentário de custo:
 */
export interface UpdateCommentCostRequest {
  idCommentsCost: number;
  approval: boolean;
  comment: string;
  idCost: number;
  idBudgetManager: number;
}

/**
 * Request para deletar um comentário de custo:
 */
export interface DeleteCommentCostRequest {
  idCommentsCost: number;
}

/**
 * Response individual de um comentário de custo:
 */
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

/**
 * Request para deletar um comentário de Budget Map:
 */
export interface DeleteCommentMapRequest {
  idCommentsMap: number;
}

/**
 * Tipo de resposta de um comentário de Budget Map:
 */
export interface CommentMap {
  idCommentsMap: number;
  idEntity: number;
  currentEntity: string;
  receivedIn: string;
  approval: boolean;
  comment: string;
  idBudgetMap: number;
  idBudgetManager: number;
}
//-------------------------Costs Management------------------------

export interface Cost {
  idCost: number;
  value: number;
  justification?: string;
  comment?: string;
  approval: boolean;
  abnormality: boolean;
  alert?: string;
  idBudgetMap: number;
  idCostCenter: number;
  accountDescription?: string;
  accountName?: string;
  costCenterName?: string;
  costCenterDescription?: string;
  directionName?: string;
  directionDescription?: string;
  departmentName?: string;
  departmentDescription?: string;
  sectionName?: string;
  sectionDescription?: string;
  budgetControlName?: string;
  budgetControlDescription?: string;
  updatedIn: string;
  createdIn: string;
  histories: Array<{
    idCostHistories: number;
    description: string;
    createdIn: string;
    idCost: number;
  }>;
  comments: Array<{
    idCommentsCost: number;
    currentEntityName: string;
    receivedIn: string;
    idCost: number;
    approval: boolean;
    comment: string;
    idBudgetManager: number;
  }>;
}

// Requisição para criar um novo Cost (POST /costs)
export interface CreateCostRequest {
  idBudgetMap: number;
  idCostCenter: number;
}

export interface CreateCostShema {
  idCostCenter: number;
}
// Requisição para marcar um cost como pago (POST /costs/pay/{idCost})
export interface PayCostRequest {
  value: number;
  justification: string;
  idCost: number;
}

// Requisição para obter um cost específico (GET /costs/{idCost})
export interface GetCostByIdRequest {
  idCost: number;
}

// Requisição para deletar um cost (DELETE /costs/{idCost})
export interface DeleteCostRequest {
  idCost: number;
}