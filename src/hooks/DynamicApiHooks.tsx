import { EndpointConfig, endpoints } from "../types/apiConfig";
import { useApiQuery, useApiMutation } from "../services/apiClient";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  Account,
  BudgetControl,
  BudgetManager,
  BudgetMap,
  Class,
  CommentCost,
  CommentMap,
  Cost,
  CostCenter,
  CreateAccountDto,
  CreateBudgetControlDto,
  CreateClassDto,
  CreateCommentCostRequest,
  CreateCommentMapRequest,
  CreateCostRequest,
  CreateDepartmentDto,
  CreateSectionDto,
  DeleteBudgetControlDto,
  DeleteCommentCostRequest,
  DeleteCommentMapRequest,
  DeleteCostRequest,
  DeleteDepartmentDto,
  Department,
  GetCostByIdRequest,
  Notification,
  PayCostRequest,
  responseapi,
  Section,
  Timeline,
  UpdateAccountDto,
  UpdateBudgetControlDto,
  UpdateClassDto,
  UpdateCommentCostRequest,
  UpdateCommentMapRequest,
  UpdateDepartmentDto,
  UpdateSectionDto,
} from "@/types/interfaces";

/* 
  ================================================================================
  SobreCarga e Implementação do createApiHook
  ================================================================================
*/

// Sobrecargas para endpoints GET
export function createApiHook<T, U = unknown>(
  endpoint: { method: "GET"; path: string },
  onSuccessCallback?: () => void
): (enabled?: boolean) => UseQueryResult<T, Error>;

// Sobrecargas para endpoints que não são GET (POST, PUT, DELETE, etc.)
export function createApiHook<T, U = unknown>(
  endpoint: Exclude<EndpointConfig, { method: "GET" }>,
  onSuccessCallback?: () => void
): () => UseMutationResult<T, Error, U>;

// Implementação: retorna um hook baseado no método do endpoint
export function createApiHook<
  T,
  U extends Record<string, any> | FormData = Record<string, any>
>(endpoint: EndpointConfig, onSuccessCallback?: () => void) {
  if (endpoint.method === "GET") {
    return function useDynamicQuery(
      enabled: boolean = true
    ): UseQueryResult<T, Error> {
      return useApiQuery<T>([endpoint.path], endpoint.path, enabled);
    };
  } else {
    return function useDynamicMutation(): ReturnType<
      typeof useApiMutation<T, U>
    > {
      return useApiMutation<T, U>(
        endpoint.method,
        endpoint.path,
        onSuccessCallback
      );
    };
  }
}

/*
  ================================================================================
  Endpoints de USUÁRIO
  ================================================================================
*/

// Autenticação (POST /users/authenticate)
export const useAuthenticateUser = createApiHook<
  {
    code: number;
    message: string;
    accessToken: string;
    userRole: string;
  },
  { email: string; password: string }
>(endpoints.users.authenticate);

// Receber código (POST /users/receiveCode)
export const useReceiveCode = createApiHook<
  { code: number; message: string },
  { email: string }
>(endpoints.users.receiveCode);

// Recuperar senha (POST /users/recoverPassword)
export const useRecoverPassworde = createApiHook<
  { code: number; message: string },
  { email: string; code: string; newPassword: string }
>(endpoints.users.recoverPassword);

// Obter dados do usuário (GET /users)
export const useGetUser = createApiHook<{
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
}>(endpoints.users.useGetAll);

export const useGetAll = createApiHook<
  {
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
  }[]
>(endpoints.users.getAll);

// Upload de foto (POST /users/uploadPhoto)
export const useUploadPhoto = createApiHook<
  {
    code: number;
    message: string;
    result: { url: string };
  },
  FormData
>(endpoints.users.uploadPhoto);

// Edição de senha (PUT /users/passwordEdit)
export const useEditPassword = createApiHook<
  {
    code: number;
    message: string;
    result: {
      token: string;
      type: number;
    };
  },
  { newPassword: string; oldPassword: string }
>(endpoints.users.passwordEdit);

// Alterar email (PUT /users/changeEmail)
export const useChangeEmail = createApiHook<
  { code: number; message: string },
  { newEmail: string; code: string; password: string }
>(endpoints.users.changeEmail);

// Atualizar usuário (PUT /users/update)
export const useUpdateUser = createApiHook<
  { code: number; message: string },
  {
    idUser: string;
    name: string;
    language: string;
    theme: number;
    location: string;
    subscriber: boolean;
  }
>(endpoints.users.update);

// Deletar usuário (DELETE /users)
export const useDeleteUser = createApiHook<
  { code: number; message: string },
  { idUser: string }
>(endpoints.users.delete);

/*
  ================================================================================
  Endpoints de NOTIFICAÇÕES
  ================================================================================
*/

// Marcar notificação como lida (PUT /notifications)
// lista todas
export const useListNotifications = createApiHook<Notification[]>(
  endpoints.notifications.list
);

// deleta 1
export const useDeleteNotification = createApiHook<
  { message: string },
  { idNotification: string }
>(endpoints.notifications.delete);

// marca como lida
export const useReadNotification = createApiHook<
  { message: string },
  { idNotification: string }
>(endpoints.notifications.read);

/*
 ================================================================================
 Endpoints de Mails
 ================================================================================
*/

// GET /mails/{idMail} - View mail details
export const useGetMailById = createApiHook<
  {
    idMail: number;
    senderName: string;
    message: string;
    receptorName: string;
    idReceptor: number;
    user: {
      idUser: number;
      email: string;
      name: string;
      password: string;
      createdIn: string;
      updatedIn: string;
      role: string;
      enabled: boolean;
      credentialsNonExpired: boolean;
      accountNonExpired: boolean;
      username: string;
      authorities: Array<{ authority: string }>;
      accountNonLocked: boolean;
    };
    createdIn: string;
  },
  { idMail: number }
>(endpoints.mails.getById);

// GET /mails/sent - Get sent mails
export const useSentMails = createApiHook<
  {
    code: number;
    message: string;
    result: Array<{
      idMail: number;
      senderName: string;
      message: string;
      receptorName: string;
      idReceptor: number;
      user: {
        idUser: number;
        email: string;
        name: string;
        password: string;
        createdIn: string;
        updatedIn: string;
        role: string;
        enabled: boolean;
        credentialsNonExpired: boolean;
        accountNonExpired: boolean;
        username: string;
        authorities: Array<{ authority: string }>;
        accountNonLocked: boolean;
      };
      createdIn: string;
    }>;
  },
  void
>(endpoints.mails.sent);

// GET /mails/received - Get received mails
export const useReceivedMails = createApiHook<
  {
    code: number;
    message: string;
    result: Array<{
      idMail: number;
      senderName: string;
      message: string;
      receptorName: string;
      idReceptor: number;
      user: {
        idUser: number;
        email: string;
        name: string;
        password: string;
        createdIn: string;
        updatedIn: string;
        role: string;
        enabled: boolean;
        credentialsNonExpired: boolean;
        accountNonExpired: boolean;
        username: string;
        authorities: Array<{ authority: string }>;
        accountNonLocked: boolean;
      };
      createdIn: string;
    }>;
  },
  void
>(endpoints.mails.received);

// POST /mails - Send a new mail
export const useCreateMail = createApiHook<
  { code: number; message: string },
  { idReceptor: number; message: string }
>(endpoints.mails.send);

// DELETE /mails/{idMail} - Delete a specific mail
export const useDeleteMail = createApiHook<
  { code: number; message: string },
  { idMail: number }
>(endpoints.mails.delete);

/*
 ================================================================================
 Endpoints de Directions
 ================================================================================
*/
export const useGetDirections = createApiHook<
  Array<{
    idDirection: number;
    name: string;
    description: string;
    createdIn: string;
    updatedIn: string;
  }>
>(endpoints.directions.list);

export const useGetDirectionsById = createApiHook<
  Array<{
    idDirection: number;
    name: string;
    description: string;
    createdIn: string;
    updatedIn: string;
  }>
>(endpoints.directions.getById);

export const useUpdateDirections = createApiHook<
  { code: number; message: string },
  {
    idDirection: number;
    name: string;
    description: string;
  }
>(endpoints.directions.update);

export const useCreatDirections = createApiHook<
  { code: number; message: string },
  {
    name: string;
    description: string;
  }
>(endpoints.directions.create);

// Hook to delete a direction by ID
export const useDeleteDirection = createApiHook<
  { message: string },
  { idDirection: number }
>(endpoints.directions.delete);
/*
 ================================================================================
 Endpoints de Sections
 ================================================================================
*/
export const useGetSections = createApiHook<Section[]>(endpoints.sections.list);

// Hook to get a section by ID
export const useGetSectionById = createApiHook<Section, { idSection: number }>(
  endpoints.sections.getById
);

// Hook to create a new section
export const useCreateSection = createApiHook<responseapi, CreateSectionDto>(
  endpoints.sections.create
);

// Hook to update an existing section
export const useUpdateSection = createApiHook<responseapi, UpdateSectionDto>(
  endpoints.sections.update
);

// Hook to delete a section
export const useDeleteSection = createApiHook<
  { message: string },
  { idSection: number }
>(endpoints.sections.delete);

/*
 ================================================================================
 Endpoints de Department
 ================================================================================
*/
// Department Hooks
export const useGetDepartments = createApiHook<Department[]>(
  endpoints.departments.list
);

export const useCreateDepartment = createApiHook<
  responseapi,
  CreateDepartmentDto
>(endpoints.departments.create);

export const useUpdateDepartment = createApiHook<
  responseapi,
  UpdateDepartmentDto
>(endpoints.departments.update);

export const useGetDepartmentById = createApiHook<
  Department,
  { idDepartment: number }
>(endpoints.departments.getById);

export const useDeleteDepartment = createApiHook<
  responseapi,
  DeleteDepartmentDto
>(endpoints.departments.delete);
/*
 ================================================================================
 Endpoints de Timelines 
 ================================================================================
*/

export const useListTimelines = createApiHook<Timeline[], void>(
  endpoints.timelines.list
);

// Create a new timeline
export const useCreateTimeline = createApiHook<
  Timeline,
  Omit<
    Timeline,
    | "idTimeline"
    | "createdIn"
    | "updatedIn"
    | "developer"
    | "mapPreparation"
    | "additionOfCosts"
    | "mapCorrection"
    | "mapExecution"
  >
>(endpoints.timelines.create);

// Update an existing timeline
export const useUpdateTimeline = createApiHook<
  responseapi,
  Pick<
    Timeline,
    | "idTimeline"
    | "yearOfApplication"
    | "mapCreationDate"
    | "mapCompletionDate"
    | "mapCostAdditionDate"
    | "completionDateAdditionOfMapCost"
    | "mapCorrectionStartDate"
    | "endDateOfMapCorrection"
    | "mapExecutionStartDate"
    | "mapExecutionEndDate"
  >
>(endpoints.timelines.update);

// Get timeline by ID
export const useGetTimelineById = createApiHook<
  Timeline,
  { idTimeline: number }
>(endpoints.timelines.getById);

// Delete a timeline by ID
export const useDeleteTimeline = createApiHook<
  responseapi,
  { idTimeline: number }
>(endpoints.timelines.delete);

/*
 ================================================================================
 Endpoints de Account
 ================================================================================
*/
// Account Hooks
export const useGetAccounts = createApiHook<Account[]>(endpoints.accounts.list);

export const useCreateAccount = createApiHook<responseapi, CreateAccountDto>(
  endpoints.accounts.create
);

export const useUpdateAccount = createApiHook<responseapi, UpdateAccountDto>(
  endpoints.accounts.update
);

export const useGetAccountById = createApiHook<Account, { idAccount: number }>(
  endpoints.accounts.getById
);

export const useDeleteAccount = createApiHook<
  responseapi,
  { idAccount: number }
>(endpoints.accounts.delete);
/*
 ================================================================================
 Endpoints de budgetControls
 ================================================================================
*/
// Budget Control Hooks
export const useGetBudgetControls = createApiHook<BudgetControl[]>(
  endpoints.budgetControls.list
);

export const useCreateBudgetControl = createApiHook<
  responseapi,
  CreateBudgetControlDto
>(endpoints.budgetControls.create);

export const useUpdateBudgetControl = createApiHook<
  responseapi,
  UpdateBudgetControlDto
>(endpoints.budgetControls.update);

export const useDeleteBudgetControl = createApiHook<
  responseapi,
  DeleteBudgetControlDto
>(endpoints.budgetControls.delete);

export const useGetBudgetControlById = createApiHook<
  BudgetControl,
  { idBudgetControl: number }
>(endpoints.budgetControls.getById);
/*
 ================================================================================
 Endpoints de Class
 ================================================================================
*/

export const useGetClasses = createApiHook<Class[]>(endpoints.classes.list);

export const useGetClassById = createApiHook<Class, { idClass: number }>(
  endpoints.classes.getById
);

export const useCreateClass = createApiHook<Class, CreateClassDto>(
  endpoints.classes.create
);

export const useUpdateClass = createApiHook<Class, UpdateClassDto>(
  endpoints.classes.update
);

export const useDeleteClass = createApiHook<responseapi, { idClass: number }>(
  endpoints.classes.delete
);
/*
 ================================================================================
 Endpoints de budget managers
 ================================================================================
*/

// List all budget managers
export const useListBudgetManagers = createApiHook<BudgetManager[], void>(
  endpoints.budgetManagers.list
);

// Create a new budget manager
export const useCreateBudgetManager = createApiHook<
  BudgetManager,
  {
    email: string;
    name: string;
    role: string;
    idDepartment: number;
  }
>(endpoints.budgetManagers.create);

// Update basic info of a budget manager
export const useUpdateBudgetManager = createApiHook<
  responseapi,
  {
    idBudgetManager: number;
    name: string;
    idDepartment: number;
    blocked: boolean;
  }
>(endpoints.budgetManagers.update);

// Update license information
export const useUpdateBudgetManagerLicense = createApiHook<
  responseapi,
  {
    idBudgetManager: number;
    license: string;
    licenseDate: string;
    licenseExpirationDate: string;
    licenseNumber: string;
  }
>(endpoints.budgetManagers.updateLicense);

// Generate a new license by email
export const useGenerateBudgetManagerLicense = createApiHook<
  {
    licenseNumber: string;
    licenseExpirationDate: string;
    licenseIssuanceDate: string;
  },
  { email: string }
>(endpoints.budgetManagers.generateLicense);

// Delete a budget manager by ID
export const useDeleteBudgetManager = createApiHook<
  responseapi,
  { idBudgetManager: number }
>(endpoints.budgetManagers.delete);
/*
 ================================================================================
 Endpoints de cost centers
 ================================================================================
*/

// List all cost centers
export const useListCostCenters = createApiHook<CostCenter[], void>(
  endpoints.costCenters.list
);

// Create a new cost center
export const useCreateCostCenter = createApiHook<
  CostCenter,
  {
    name: string;
    description: string;
    idAccount: number;
  }
>(endpoints.costCenters.create);

// Update an existing cost center
export const useUpdateCostCenter = createApiHook<
  responseapi,
  {
    idCostCenter: number;
    name: string;
    description: string;
    idAccount: number;
  }
>(endpoints.costCenters.update);

// Get cost center by ID
export const useGetCostCenterById = createApiHook<
  CostCenter,
  {
    idCostCenter: number;
  }
>(endpoints.costCenters.getById);

// Delete a cost center by ID
export const useDeleteCostCenter = createApiHook<
  responseapi,
  {
    idCostCenter: number;
  }
>(endpoints.costCenters.delete);
/*
 ================================================================================
Budget Map management
 ================================================================================
*/

// 3.1 Listar todos os Budget Maps
export const useListBudgetMaps = createApiHook<BudgetMap[]>(
  endpoints.budgetMaps.list
);

// 3.2 Obter Budget Map por ID
export const useGetBudgetMapById = createApiHook<BudgetMap>(
  endpoints.budgetMaps.getById
);

// 3.3 Criar um novo Budget Map
// Retorno da API é { message: string }
export const useCreateBudgetMap = createApiHook<
  responseapi,
  {
    budgetYear: string;
    idDepartment: number;
    idTimeline: number;
  }
>(endpoints.budgetMaps.create);

// 3.4 Atualizar um Budget Map existente
// Retorno da API é { message: string }
export const useUpdateBudgetMap = createApiHook<{
  idBudgetMap: number;
  budgetYear: string;
  idDepartment: number;
  idTimeline: number;
}>(endpoints.budgetMaps.update);

// 3.5 Deletar um Budget Map
// Retorno da API é { message: string }
export const useDeleteBudgetMap = createApiHook<{ idBudgetMap: number }>(
  endpoints.budgetMaps.delete
);

// 3.6 Encaminhar (forward) um Budget Map
export const useForwardBudgetMap = createApiHook<{
  idBudgetMap: number;
  idEntity: number;
}>(endpoints.budgetMaps.forward);

// 3.7 Listar todos os Budget Maps recebidos
export const useListBudgetMapsReceived = createApiHook<BudgetMap[]>(
  endpoints.budgetMaps.listReceived
);

/*
 ================================================================================
CommentCost
 ================================================================================
*/
export const useCreateCommentCost = createApiHook<
  responseapi,
  CreateCommentCostRequest
>(endpoints.commentsCosts.create);

export const useGetCommentsCost = createApiHook<undefined, CommentCost[]>(
  endpoints.commentsCosts.list
);

export const useGetCommentCostById = createApiHook<
  { idCommentsCost: number },
  CommentCost
>(endpoints.commentsCosts.getById);

export const useUpdateCommentCost = createApiHook<
  responseapi,
  UpdateCommentCostRequest
>(endpoints.commentsCosts.update);

export const useDeleteCommentCost = createApiHook<
  responseapi,
  DeleteCommentCostRequest
>(endpoints.commentsCosts.delete);

/* costs
 ================================================================================
CommentCost
 ================================================================================
*/

export const useGetCommentsMap = createApiHook<CommentMap[]>(
  endpoints.commentsMaps.list
);

export const useGetCommentMapById = createApiHook<
  { idCommentsMap: number },
  CommentMap
>(endpoints.commentsMaps.getById);

export const useCreateCommentMap = createApiHook<
  responseapi,
  CreateCommentMapRequest
>(endpoints.commentsMaps.create);

export const useUpdateCommentMap = createApiHook<
  responseapi,
  UpdateCommentMapRequest
>(endpoints.commentsMaps.update);

export const useDeleteCommentMap = createApiHook<
  responseapi,
  DeleteCommentMapRequest
>(endpoints.commentsMaps.delete);

/* 
 ================================================================================
costs
 ================================================================================
*/
export const useGetCosts = createApiHook<Cost[]>(endpoints.costs.list);

export const useCreateCost = createApiHook<responseapi, CreateCostRequest>(
  endpoints.costs.create
);

export const usePayCost = createApiHook<responseapi, PayCostRequest>(
  endpoints.costs.pay
);

export const useGetCostById = createApiHook<responseapi, GetCostByIdRequest>(
  endpoints.costs.getById
);

export const useDeleteCost = createApiHook<responseapi, DeleteCostRequest>(
  endpoints.costs.delete
);
