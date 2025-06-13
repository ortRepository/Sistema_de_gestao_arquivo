import { EndpointConfig, endpoints } from "../types/apiConfig";
import { useApiQuery, useApiMutation } from "../services/apiClient";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  CreateDepartmentDto,
  DeleteDepartmentDto,
  Department,
  Notification,
  responseapi,
  UpdateDepartmentDto,
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

